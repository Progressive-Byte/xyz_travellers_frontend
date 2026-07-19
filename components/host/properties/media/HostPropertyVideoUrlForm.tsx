"use client";

import React, { useState } from "react";

type HostPropertyVideoUrlFormProps = {
  disabled: boolean;
  onSubmit: (videoUrl: string) => Promise<void>;
};

const isLikelyUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const HostPropertyVideoUrlForm: React.FC<HostPropertyVideoUrlFormProps> = ({
  disabled,
  onSubmit,
}) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (disabled || isSubmitting) {
      return;
    }

    const normalizedUrl = videoUrl.trim();

    if (!normalizedUrl) {
      setError("Please enter a video URL.");
      setSuccessMessage("");
      return;
    }

    if (!isLikelyUrl(normalizedUrl)) {
      setError("Please enter a valid video URL.");
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      await onSubmit(normalizedUrl);
      setVideoUrl("");
      setSuccessMessage("Media uploaded successfully.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message || "We couldn't save that video URL right now."
          : "We couldn't save that video URL right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="surface-card rounded-panel p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
        Optional video
      </p>
      <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
        Add a supporting video link
      </h2>
      <p className="mt-4 text-[14px] leading-7 text-text-secondary">
        Video is optional and should support, not replace, your image gallery for this listing.
      </p>

      <label className="mt-6 block">
        <span className="text-[13px] font-semibold text-text-primary">Video URL</span>
        <input
          type="url"
          value={videoUrl}
          onChange={(event) => {
            setVideoUrl(event.target.value);
            setError("");
            setSuccessMessage("");
          }}
          disabled={disabled || isSubmitting}
          placeholder="https://"
          className="mt-3 w-full rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-colors duration-200 placeholder:text-text-primary focus:border-text-primary/25"
        />
      </label>

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
          type="submit"
          disabled={disabled || isSubmitting}
          className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium disabled:opacity-70"
        >
          {isSubmitting ? "Saving video..." : "Add video URL"}
        </button>
      </div>
    </form>
  );
};
