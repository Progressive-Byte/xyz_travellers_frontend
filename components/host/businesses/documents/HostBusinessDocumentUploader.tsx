"use client";

import React, { useRef, useState } from "react";

type HostBusinessDocumentUploaderProps = {
  disabled: boolean;
  isUploading: boolean;
  onUpload: (files: File[], metadata: { title: string; documentType: string; note: string }) => Promise<void>;
};

export const HostBusinessDocumentUploader: React.FC<HostBusinessDocumentUploaderProps> = ({
  disabled,
  isUploading,
  onUpload,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleUpload = async () => {
    if (disabled || isUploading || selectedFiles.length === 0) {
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      await onUpload(selectedFiles, { title, documentType, note });
      setSelectedFiles([]);
      setTitle("");
      setDocumentType("");
      setNote("");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setSuccessMessage("Business document library updated successfully.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message || "We couldn't upload those business documents right now."
          : "We couldn't upload those business documents right now.",
      );
    }
  };

  return (
    <div className="rounded-[22px] border border-border-light bg-white/85 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
        Document upload
      </p>
      <h3 className="mt-3 text-[18px] font-semibold text-text-primary">
        Add reusable business documents
      </h3>
      <p className="mt-3 text-[14px] leading-6 text-text-secondary">
        Upload business-level proof here so commercial listings can reuse it later instead of
        repeating the same setup work.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label>
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Title</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={disabled || isUploading}
            placeholder="Example: Trade license"
            className="w-full rounded-[18px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary outline-none transition-all duration-200 placeholder:text-text-secondary focus:border-text-primary/20 disabled:opacity-70"
          />
        </label>

        <label>
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">
            Document type
          </span>
          <input
            type="text"
            value={documentType}
            onChange={(event) => setDocumentType(event.target.value)}
            disabled={disabled || isUploading}
            placeholder="Example: registration"
            className="w-full rounded-[18px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary outline-none transition-all duration-200 placeholder:text-text-secondary focus:border-text-primary/20 disabled:opacity-70"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-[13px] font-semibold text-text-primary">Note</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          disabled={disabled || isUploading}
          placeholder="Optional note to help identify this document later."
          className="w-full rounded-[18px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary outline-none transition-all duration-200 placeholder:text-text-secondary focus:border-text-primary/20 disabled:opacity-70"
        />
      </label>

      <label className="mt-4 block rounded-[18px] border border-dashed border-border bg-card px-4 py-4">
        <span className="block text-[13px] font-semibold text-text-primary">Choose files</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          disabled={disabled || isUploading}
          onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
          className="mt-4 block w-full text-[13px] text-text-primary file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-text-primary"
        />
      </label>

      {selectedFiles.length > 0 ? (
        <div className="mt-4 rounded-[18px] border border-border-light bg-surface px-4 py-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
            Ready to upload
          </p>
          <ul className="mt-3 space-y-1 text-[14px] leading-6 text-text-primary">
            {selectedFiles.map((file) => (
              <li key={`${file.name}-${file.size}`}>{file.name}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-[18px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-4 rounded-[18px] border border-primary/35 bg-primary-light/80 px-4 py-4 text-[14px] leading-6 text-text-primary">
          {successMessage}
        </div>
      ) : null}

      <div className="mt-5">
        <button
          type="button"
          onClick={handleUpload}
          disabled={disabled || isUploading || selectedFiles.length === 0}
          className="inline-flex items-center justify-center rounded-[16px] bg-primary px-4 py-2.5 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
        >
          {isUploading ? "Uploading..." : "Upload documents"}
        </button>
      </div>
    </div>
  );
};
