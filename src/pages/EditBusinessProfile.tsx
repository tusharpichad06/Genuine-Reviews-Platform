import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Info,
  Store,
  Trash2,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import BusinessProfileForm, {
  type BusinessProfile,
} from "../components/business/BusinessProfileForm";
import { Button } from "../components/ui/button";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function EditBusinessProfile() {
  const navigate = useNavigate();

  const [business, setBusiness] =
    useState<BusinessProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadBusinessProfile() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error(
            "EDIT BUSINESS USER ERROR:",
            userError
          );

          if (!cancelled) {
            setError(
              "Unable to verify your account."
            );
          }

          return;
        }

        if (!user) {
          navigate("/auth?mode=login", {
            replace: true,
          });

          return;
        }

        const {
          data: businessData,
          error: businessError,
        } = await supabase
          .from("business_profiles")
          .select(
            `
              id,
              user_id,
              business_name,
              logo_url,
              category,
              short_description,
              description,
              location,
              website,
              business_email,
              business_phone,
              services,
              created_at,
              updated_at
            `
          )
          .eq("user_id", user.id)
          .maybeSingle();

        if (businessError) {
          console.error(
            "EDIT BUSINESS PROFILE ERROR:",
            businessError
          );

          if (!cancelled) {
            setError(
              "Unable to load your business profile. Please try again."
            );
          }

          return;
        }

        if (!businessData) {
          if (!cancelled) {
            setError(
              "You don't have a business profile yet."
            );
          }

          return;
        }

        if (businessData.user_id !== user.id) {
          if (!cancelled) {
            setError(
              "You are not allowed to edit this business profile."
            );
          }

          return;
        }

        if (!cancelled) {
          setBusiness(
            businessData as BusinessProfile
          );
        }
      } catch (err) {
        console.error(
          "EDIT BUSINESS PROFILE LOAD ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            "Something went wrong while loading your business profile."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBusinessProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleDeleteBusiness() {
    if (!business) return;

    setDeleting(true);
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("business_profiles")
        .delete()
        .eq("id", business.id);

      if (deleteError) {
        throw deleteError;
      }

      navigate("/businesses", { replace: true });
    } catch (err) {
      console.error("DELETE BUSINESS ERROR:", err);
      setError("Unable to delete business profile. Please try again.");
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  }

  function handleSuccess(
    updatedBusiness: BusinessProfile
  ) {
    navigate(
      `/business/${updatedBusiness.id}`,
      {
        replace: true,
      }
    );
  }

  function handleCancel() {
    if (business) {
      navigate(
        `/business/${business.id}`
      );
      return;
    }

    navigate("/businesses");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef8ff]">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-28 rounded-lg bg-[#dcecff] sm:w-32" />
            <div className="mt-6 h-10 w-full max-w-md rounded-xl bg-[#dcecff] sm:mt-8 sm:h-12 sm:w-[520px]" />
            <div className="mt-3 h-4 w-full max-w-lg rounded-xl bg-[#e4f0fc] sm:h-5 sm:w-[620px]" />
            <div className="mt-8 h-[600px] rounded-[16px] border border-[#d6e8fa] bg-white sm:mt-10 sm:h-[850px] sm:rounded-[20px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-[#eef8ff]">
        <div className="mx-auto flex min-h-[75vh] w-full max-w-[1180px] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-xl rounded-[16px] border border-[#d6e2f2] bg-white p-6 text-center shadow-sm sm:rounded-[20px] sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf4ff] sm:h-14 sm:w-14">
              <Store className="h-6 w-6 sm:h-7 sm:w-7 text-[#2875F5]" />
            </div>

            <h1 className="mt-4 text-lg font-bold text-[#10182D] sm:text-xl">
              {error ===
              "You don't have a business profile yet."
                ? "Business profile not found"
                : "Unable to load business profile"}
            </h1>

            <p className="mt-2 text-xs leading-5 text-[#617493] sm:text-sm sm:leading-6">
              {error ||
                "Unable to load your business profile. Please try again."}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2.5 sm:mt-6 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-[#C9D7EA] bg-white text-xs sm:text-sm text-[#2875F5] hover:bg-[#F3F7FF]"
              >
                Try Again
              </Button>

              <Button
                type="button"
                onClick={() =>
                  navigate("/businesses")
                }
                className="bg-[#2875F5] text-xs sm:text-sm text-white hover:bg-[#155DCC]"
              >
                Browse Businesses
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef8ff]">
      <Navbar />

      <main className="relative z-10">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-10">
          <div className="flex items-center">
            <Link
              to={`/business/${business.id}`}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-[#a9d7ff]
                bg-white/90
                px-3.5 py-1.5
                text-xs
                font-semibold
                text-[#2875F5]
                shadow-sm
                transition
                hover:bg-white
                sm:px-4 sm:py-2 sm:text-sm
              "
            >
              <ArrowLeft className="h-4 w-4" />
              Business Profile
            </Link>
          </div>

          <div className="mt-5 sm:mt-7">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#123b7a] sm:text-4xl lg:text-5xl">
              Edit Business Profile
            </h1>

            <p className="mt-2.5 max-w-[650px] text-xs leading-5 text-[#4771a8] sm:mt-3 sm:text-base sm:leading-7">
              Update your business information, services and portfolio.
            </p>
          </div>

          {/* Form */}
          <div className="mt-6 sm:mt-8 overflow-hidden rounded-[16px] border border-[#cfe5f8] bg-white/90 shadow-[0_10px_40px_rgba(40,117,245,0.08)] backdrop-blur sm:rounded-[20px]">
            <BusinessProfileForm
              mode="edit"
              initialData={business}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>

          {/* Bottom Left Delete Button */}
          <div className="mt-8 sm:mt-10 flex justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full sm:w-auto border-red-200 bg-white text-xs sm:text-sm text-red-600 hover:bg-red-50 hover:text-red-700 px-5 py-2.5"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Business Profile
            </Button>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#D6E2F2] bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="size-5" />
              </div>

              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-[#10182D]">
                  Delete Business Profile?
                </h2>

                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                  Are you sure you want to delete <span className="font-semibold text-[#10182D]">{business.business_name}</span>? This action is permanent and cannot be undone. All associated attachments and data will be removed.
                </p>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 flex flex-col-reverse gap-2.5 sm:gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleting}
                className="w-full sm:w-auto border-[#D6E2F2] bg-white text-xs sm:text-sm text-[#10182D] hover:bg-[#F3F7FF]"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleDeleteBusiness}
                disabled={deleting}
                className="w-full sm:w-auto bg-red-600 text-xs sm:text-sm text-white hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default EditBusinessProfile;