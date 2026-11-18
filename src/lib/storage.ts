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

  const fileName = `${crypto.randomUUID()}-${file.name}`;

  const filePath = `${userId}/${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from("review-attachments")
    .upload(filePath, file);

  if (error) {
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