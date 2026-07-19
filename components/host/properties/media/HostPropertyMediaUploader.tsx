"use client";

import React, { useRef, useState } from "react";

type HostPropertyMediaUploaderProps = {
  disabled: boolean;
  isUploading: boolean;
  onUpload: (files: File[]) => Promise<void>;
};

export const HostPropertyMediaUploader: React.FC<HostPropertyMediaUploaderProps> = ({
  disabled,
  isUploading,
  onUpload,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);
    setSelectedFiles(nextFiles);
    setError("");
    setSuccessMessage("");
  };

  const handleUpload = async () => {
    if (disabled || isUploading || selectedFiles.length === 0) {
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setSuccessMessage("Media uploaded successfully.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message || "We couldn't upload those images right now."
          : "We couldn't upload those images right now.",
      );
    }
  };

  return (
    <div className="surface-card rounded-panel p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
        Image upload
      </p>
      <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
        Add the images guests should see first
      </h2>
      <p className="mt-4 text-[14px] leading-7 text-text-secondary">
        Upload the main gallery images for this listing, then choose one as the cover photo once the
        uploads finish.
      </p>

      <label className="mt-6 block rounded-[22px] border border-dashed border-border bg-white/80 p-5">
        <span className="block text-[13px] font-semibold text-text-primary">Choose property images</span>
        <span className="mt-2 block text-[13px] leading-6 text-text-secondary">
          Select one or more image files for this property's media gallery.
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={disabled || isUploading}
          onChange={handleFilesChange}
          className="mt-4 block w-full text-[13px] text-text-primary file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-text-primary"
        />
      </label>

      {selectedFiles.length > 0 ? (
        <div className="mt-5 rounded-[20px] border border-border-light bg-white/80 px-4 py-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
            Ready to upload
          </p>
          <ul className="mt-3 space-y-2 text-[14px] leading-6 text-text-primary">
            {selectedFiles.map((file) => (
              <li key={`${file.name}-${file.size}`}>{file.name}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-5 rounded-[20px] border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-[14px] leading-6 text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="mt-6">
        <button
          type="button"
          onClick={handleUpload}
          disabled={disabled || isUploading || selectedFiles.length === 0}
          className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
        >
          {isUploading ? "Uploading..." : "Upload selected images"}
        </button>
      </div>
    </div>
  );
};
