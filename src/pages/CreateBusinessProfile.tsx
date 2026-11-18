import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Info,
  Store,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import BusinessProfileForm, {
  type BusinessProfile,
} from "../components/business/BusinessProfileForm";
import { Button } from "../components/ui/button";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";


function CreateBusinessProfile() {
  const navigate = useNavigate();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkAuthentication() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error(
            "CREATE BUSINESS AUTH ERROR:",
            userError
          );

          if (!cancelled) {
            setError("Unable to verify your account.");
          }

          return;
        }

        if (!user) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        /*
         * One business profile per user.
         */
        const {
          data: existingBusiness,
          error: businessError,
        } = await supabase
          .from("business_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (businessError) {
          console.error(
            "CREATE BUSINESS EXISTING PROFILE ERROR:",
            businessError
          );

          if (!cancelled) {
            setError(
              "Unable to check your existing business profile."
            );
          }

          return;
        }

        if (existingBusiness) {
          navigate(
            `/business/${existingBusiness.id}`,
            {
              replace: true,
            }
          );

          return;
        }
      } catch (err) {
        console.error(
          "CREATE BUSINESS AUTH CHECK ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            "Something went wrong while checking your account."
          );
        }
      } finally {
        if (!cancelled) {
          setCheckingAuth(false);
        }
      }
    }

    checkAuthentication();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function handleSuccess(
    businessProfile: BusinessProfile
  ) {
    navigate(
      `/business/${businessProfile.id}`
    );
  }

  function handleCancel() {
    navigate("/businesses");
  }

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#eef8ff]">

        <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-28 rounded-lg bg-[#dcecff] sm:w-32" />

            <div className="mt-6 h-10 w-full max-w-md rounded-lg bg-[#dcecff] sm:mt-8 sm:h-12 sm:w-[480px]" />

            <div className="mt-3 h-5 w-full max-w-lg rounded-lg bg-[#e4f0fc] sm:h-6 sm:w-[620px]" />

            <div className="mt-8 h-[600px] rounded-[16px] border border-[#d6e8fa] bg-white/80 sm:mt-10 sm:h-[900px] sm:rounded-[20px]" />
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (error) {
    return (
      <div className="min-h-screen bg-[#eef8ff]">
        <div className="mx-auto flex min-h-[75vh] w-full max-w-[1180px] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-xl rounded-[16px] border border-[#d6e2f2] bg-white p-6 text-center shadow-[0_10px_40px_rgba(40,117,245,0.08)] sm:rounded-[20px] sm:p-8">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f3ff] sm:h-14 sm:w-14">
              <Info className="h-6 w-6 sm:h-7 sm:w-7 text-[#2875F5]" />
            </div>

            <h1 className="mt-4 text-xl font-bold text-[#123b7a] sm:text-2xl">
              Unable to create business profile
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#617493] sm:text-base sm:leading-7">
              {error}
            </p>

            <Button
              type="button"
              onClick={() =>
                navigate("/businesses")
              }
              className="
                mt-5 sm:mt-6
                bg-[#2875F5]
                px-5 sm:px-6
                text-sm sm:text-base
                font-semibold
                text-white
                shadow-sm
                hover:bg-[#155DCC]
              "
            >
              Back to Businesses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * MAIN PAGE
   * =========================================================
   */

  return (
    <div className="min-h-screen bg-[#eef8ff]">
      <Navbar />

      {/* =====================================================
          PAGE CONTENT
          ===================================================== */}

      <main className="relative z-10">

        <div
          className="
            mx-auto
            w-full
            max-w-[1180px]
            px-4
            py-5
            sm:px-6
            sm:py-7
            lg:px-8
            lg:py-10
          "
        >

          {/* =================================================
              BACK BUTTON
              ================================================= */}

          <Link
            to="/businesses"
            className="
              group
              inline-flex
              items-center
              gap-2
              rounded-[9px]
              border
              border-[#a9d7ff]
              bg-white/90
              px-3.5
              py-2
              text-sm
              font-semibold
              text-[#2875F5]
              shadow-sm
              transition-all
              duration-200
              hover:border-[#2875F5]
              hover:bg-white
              hover:shadow-md
              sm:px-4 sm:py-2.5 sm:text-base
            "
          >
            <ArrowLeft
              className="
                h-4
                w-4
                sm:h-5
                sm:w-5
                transition-transform
                duration-200
                group-hover:-translate-x-0.5
              "
            />

            Businesses
          </Link>

          {/* =================================================
              HEADER
              ================================================= */}

          <div
            className="
              mt-4 sm:mt-6
              flex
              flex-col
              gap-6
              lg:flex-row
              lg:items-start
              lg:justify-between
            "
          >

            {/* Header text */}

            <div className="max-w-[720px]">

              <h1
                className="
                  text-3xl
                  font-extrabold
                  leading-tight
                  tracking-[-0.6px]
                  text-[#123b7a]
                  sm:text-[38px]
                  sm:leading-[1.1]
                  lg:text-[44px]
                "
              >
                Create Business Profile
              </h1>

              <p
                className="
                  mt-2.5
                  max-w-[650px]
                  text-sm
                  leading-6
                  text-[#4771a8]
                  sm:mt-3
                  sm:text-base
                  sm:leading-7
                "
              >
                Create a public profile for your business,
                showcase your services and connect with potential clients.
              </p>
            </div>

            {/* =================================================
                STORE ILLUSTRATION
                ================================================= */}

            <div
              className="
                relative
                hidden
                h-[120px]
                w-[140px]
                shrink-0
                items-center
                justify-center
                rounded-[22px]
                border
                border-[#cfe8ff]
                bg-white/90
                shadow-[0_8px_30px_rgba(40,117,245,0.10)]
                lg:flex
              "
            >

              {/* Decorative lines */}

              <span
                className="
                  absolute
                  -left-5
                  top-3
                  h-2
                  w-1
                  rotate-[-45deg]
                  rounded-full
                  bg-[#1687f8]
                "
              />

              <span
                className="
                  absolute
                  -left-7
                  top-8
                  h-1
                  w-3
                  rotate-[-10deg]
                  rounded-full
                  bg-[#1687f8]
                "
              />

              <span
                className="
                  absolute
                  -top-2
                  left-1
                  h-2
                  w-1
                  rotate-[-35deg]
                  rounded-full
                  bg-[#1687f8]
                "
              />

              {/* Store */}

              <div className="relative">

                <div
                  className="
                    flex
                    h-[66px]
                    w-[82px]
                    items-end
                    justify-center
                    overflow-hidden
                    rounded-[8px]
                    border-[3px]
                    border-[#1687f8]
                    bg-[#eaf5ff]
                  "
                >
                  <div
                    className="
                      h-[38px]
                      w-[56px]
                      rounded-t-[5px]
                      border-[3px]
                      border-[#1687f8]
                      bg-white
                    "
                  />
                </div>

                {/* Awning */}

                <div
                  className="
                    absolute
                    -left-[2px]
                    -top-[2px]
                    flex
                    overflow-hidden
                    rounded-t-[7px]
                  "
                >
                  <span className="h-8 w-4 bg-[#1687f8]" />
                  <span className="h-8 w-4 bg-white" />
                  <span className="h-8 w-4 bg-[#1687f8]" />
                  <span className="h-8 w-4 bg-white" />
                  <span className="h-8 w-4 bg-[#1687f8]" />
                </div>

                {/* Plus button */}

                <div
                  className="
                    absolute
                    -bottom-4
                    -right-5
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-[#1687f8]
                    text-white
                    shadow-md
                  "
                >
                  <Plus className="h-5 w-5" />
                </div>

              </div>
            </div>
          </div>

          {/* =================================================
              FORM CONTAINER
              ================================================= */}

          <div
            className="
              mt-6 sm:mt-8
              overflow-hidden
              rounded-[16px]
              border
              border-[#cfe5f8]
              bg-white/90
              shadow-[0_10px_40px_rgba(40,117,245,0.08)]
              backdrop-blur
              sm:rounded-[20px]
            "
          >

            <BusinessProfileForm
              mode="create"
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />

          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CreateBusinessProfile;