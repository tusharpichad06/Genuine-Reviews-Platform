import {
  BriefcaseBusiness,
  Globe,
  ImagePlus,
  Info,
  MapPin,
  Mail,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";

import { supabase } from "../../lib/supabase";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import BusinessAttachments from "./BusinessAttachments";
/*
 * =========================================================
 * TYPES
 * =========================================================
 */

export type BusinessProfile = {
  id: string;
  user_id: string;
  business_name: string;
  logo_url: string | null;
  category: string;
  short_description: string;
  description: string;
  location: string | null;
  website: string | null;
  business_email: string | null;
  business_phone: string | null;
  services: string[];
  created_at: string;
  updated_at: string;
};

type BusinessProfileFormProps = {
  mode: "create" | "edit";
  initialData?: BusinessProfile | null;
  onSuccess?: (
    businessProfile: BusinessProfile
  ) => void;
  onCancel?: () => void;
};

/*
 * =========================================================
 * CATEGORY SYSTEM
 * =========================================================
 */

const categories = [
  "Products",
  "Services",
  "Places",
  "Food & Restaurants",
  "Electronics",
  "Travel",
  "Education",
  "Health & Wellness",
  "Automotive",
  "Technology",
  "Other",
];

/*
 * =========================================================
 * CONSTANTS
 * =========================================================
 */

const MAX_SERVICES = 10;
const MAX_SERVICE_LENGTH = 100;
const MAX_LOGO_SIZE = 5 * 1024 * 1024;

/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

function BusinessProfileForm({
  mode,
  initialData = null,
  onSuccess,
  onCancel,
}: BusinessProfileFormProps) {
  /*
   * =======================================================
   * FORM STATE
   * =======================================================
   */

const [businessName, setBusinessName] =
  useState(initialData?.business_name ?? "");

const [logoUrl, setLogoUrl] =
  useState(initialData?.logo_url ?? null);

const [category, setCategory] =
  useState(initialData?.category ?? "");

const [shortDescription, setShortDescription] =
  useState(initialData?.short_description ?? "");

const [description, setDescription] =
  useState(initialData?.description ?? "");

const [location, setLocation] =
  useState(initialData?.location ?? "");

const [website, setWebsite] =
  useState(initialData?.website ?? "");

const [businessEmail, setBusinessEmail] =
  useState(initialData?.business_email ?? "");

const [businessPhone, setBusinessPhone] =
  useState(initialData?.business_phone ?? "");

const [services, setServices] =
  useState<string[]>(
    Array.isArray(initialData?.services)
      ? initialData.services
      : []
  );

  const serviceInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /*
   * =======================================================
   * LOGO STATE
   * =======================================================
   */

  const [logoFile, setLogoFile] =
    useState<File | null>(null);

  const [logoPreview, setLogoPreview] =
    useState<string | null>(null);

  const [removeExistingLogo, setRemoveExistingLogo] =
    useState(false);

  const logoInputRef =
    useRef<HTMLInputElement | null>(null);

  /*
   * =======================================================
   * LOGO CROP STATE
   * =======================================================
   */

  const [cropOpen, setCropOpen] =
    useState(false);

  const [cropImage, setCropImage] =
    useState<string | null>(null);

  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] =
    useState(1);

  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>(null);

  const [savingCrop, setSavingCrop] =
    useState(false);

  /*
   * =======================================================
   * UI STATE
   * =======================================================
   */

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

    const [pendingAttachments, setPendingAttachments] =
  useState<File[]>([]);
  /*
   * =======================================================
   * LOAD INITIAL DATA
   * =======================================================
   */

  useEffect(() => {
    if (!initialData) {
      setBusinessName("");
      setCategory("");
      setShortDescription("");
      setDescription("");
      setLocation("");
      setWebsite("");
      setBusinessEmail("");
      setBusinessPhone("");
      setServices([""]);
      setLogoFile(null);
      setLogoPreview(null);
      setRemoveExistingLogo(false);

      return;
    }

    setBusinessName(
      initialData.business_name ?? ""
    );

    setCategory(
      initialData.category ?? ""
    );

    setShortDescription(
      initialData.short_description ?? ""
    );

    setDescription(
      initialData.description ?? ""
    );

    setLocation(
      initialData.location ?? ""
    );

    setWebsite(
      initialData.website ?? ""
    );

    setBusinessEmail(
      initialData.business_email ?? ""
    );

    setBusinessPhone(
      initialData.business_phone ?? ""
    );

    const existingServices =
      Array.isArray(initialData.services)
        ? initialData.services
        : [];

    setServices(
      existingServices.length > 0
        ? existingServices
        : [""]
    );

    setLogoFile(null);

    setLogoPreview(
      initialData.logo_url ?? null
    );

    setRemoveExistingLogo(false);
  }, [initialData]);

  /*
   * =======================================================
   * CLEANUP LOGO PREVIEW
   * =======================================================
   */

  useEffect(() => {
    return () => {
      if (
        logoPreview &&
        logoPreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(logoPreview);
      }

      if (cropImage) {
        URL.revokeObjectURL(cropImage);
      }
    };
  }, [logoPreview, cropImage]);

  /*
   * =======================================================
   * SERVICES
   * =======================================================
   */

  function handleServiceChange(
    index: number,
    value: string
  ) {
    setServices((currentServices) => {
      const updated = [
        ...currentServices,
      ];

      updated[index] = value;

      return updated;
    });
  }

  function handleAddService() {

    
    if (services.length >= MAX_SERVICES) {
      return;
    }

    setServices((currentServices) => [
      ...currentServices,
      "",
    ]);
  }

  const handleServiceKeyDown = (
  event: React.KeyboardEvent<HTMLInputElement>,
  index: number
) => {
  if (event.key !== "Enter") return;

  event.preventDefault();

  const value = services[index]?.trim();

  if (!value) return;

  handleAddService();

  setTimeout(() => {
    serviceInputRefs.current[index + 1]?.focus();
  }, 0);
};
  

  function handleRemoveService(
    index: number
  ) {
    setServices((currentServices) => {
      if (currentServices.length === 1) {
        return [""];
      }

      return currentServices.filter(
        (_, serviceIndex) =>
          serviceIndex !== index
      );
    });
  }

  /*
   * =======================================================
   * LOGO CROP
   * =======================================================
   */

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

  function closeCropModal() {
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

    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  }

  /*
   * =======================================================
   * LOGO SELECTION
   * =======================================================
   */

  function handleLogoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const isImageExt = fileExt && ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(fileExt);

    if (!file.type.startsWith("image/") && !isImageExt) {
      setError(
        "Please select a valid image file for the business logo."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      setError(
        "Business logo must be 5 MB or smaller."
      );

      event.target.value = "";
      return;
    }

    try {
      const imageUrl =
        URL.createObjectURL(file);

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
        "BUSINESS LOGO SELECT ERROR:",
        err
      );

      setError(
        "Something went wrong while selecting your logo."
      );

      event.target.value = "";
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
          new Error(
            "Unable to load selected logo."
          )
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

    const outputSize = 512;

    canvas.width = outputSize;
    canvas.height = outputSize;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputSize,
      outputSize
    );

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(
              new Error(
                "Unable to create cropped logo."
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
      !croppedAreaPixels
    ) {
      return;
    }

    try {
      setSavingCrop(true);

      const croppedBlob =
        await createCroppedImage(
          cropImage,
          croppedAreaPixels
        );

      const croppedFile = new File(
        [croppedBlob],
        `business-logo-${Date.now()}.jpg`,
        {
          type: "image/jpeg",
        }
      );

      const croppedPreviewUrl =
        URL.createObjectURL(croppedBlob);

      if (
        logoPreview &&
        logoPreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(logoPreview);
      }

      setLogoFile(croppedFile);
      setLogoPreview(croppedPreviewUrl);
      setRemoveExistingLogo(false);

      URL.revokeObjectURL(cropImage);

      setCropOpen(false);
      setCropImage(null);
      setCroppedAreaPixels(null);
      setZoom(1);
      setCrop({
        x: 0,
        y: 0,
      });

      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    } catch (err) {
      console.error(
        "BUSINESS LOGO CROP ERROR:",
        err
      );

      setError(
        "Something went wrong while cropping your business logo."
      );
    } finally {
      setSavingCrop(false);
    }
  }

  /*
   * =======================================================
   * REMOVE LOGO
   * =======================================================
   */

  function handleRemoveLogo() {
    if (
      logoPreview &&
      logoPreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(null);
    setLogoPreview(null);

    if (mode === "edit") {
      setRemoveExistingLogo(true);
    }

    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  }

  /*
   * =======================================================
   * VALIDATION
   * =======================================================
   */

  function isValidWebsite(
    value: string
  ) {
    if (!value.trim()) {
      return true;
    }

    try {
      const url = new URL(value);

      return (
        url.protocol === "http:" ||
        url.protocol === "https:"
      );
    } catch {
      return false;
    }
  }

  function isValidEmail(
    value: string
  ) {
    if (!value.trim()) {
      return true;
    }

   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
  value.trim()
);
  }

  function validateForm() {
    const trimmedBusinessName =
      businessName.trim();

    const trimmedShortDescription =
      shortDescription.trim();

    const trimmedDescription =
      description.trim();

    if (!trimmedBusinessName) {
      return "Business name is required.";
    }

    if (
      trimmedBusinessName.length < 2
    ) {
      return "Business name must contain at least 2 characters.";
    }

    if (
      trimmedBusinessName.length > 150
    ) {
      return "Business name must be 150 characters or less.";
    }

    if (!category) {
      return "Please select a business category.";
    }

    if (!categories.includes(category)) {
      return "Please select a valid business category.";
    }

    if (!trimmedShortDescription) {
      return "Short description is required.";
    }

    if (
      trimmedShortDescription.length > 300
    ) {
      return "Short description must be 300 characters or less.";
    }

    if (!trimmedDescription) {
      return "Business description is required.";
    }

    if (
      trimmedDescription.length > 5000
    ) {
      return "Business description must be 5000 characters or less.";
    }

    if (!isValidWebsite(website)) {
      return "Please enter a valid website URL, including https:// or http://.";
    }

    if (!isValidEmail(businessEmail)) {
      return "Please enter a valid business email address.";
    }

    const cleanedServices =
      services
        .map((service) =>
          service.trim()
        )
        .filter(Boolean);

    if (
      cleanedServices.length >
      MAX_SERVICES
    ) {
      return `You can add up to ${MAX_SERVICES} services.`;
    }

    for (const service of cleanedServices) {
      if (
        service.length >
        MAX_SERVICE_LENGTH
      ) {
        return `Each service must be ${MAX_SERVICE_LENGTH} characters or less.`;
      }
    }

    return null;
  }

  /*
   * =======================================================
   * LOGO UPLOAD
   * =======================================================
   */

  async function uploadLogo(
    userId: string,
    businessId: string,
    file: File
  ) {
    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const filePath =
  `business/${businessId}/logo-${Date.now()}.${extension}`;

    const {
      error: uploadError,
    } = await supabase.storage
      .from("business-assets")
      .upload(
        filePath,
        file,
        {
          cacheControl: "3600",
          contentType: file.type,
          upsert: true,
        }
      );

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from("business-assets")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  /*
   * =======================================================
   * SUBMIT
   * =======================================================
   */

  async function uploadPendingAttachments(
  userId: string,
  businessId: string,
  files: File[]
) {
  for (const file of files) {
    const safeFileName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-");

    const filePath =
      `business/${businessId}/portfolio/${Date.now()}-${safeFileName}`;

    const {
      error: uploadError,
    } = await supabase.storage
      .from("business-assets")
      .upload(
        filePath,
        file,
        {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        }
      );

    if (uploadError) {
      throw uploadError;
    }

    const {
      error: databaseError,
    } = await supabase
      .from("business_attachments")
      .insert({
        business_id: businessId,
        uploaded_by: userId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
      });

    if (databaseError) {
      await supabase.storage
        .from("business-assets")
        .remove([filePath]);

      throw databaseError;
    }
  }
}


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      /*
       * ===================================================
       * GET AUTHENTICATED USER
       * ===================================================
       */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "BUSINESS PROFILE USER ERROR:",
          userError
        );

        setError(
          "Unable to verify your account."
        );

        return;
      }

      if (!user) {
        setError(
          "You need to log in before creating a business profile."
        );

        return;
      }

      /*
       * ===================================================
       * CLEAN SERVICES
       * ===================================================
       */

      const cleanedServices =
        services
          .map((service) =>
            service.trim()
          )
          .filter(Boolean);

      /*
       * ===================================================
       * CREATE
       * ===================================================
       */

      if (mode === "create") {
        const {
          data: createdBusiness,
          error: createError,
        } = await supabase
          .from("business_profiles")
          .insert({
            user_id: user.id,
            business_name:
              businessName.trim(),
            category,
            short_description:
              shortDescription.trim(),
            description:
              description.trim(),
            location:
              location.trim() || null,
            website:
              website.trim() || null,
            business_email:
              businessEmail.trim() || null,
            business_phone:
              businessPhone.trim() || null,
            services:
              cleanedServices,
          })
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
          .single();

        if (createError) {
          console.error(
            "BUSINESS PROFILE CREATE ERROR:",
            createError
          );

          if (
            createError.code ===
            "23505"
          ) {
            setError(
              "You already have a business profile."
            );
          } else {
            setError(
              createError.message ||
                "Unable to create your business profile."
            );
          }

          return;
        }

        if (!createdBusiness) {
          setError(
            "Business profile could not be created."
          );

          return;
        }

        let finalBusiness =
          createdBusiness as BusinessProfile;

        /*
         * =================================================
         * UPLOAD LOGO
         * =================================================
         */

        if (logoFile) {
          try {
            const logoUrl =
              await uploadLogo(
                user.id,
                createdBusiness.id,
                logoFile
              );

            const {
              data: updatedBusiness,
              error:
                logoDatabaseError,
            } = await supabase
              .from("business_profiles")
              .update({
                logo_url: logoUrl,
                updated_at:
                  new Date().toISOString(),
              })
              .eq(
                "id",
                createdBusiness.id
              )
              .eq(
                "user_id",
                user.id
              )
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
              .single();

            if (
              logoDatabaseError
            ) {
              console.error(
                "BUSINESS LOGO DATABASE ERROR:",
                logoDatabaseError
              );

              setError(
                "Business profile was created, but the logo could not be saved."
              );

              return;
            }

            if (updatedBusiness) {
              finalBusiness =
                updatedBusiness as BusinessProfile;
            }
          } catch (logoError) {
            console.error(
              "BUSINESS LOGO UPLOAD ERROR:",
              logoError
            );

            setError(
              "Business profile was created, but the logo could not be uploaded."
            );

            return;
          }
        }

        if (pendingAttachments.length > 0) {
  try {
    await uploadPendingAttachments(
      user.id,
      createdBusiness.id,
      pendingAttachments
    );
  } catch (attachmentError) {
    console.error(
      "BUSINESS ATTACHMENT UPLOAD ERROR:",
      attachmentError
    );

    setError(
      "Business profile was created, but one or more portfolio files could not be uploaded."
    );

    return;
  }
}

onSuccess?.(finalBusiness);
return;
      }

      /*
       * ===================================================
       * EDIT
       * ===================================================
       */

      if (
        mode === "edit" &&
        initialData
      ) {
        let logoUrl =
          initialData.logo_url;

        if (removeExistingLogo) {
          logoUrl = null;
        }

        if (logoFile) {
          try {
            logoUrl =
              await uploadLogo(
                user.id,
                initialData.id,
                logoFile
              );
          } catch (logoError) {
            console.error(
              "BUSINESS LOGO REPLACEMENT ERROR:",
              logoError
            );

            setError(
              "Unable to upload the new business logo."
            );

            return;
          }
        }

        const {
          data: updatedBusiness,
          error: updateError,
        } = await supabase
          .from("business_profiles")
          .update({
            business_name:
              businessName.trim(),
            logo_url: logoUrl,
            category,
            short_description:
              shortDescription.trim(),
            description:
              description.trim(),
            location:
              location.trim() || null,
            website:
              website.trim() || null,
            business_email:
              businessEmail.trim() || null,
            business_phone:
              businessPhone.trim() || null,
            services:
              cleanedServices,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            initialData.id
          )
          .eq(
            "user_id",
            user.id
          )
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
          .single();

        if (updateError) {
          console.error(
            "BUSINESS PROFILE UPDATE ERROR:",
            updateError
          );

          setError(
            updateError.message ||
              "Unable to save your business profile."
          );

          return;
        }

        if (!updatedBusiness) {
          setError(
            "Business profile could not be saved."
          );

          return;
        }

        onSuccess?.(
          updatedBusiness as BusinessProfile
        );
      }
    } catch (err) {
      console.error(
        "BUSINESS PROFILE SUBMIT ERROR:",
        err
      );

      setError(
        "Something went wrong while saving your business profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * =======================================================
   * SECTION TITLE
   * =======================================================
   */

  function SectionTitle({
    icon,
    title,
    description,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }) {
    return (
      <div>
        <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#e9f4ff] px-2.5 sm:px-3 py-1 sm:py-1.5">
          <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#d9edff] text-[#1687f8]">
            {icon}
          </span>

          <h2 className="text-xs sm:text-sm font-bold text-[#0874df]">
            {title}
          </h2>
        </div>

        <p className="mt-1.5 sm:mt-2 text-xs leading-5 text-[#617493]">
          {description}
        </p>
      </div>
    );
  }

  /*
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <form
      onSubmit={handleSubmit}
      className="p-2.5 sm:p-4 lg:p-5"
    >
      {/* ===================================================
          ERROR
      ================================================== */}

      {error && (
        <div
          role="alert"
          className="
            mb-4 sm:mb-5
            rounded-xl
            border
            border-[#F2C5C5]
            bg-[#FEF2F2]
            px-3.5 sm:px-4
            py-2.5 sm:py-3
            text-xs sm:text-sm
            font-medium
            text-[#B91C1C]
          "
        >
          {error}
        </div>
      )}

      {/* ===================================================
          BUSINESS IDENTITY
      ================================================== */}

      <section
        className="
          rounded-xl sm:rounded-[12px]
          border
          border-[#cfe5f8]
          bg-white
          p-3.5 sm:p-5
        "
      >
        <SectionTitle
          icon={
            <BriefcaseBusiness className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          }
          title="Business Identity"
          description="Tell people about your business."
        />

        <div
          className="
            mt-4 sm:mt-5
            grid
            gap-4 sm:gap-5
            lg:grid-cols-[1.35fr_0.72fr_1.1fr]
            lg:items-start
          "
        >
          {/* Business Name */}

          <div className="space-y-1.5 sm:space-y-2">
            <label
              htmlFor="business-name"
              className="block text-xs font-semibold text-[#123b7a]"
            >
              Business Name{" "}
              <span className="text-[#2875F5]">
                *
              </span>
            </label>

            <Input
              id="business-name"
              value={businessName}
              onChange={(event) =>
                setBusinessName(
                  event.target.value
                )
              }
              placeholder="Enter your business name"
              maxLength={150}
              disabled={loading}
              className="
                h-9
                rounded-[7px]
                border-[#c9dcf2]
                bg-white
                text-xs
                text-[#10182D]
                shadow-none
                placeholder:text-[#8ca8ca]
                focus-visible:border-[#2875F5]
                focus-visible:ring-2
                focus-visible:ring-[#2875F5]/15
              "
            />

            <p className="text-[10px] text-[#617493]">
              {businessName.length}/150
            </p>

            {/* Category */}

            <div className="pt-1">
              <label
                htmlFor="business-category"
                className="mb-1.5 sm:mb-2 block text-xs font-semibold text-[#123b7a]"
              >
                Business Category{" "}
                <span className="text-[#2875F5]">
                  *
                </span>
              </label>

              <select
                id="business-category"
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
                disabled={loading}
                className="
                  flex
                  h-9
                  w-full
                  rounded-[7px]
                  border
                  border-[#c9dcf2]
                  bg-white
                  px-3
                  py-2
                  text-xs
                  text-[#10182D]
                  outline-none
                  transition
                  focus:border-[#2875F5]
                  focus:ring-2
                  focus:ring-[#2875F5]/15
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <option value="">
                  Select a category
                </option>

                {categories.map(
                  (categoryName) => (
                    <option
                      key={categoryName}
                      value={categoryName}
                    >
                      {categoryName}
                    </option>
                  )
                )}
              </select>

              <p className="mt-1 text-[10px] text-[#617493]">
                Choose a category for your business.
              </p>
            </div>
          </div>

          {/* Business Logo */}

          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs font-semibold text-[#123b7a]">
              Business Logo
            </label>

            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              disabled={loading}
              className="hidden"
            />

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                logoInputRef.current?.click()
              }
              className="
                flex
                h-[115px] sm:h-[125px]
                w-full
                flex-col
                items-center
                justify-center
                rounded-[9px]
                border
                border-dashed
                border-[#a9d7ff]
                bg-[#f8fcff]
                p-3
                text-center
                transition
                hover:border-[#2875F5]
                hover:bg-[#f0f8ff]
              "
            >
              {logoPreview ? (
                <div className="relative h-full w-full overflow-hidden rounded-[8px]">
                  <img
                    src={logoPreview}
                    alt="Business logo preview"
                    className="h-full w-full object-cover"
                  />

                  <span
                    className="
                      absolute
                      bottom-2
                      left-1/2
                      -translate-x-1/2
                      rounded-full
                      bg-white/95
                      px-3
                      py-1
                      text-[10px]
                      font-semibold
                      text-[#2875F5]
                      shadow-sm
                    "
                  >
                    Replace Logo
                  </span>
                </div>
              ) : (
                <>
                  <span
                    className="
                      flex
                      h-9 w-9 sm:h-10 sm:w-10
                      items-center
                      justify-center
                      rounded-full
                      bg-[#e8f4ff]
                      text-[#1687f8]
                    "
                  >
                    <ImagePlus className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>

                  <span className="mt-2 text-xs font-semibold text-[#0874df]">
                    Upload Logo
                  </span>

                  <span className="mt-0.5 sm:mt-1 text-[9px] text-[#617493]">
                    PNG, JPG, JPEG, WEBP
                  </span>
                </>
              )}
            </button>

            {logoPreview && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                disabled={loading}
                className="
                  text-[10px]
                  font-semibold
                  text-[#dc2626]
                  hover:text-[#b91c1c]
                "
              >
                Remove Logo
              </button>
            )}
          </div>

          {/* Short Description */}

          <div className="space-y-1.5 sm:space-y-2">
            <label
              htmlFor="business-short-description"
              className="block text-xs font-semibold text-[#123b7a]"
            >
              Short Description{" "}
              <span className="text-[#2875F5]">
                *
              </span>
            </label>

            <Textarea
              id="business-short-description"
              value={shortDescription}
              onChange={(event) =>
                setShortDescription(
                  event.target.value
                )
              }
              placeholder="Tell people briefly about your business..."
              rows={5}
              maxLength={300}
              disabled={loading}
              className="
                min-h-[110px] sm:min-h-[125px]
                resize-none
                rounded-[7px]
                border-[#c9dcf2]
                bg-white
                text-xs
                leading-5
                text-[#10182D]
                shadow-none
                placeholder:text-[#8ca8ca]
                focus-visible:border-[#2875F5]
                focus-visible:ring-2
                focus-visible:ring-[#2875F5]/15
              "
            />

            <p className="text-right text-[10px] text-[#617493]">
              {shortDescription.length}/300
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
          BUSINESS INFORMATION
      ================================================== */}

      <section
        className="
          mt-3
          rounded-xl sm:rounded-[12px]
          border
          border-[#cfe5f8]
          bg-white
          p-3.5 sm:p-5
        "
      >
        <SectionTitle
          icon={
            <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          }
          title="Business Information"
          description="Add useful information people can use to understand or contact your business."
        />

        <div
          className="
            mt-4 sm:mt-5
            grid
            gap-4 sm:gap-5
            lg:grid-cols-[1fr_1.25fr]
          "
        >
          {/* Description */}

          <div className="space-y-1.5 sm:space-y-2">
            <label
              htmlFor="business-description"
              className="block text-xs font-semibold text-[#123b7a]"
            >
              Business Description{" "}
              <span className="text-[#2875F5]">
                *
              </span>
            </label>

            <Textarea
              id="business-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Tell people more about your business..."
              rows={8}
              maxLength={5000}
              disabled={loading}
              className="
                min-h-[150px] sm:min-h-[175px]
                resize-none
                rounded-[7px]
                border-[#c9dcf2]
                bg-white
                text-xs
                leading-5
                text-[#10182D]
                shadow-none
                placeholder:text-[#8ca8ca]
                focus-visible:border-[#2875F5]
                focus-visible:ring-2
                focus-visible:ring-[#2875F5]/15
              "
            />

            <p className="text-right text-[10px] text-[#617493]">
              {description.length}/5000
            </p>
          </div>

          {/* Right side */}

          <div className="grid content-start gap-3.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {/* Location */}

            <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
              <label
                htmlFor="business-location"
                className="block text-xs font-semibold text-[#123b7a]"
              >
                Location
              </label>

              <div className="relative">
                <MapPin
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-[#2875F5]
                  "
                />

                <Input
                  id="business-location"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                  placeholder="City, State / Country"
                  disabled={loading}
                  className="
                    h-9
                    rounded-[7px]
                    border-[#c9dcf2]
                    bg-white
                    pl-9
                    text-xs
                    text-[#10182D]
                    shadow-none
                    placeholder:text-[#8ca8ca]
                    focus-visible:border-[#2875F5]
                    focus-visible:ring-2
                    focus-visible:ring-[#2875F5]/15
                  "
                />
              </div>

              <p className="text-[10px] text-[#617493]">
                (Optional)
              </p>
            </div>

            {/* Website */}

            <div className="space-y-1.5 sm:space-y-2">
              <label
                htmlFor="business-website"
                className="block text-xs font-semibold text-[#123b7a]"
              >
                Website
              </label>

              <div className="relative">
                <Globe
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-[#2875F5]
                  "
                />

                <Input
                  id="business-website"
                  type="url"
                  value={website}
                  onChange={(event) =>
                    setWebsite(
                      event.target.value
                    )
                  }
                  placeholder="https://example.com"
                  disabled={loading}
                  className="
                    h-9
                    rounded-[7px]
                    border-[#c9dcf2]
                    bg-white
                    pl-9
                    text-xs
                    text-[#10182D]
                    shadow-none
                    placeholder:text-[#8ca8ca]
                    focus-visible:border-[#2875F5]
                    focus-visible:ring-2
                    focus-visible:ring-[#2875F5]/15
                  "
                />
              </div>

              <p className="text-[10px] text-[#617493]">
                (Optional)
              </p>
            </div>

            {/* Business Email */}

            <div className="space-y-1.5 sm:space-y-2">
              <label
                htmlFor="business-email"
                className="block text-xs font-semibold text-[#123b7a]"
              >
                Business Email
              </label>

              <div className="relative">
                <Mail
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-[#2875F5]
                  "
                />

                <Input
                  id="business-email"
                  type="email"
                  value={businessEmail}
                  onChange={(event) =>
                    setBusinessEmail(
                      event.target.value
                    )
                  }
                  placeholder="business@example.com"
                  disabled={loading}
                  className="
                    h-9
                    rounded-[7px]
                    border-[#c9dcf2]
                    bg-white
                    pl-9
                    text-xs
                    text-[#10182D]
                    shadow-none
                    placeholder:text-[#8ca8ca]
                    focus-visible:border-[#2875F5]
                    focus-visible:ring-2
                    focus-visible:ring-[#2875F5]/15
                  "
                />
              </div>

              <p className="text-[10px] text-[#617493]">
                (Optional)
              </p>
            </div>

            {/* Business Phone */}

            <div className="space-y-1.5 sm:space-y-2 sm:col-span-2 sm:max-w-[250px]">
              <label
                htmlFor="business-phone"
                className="block text-xs font-semibold text-[#123b7a]"
              >
                Business Phone
              </label>

              <div className="relative">
                <Phone
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-[#2875F5]
                  "
                />

                <Input
                  id="business-phone"
                  type="tel"
                  value={businessPhone}
                  onChange={(event) =>
                    setBusinessPhone(
                      event.target.value
                    )
                  }
                  placeholder="+91 XXXXX XXXXX"
                  disabled={loading}
                  className="
                    h-9
                    rounded-[7px]
                    border-[#c9dcf2]
                    bg-white
                    pl-9
                    text-xs
                    text-[#10182D]
                    shadow-none
                    placeholder:text-[#8ca8ca]
                    focus-visible:border-[#2875F5]
                    focus-visible:ring-2
                    focus-visible:ring-[#2875F5]/15
                  "
                />
              </div>

              <p className="text-[10px] text-[#617493]">
                (Optional)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          SERVICES
      ================================================== */}

      <section
        className="
          mt-3
          rounded-xl sm:rounded-[12px]
          border
          border-[#cfe5f8]
          bg-white
          p-3.5 sm:p-5
        "
      >
        <div className="flex items-start justify-between gap-3">
          <SectionTitle
            icon={
              <BriefcaseBusiness className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            }
            title="Services"
            description="Add the main services your business provides."
          />

          <Button
            type="button"
            variant="outline"
            onClick={handleAddService}
            disabled={
              loading ||
              services.length >=
                MAX_SERVICES
            }
            className="
              h-8
              shrink-0
              rounded-full
              border-[#cfe5f8]
              bg-[#eef8ff]
              px-3
              text-[11px]
              font-semibold
              text-[#0874df]
              shadow-none
              hover:border-[#a9d7ff]
              hover:bg-[#e2f2ff]
              hover:text-[#155DCC]
            "
          >
            <Plus className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Add Service
          </Button>
        </div>

        <div
          className="
            mt-3.5 sm:mt-4
            grid
            gap-2 sm:gap-2.5
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          {services.map(
            (service, index) => (
              <div
                key={index}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-[#cfe5f8]
                  bg-[#f7fbff]
                  px-3
                  py-1
                  focus-within:border-[#2875F5]
                "
              >
                <Input
  ref={(element) => {
    serviceInputRefs.current[index] = element;
  }}
  value={service}
  onChange={(event) =>
    handleServiceChange(
      index,
      event.target.value
    )
  }
  onKeyDown={(event) =>
    handleServiceKeyDown(event, index)
  }
  placeholder={`Service ${index + 1}`}
  maxLength={MAX_SERVICE_LENGTH}
  disabled={loading}
  className="
    h-7
    border-0
    bg-transparent
    px-0
    text-xs
    text-[#10182D]
    shadow-none
    placeholder:text-[#8ca8ca]
    focus-visible:ring-0
  "
/>

                <button
                  type="button"
                  disabled={
                    loading ||
                    services.length === 1
                  }
                  onClick={() =>
                    handleRemoveService(
                      index
                    )
                  }
                  className="
                    flex
                    h-6
                    w-6
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    text-[#2875F5]
                    transition
                    hover:bg-[#e8f2ff]
                    hover:text-[#155DCC]
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
                  aria-label={`Remove service ${index + 1}`}
                >
                  <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </div>
            )
          )}
        </div>

        <p className="mt-2.5 sm:mt-3 text-[10px] text-[#617493]">
          Maximum {MAX_SERVICES} services.
        </p>
      </section>

      {/* ===================================================
          PORTFOLIO
      ================================================== */}

      <section
        className="
          mt-3
          rounded-xl sm:rounded-[12px]
          border
          border-[#cfe5f8]
          bg-white
          p-3.5 sm:p-5
        "
      >
        <SectionTitle
          icon={
            <ImagePlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          }
          title="Portfolio & Attachments"
          description="Showcase your work, services and business materials."
        />

        <div className="mt-3.5 sm:mt-4">
  <BusinessAttachments
    businessId={
      mode === "edit"
        ? initialData?.id
        : null
    }
    disabled={loading}
    onPendingFilesChange={
      setPendingAttachments
    }
  />
</div>
      </section>

      {/* ===================================================
          PUBLIC VISIBILITY NOTICE
      ================================================== */}

      <div
        className="
          mt-3
          flex
          items-start
          gap-2.5 sm:gap-3
          rounded-xl sm:rounded-[9px]
          border
          border-[#cfe5f8]
          bg-[#edf8ff]
          px-3.5 sm:px-4
          py-2.5 sm:py-3
        "
      >
        <div
          className="
            mt-0.5
            flex
            h-6 w-6 sm:h-7 sm:w-7
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-white
            text-[#2875F5]
          "
        >
          <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>

        <div>
          <p className="text-xs font-semibold text-[#155DCC]">
            Your business profile will be publicly visible.
          </p>

          <p className="mt-0.5 text-[10px] leading-4 sm:leading-5 text-[#617493]">
            Normal users and businesses can view your
            profile, services, portfolio and reviews.
          </p>
        </div>
      </div>

      {/* ===================================================
          ACTIONS
      ================================================== */}

      <div
        className="
          mt-4
          flex
          flex-col-reverse
          gap-2.5 sm:gap-3
          sm:flex-row
          sm:justify-end
        "
      >
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={onCancel}
          className="
            h-9
            w-full sm:w-auto
            rounded-[7px]
            border-[#c9dcf2]
            bg-white
            px-5 sm:px-6
            text-xs
            font-semibold
            text-[#617493]
            shadow-none
            hover:border-[#a9d7ff]
            hover:bg-[#f3f8ff]
            hover:text-[#2875F5]
          "
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={
            loading ||
            !businessName.trim() ||
            !category ||
            !shortDescription.trim() ||
            !description.trim()
          }
          className="
            h-9
            w-full sm:w-auto
            rounded-[7px]
            bg-[#1687f8]
            px-4 sm:px-5
            text-xs
            font-semibold
            text-white
            shadow-[0_4px_12px_rgba(22,135,248,0.20)]
            hover:bg-[#0874df]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Business Profile"
              : "Save Changes"}
        </Button>
      </div>


      {/* ===================================================
          BUSINESS LOGO CROP MODAL
      ================================================== */}

      {cropOpen && cropImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="crop-business-logo-title"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#D6E2F2] bg-white p-4 sm:p-6 text-[#10182D] shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2
                  id="crop-business-logo-title"
                  className="text-lg sm:text-xl font-semibold text-[#10182D]"
                >
                  Crop Business Logo
                </h2>

                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#617493]">
                  Adjust your logo before saving.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCropModal}
                disabled={savingCrop || loading}
                className="rounded-md p-2 text-[#617493] transition hover:bg-[#F3F7FF] hover:text-[#10182D] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close crop business logo"
              >
                ×
              </button>
            </div>

            <div className="relative mt-4 sm:mt-6 h-[260px] sm:h-[320px] w-full overflow-hidden rounded-xl bg-[#111827]">
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

            <div className="mt-4 sm:mt-5">
              <label
                htmlFor="business-logo-zoom"
                className="text-xs sm:text-sm font-medium text-[#10182D]"
              >
                Zoom
              </label>

              <input
                id="business-logo-zoom"
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(event) =>
                  setZoom(Number(event.target.value))
                }
                className="mt-2.5 sm:mt-3 w-full accent-[#2875F5]"
              />
            </div>

            <div className="mt-5 sm:mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={savingCrop || loading}
                onClick={closeCropModal}
                className="w-full sm:w-auto border-[#D6E2F2] bg-white text-xs sm:text-sm text-[#10182D] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={
                  savingCrop ||
                  loading ||
                  !croppedAreaPixels
                }
                onClick={handleCropSave}
                className="w-full sm:w-auto bg-[#2875F5] text-xs sm:text-sm text-white hover:bg-[#155DCC]"
              >
                {savingCrop
                  ? "Saving..."
                  : "Crop & Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

export default BusinessProfileForm;