/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);

type Review = {
  id: string;
  subject: string;
  content: string;
};

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();

    const reviewId = body.review_id;

    if (!reviewId) {
      return new Response(
        JSON.stringify({ error: "review_id is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get submitted review
    const { data: review, error: reviewError } =
      await supabase
        .from("reviews")
        .select("id, subject, content")
        .eq("id", reviewId)
        .single();

    if (reviewError || !review) {
      return new Response(
        JSON.stringify({
          error: "Review not found",
          details: reviewError?.message,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const typedReview = review as Review;

    // ------------------------------------------------
    // 1. EXACT DUPLICATE
    // ------------------------------------------------

    const { count: duplicateCount, error: duplicateError } =
      await supabase
        .from("reviews")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("subject", typedReview.subject)
        .eq("content", typedReview.content);

    if (duplicateError) {
      throw duplicateError;
    }

    const exactDuplicateCount = duplicateCount ?? 0;

    // Only activate duplicate penalty when
    // the exact same subject + content appears MORE THAN 50 times.
    const exactDuplicate =
      exactDuplicateCount > 50;

    // ------------------------------------------------
    // 2. INITIAL SCORE
    // ------------------------------------------------

    let trustScore = 100;

    const flags = {
      exact_duplicate: exactDuplicate,
      coordinated_burst: false,
      template_reuse: false,
      promotional_spam: false,
      content_anomaly: false,
    };

    // ------------------------------------------------
    // 3. DUPLICATE PENALTY
    // ------------------------------------------------

    if (flags.exact_duplicate) {
      trustScore -= 35;
    }

    // ------------------------------------------------
    // 4. PROMOTIONAL / SPAM CONTENT
    // ------------------------------------------------

    const promotionalPatterns = [
      /buy now/i,
      /limited offer/i,
      /special offer/i,
      /discount code/i,
      /promo code/i,
      /coupon code/i,
      /use my code/i,
      /referral code/i,
      /click here/i,
      /visit my website/i,
      /contact me/i,
      /whatsapp me/i,
      /telegram/i,
      /https?:\/\//i,
      /www\./i,
    ];

    const promotionalSpam = promotionalPatterns.some(
      (pattern) => pattern.test(typedReview.content)
    );

    flags.promotional_spam = promotionalSpam;

    if (flags.promotional_spam) {
      trustScore -= 15;
    }

    // ------------------------------------------------
    // 5. CONTENT ANOMALY
    // ------------------------------------------------

    const content = typedReview.content.trim();

    const repeatedCharacterPattern =
      /(.)\1{7,}/i;

    const excessiveEmojiPattern =
      /(?:[\u{1F300}-\u{1FAFF}]\s*){8,}/u;

    const veryShortMeaninglessReview =
      content.length < 5;

    const contentAnomaly =
      repeatedCharacterPattern.test(content) ||
      excessiveEmojiPattern.test(content) ||
      veryShortMeaninglessReview;

    flags.content_anomaly = contentAnomaly;

    if (flags.content_anomaly) {
      trustScore -= 10;
    }

    // ------------------------------------------------
    // 6. COORDINATED BURST
    // ------------------------------------------------
    //
    // Intentionally NOT enabled yet.
    //
    // We don't want to mark genuine popular products
    // as suspicious simply because many people review
    // them around the same time.
    //
    // This will later require multiple signals together.
    //

    // ------------------------------------------------
    // 7. TEMPLATE REUSE
    // ------------------------------------------------
    //
    // Intentionally NOT enabled yet.
    //
    // We will implement this carefully so that normal
    // phrases such as "highly recommended" are not
    // treated as fake reviews.
    //

    // Keep score inside 0-100.
    trustScore = Math.max(
      0,
      Math.min(100, trustScore)
    );

    // ------------------------------------------------
    // 8. VERIFIED CONDITION
    // ------------------------------------------------

    const verified =
      trustScore >= 80;

    // ------------------------------------------------
    // 9. SAVE RESULT
    // ------------------------------------------------

    const { error: scoreError } =
      await supabase
        .from("review_trust_scores")
        .upsert(
          {
            review_id: typedReview.id,
            trust_score: trustScore,

            exact_duplicate:
              flags.exact_duplicate,

            coordinated_burst:
              flags.coordinated_burst,

            template_reuse:
              flags.template_reuse,

            promotional_spam:
              flags.promotional_spam,

            content_anomaly:
              flags.content_anomaly,

            flags: {
              exact_duplicate_count:
                exactDuplicateCount,
              verified,
            },
          },
          {
            onConflict: "review_id",
          }
        );

    if (scoreError) {
      throw scoreError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        review_id: typedReview.id,
        trust_score: trustScore,
        verified,
        flags,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
});