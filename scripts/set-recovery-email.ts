/**
 * Set recovery email for an existing user (legacy accounts without one).
 * Creates/updates profile username when missing (looks up auth by internal email).
 *
 * Run:
 *   npx tsx scripts/set-recovery-email.ts shalevm you@real-email.com
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import {
  isValidRecoveryEmail,
  normalizeRecoveryEmail,
  normalizeUsername,
  toInternalEmail,
} from "../lib/auth";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const username = process.argv[2];
const recoveryEmailRaw = process.argv[3];

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

if (!username || !recoveryEmailRaw) {
  console.error("Usage: npx tsx scripts/set-recovery-email.ts <username> <recovery-email>");
  process.exit(1);
}

const normalized = normalizeUsername(username);
const recoveryEmail = normalizeRecoveryEmail(recoveryEmailRaw);

if (!isValidRecoveryEmail(recoveryEmail)) {
  console.error("Invalid recovery email.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function findUserIdByUsername(): Promise<string | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", normalized)
    .maybeSingle();
  if (profile?.id) return profile.id as string;

  const internalEmail = toInternalEmail(normalized);
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) {
    console.error("Could not list auth users:", listError.message);
    process.exit(1);
  }

  const authUser = listData.users.find((u) => {
    const email = u.email?.toLowerCase() ?? "";
    return email === internalEmail || email === `${normalized}@surf.local`;
  });

  return authUser?.id ?? null;
}

async function main() {
  const userId = await findUserIdByUsername();
  if (!userId) {
    console.error(`No user found for username "${normalized}".`);
    console.error("Run: npx tsx scripts/migrate-main-user-to-username.ts (for main user)");
    process.exit(1);
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        username: normalized,
        recovery_email: recoveryEmail,
      },
      { onConflict: "id" }
    )
    .select("id, username, recovery_email")
    .single();

  if (error) {
    console.error("Update failed:", error.message);
    if (error.message.includes("recovery_email") || error.message.includes("username")) {
      console.error("Run supabase/apply-recovery-email.sql in Supabase SQL Editor first.");
    }
    process.exit(1);
  }

  const internalEmail = toInternalEmail(normalized);
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  const currentEmail = authUser.user?.email?.toLowerCase() ?? "";
  if (currentEmail !== internalEmail) {
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      email: internalEmail,
      email_confirm: true,
    });
    if (authError) {
      console.warn("Profile saved, but auth email update failed:", authError.message);
      console.warn(`Login may still use old email mapping until auth email is ${internalEmail}`);
    } else {
      console.log(`Auth email updated to ${internalEmail}`);
    }
  }

  console.log(`Recovery email set for @${profile.username}: ${profile.recovery_email}`);
  console.log("They can now use Forgot password on the login page.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
