/**
 * One-time: convert the main (admin/seed) user from email-based to username-based.
 * Sets auth email to shalevm@example.com and profile to username shalevm, first name שליו, last name מרום.
 *
 * Prerequisites:
 * - .env.local with NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * - NEXT_PUBLIC_ADMIN_USER_ID or SEED_USER_ID set to the main user's UUID
 *
 * Run: npx tsx scripts/migrate-main-user-to-username.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userId =
  process.env.NEXT_PUBLIC_ADMIN_USER_ID ?? process.env.SEED_USER_ID ?? null;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

if (!userId) {
  console.error("Missing NEXT_PUBLIC_ADMIN_USER_ID or SEED_USER_ID in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const INTERNAL_EMAIL = "shalevm@example.com";
const USERNAME = "shalevm";
const FIRST_NAME = "שליו";
const LAST_NAME = "מרום";

async function main() {
  console.log("Migrating main user to username-based auth...");
  console.log("User ID:", userId);
  console.log("New auth email:", INTERNAL_EMAIL);
  console.log("Profile: username=%s, first_name=%s, last_name=%s", USERNAME, FIRST_NAME, LAST_NAME);

  const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
    email: INTERNAL_EMAIL,
    email_confirm: true,
  });

  if (authError) {
    console.error("Auth update failed:", authError.message);
    process.exit(1);
  }
  console.log("Auth user email updated to", INTERNAL_EMAIL);

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      username: USERNAME,
      first_name: FIRST_NAME,
      last_name: LAST_NAME,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    const needMigration =
      profileError.message.includes("first_name") ||
      profileError.message.includes("last_name") ||
      profileError.message.includes("username") ||
      profileError.message.includes("schema cache");
    if (needMigration) {
      console.log("");
      console.log("Profile could not be updated: run the migration first.");
      console.log("In Supabase Dashboard → SQL Editor, run the contents of:");
      console.log("  supabase/migrations/20250310_profiles_username_auth.sql");
      console.log("Then run this script again to set username and names.");
      console.log("");
      console.log("You can already log in with username 'shalevm' and your existing password.");
      process.exit(0);
    }
    console.error("Profile upsert failed:", profileError.message);
    process.exit(1);
  }
  console.log("Profile updated: username=shalevm, first_name=שליו, last_name=מרום");

  console.log("Done. You can now log in with username 'shalevm' and your existing password.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
