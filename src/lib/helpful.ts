import { supabase } from "./supabase";

function getVisitorId(): string {
  const STORAGE_KEY =
    "genuine_reviews_visitor_id";

  let visitorId =
    localStorage.getItem(STORAGE_KEY);

  if (!visitorId) {
    visitorId = crypto.randomUUID();

    localStorage.setItem(
      STORAGE_KEY,
      visitorId
    );
  }

  return visitorId;
}

export async function toggleHelpful(
  reviewId: string,
  userId?: string | null
) {
  const visitorId = getVisitorId();

  /*
   * ==========================================
   * LOGGED-IN USER
   * ==========================================
   */
  if (userId) {
    const {
      data: existingVote,
      error: checkError,
    } = await supabase
      .from("review_helpful")
      .select("id")
      .eq("review_id", reviewId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    /*
     * Remove existing vote
     */
    if (existingVote) {
      const {
        error: deleteError,
      } = await supabase
        .from("review_helpful")
        .delete()
        .eq("id", existingVote.id);

      if (deleteError) {
        throw deleteError;
      }

      return {
        helpful: false,
      };
    }

    /*
     * Add vote
     */
    const {
      error: insertError,
    } = await supabase
      .from("review_helpful")
      .insert({
        review_id: reviewId,
        user_id: userId,
        visitor_id: null,
      });

    if (insertError) {
      throw insertError;
    }

    return {
      helpful: true,
    };
  }

  /*
   * ==========================================
   * LOGGED-OUT VISITOR
   * ==========================================
   */

  const {
    data: existingVote,
    error: checkError,
  } = await supabase
    .from("review_helpful")
    .select("id")
    .eq("review_id", reviewId)
    .eq("visitor_id", visitorId)
    .is("user_id", null)
    .maybeSingle();

  if (checkError) {
    throw checkError;
  }

  /*
   * Remove anonymous vote
   */
  if (existingVote) {
    const {
      error: deleteError,
    } = await supabase
      .from("review_helpful")
      .delete()
      .eq("id", existingVote.id);

    if (deleteError) {
      throw deleteError;
    }

    return {
      helpful: false,
    };
  }

  /*
   * Add anonymous vote
   */
  const {
    error: insertError,
  } = await supabase
    .from("review_helpful")
    .insert({
      review_id: reviewId,
      user_id: null,
      visitor_id: visitorId,
    });

  if (insertError) {
    throw insertError;
  }

  return {
    helpful: true,
  };
}