# Demo Listings Seed

This folder contains a **fixed** demo dataset and a seed script to populate the database with ~120 surfboard listings for development/testing.

## 1. Dataset: `../data/demoListings.ts`

- **Fixed data** – no random generation; same listings every run so UI and filters behave consistently.
- **~120 listings** matching the New Listing form schema exactly.
- **Distribution:**
  - 30 Shortboards  
  - 20 Fish  
  - 20 Longboards  
  - 20 Funboards  
  - 15 Midlength  
  - 10 Softboard  
  - 5 Other (SUP-style)
- **Regions:** North, Center, South.
- **Cities:** Hebrew names from the app’s city list (e.g. חיפה, תל אביב - יפו, אשדוד).
- **Brands:** Channel Islands, Lost, JS, Firewire, Pyzel, DHD, Sharpeye, HaydenShapes, Torq, Softech, NSP, Modern, Catch Surf, Rusty, Album, Local Shaper, Custom.
- **Prices, dimensions, conditions, fin setup, construction** follow the rules in the main task (realistic ranges per board type).
- **Variety:** mix of `repairs` / `fins_included`; some Hebrew and English titles; descriptions like real sellers.
- **Phones:** Israeli WhatsApp format `+9725XXXXXXXX`.
- **Images:** dataset defines `imageIndices` (0–14) for future use; the seed script does **not** upload images, so all demo listings show the “No image” placeholder.

## 2. Seed script: `seed-demo.ts`

- Reads `DEMO_LISTINGS` from `../data/demoListings.ts`.
- Uses `normalizeText`, `compactText`, `buildSearchCompact` from `../lib/normalize` so `search_compact` and normalized fields match the app.
- Inserts into `listings` with the same fields as the New Listing form (no `listing_images`).

## 3. How to run

### Prerequisites

1. **`.env.local`** with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
   (or `SUPABASE_SERVICE_ROLE_KEY` if you need to bypass RLS for the seed user.)

2. **`SEED_USER_ID`** – UUID of the Supabase Auth user who will own all demo listings.  
   - Create a user in your project (e.g. sign up once in the app), then copy their ID from Supabase Dashboard → Authentication → Users, or from the app after login.

Add to `.env.local`:

```env
SEED_USER_ID=your-user-uuid-here
```

### Optional

- **`CLEAR_DEMO=1`** – before inserting, deletes all existing listings where `user_id = SEED_USER_ID`. Use this to reset demo data without touching other users’ listings.

### Commands

```bash
# Install dependencies (tsx, dotenv) if not already
npm install

# Run the seed
npm run seed:demo
```

Or directly:

```bash
npx tsx scripts/seed-demo.ts
```

With clear:

```bash
CLEAR_DEMO=1 npm run seed:demo
```

## 4. Confirmation: form schema match

The seed uses only fields that exist on the New Listing form and in the `listings` table:

- `title`, `description`, `price_ils`
- `city_he`, `city_other`, `city`, `city_norm`, `city_compact`
- `region`, `board_type`, `length_ft`, `volume_l`
- `brand` / `brand_raw`, `brand_norm`, `brand_compact`
- `title_norm`, `title_compact`, `title_normalized`, `brand_normalized`, `city_normalized`
- `search_compact`
- `condition`, `repairs`, `fins_included`, `fin_setup`, `construction`
- `whatsapp_phone`
- `user_id` (from `SEED_USER_ID`)

No extra or random fields are added; the dataset is deterministic and matches the form schema.
