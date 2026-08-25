import { createClient } from "@supabase/supabase-js";

export function getAdminUserId(): string | null {
  return (
    process.env.ADMIN_USER_ID ??
    process.env.NEXT_PUBLIC_ADMIN_USER_ID ??
    process.env.SEED_USER_ID ??
    null
  );
}

export function isAdminUserId(userId: string | null | undefined): boolean {
  if (!userId) return false;
  const adminId = getAdminUserId();
  return !!adminId && userId === adminId;
}

export async function getUserIdFromBearer(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;

  const supabase = createClient(supabaseUrl, anonKey);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export async function requireAdmin(request: Request): Promise<{ userId: string } | { error: string; status: number }> {
  const userId = await getUserIdFromBearer(request);
  if (!userId) return { error: "Not authenticated.", status: 401 };
  if (!isAdminUserId(userId)) return { error: "Forbidden.", status: 403 };
  return { userId };
}

export async function getAdminNotificationEmail(): Promise<string | null> {
  const direct = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  if (direct) return direct;

  const adminId = getAdminUserId();
  if (!adminId) return null;

  const { createSupabaseAdmin } = await import("@/lib/supabaseAdmin");
  const admin = createSupabaseAdmin();
  const { data } = await admin
    .from("profiles")
    .select("recovery_email")
    .eq("id", adminId)
    .maybeSingle();

  return data?.recovery_email?.trim().toLowerCase() ?? null;
}
