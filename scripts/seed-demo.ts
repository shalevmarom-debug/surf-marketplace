/**
 * Seed the database with the fixed demo dataset (~120 surfboard listings).
 *
 * Prerequisites:
 * - .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - SEED_USER_ID: a valid Supabase auth user ID (all demo listings will be owned by this user)
 *
 * Optional:
 * - CLEAR_DEMO=1: delete all existing listings owned by SEED_USER_ID before inserting
 *
 * Run: npm run seed:demo
 * Or: npx tsx scripts/seed-demo.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import { DEMO_LISTINGS } from "../data/demoListings";
import { normalizeText, compactText, buildSearchCompact } from "../lib/normalize";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const seedUserId = process.env.SEED_USER_ID;
const clearDemo = process.env.CLEAR_DEMO === "1";

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or Supabase key. Set in .env.local");
  process.exit(1);
}

if (!seedUserId) {
  console.error("Missing SEED_USER_ID. Set it in .env.local to the UUID of the user who will own demo listings.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Demo seed: using dataset with", DEMO_LISTINGS.length, "listings.");
  console.log("SEED_USER_ID:", seedUserId);

  if (clearDemo) {
    console.log("CLEAR_DEMO=1: deleting existing listings for this user...");
    const { error } = await supabase.from("listings").delete().eq("user_id", seedUserId);
    if (error) {
      console.error("Delete error:", error.message);
      process.exit(1);
    }
    console.log("Deleted.");
  }

  let inserted = 0;
  for (const row of DEMO_LISTINGS) {
    const displayCity = row.city_he.trim() === "אחר" ? (row.city_other?.trim() || "אחר") : row.city_he.trim();
    const cityNorm = normalizeText(displayCity);
    const cityCompact = compactText(displayCity);
    const brandRaw = row.brand?.trim() || null;
    const brandNorm = brandRaw ? normalizeText(brandRaw) : null;
    const brandCompact = brandRaw ? compactText(brandRaw) : null;
    const titleNorm = normalizeText(row.title);
    const titleCompact = compactText(row.title);
    const searchCompact = buildSearchCompact(row.title, brandRaw, displayCity);

    const insertRow = {
      user_id: seedUserId,
      title: row.title,
      description: row.description || null,
      price_ils: row.price_ils,
      city: displayCity,
      city_he: row.city_he.trim(),
      city_other: row.city_he.trim() === "אחר" ? (row.city_other?.trim() || null) : null,
      city_norm: cityNorm || null,
      city_compact: cityCompact || null,
      region: row.region,
      board_type: row.board_type,
      length_ft: row.length_ft,
      volume_l: row.volume_l,
      brand_raw: brandRaw,
      brand_norm: brandNorm,
      brand_compact: brandCompact,
      brand: brandRaw,
      title_norm: titleNorm || null,
      title_compact: titleCompact || null,
      title_normalized: titleNorm || null,
      brand_normalized: brandNorm,
      city_normalized: cityNorm || null,
      search_compact: searchCompact || null,
      condition: row.condition,
      repairs: row.repairs,
      fins_included: row.fins_included,
      fin_setup: row.fin_setup || null,
      construction: row.construction || null,
      whatsapp_phone: row.whatsapp_phone,
    };

    const { error } = await supabase.from("listings").insert(insertRow);
    if (error) {
      console.error("Insert error for title:", row.title, error.message);
      continue;
    }
    inserted++;
  }

  console.log("Inserted", inserted, "listings.");
  console.log("Done. Demo listings have no images; cards will show the placeholder.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
