"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { HostShell } from "@/components/host/HostShell";
import { HostPropertyEditorShell } from "@/components/host/properties/HostPropertyEditorShell";
import { HostPropertyMediaEmptyState } from "@/components/host/properties/media/HostPropertyMediaEmptyState";
import { HostPropertyMediaGallery } from "@/components/host/properties/media/HostPropertyMediaGallery";
import { HostPropertyMediaUploader } from "@/components/host/properties/media/HostPropertyMediaUploader";
import { HostPropertyVideoUrlForm } from "@/components/host/properties/media/HostPropertyVideoUrlForm";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  createHostPropertyVideoUrl,
  deleteHostPropertyMedia,
  getHostProperty,
  getHostPropertyMedia,
  isHostPropertyEditable,
  updateHostPropertyMedia,
  uploadHostPropertyImage,
  type HostPropertyDetail,
  type HostPropertyMediaItem,
} from "@/lib/host";

type HostPropertyMediaPageProps = {
  propertyId: string;
};

const MediaPageSkeleton = () => (
  <HostShell badge="Add Property">
    <div className="space-y-6">
      <div className="surface-card rounded-panel h-72 animate-pulse bg-white/75" />
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="surface-card rounded-panel h-[420px] animate-pulse bg-white/75" />
          <div className="surface-card rounded-panel h-[240px] animate-pulse bg-white/75" />
        </div>
        <div className="space-y-6">
          <div className="surface-card rounded-panel h-[220px] animate-pulse bg-white/75" />
          <div className="surface-card rounded-panel h-[220px] animate-pulse bg-white/75" />
        </div>
      </div>
    </div>
  </HostShell>
);

