"use client";

import { useRef, useCallback, useEffect } from "react";
import {
  IMAGE_FILES_MIN_COUNT,
  IMAGE_FILES_MAX_COUNT,
  IMAGE_FILE_SIZE_MAX,
  IMAGE_ALLOWED_TYPES,
} from "@/lib/validations/listing";

type ListingImageUploadProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
  primaryIndex: number;
  onPrimaryChange: (index: number) => void;
  error?: string;
};

function filterValidFiles(files: FileList | File[]): File[] {
  const arr = Array.from(files);
  return arr.filter((file) => {
    if (!IMAGE_ALLOWED_TYPES.includes(file.type as (typeof IMAGE_ALLOWED_TYPES)[number]))
      return false;
    if (file.size > IMAGE_FILE_SIZE_MAX) return false;
    return true;
  });
}

export function ListingImageUpload({
  files,
  onFilesChange,
  primaryIndex,
  onPrimaryChange,
  error,
}: ListingImageUploadProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const pickerInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const valid = filterValidFiles(newFiles);
      const remaining = IMAGE_FILES_MAX_COUNT - files.length;
      const toAdd = valid.slice(0, remaining);
      if (toAdd.length === 0) return;
      onFilesChange([...files, ...toAdd]);
      onPrimaryChange(primaryIndex >= 0 ? primaryIndex : 0);
    },
    [files, primaryIndex, onFilesChange, onPrimaryChange]
  );

  const removeFile = useCallback(
    (index: number) => {
      const next = files.filter((_, i) => i !== index);
      onFilesChange(next);
      if (primaryIndex >= next.length) onPrimaryChange(Math.max(0, next.length - 1));
      else if (primaryIndex >= index && primaryIndex > 0) onPrimaryChange(primaryIndex - 1);
      else onPrimaryChange(primaryIndex);
    },
    [files, primaryIndex, onFilesChange, onPrimaryChange]
  );

  const clearInput = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) ref.current.value = "";
  };

  const numImages = files.length;
  const canAddMore = numImages < IMAGE_FILES_MAX_COUNT;
  const imageAccept = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        תמונות ({IMAGE_FILES_MIN_COUNT}–{IMAGE_FILES_MAX_COUNT}, JPG/PNG/WebP, עד 5MB לכל תמונה)
      </label>

      <div className="flex flex-wrap gap-2 mb-3">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files;
            if (f?.length) addFiles(f);
            clearInput(cameraInputRef);
          }}
        />
        <input
          ref={pickerInputRef}
          type="file"
          accept={imageAccept}
          multiple
          className="hidden"
          onChange={(e) => {
            const f = e.target.files;
            if (f?.length) addFiles(f);
            clearInput(pickerInputRef);
          }}
        />

        {canAddMore && (
          <>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100"
            >
              <span aria-hidden>📷</span>
              צלם תמונה
            </button>
            <button
              type="button"
              onClick={() => pickerInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100"
            >
              <span aria-hidden>🖼️</span>
              בחר תמונות
            </button>
          </>
        )}
      </div>

      {numImages > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">
            תמונה ראשית: לחץ על כוכב. להסרה: לחץ על X. ({numImages}/{IMAGE_FILES_MAX_COUNT})
          </p>
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <ImageThumb
                key={`${file.name}-${index}-${file.size}`}
                file={file}
                isPrimary={index === primaryIndex}
                onSetPrimary={() => onPrimaryChange(index)}
                onRemove={() => removeFile(index)}
              />
            ))}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function ImageThumb({
  file,
  isPrimary,
  onSetPrimary,
  onRemove,
}: {
  file: File;
  isPrimary: boolean;
  onSetPrimary: () => void;
  onRemove: () => void;
}) {
  const urlRef = useRef<string | null>(null);
  if (!urlRef.current) urlRef.current = URL.createObjectURL(file);
  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);
  return (
    <div className="relative inline-block">
      <div className="h-20 w-20 overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100">
        <img src={urlRef.current!} alt="" className="h-full w-full object-cover" />
      </div>
      <button
        type="button"
        onClick={onSetPrimary}
        className="absolute bottom-0 left-0 rounded-bl bg-black/60 px-1.5 py-0.5 text-white"
        title="תמונה ראשית"
        aria-label={isPrimary ? "תמונה ראשית (נבחרה)" : "הגדר כתמונה ראשית"}
      >
        {isPrimary ? "★" : "☆"}
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-0 right-0 rounded-tr bg-red-600 px-1.5 py-0.5 text-white hover:bg-red-700"
        aria-label="הסר תמונה"
      >
        ×
      </button>
    </div>
  );
}
