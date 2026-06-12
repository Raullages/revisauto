import { createClient } from "@/lib/supabase/client";

interface Attachment {
  id: string;
  maintenance_id: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

const BUCKET = "attachments";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

function buildPath(userId: string, maintenanceId: string, filename: string) {
  return `${userId}/${maintenanceId}/${filename}`;
}

function extractStoragePath(fileUrl: string) {
  if (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://")) {
    return fileUrl;
  }

  const url = new URL(fileUrl);
  const pathParts = url.pathname.split(`/${BUCKET}/`);
  return pathParts.length > 1 ? pathParts[1] : fileUrl;
}

async function getUserId(): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return user.id;
}

async function assertMaintenanceOwnership(maintenanceId: string, userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("maintenances")
    .select("id, vehicles!inner(user_id)")
    .eq("id", maintenanceId)
    .eq("vehicles.user_id", userId)
    .single();

  if (error || !data) throw new Error("Manutenção não encontrada");
}

export const attachmentService = {
  async list(maintenanceId: string): Promise<Attachment[]> {
    const supabase = createClient();
    const userId = await getUserId();

    await assertMaintenanceOwnership(maintenanceId, userId);

    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("maintenance_id", maintenanceId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const attachments = await Promise.all(
      (data || []).map(async (attachment) => {
        const storagePath = extractStoragePath(attachment.file_url);
        const { data: signedUrl, error: signedUrlError } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

        return {
          ...attachment,
          file_url: signedUrlError ? attachment.file_url : signedUrl.signedUrl,
        };
      }),
    );

    return attachments;
  },

  async upload(maintenanceId: string, file: File): Promise<Attachment> {
    const supabase = createClient();
    const userId = await getUserId();

    await assertMaintenanceOwnership(maintenanceId, userId);

    const filename = `${Date.now()}-${file.name}`;
    const path = buildPath(userId, maintenanceId, filename);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: record, error: insertError } = await supabase
      .from("attachments")
      .insert({
        maintenance_id: maintenanceId,
        file_url: path,
        file_name: file.name,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return record;
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();

    const { data: attachment } = await supabase
      .from("attachments")
      .select("file_url")
      .eq("id", id)
      .single();

    if (attachment) {
      const storagePath = extractStoragePath(attachment.file_url);
      if (storagePath) {
        await supabase.storage.from(BUCKET).remove([storagePath]);
      }
    }

    const { error } = await supabase
      .from("attachments")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
