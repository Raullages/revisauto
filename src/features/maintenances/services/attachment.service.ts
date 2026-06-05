import { createClient } from "@/lib/supabase/client";

interface Attachment {
  id: string;
  maintenance_id: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

const BUCKET = "attachments";

function buildPath(userId: string, maintenanceId: string, filename: string) {
  return `${userId}/${maintenanceId}/${filename}`;
}

async function getUserId(): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Nao autenticado");
  return user.id;
}

export const attachmentService = {
  async list(maintenanceId: string): Promise<Attachment[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("maintenance_id", maintenanceId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  async upload(maintenanceId: string, file: File): Promise<Attachment> {
    const supabase = createClient();
    const userId = await getUserId();

    const filename = `${Date.now()}-${file.name}`;
    const path = buildPath(userId, maintenanceId, filename);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    const { data: record, error: insertError } = await supabase
      .from("attachments")
      .insert({
        maintenance_id: maintenanceId,
        file_url: publicUrl.publicUrl,
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
      const url = new URL(attachment.file_url);
      const pathParts = url.pathname.split(`/${BUCKET}/`);
      if (pathParts.length > 1) {
        const storagePath = pathParts[1];
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
