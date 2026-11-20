import { supabase } from "./supabase";

export async function uploadAttachment(
  file: File,
  userId: string
) {
  const folder = file.type.startsWith("image/")
    ? "images"
    : file.type.startsWith("video/")
      ? "videos"
      : "files";

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${crypto.randomUUID()}-${safeName}`;

  const filePath = `${userId}/${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from("review-attachments")
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (error) {
    console.error("STORAGE UPLOAD ERROR FOR REVIEW-ATTACHMENTS:", error);
    throw error;
  }

  const { data } = supabase.storage
    .from("review-attachments")
    .getPublicUrl(filePath);

  return {
    url: data.publicUrl,
    path: filePath,
    type: folder,
    name: file.name,
  };
}
