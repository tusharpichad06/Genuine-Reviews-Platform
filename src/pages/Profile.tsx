import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
  Pencil,
  Plus,
  BriefcaseBusiness,
  FileText,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import ReviewCard from "../components/review/ReviewCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { getAvatarColor } from "@/lib/avatar";
import Cropper from "react-easy-crop";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

type ProfileData = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
};

type Review = {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  rating: number | null;
  title: string | null;
  content: string;
  created_at: string;
  helpful_count: number | null;
  is_verified: boolean;
};

function formatReviewTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diffMinutes = Math.floor(
    (now.getTime() - date.getTime()) / 60000
  );

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Profile() {
  const navigate = useNavigate();

  const routerLocation = useLocation();

  const [profile, setProfile] =
    useState<ProfileData | null>(null);

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [editOpen, setEditOpen] =
    useState(false);

  const [contactOpen, setContactOpen] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [username, setUsername] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [contactEmail, setContactEmail] =
    useState("");

  const [contactPhone, setContactPhone] =
    useState("");

  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [cropOpen, setCropOpen] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);

  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] = useState(1);

  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>(null);

    const [businessProfileId, setBusinessProfileId] = useState<string | null>(null);

  function getInitial(username: string) {
    return (
      username.trim().charAt(0).toUpperCase() ||
      "U"
    );
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error(
            "PROFILE USER ERROR:",
            userError
          );

          if (!cancelled) {
            setError(
              "Unable to load your account."
            );
          }

          return;
        }

        if (!user) {
          if (!cancelled) {
            setError(
              "You need to log in to view your profile."
            );
          }

          return;
        }

        const requestedProfileUserId =
          routerLocation.state?.profileUserId as
            | string
            | undefined;

        let targetUserId = user.id;

        if (requestedProfileUserId) {
          const {
            data: currentUserProfile,
            error: currentUserProfileError,
          } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", targetUserId)
            .maybeSingle();

          if (currentUserProfileError) {
            console.error(
              "CURRENT USER ROLE ERROR:",
              currentUserProfileError
            );

            if (!cancelled) {
              setError(
                "Unable to verify your permissions."
              );
            }

            return;
          }

          const isAdmin =
            String(
              currentUserProfile?.role ?? ""
            ).toLowerCase() === "admin";

          if (!isAdmin) {
            if (!cancelled) {
              setError(
                "You are not allowed to view this profile."
              );
            }

            return;
          }

          targetUserId =
            requestedProfileUserId;
        }

        const { data: businessProfile } = await supabase
  .from("business_profiles")
  .select("id")
  .eq("user_id", user.id)
  .maybeSingle();

