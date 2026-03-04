"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toE164, COUNTRY_OPTIONS, DEFAULT_COUNTRY_CODE } from "@/lib/phone";
import {
  listingSchema,
  BOARD_TYPES,
  REGIONS,
  CONDITIONS,
  FIN_SETUPS,
  CONSTRUCTIONS,
  LENGTH_FT_RANGES,
  TITLE_MIN,
  TITLE_MAX,
  PRICE_MAX,
  VOLUME_L_MAX,
  IMAGE_FILE_SIZE_MAX,
  IMAGE_FILES_MIN_COUNT,
  IMAGE_FILES_MAX_COUNT,
  IMAGE_ALLOWED_TYPES,
} from "@/lib/validations/listing";

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceIls, setPriceIls] = useState<number | "">("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState<typeof REGIONS[number]>("Center");
  const [boardType, setBoardType] = useState<typeof BOARD_TYPES[number]>("Shortboard");
  const [lengthFt, setLengthFt] = useState<number | "">("");
  const [volumeL, setVolumeL] = useState<number | "">("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState<typeof CONDITIONS[number]>("Used (Normal)");
  const [repairs, setRepairs] = useState(false);
  const [finsIncluded, setFinsIncluded] = useState(false);
  const [finSetup, setFinSetup] = useState<string>("");
  const [construction, setConstruction] = useState<string>("");
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const e164 = toE164(whatsappPhone, countryCode);
    if (!e164) {
      setStatus("Invalid phone. Use 9 digits for Israel (e.g. 0501234567) or E.164 (8–15 digits).");
      setLoading(false);
      return;
    }

    const raw = {
      title,
      description: description || undefined,
      price_ils: priceIls === "" ? 0 : Number(priceIls),
      city,
      region,
      board_type: boardType,
      length_ft: lengthFt === "" ? null : Number(lengthFt),
      volume_l: volumeL === "" ? null : Number(volumeL),
      brand: brand || undefined,
      condition,
      repairs,
      fins_included: finsIncluded,
      fin_setup: finSetup || null,
      construction: construction || null,
      whatsapp_phone: e164,
    };

    const parsed = listingSchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = Object.values(first).flat().join(" ") || "Invalid fields.";
      setStatus(msg);
      setLoading(false);
      return;
    }

    if (!imageFiles || imageFiles.length < IMAGE_FILES_MIN_COUNT) {
      setStatus(`Add at least ${IMAGE_FILES_MIN_COUNT} images (${IMAGE_FILES_MIN_COUNT}–${IMAGE_FILES_MAX_COUNT}).`);
      setLoading(false);
      return;
    }
    if (imageFiles.length > IMAGE_FILES_MAX_COUNT) {
      setStatus(`Maximum ${IMAGE_FILES_MAX_COUNT} images allowed.`);
      setLoading(false);
      return;
    }
    const filesArray = Array.from(imageFiles);
    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      if (!IMAGE_ALLOWED_TYPES.includes(file.type as (typeof IMAGE_ALLOWED_TYPES)[number])) {
        setStatus(`Only JPG, PNG, and WebP allowed. "${file.name}" is not supported.`);
        setLoading(false);
        return;
      }
      if (file.size > IMAGE_FILE_SIZE_MAX) {
        setStatus(`Image "${file.name}" is too large (max 5MB per file).`);
        setLoading(false);
        return;
      }
    }
    if (primaryImageIndex < 0 || primaryImageIndex >= filesArray.length) {
      setStatus("Please select which image is the primary one.");
      setLoading(false);
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setStatus("You must be logged in to create a listing.");
      setLoading(false);
      return;
    }
    const userId = userData.user.id;

    const { error: profileError } = await supabase.from("profiles").upsert({ id: userId });
    if (profileError) {
      setStatus(`Profile error: ${profileError.message}`);
      setLoading(false);
      return;
    }

    const {
      data: listingInsertData,
      error: listingError,
    } = await supabase
      .from("listings")
      .insert({
        user_id: userId,
        title,
        description: description || null,
        price_ils: priceIls === "" ? null : Number(priceIls),
        city,
        region,
        board_type: boardType,
        length_ft: lengthFt === "" ? null : Number(lengthFt),
        volume_l: volumeL === "" ? null : Number(volumeL),
        brand: brand || null,
        condition,
        repairs,
        fins_included: finsIncluded,
        fin_setup: finSetup || null,
        construction: construction || null,
        whatsapp_phone: e164,
      })
      .select("id")
      .single();

    if (listingError || !listingInsertData) {
      setStatus(`Error creating listing: ${listingError?.message ?? "Unknown error"}`);
      setLoading(false);
      return;
    }
    const listingId = listingInsertData.id as string;

    for (let index = 0; index < filesArray.length; index++) {
      const file = filesArray[index];
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
      const fileName = `${Date.now()}_${index}.${safeExt}`;
      const path = `${userId}/${listingId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        console.error("Image upload error", uploadError);
        continue;
      }

      const { error: imageInsertError } = await supabase.from("listing_images").insert({
        listing_id: listingId,
        storage_path: path,
        sort_order: index,
        is_primary: index === primaryImageIndex,
      });
      if (imageInsertError) console.error("Error saving image record", imageInsertError);
    }

    setStatus("Listing created successfully!");
    setLoading(false);
    setTimeout(() => router.push("/my-listings"), 800);
  }

  const lengthRange = LENGTH_FT_RANGES[boardType];
  const numImages = imageFiles?.length ?? 0;

  return (
    <main className="flex min-h-screen justify-center bg-gray-100">
      <div className="w-full max-w-2xl bg-white p-6 mt-6 mb-6 rounded-lg shadow">
        <h1 className="mb-4 text-2xl font-bold">New Listing</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                required
                minLength={TITLE_MIN}
                maxLength={TITLE_MAX}
                placeholder={`${TITLE_MIN}–${TITLE_MAX} characters`}
                className="w-full rounded border px-3 py-2 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="price">Price (ILS)</label>
              <input
                id="price"
                type="number"
                required
                min={0}
                max={PRICE_MAX}
                className="w-full rounded border px-3 py-2 text-sm"
                value={priceIls}
                onChange={(e) => setPriceIls(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="city">City</label>
              <input
                id="city"
                type="text"
                required
                maxLength={100}
                className="w-full rounded border px-3 py-2 text-sm"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="region">Region</label>
              <select
                id="region"
                className="w-full rounded border px-3 py-2 text-sm"
                value={region}
                onChange={(e) => setRegion(e.target.value as (typeof REGIONS)[number])}
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="boardType">Board type</label>
              <select
                id="boardType"
                className="w-full rounded border px-3 py-2 text-sm"
                value={boardType}
                onChange={(e) => setBoardType(e.target.value as (typeof BOARD_TYPES)[number])}
              >
                {BOARD_TYPES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="brand">Brand</label>
              <input
                id="brand"
                type="text"
                maxLength={100}
                className="w-full rounded border px-3 py-2 text-sm"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="lengthFt">Length (ft)</label>
              <input
                id="lengthFt"
                type="number"
                min={lengthRange[0]}
                max={lengthRange[1]}
                step="0.1"
                className="w-full rounded border px-3 py-2 text-sm"
                value={lengthFt}
                onChange={(e) => setLengthFt(e.target.value === "" ? "" : Number(e.target.value))}
              />
              <p className="mt-0.5 text-xs text-gray-500">
                {boardType}: {lengthRange[0]}–{lengthRange[1]} ft
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="volumeL">Volume (L)</label>
              <input
                id="volumeL"
                type="number"
                min={0}
                max={VOLUME_L_MAX}
                step="0.1"
                className="w-full rounded border px-3 py-2 text-sm"
                value={volumeL}
                onChange={(e) => setVolumeL(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="condition">Condition</label>
              <select
                id="condition"
                className="w-full rounded border px-3 py-2 text-sm"
                value={condition}
                onChange={(e) => setCondition(e.target.value as (typeof CONDITIONS)[number])}
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="finSetup">Fin setup</label>
              <select
                id="finSetup"
                className="w-full rounded border px-3 py-2 text-sm"
                value={finSetup}
                onChange={(e) => setFinSetup(e.target.value)}
              >
                <option value="">—</option>
                {FIN_SETUPS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="construction">Construction</label>
              <select
                id="construction"
                className="w-full rounded border px-3 py-2 text-sm"
                value={construction}
                onChange={(e) => setConstruction(e.target.value)}
              >
                <option value="">—</option>
                {CONSTRUCTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">WhatsApp phone</label>
              <div className="flex gap-2">
                <select
                  className="rounded border px-2 py-2 text-sm"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  required
                  placeholder={countryCode === "+972" ? "0501234567" : "Phone number"}
                  className="flex-1 rounded border px-3 py-2 text-sm"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={repairs} onChange={(e) => setRepairs(e.target.checked)} />
              Repairs done
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={finsIncluded} onChange={(e) => setFinsIncluded(e.target.checked)} />
              Fins included
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="images">
              Images ({IMAGE_FILES_MIN_COUNT}–{IMAGE_FILES_MAX_COUNT}, JPG/PNG/WebP, max 5MB each)
            </label>
            <input
              id="images"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              multiple
              className="w-full text-sm"
              onChange={(e) => {
                setImageFiles(e.target.files);
                setPrimaryImageIndex(0);
              }}
            />
            {numImages > 0 && (
              <div className="mt-2">
                <label className="block text-xs font-medium mb-1">Primary image</label>
                <select
                  className="rounded border px-2 py-1 text-sm"
                  value={primaryImageIndex}
                  onChange={(e) => setPrimaryImageIndex(Number(e.target.value))}
                >
                  {Array.from({ length: numImages }, (_, i) => (
                    <option key={i} value={i}>Image {i + 1}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="description">Description</label>
            <textarea
              id="description"
              maxLength={2000}
              className="w-full rounded border px-3 py-2 text-sm"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Creating listing..." : "Create listing"}
          </button>
        </form>
        {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
      </div>
    </main>
  );
}
