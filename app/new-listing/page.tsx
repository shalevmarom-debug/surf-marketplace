"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { listingSchema } from "@/lib/validations/listing";

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceIls, setPriceIls] = useState<number | "">("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("Center");
  const [boardType, setBoardType] = useState("Shortboard");
  const [lengthFt, setLengthFt] = useState<number | "">("");
  const [volumeL, setVolumeL] = useState<number | "">("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("Good");
  const [repairs, setRepairs] = useState(false);
  const [finsIncluded, setFinsIncluded] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    
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
        whatsapp_phone: whatsappPhone,
      };
  
      const parsed = listingSchema.safeParse(raw);
      if (!parsed.success) {
        const first = parsed.error.flatten().fieldErrors;
        const msg = Object.values(first).flat().join(" ") || "Invalid fields.";
        setStatus(msg);
        setLoading(false);
        return;
      }
  
    // 1) Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setStatus("You must be logged in to create a listing.");
      setLoading(false);
      return;
    }

    const userId = userData.user.id;

    // 2) Ensure profile row exists (for FK to profiles)
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
    });
    if (profileError) {
      setStatus(`Profile error: ${profileError.message}`);
      setLoading(false);
      return;
    }

    // 3) Insert listing and get its id
    const {
      data: listingInsertData,
      error: listingError,
    } = await supabase
      .from("listings")
      .insert({
        user_id: userId,
        title,
        description,
        price_ils: priceIls === "" ? null : Number(priceIls),
        city,
        region,
        board_type: boardType,
        length_ft: lengthFt === "" ? null : Number(lengthFt),
        volume_l: volumeL === "" ? null : Number(volumeL),
        brand,
        condition,
        repairs,
        fins_included: finsIncluded,
        whatsapp_phone: whatsappPhone,
      })
      .select("id")
      .single();

    if (listingError || !listingInsertData) {
      setStatus(
        `Error creating listing: ${listingError ? listingError.message : "Unknown error"}`
      );
      setLoading(false);
      return;
    }

    const listingId = listingInsertData.id as string;

    // 4) Upload images (optional)
    if (imageFiles && imageFiles.length > 0) {
      const maxImages = 5;
      const filesArray = Array.from(imageFiles).slice(0, maxImages);

      for (let index = 0; index < filesArray.length; index++) {
        const file = filesArray[index];
        const ext = file.name.split(".").pop() ?? "jpg";
        const fileName = `${Date.now()}_${index}.${ext}`;
        const path = `${userId}/${listingId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Image upload error", uploadError);
          continue;
        }

        const { error: imageInsertError } = await supabase
          .from("listing_images")
          .insert({
            listing_id: listingId,
            storage_path: path,
            sort_order: index,
          });

        if (imageInsertError) {
          console.error("Error saving image record", imageInsertError);
        }
      }
    }

    setStatus("Listing created successfully!");
    setLoading(false);

    setTimeout(() => {
      router.push("/my-listings");
    }, 800);
  }

  return (
    <main className="flex min-h-screen justify-center bg-gray-100">
      <div className="w-full max-w-2xl bg-white p-6 mt-6 mb-6 rounded-lg shadow">
        <h1 className="mb-4 text-2xl font-bold">New Listing</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                type="text"
                required
                className="w-full rounded border px-3 py-2 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="price">
                Price (ILS)
              </label>
              <input
                id="price"
                type="number"
                required
                min={0}
                className="w-full rounded border px-3 py-2 text-sm"
                value={priceIls}
                onChange={(e) =>
                  setPriceIls(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="city">
                City
              </label>
              <input
                id="city"
                type="text"
                required
                className="w-full rounded border px-3 py-2 text-sm"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="region">
                Region
              </label>
              <select
                id="region"
                className="w-full rounded border px-3 py-2 text-sm"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="Center">Center</option>
                <option value="Sharon">Sharon</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="Jerusalem">Jerusalem</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="boardType">
                Board type
              </label>
              <select
                id="boardType"
                className="w-full rounded border px-3 py-2 text-sm"
                value={boardType}
                onChange={(e) => setBoardType(e.target.value)}
              >
                <option value="Shortboard">Shortboard</option>
                <option value="Fish">Fish</option>
                <option value="Longboard">Longboard</option>
                <option value="Softtop">Softtop</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="brand">
                Brand
              </label>
              <input
                id="brand"
                type="text"
                className="w-full rounded border px-3 py-2 text-sm"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="lengthFt">
                Length (ft)
              </label>
              <input
                id="lengthFt"
                type="number"
                min={0}
                step="0.1"
                className="w-full rounded border px-3 py-2 text-sm"
                value={lengthFt}
                onChange={(e) =>
                  setLengthFt(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="volumeL">
                Volume (L)
              </label>
              <input
                id="volumeL"
                type="number"
                min={0}
                step="0.1"
                className="w-full rounded border px-3 py-2 text-sm"
                value={volumeL}
                onChange={(e) =>
                  setVolumeL(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="condition"
              >
                Condition
              </label>
              <select
                id="condition"
                className="w-full rounded border px-3 py-2 text-sm"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="whatsappPhone"
              >
                WhatsApp phone
              </label>
              <input
                id="whatsappPhone"
                type="tel"
                required
                className="w-full rounded border px-3 py-2 text-sm"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={repairs}
                onChange={(e) => setRepairs(e.target.checked)}
              />
              Repairs done
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={finsIncluded}
                onChange={(e) => setFinsIncluded(e.target.checked)}
              />
              Fins included
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="images">
              Images (up to 5)
            </label>
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              className="w-full text-sm"
              onChange={(e) => setImageFiles(e.target.files)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
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

        {status && (
          <p className="mt-4 text-sm text-gray-700">
            {status}
          </p>
        )}
      </div>
    </main>
  );
}