setBusinessProfileId(businessProfile?.id ?? null);

        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "id, username, avatar_url, bio, location, contact_email, contact_phone, created_at, updated_at"
          )
          .eq("id", targetUserId)
          .maybeSingle();

        if (profileError) {
          console.error(
            "PROFILE DATA ERROR:",
            profileError
          );

          if (!cancelled) {
            setError(
              "Unable to load your profile."
            );
          }

          return;
        }

        const profileResult =
          profileData as ProfileData;

        const {
          data: reviewData,
          error: reviewError,
        } = await supabase
          .from("reviews")
          .select(
            "id, user_id, subject, category, rating, title, content, created_at, helpful_count,is_verified"
          )
          .eq("user_id", targetUserId)
          .order("created_at", {
            ascending: false,
          });

        if (reviewError) {
          console.error(
            "PROFILE REVIEWS ERROR:",
            reviewError
          );
        }

        if (!cancelled) {
          setProfile(profileResult);

          setReviews(
            (reviewData as Review[]) ?? []
          );

          setUsername(
            profileResult.username ?? ""
          );

          setBio(
            profileResult.bio ?? ""
          );

          setLocation(
            profileResult.location ?? ""
          );

          setContactEmail(
            profileResult.contact_email ?? ""
          );

          setContactPhone(
            profileResult.contact_phone ?? ""
          );
        }
      } catch (err) {
        console.error(
          "PROFILE ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            "Something went wrong while loading your profile."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSaveProfile() {
    if (!profile) {
      return;
    }

    const trimmedUsername =
      username.trim();

    if (!trimmedUsername) {
      return;
    }

    try {
      setSaving(true);

      const updatedAt =
        new Date().toISOString();

      const {
        data: updatedProfile,
        error: updateError,
      } = await supabase
        .from("profiles")
        .update({
          username: trimmedUsername,
          bio: bio.trim() || null,
          location:
            location.trim() || null,
          contact_email:
            contactEmail.trim() || null,
          contact_phone:
            contactPhone.trim() || null,
          updated_at: updatedAt,
        })
        .eq("id", profile.id)
        .select(
          "id, username, avatar_url, bio, location, contact_email, contact_phone, created_at, updated_at"
        )
        .maybeSingle();

      if (updateError) {
        console.error(
          "PROFILE UPDATE ERROR:",
          updateError
        );

        alert(
          "Unable to save your profile."
        );

        return;
      }

      if (!updatedProfile) {
        console.error(
          "PROFILE UPDATE ERROR: No profile returned."
        );

        alert(
          "Profile could not be saved. Please try again."
        );

        return;
      }

      const savedProfile =
        updatedProfile as ProfileData;

      setProfile(savedProfile);

      setUsername(
        savedProfile.username ?? ""
      );

      setBio(
        savedProfile.bio ?? ""
      );

      setLocation(
        savedProfile.location ?? ""
      );

      setContactEmail(
        savedProfile.contact_email ?? ""
      );

      setContactPhone(
        savedProfile.contact_phone ?? ""
      );

      setEditOpen(false);
    } catch (err) {
      console.error(
        "PROFILE SAVE ERROR:",
        err
      );

      alert(
        "Something went wrong while saving your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCropComplete(
    _croppedArea: any,
    croppedPixels: {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  ) {
    setCroppedAreaPixels(croppedPixels);
  }

  async function handlePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || !profile) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    try {
      const imageUrl = URL.createObjectURL(file);

      setCropImage(imageUrl);

      setCrop({
        x: 0,
        y: 0,
      });

      setZoom(1);
      setCroppedAreaPixels(null);

      setCropOpen(true);
    } catch (err) {
      console.error(
        "PROFILE PHOTO SELECT ERROR:",
        err
      );

      alert(
        "Something went wrong while selecting your photo."
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function createCroppedImage(
    imageSrc: string,
    pixelCrop: {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  ): Promise<Blob> {
    const image = new Image();

    image.src = imageSrc;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(
          new Error("Unable to load selected image.")
        );
    });

    const canvas =
      document.createElement("canvas");

    const context =
      canvas.getContext("2d");

    if (!context) {
      throw new Error(
        "Unable to create image canvas."
      );
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    context.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(
              new Error(
                "Unable to create cropped image."
              )
            );
          }
        },
        "image/jpeg",
        0.92
      );
    });
  }

  async function handleCropSave() {
    if (
      !cropImage ||
      !croppedAreaPixels ||
      !profile
    ) {
      return;
    }

    try {
      setUploadingPhoto(true);

      const croppedBlob =
        await createCroppedImage(
          cropImage,
          croppedAreaPixels
        );

      const filePath =
        `${profile.id}/profile-${Date.now()}.jpg`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("profile-photos")
        .upload(
          filePath,
          croppedBlob,
          {
            cacheControl: "3600",
            contentType: "image/jpeg",
            upsert: true,
          }
        );

      if (uploadError) {
        console.error(
          "PROFILE PHOTO UPLOAD ERROR:",
          uploadError
        );

        alert(
          `Unable to upload profile photo.\n\n${uploadError.message}`
        );

        return;
      }

      const {
        data: publicUrlData,
      } =
        supabase.storage
          .from("profile-photos")
          .getPublicUrl(filePath);

      const avatarUrl =
        publicUrlData.publicUrl;

      const {
        data: updatedProfile,
        error: updateError,
      } =
        await supabase
          .from("profiles")
          .update({
            avatar_url: avatarUrl,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", profile.id)
          .select(
            "id, username, avatar_url, bio, location, contact_email, contact_phone, created_at, updated_at"
          )
          .maybeSingle();

      if (updateError) {
        console.error(
          "PROFILE PHOTO DATABASE ERROR:",
          updateError
        );

        alert(
          "Photo uploaded, but unable to update your profile."
        );

        return;
      }

      if (!updatedProfile) {
        alert(
          "Profile was not found while updating your photo."
        );

        return;
      }

      setProfile(
        updatedProfile as ProfileData
      );

      setCropOpen(false);

      if (cropImage) {
        URL.revokeObjectURL(cropImage);
      }

      setCropImage(null);
      setCroppedAreaPixels(null);
      setZoom(1);
      setCrop({
        x: 0,
        y: 0,
      });
    } catch (err) {
      console.error(
        "PROFILE PHOTO CROP ERROR:",
        err
      );

      alert(
        "Something went wrong while saving your cropped photo."
      );
    } finally {
      setUploadingPhoto(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDeletePhoto() {
    if (!profile?.avatar_url) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete your profile photo?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setUploadingPhoto(true);

      const marker = "/profile-photos/";

      const markerIndex =
        profile.avatar_url.indexOf(marker);

      if (markerIndex === -1) {
        console.error(
          "PROFILE PHOTO PATH ERROR:",
          profile.avatar_url
        );

        alert(
          "Unable to find the profile photo."
        );

        return;
      }

      const filePath =
        profile.avatar_url.substring(
          markerIndex + marker.length
        );

      const {
        error: storageError,
      } = await supabase.storage
        .from("profile-photos")
        .remove([filePath]);

      if (storageError) {
        console.error(
          "PROFILE PHOTO DELETE ERROR:",
          storageError
        );

        alert(
          "Unable to delete your profile photo."
        );

        return;
      }

      const {
        error: updateError,
      } = await supabase
        .from("profiles")
        .update({
          avatar_url: null,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) {
        console.error(
          "PROFILE AVATAR UPDATE ERROR:",
          updateError
        );

        alert(
          "Photo was deleted, but the profile could not be updated."
        );

        return;
      }

      setProfile({
        ...profile,
        avatar_url: null,
        updated_at:
          new Date().toISOString(),
      });
    } catch (err) {
      console.error(
        "PROFILE PHOTO DELETE ERROR:",
        err
      );

      alert(
        "Something went wrong while deleting your photo."
      );
    } finally {
      setUploadingPhoto(false);
    }
  }

  const hasContact =
    Boolean(
      profile?.contact_email ||
      profile?.contact_phone
    );

  const totalHelpful =
    reviews.reduce(
      (total, review) =>
        total +
        (review.helpful_count ?? 0),
      0
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef8ff]">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-40 rounded-lg bg-[#E3EBF7]" />
            <div className="h-64 rounded-2xl border border-[#D6E2F2] bg-white" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-24 rounded-xl bg-[#E8F0FF]" />
              <div className="h-24 rounded-xl bg-[#E8F8EF]" />
            </div>
            <div className="h-8 w-48 rounded-lg bg-[#E3EBF7]" />
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div className="h-72 rounded-xl bg-white border border-[#D6E2F2]" />
              <div className="h-72 rounded-xl bg-white border border-[#D6E2F2]" />
              <div className="h-72 rounded-xl bg-white border border-[#D6E2F2]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#eef8ff]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="rounded-2xl border border-[#D6E2F2] bg-white p-6 sm:p-10 text-center text-[#10182D]">
            <h1 className="text-lg sm:text-xl font-semibold">
              {error ||
                "Profile not found"}
            </h1>

            <Button
              className="mt-5 bg-[#2875F5] text-white hover:bg-[#155DCC]"
              onClick={() =>
                navigate("/")
              }
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef8ff]">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 text-[#10182D]">

        <div>
          <p className="text-xs sm:text-sm font-semibold text-[#2875F5]">
            Your account
          </p>

          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#10182D]">
            Profile
          </h1>
        </div>

        <section className="mt-6 sm:mt-8 rounded-2xl border border-[#D6E2F2] bg-white p-5 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-6">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">

              {/* Avatar */}

              <div className="flex shrink-0 justify-center sm:justify-start">
                <div className="flex shrink-0 justify-center sm:justify-start">
                  <div className="flex size-24 sm:size-32 items-center justify-center rounded-full bg-[#2875F5] p-1.5 shadow-md">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={`${profile.username}'s profile`}
                        className="size-full rounded-full border-2 border-white object-cover"
                      />
                    ) : (
                      <div
                        className={`flex size-full items-center justify-center rounded-full border text-3xl sm:text-4xl font-semibold ${getAvatarColor(
                          profile.username
                        )}`}
                      >
                        {profile.username
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile information */}

              <div className="min-w-0 flex-1 text-center sm:text-left">

                <h2 className="break-words text-xl sm:text-2xl font-bold text-[#10182D]">
                  {profile.username}
                </h2>

                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#617493]">
                  @{profile.username}
                </p>

                {profile.location && (
                  <div className="mt-2.5 sm:mt-3 flex items-center justify-center gap-1.5 text-xs sm:text-sm text-[#617493] sm:justify-start">
                    <MapPin className="size-3.5 sm:size-4 text-[#2875F5]" />

                    <span>
                      {profile.location}
                    </span>
                  </div>
                )}

                {profile.bio && (
                  <p className="mt-3 sm:mt-4 max-w-2xl text-xs sm:text-sm leading-5 sm:leading-6 text-[#10182D]">
                    {profile.bio}
                  </p>
                )}

                {/* Contact */}

                {hasContact && (
                  <div className="mt-3.5 sm:mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setContactOpen(true)
                      }
                      className="border-[#BBD2FF] bg-[#E8F0FF] text-xs sm:text-sm text-[#2875F5] hover:bg-[#DCE9FF] hover:text-[#155DCC]"
                    >
                      Contact
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* =================================================
                ACTION BUTTONS (Added "My Proposals" Navigation)
            ================================================== */}

            <div className="flex flex-col gap-2.5 sm:gap-3 border-t border-[#D6E2F2] pt-5 sm:pt-6 sm:flex-row sm:flex-wrap">

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setEditOpen(true)
                }
                className="w-full border-[#D6E2F2] bg-white text-xs sm:text-sm text-[#10182D] hover:bg-[#F3F7FF] hover:text-[#2875F5] sm:w-auto"
              >
                <Pencil className="mr-2 size-3.5 sm:size-4 text-[#2875F5]" />
                Edit Profile
              </Button>

              {/* My Proposals Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/proposals")}
                className="w-full border-[#D6E2F2] bg-white text-xs sm:text-sm text-[#10182D] hover:bg-[#F3F7FF] hover:text-[#2875F5] sm:w-auto"
              >
                <FileText className="mr-2 size-3.5 sm:size-4 text-[#2875F5]" />
                My Proposals
              </Button>

                                   <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/deals")}
                className="w-full border-[#D6E2F2] bg-white text-xs sm:text-sm text-[#10182D] hover:bg-[#F3F7FF] hover:text-[#2875F5] sm:w-auto"
              >
                <FileText className="mr-2 size-3.5 sm:size-4 text-[#2875F5]" />
                My Deals
              </Button>

              {/* Create Business Profile */}
              {businessProfileId ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    navigate(`/business/${businessProfileId}`)
                  }
                  className="
                    w-full
                    border-[#2875F5]
                    bg-white
                    text-xs sm:text-sm
                    text-[#2875F5]
                    shadow-sm
                    hover:bg-[#F3F7FF]
                    hover:text-[#155DCC]
                    sm:w-auto
                  "
                >
                  <BriefcaseBusiness className="mr-2 size-3.5 sm:size-4" />
                  My Business Profile
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    navigate("/business/create")
                  }
                  className="
                    w-full
                    border-[#D6E2F2]
                    bg-white
                    text-xs sm:text-sm
                    text-[#10182D]
                    hover:bg-[#F3F7FF]
                    hover:text-[#2875F5]
                    sm:w-auto
                  "
                >
                  <Plus className="mr-2 size-3.5 sm:size-4 text-[#2875F5]" />
                  Create Business Profile
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate("/write-review")
                }
                className="w-full border-[#2875F5] bg-[#2875F5] text-xs sm:text-sm text-white shadow-md hover:border-[#155DCC] hover:bg-[#155DCC] sm:w-auto"
              >
                <Plus className="mr-2 size-3.5 sm:size-4" />
                Write a New Review
              </Button>

            </div>
          </div>
        </section>

        {/* =====================================================
            PROFILE STATS
        ===================================================== */}

        <section className="mt-5 sm:mt-6 grid gap-3.5 sm:gap-4 sm:grid-cols-2">

          <div className="rounded-xl border border-[#BBD2FF] bg-[#E8F0FF] p-4 sm:p-5 text-center">
            <p className="text-xl sm:text-2xl font-bold text-[#2875F5]">
              {reviews.length}
            </p>

            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#617493]">
              Reviews
            </p>
          </div>

          <div className="rounded-xl border border-[#BFE6CD] bg-[#E8F8EF] p-4 sm:p-5 text-center">
            <p className="text-xl sm:text-2xl font-bold text-[#16A34A]">
              {totalHelpful}
            </p>

            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#617493]">
              Helpful
            </p>
          </div>

        </section>

        {/* =====================================================
            SAVED REVIEWS
        ===================================================== */}

        <section className="mt-5 sm:mt-6">
          <button
            type="button"
            onClick={() => navigate("/profile/saved-reviews")}
            className="flex w-full items-center justify-between rounded-xl border border-[#D6E2F2] bg-white p-4 sm:p-5 text-left shadow-sm transition hover:bg-[#F3F7FF]"
          >
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-[#10182D]">
                Saved Reviews
              </h2>

              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#617493]">
                Reviews you saved for later.
              </p>
            </div>

            <span className="text-xs sm:text-sm font-semibold text-[#2875F5]">
              View →
            </span>
          </button>
        </section>

        {/* =====================================================
            REVIEWS
        ===================================================== */}

        <section className="mt-8 sm:mt-10">

          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#10182D]">
              Your Reviews
            </h2>

            <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-[#617493]">
              Reviews you have shared with the community.
            </p>
          </div>

          {reviews.length === 0 ? (
            <div className="mt-6 sm:mt-8 rounded-2xl border border-[#D6E2F2] bg-white p-6 sm:p-10 text-center">

              <h3 className="text-base sm:text-lg font-semibold text-[#10182D]">
                You haven't written any reviews yet.
              </h3>

              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#617493]">
                Share your first experience
                with the community.
              </p>

              <Button
                className="mt-4 sm:mt-5 bg-[#2875F5] text-white hover:bg-[#155DCC]"
                onClick={() =>
                  navigate("/write-review")
                }
              >
                <Plus className="mr-2 size-4" />
                Write a New Review
              </Button>

            </div>
          ) : (
            <div className="mt-6 sm:mt-8 grid items-stretch gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  userId={profile.id}
                  subjectName={
                    review.subject
                  }
                  category={
                    review.category
                  }
                  rating={
                    review.rating ??
                    undefined
                  }
                  title={
                    review.title ??
                    undefined
                  }
                  content={
                    review.content
                  }
                  author={
                    profile.username
                  }
                  time={formatReviewTime(
                    review.created_at
                  )}
                  helpfulCount={
                    review.helpful_count ??
                    0
                  }
                    isVerified={
                      review.is_verified
                   }
                />
              ))}
            </div>
          )}
        </section>

        {/* =====================================================
            EDIT PROFILE MODAL
        ===================================================== */}

        {editOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
          >
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#D6E2F2] bg-white p-5 sm:p-6 text-[#10182D] shadow-2xl">

              <div className="flex items-center justify-between">

                <div>
                  <h2
                    id="edit-profile-title"
                    className="text-lg sm:text-xl font-semibold text-[#10182D]"
                  >
                    Edit Profile
                  </h2>

                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#617493]">
                    Update your profile information.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditOpen(false)
                  }
                  className="rounded-md p-2 text-[#617493] hover:bg-[#F3F7FF] hover:text-[#10182D]"
                  aria-label="Close edit profile"
                >
                  ×
                </button>

              </div>

              <div className="mt-5 sm:mt-6 space-y-4 sm:space-y-5">

                {/* Profile picture */}

                <div className="space-y-2.5 sm:space-y-3">

                  <label className="text-xs sm:text-sm font-medium text-[#10182D]">
                    Profile Picture
                  </label>

                  <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">

                    <div className="flex size-16 sm:size-20 shrink-0 items-center justify-center rounded-full border-2 border-[#D6E2F2] bg-white p-1 shadow-md">

                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={`${profile.username}'s profile`}
                          className="size-full rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`flex size-full items-center justify-center rounded-full border text-2xl sm:text-3xl font-semibold ${getAvatarColor(
                            profile.username
                          )}`}
                        >
                          {getInitial(profile.username)}
                        </div>
                      )}

                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingPhoto}
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="border-[#D6E2F2] bg-white text-xs sm:text-sm text-[#10182D] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
                    >
                      {uploadingPhoto
                        ? "Uploading..."
                        : "Change Photo"}
                    </Button>

                    {profile.avatar_url && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingPhoto}
                        onClick={handleDeletePhoto}
                        className="border-[#F2C5C5] bg-white text-xs sm:text-sm text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
                      >
                        Delete Photo
                      </Button>
                    )}

                  </div>
                </div>

                {/* Username */}

                <div className="space-y-1.5 sm:space-y-2">

                  <label
                    htmlFor="profile-username"
                    className="text-xs sm:text-sm font-medium text-[#10182D]"
                  >
                    Username
                  </label>

                  <Input
                    id="profile-username"
                    value={username}
                    onChange={(event) =>
                      setUsername(
                        event.target.value
                      )
                    }
                    placeholder="Enter your username"
                    className="h-10 sm:h-11 border-[#D6E2F2] bg-white text-xs sm:text-sm text-[#10182D] placeholder:text-[#A7B0BD] focus-visible:border-[#2875F5] focus-visible:ring-[#2875F5]/20"
                  />

                </div>

                {/* Bio */}

                <div className="space-y-1.5 sm:space-y-2">

                  <label
                    htmlFor="profile-bio"
                    className="text-xs sm:text-sm font-medium text-[#10182D]"
                  >
                    Bio
                  </label>

                  <Textarea
                    id="profile-bio"
                    value={bio}
                    onChange={(event) =>
                      setBio(
                        event.target.value
                      )
                    }
                    placeholder="Write something about yourself"
                    rows={3}
                    className="border-[#D6E2F2] bg-white text-xs sm:text-sm text-[#10182D] placeholder:text-[#A7B0BD] focus-visible:border-[#2875F5] focus-visible:ring-[#2875F5]/20"
                  />

                </div>

                {/* Location */}

                <div className="space-y-1.5 sm:space-y-2">

                  <label
                    htmlFor="profile-location"
                    className="text-xs sm:text-sm font-medium text-[#10182D]"
                  >
                    Location
                  </label>

                  <Input
                    id="profile-location"
                    value={location}
                    onChange={(event) =>
                      setLocation(
                        event.target.value
                      )
                    }
                    placeholder="Mumbai, India"
                    className="h-10 sm:h-11 border-[#D6E2F2] bg-white text-xs sm:text-sm text-[#10182D] placeholder:text-[#A7B0BD] focus-visible:border-[#2875F5] focus-visible:ring-[#2875F5]/20"
                  />

                </div>

                {/* Contact */}

                <div className="space-y-3.5 sm:space-y-4 border-t border-[#D6E2F2] pt-4 sm:pt-5">

                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#10182D]">
                      Contact
                    </h3>

                    <p className="mt-0.5 text-[11px] sm:text-xs text-[#617493]">
                      Contact information is optional
                      and will be visible to other
                      users on your profile.
                    </p>
                  </div>

                  {/* Email */}

                  <div className="space-y-1.5 sm:space-y-2">

                    <label
                      htmlFor="contact-email"
                      className="text-xs sm:text-sm font-medium text-[#10182D]"
                    >
                      Email
                    </label>

                    <Input
                      id="contact-email"
                      type="email"
                      value={contactEmail}
                      onChange={(event) =>
                        setContactEmail(
                          event.target.value
                        )
                      }
                      placeholder="email@example.com"
                      className="h-10 sm:h-11 border-[#D6E2F2] bg-white text-xs sm:text-sm text-[#10182D] placeholder:text-[#A7B0BD] focus-visible:border-[#2875F5] focus-visible:ring-[#2875F5]/20"
                    />

                  </div>

                  {/* Mobile */}

                  <div className="space-y-1.5 sm:space-y-2">

                    <label
                      htmlFor="contact-phone"
                      className="text-xs sm:text-sm font-medium text-[#10182D]"
                    >
                      Mobile Number
                    </label>

                    <Input
                      id="contact-phone"
                      type="tel"
                      value={contactPhone}
                      onChange={(event) =>
                        setContactPhone(
                          event.target.value
                        )
                      }
                      placeholder="+91 "
                      className="h-10 sm:h-11 border-[#D6E2F2] bg-white text-xs sm:text-sm text-[#10182D] placeholder:text-[#A7B0BD] focus-visible:border-[#2875F5] focus-visible:ring-[#2875F5]/20"
                    />

                  </div>

                </div>
              </div>

              {/* Modal actions */}

              <div className="mt-6 sm:mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end sm:gap-3">

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setEditOpen(false)
                  }
                  disabled={saving}
                  className="w-full sm:w-auto border-[#D6E2F2] bg-white text-xs sm:text-sm text-[#10182D] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={
                    handleSaveProfile
                  }
                  disabled={
                    saving ||
                    !username.trim()
                  }
                  className="w-full sm:w-auto bg-[#2875F5] text-xs sm:text-sm text-white hover:bg-[#155DCC]"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </Button>

              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            PROFILE PHOTO CROP MODAL
        ===================================================== */}

        {cropOpen && cropImage && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="crop-profile-photo-title"
          >
            <div className="w-full max-w-lg rounded-2xl border border-[#D6E2F2] bg-white p-5 sm:p-6 text-[#10182D] shadow-2xl">

              <div className="flex items-center justify-between">

                <div>
                  <h2
                    id="crop-profile-photo-title"
                    className="text-lg sm:text-xl font-semibold text-[#10182D]"
                  >
                    Crop Profile Photo
                  </h2>

                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#617493]">
                    Adjust your photo before saving.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (cropImage) {
                      URL.revokeObjectURL(cropImage);
                    }

                    setCropOpen(false);
                    setCropImage(null);
                    setCroppedAreaPixels(null);
                    setZoom(1);
                    setCrop({
                      x: 0,
                      y: 0,
                    });

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  disabled={uploadingPhoto}
                  className="rounded-md p-2 text-[#617493] hover:bg-[#F3F7FF] hover:text-[#10182D]"
                  aria-label="Close crop profile photo"
                >
                  ×
                </button>

              </div>

              {/* Crop area */}

              <div className="relative mt-5 sm:mt-6 h-[280px] sm:h-[320px] w-full overflow-hidden rounded-xl bg-black">
                <Cropper
                  image={cropImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              </div>

              {/* Zoom */}

              <div className="mt-4 sm:mt-5">

                <label
                  htmlFor="profile-photo-zoom"
                  className="text-xs sm:text-sm font-medium text-[#10182D]"
                >
                  Zoom
                </label>

                <input
                  id="profile-photo-zoom"
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(event) =>
                    setZoom(
                      Number(event.target.value)
                    )
                  }
                  className="mt-2.5 sm:mt-3 w-full accent-[#2875F5]"
                />

              </div>

              {/* Actions */}

              <div className="mt-5 sm:mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end sm:gap-3">

                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingPhoto}
                  onClick={() => {
                    if (cropImage) {
                      URL.revokeObjectURL(cropImage);
                    }

                    setCropOpen(false);
                    setCropImage(null);
                    setCroppedAreaPixels(null);
                    setZoom(1);
                    setCrop({
                      x: 0,
                      y: 0,
                    });

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="w-full sm:w-auto border-[#D6E2F2] bg-white text-xs sm:text-sm text-[#10182D] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  disabled={
                    uploadingPhoto ||
                    !croppedAreaPixels
                  }
                  onClick={handleCropSave}
                  className="w-full sm:w-auto bg-[#2875F5] text-xs sm:text-sm text-white hover:bg-[#155DCC]"
                >
                  {uploadingPhoto
                    ? "Saving..."
                    : "Crop & Save"}
                </Button>

              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            CONTACT MODAL
        ===================================================== */}

        {contactOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-profile-title"
          >
            <div className="w-full max-w-md rounded-2xl border border-[#D6E2F2] bg-white p-5 sm:p-6 text-[#10182D] shadow-2xl">

              <div className="flex items-center justify-between">

                <div>
                  <h2
                    id="contact-profile-title"
                    className="text-lg sm:text-xl font-semibold text-[#10182D]"
                  >
                    Contact{" "}
                    {profile.username}
                  </h2>

                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#617493]">
                    Get in touch directly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setContactOpen(false)
                  }
                  className="rounded-md p-2 text-[#617493] hover:bg-[#F3F7FF] hover:text-[#10182D]"
                  aria-label="Close contact"
                >
                  ×
                </button>

              </div>

              <div className="mt-5 sm:mt-6 space-y-3">

                {profile.contact_email && (
                  <a
                    href={`mailto:${profile.contact_email}`}
                    className="flex items-center gap-3 rounded-xl border border-[#D6E2F2] bg-white p-3.5 sm:p-4 transition hover:bg-[#F3F7FF]"
                  >
                    <Mail className="size-5 text-[#2875F5]" />

                    <div className="min-w-0">

                      <p className="text-xs text-[#617493]">
                        Email
                      </p>

                      <p className="break-all text-xs sm:text-sm font-medium text-[#10182D]">
                        {profile.contact_email}
                      </p>

                    </div>
                  </a>
                )}

                {profile.contact_phone && (
                  <a
                    href={`tel:${profile.contact_phone}`}
                    className="flex items-center gap-3 rounded-xl border border-[#D6E2F2] bg-white p-3.5 sm:p-4 transition hover:bg-[#F3F7FF]"
                  >
                    <Phone className="size-5 text-[#2875F5]" />

                    <div>

                      <p className="text-xs text-[#617493]">
                        Mobile
                      </p>

                      <p className="text-xs sm:text-sm font-medium text-[#10182D]">
                        {profile.contact_phone}
                      </p>

                    </div>
                  </a>
                )}

              </div>

              <div className="mt-5 sm:mt-6 flex justify-end">

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setContactOpen(false)
                  }
                  className="w-full sm:w-auto border-[#D6E2F2] bg-white text-xs sm:text-sm text-[#10182D] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
                >
                  Close
                </Button>

              </div>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}

export default Profile;