export const HostPropertyMediaPage: React.FC<HostPropertyMediaPageProps> = ({ propertyId }) => {
  const { token } = useAuth();
  const [property, setProperty] = useState<HostPropertyDetail | null>(null);
  const [mediaItems, setMediaItems] = useState<HostPropertyMediaItem[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadMediaPage = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [propertyResult, mediaResult] = await Promise.all([
          getHostProperty(token, propertyId),
          getHostPropertyMedia(token, propertyId),
        ]);

        if (!isActive) {
          return;
        }

        setProperty(propertyResult);
        setMediaItems(mediaResult);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load this property's media right now."
            : "We couldn't load this property's media right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadMediaPage();

    return () => {
      isActive = false;
    };
  }, [propertyId, retryKey, token]);

  const canEdit = useMemo(
    () => (property ? isHostPropertyEditable(property.status) : false),
    [property],
  );
  const coverImage = useMemo(
    () => mediaItems.find((item) => item.isCover && item.type === "image") ?? null,
    [mediaItems],
  );
  const imageCount = useMemo(
    () => mediaItems.filter((item) => item.type === "image").length,
    [mediaItems],
  );
  const videoCount = useMemo(
    () => mediaItems.filter((item) => item.type === "video").length,
    [mediaItems],
  );

  const refreshMediaItems = async () => {
    if (!token) {
      return;
    }

    const nextItems = await getHostPropertyMedia(token, propertyId);
    setMediaItems(nextItems);
  };

  const handleUpload = async (files: File[]) => {
    if (!token) {
      return;
    }

    setIsUploading(true);

    try {
      for (const file of files) {
        await uploadHostPropertyImage(token, propertyId, file);
      }

      await refreshMediaItems();
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateVideo = async (videoUrl: string) => {
    if (!token) {
      return;
    }

    await createHostPropertyVideoUrl(token, propertyId, videoUrl);
    await refreshMediaItems();
  };

  const handleSaveMedia = async (
    mediaId: string,
    payload: { caption: string; sortOrder: string },
  ) => {
    if (!token) {
      return;
    }

    await updateHostPropertyMedia(token, propertyId, mediaId, payload);
    await refreshMediaItems();
  };

  const handleSetCover = async (mediaId: string) => {
    if (!token) {
      return;
    }

    await updateHostPropertyMedia(token, propertyId, mediaId, {
      caption: "",
      sortOrder: "",
      isCover: true,
    });
    await refreshMediaItems();
  };

  const handleDelete = async (mediaId: string) => {
    if (!token) {
      return;
    }

    await deleteHostPropertyMedia(token, propertyId, mediaId);
    await refreshMediaItems();
  };

  if (isLoading) {
    return <MediaPageSkeleton />;
  }

  if (error || !property) {
    return (
      <HostShell badge="Add Property">
        <div className="surface-card rounded-panel p-6 md:p-8">
          <p className="text-[14px] leading-7 text-text-secondary">
            {error || "We couldn't load this property's media right now."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Try again
            </button>
            <Link
              href={`/host/properties/${propertyId}/edit`}
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Back to editor
            </Link>
          </div>
        </div>
      </HostShell>
    );
  }

  return (
    <HostShell badge="Add Property">
      <HostPropertyEditorShell
        propertyId={propertyId}
        currentStep="media"
        title={property.name || "Untitled property"}
        status={property.status}
        description="This stage turns the draft into a real guest-facing listing by adding gallery images, choosing a cover photo, and optionally attaching a supporting video link."
        headerAside={
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Editability
            </p>
            <p className="mt-3 text-[16px] font-semibold text-text-primary">
              {canEdit ? "Media can be updated now" : "Media is read-only right now"}
            </p>
          </div>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <HostPropertyMediaUploader
              disabled={!canEdit}
              isUploading={isUploading}
              onUpload={handleUpload}
            />

            <HostPropertyVideoUrlForm disabled={!canEdit} onSubmit={handleCreateVideo} />

            {mediaItems.length === 0 ? (
              <HostPropertyMediaEmptyState />
            ) : (
              <HostPropertyMediaGallery
                items={mediaItems}
                disabled={!canEdit}
                onSave={handleSaveMedia}
                onSetCover={handleSetCover}
                onDelete={handleDelete}
              />
            )}
          </div>

          <div className="space-y-6">
            <div className="surface-card rounded-panel p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Media summary
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[20px] border border-border-light bg-white/80 px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Images</p>
                  <p className="mt-2 text-[20px] font-semibold text-text-primary">{imageCount}</p>
                </div>
                <div className="rounded-[20px] border border-border-light bg-white/80 px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Videos</p>
                  <p className="mt-2 text-[20px] font-semibold text-text-primary">{videoCount}</p>
                </div>
                <div className="rounded-[20px] border border-border-light bg-white/80 px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Cover image</p>
                  <p className="mt-2 text-[15px] font-semibold text-text-primary">
                    {coverImage ? "Ready" : "Still needed"}
                  </p>
                </div>
              </div>
            </div>

            <div className="surface-card rounded-panel p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Workflow guidance
              </p>
              <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                Keep the gallery intentional
              </h2>
              <div className="mt-5 space-y-3">
                {[
                  "Lead with the image guests should trust first, then mark it as cover.",
                  "Use captions only when they add helpful context instead of repeating the obvious.",
                  "Treat video as optional support for the image gallery, not the core listing asset.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[20px] border border-border-light bg-white/80 px-4 py-3 text-[14px] leading-6 text-text-primary"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card rounded-panel p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Navigation
              </p>
              <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                Move through the listing workflow
              </h2>
              <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                Basics and location stay editable in the previous step. Units now open next, followed by
                pricing and calendar controls before verification lands.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/host/properties/${propertyId}/edit`}
                  className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                >
                  Back to editor
                </Link>
                <Link
                  href={`/host/properties/${propertyId}/units`}
                  className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
                >
                  Open units
                </Link>
                <Link
                  href="/host/properties"
                  className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                >
                  View properties
                </Link>
              </div>
            </div>
          </div>
        </div>
      </HostPropertyEditorShell>
    </HostShell>
  );
};
