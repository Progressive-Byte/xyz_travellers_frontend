"use client";

import React, { useRef, useState } from "react";

export type HostPropertyVerificationUploadEntry = {
  file: File;
  documentType: string;
};

type HostPropertyVerificationUploaderProps = {
  disabled: boolean;
  isUploading: boolean;
  onUpload: (entries: HostPropertyVerificationUploadEntry[]) => Promise<void>;
};

export const HostPropertyVerificationUploader: React.FC<HostPropertyVerificationUploaderProps> = ({
  disabled,
  isUploading,
  onUpload,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<HostPropertyVerificationUploadEntry[]>([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);
    setSelectedFiles(nextFiles.map((file) => ({ file, documentType: "" })));
    setError("");
    setSuccessMessage("");
  };

  const handleUpload = async () => {
    if (disabled || isUploading || selectedFiles.length === 0) {
      return;
    }

    setError("");
    setSuccessMessage("");

    const hasMissingDocumentType = selectedFiles.some((entry) => !entry.documentType.trim());

    if (hasMissingDocumentType) {
      setError("Choose a document type for every verification file before uploading.");
      return;
    }

    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      setSuccessMessage("Verification proof saved successfully.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message || "We couldn't save those verification files right now."
          : "We couldn't save those verification files right now.",
      );
    }
  };

  return (
    <div className="surface-card rounded-panel p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
        Verification proof
      </p>
      <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
        Add the documents that prove this listing
      </h2>
      <p className="mt-4 text-[14px] leading-7 text-text-secondary">
        Upload ownership or property proof documents for admin review. Keep the files practical and
        directly tied to the listing.
      </p>

      <label className="mt-6 block rounded-[22px] border border-dashed border-border bg-white/80 p-5">
        <span className="block text-[13px] font-semibold text-text-primary">Choose verification files</span>
        <span className="mt-2 block text-[13px] leading-6 text-text-secondary">
          Select one or more files that support the property's verification review.
        </span>
        <input
          ref={inputRef}
          type="file"
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
          <div className="mt-3 space-y-3">
            {selectedFiles.map((entry, index) => (
              <div
                key={`${entry.file.name}-${entry.file.size}-${index}`}
                className="rounded-[18px] border border-border-light bg-white/90 px-4 py-4"
              >
                <p className="text-[14px] font-semibold text-text-primary">{entry.file.name}</p>
                <p className="mt-1 text-[12px] text-text-secondary">
                  {(entry.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <label className="mt-3 block">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                    Document type
                  </span>
                  <select
                    value={entry.documentType}
                    onChange={(event) =>
                      setSelectedFiles((current) =>
                        current.map((item, currentIndex) =>
                          currentIndex === index
                            ? { ...item, documentType: event.target.value }
                            : item,
                        ),
                      )
                    }
                    className="mt-2 w-full rounded-[16px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-colors duration-200 focus:border-text-primary/25"
                  >
                    <option value="">Choose document type</option>
                    <option value="proof_of_ownership">Proof of ownership</option>
                    <option value="lease_agreement">Lease agreement</option>
                    <option value="trade_license">Trade license</option>
                    <option value="tourism_license">Tourism license</option>
                    <option value="fire_safety_certificate">Fire safety certificate</option>
                    <option value="insurance">Insurance</option>
                    <option value="other">Other proof</option>
                  </select>
                </label>
              </div>
            ))}
          </div>
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
          {isUploading ? "Uploading..." : "Upload verification files"}
        </button>
      </div>
    </div>
  );
};
