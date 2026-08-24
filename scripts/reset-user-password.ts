/**
 * Set a new password for a user by username (admin / local use only).
 *
 * Prerequisites: .env.local with NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Run:
 *   npx tsx scripts/reset-user-password.ts shalevm YourNewPassword
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import { toInternalEmail } from "../lib/auth";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const username = process.argv[2];
const newPassword = process.argv[3];

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

if (!username || !newPassword) {
  console.error("Usage: npx tsx scripts/reset-user-password.ts <username> <new-password>");
  process.exit(1);
}

if (newPassword.length < 6) {
  console.error("Password must be at least 6 characters.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const normalized = username.trim().toLowerCase();
  const internalEmail = toInternalEmail(normalized);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", normalized)
    .maybeSingle();

  let userId = profile?.id as string | undefined;

  if (!userId) {
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error("Could not list users:", listError.message);
      process.exit(1);
    }
    const match = listData.users.find((u) => u.email?.toLowerCase() === internalEmail);
    userId = match?.id;
  }

  if (!userId) {
    console.error(`No user found for username "${normalized}".`);
    process.exit(1);
  }

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    console.error("Password update failed:", error.message);
    process.exit(1);
  }

  console.log(`Password updated for @${normalized}. Log in at /login with the new password.`);
}

main();
