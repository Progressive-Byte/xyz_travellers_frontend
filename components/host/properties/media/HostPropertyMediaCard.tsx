"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { type HostPropertyMediaItem } from "@/lib/host";

type HostPropertyMediaCardProps = {
  item: HostPropertyMediaItem;
  disabled: boolean;
  onSave: (payload: { caption: string; sortOrder: string }) => Promise<void>;
  onSetCover: () => Promise<void>;
  onDelete: () => Promise<void>;
};

export const HostPropertyMediaCard: React.FC<HostPropertyMediaCardProps> = ({
  item,
  disabled,
  onSave,
  onSetCover,
  onDelete,
}) => {
  const [caption, setCaption] = useState(item.caption);
  const [sortOrder, setSortOrder] = useState(item.sortOrder?.toString() ?? "");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingCover, setIsSettingCover] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setCaption(item.caption);
    setSortOrder(item.sortOrder?.toString() ?? "");
  }, [item.caption, item.sortOrder]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (disabled || isSaving) {
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await onSave({ caption, sortOrder });
      setSuccessMessage("Media details updated successfully.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message || "We couldn't update this media item right now."
          : "We couldn't update this media item right now.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetCover = async () => {
    if (disabled || item.isCover || isSettingCover) {
      return;
    }

    setIsSettingCover(true);
    setError("");
    setSuccessMessage("");

    try {
      await onSetCover();
      setSuccessMessage("Cover image updated successfully.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message || "We couldn't update this media item right now."
          : "We couldn't update this media item right now.",
      );
    } finally {
      setIsSettingCover(false);
    }
  };

  const handleDelete = async () => {
    if (disabled || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setError("");
    setSuccessMessage("");

    try {
      await onDelete();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message || "We couldn't remove this media item right now."
          : "We couldn't remove this media item right now.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const previewUrl = item.thumbnailUrl || item.url;

  return (
    <div className="surface-card rounded-panel overflow-hidden">
      <div className="relative aspect-[4/3] bg-surface">
        {item.type === "image" ? (
          <img src={previewUrl} alt={item.caption || "Property media"} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(180deg,rgba(245,243,237,1)_0%,rgba(217,241,75,0.26)_100%)] px-6 text-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Video link
              </p>
              <p className="mt-3 text-[15px] font-semibold text-text-primary">
                Supplemental listing video
              </p>
              <Link
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-2 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:border-text-primary/20 hover:shadow-medium"
              >
                Open video URL
              </Link>
            </div>
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/92 px-3 py-1.5 text-[12px] font-semibold text-text-primary shadow-soft">
            {item.type === "video" ? "Video" : "Image"}
          </span>
          {item.isCover ? (
            <span className="rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-text-primary shadow-glow">
              Cover image
            </span>
          ) : null}
        </div>
      </div>

      <form onSubmit={handleSave} className="p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
              Caption
            </span>
            <input
              type="text"
              value={caption}
              onChange={(event) => {
                setCaption(event.target.value);
                setError("");
                setSuccessMessage("");
              }}
              disabled={disabled || isSaving || isDeleting}
              className="mt-3 w-full rounded-[16px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-colors duration-200 placeholder:text-text-primary focus:border-text-primary/25"
              placeholder="Add a short caption"
            />
          </label>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
              Sort order
            </span>
            <input
              type="number"
              min="0"
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value);
                setError("");
                setSuccessMessage("");
              }}
              disabled={disabled || isSaving || isDeleting}
              className="mt-3 w-full rounded-[16px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-colors duration-200 placeholder:text-text-primary focus:border-text-primary/25"
              placeholder="0"
            />
          </label>
        </div>

        {error ? (
          <div className="mt-4 rounded-[18px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-4 rounded-[18px] border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-[14px] leading-6 text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={disabled || isSaving || isDeleting}
            className="inline-flex items-center justify-center rounded-[16px] bg-primary px-4 py-3 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Save details"}
          </button>

          <button
            type="button"
            onClick={handleSetCover}
            disabled={disabled || item.isCover || isSettingCover || isDeleting}
            className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-4 py-3 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium disabled:opacity-70"
          >
            {item.isCover ? "Current cover" : isSettingCover ? "Updating cover..." : "Set as cover"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={disabled || isDeleting || isSaving || isSettingCover}
            className="inline-flex items-center justify-center rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700 transition-all duration-200 hover:bg-red-100 disabled:opacity-70"
          >
            {isDeleting ? "Removing..." : "Delete"}
          </button>
        </div>
      </form>
    </div>
  );
};
