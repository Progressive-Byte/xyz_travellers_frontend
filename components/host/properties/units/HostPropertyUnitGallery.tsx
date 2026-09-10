"use client";

import React, { useEffect, useState } from "react";
import { HostPropertyMediaEmptyState } from "@/components/host/properties/media/HostPropertyMediaEmptyState";
import { HostPropertyMediaGallery } from "@/components/host/properties/media/HostPropertyMediaGallery";
import { HostPropertyMediaUploader } from "@/components/host/properties/media/HostPropertyMediaUploader";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  deleteHostUnitMedia,
  getHostUnitMedia,
  updateHostUnitMedia,
  uploadHostUnitImage,
  type HostPropertyMediaItem,
} from "@/lib/host";

type HostPropertyUnitGalleryProps = {
  propertyId: string;
  unitId: string;
  disabled: boolean;
};

export const HostPropertyUnitGallery: React.FC<HostPropertyUnitGalleryProps> = ({
  propertyId,
  unitId,
  disabled,
}) => {
  const { token } = useAuth();
  const [items, setItems] = useState<HostPropertyMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !unitId) {
      return;
    }

    let isActive = true;

    const loadGallery = async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await getHostUnitMedia(token, propertyId, unitId);
        if (isActive) {
          setItems(result);
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError instanceof ApiError
              ? requestError.message || "We couldn't load this unit's gallery right now."
              : "We couldn't load this unit's gallery right now.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadGallery();

    return () => {
      isActive = false;
    };
  }, [propertyId, unitId, token]);

  const refreshItems = async () => {
    if (!token) {
      return;
    }

    const nextItems = await getHostUnitMedia(token, propertyId, unitId);
    setItems(nextItems);
  };

  const handleUpload = async (files: File[]) => {
    if (!token) {
      return;
    }

    setIsUploading(true);

    try {
      for (const file of files) {
        await uploadHostUnitImage(token, propertyId, unitId, file);
      }

      await refreshItems();
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (mediaId: string, payload: { caption: string; sortOrder: string }) => {
    if (!token) {
      return;
    }

    await updateHostUnitMedia(token, propertyId, unitId, mediaId, payload);
    await refreshItems();
  };

  const handleSetCover = async (mediaId: string) => {
    if (!token) {
      return;
    }

    await updateHostUnitMedia(token, propertyId, unitId, mediaId, {
      caption: "",
      sortOrder: "",
      isCover: true,
    });
    await refreshItems();
  };

  const handleDelete = async (mediaId: string) => {
    if (!token) {
      return;
    }

    await deleteHostUnitMedia(token, propertyId, unitId, mediaId);
    await refreshItems();
  };

  return (
    <div className="mt-5 space-y-5 border-t border-border-light pt-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          Unit gallery
        </p>
        <p className="mt-2 text-[13px] leading-6 text-text-secondary">
          Photos added here show up specifically for this unit on the public listing, alongside the
          property's own gallery.
        </p>
      </div>

      <HostPropertyMediaUploader
        disabled={disabled}
        isUploading={isUploading}
        onUpload={handleUpload}
        eyebrow="Unit image upload"
        heading="Show guests exactly what this unit looks like"
        description="Upload photos specific to this unit, then choose one as the unit's cover image."
        chooseLabel="Choose unit images"
        chooseHint="Select one or more image files for this unit's gallery."
      />

      {error ? (
        <div className="rounded-[20px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-panel h-40 animate-pulse bg-white/75" />
      ) : items.length === 0 ? (
        <HostPropertyMediaEmptyState
          eyebrow="No unit images yet"
          heading="Add this unit's first photo"
          description="Unit-specific photos help guests pick between similar units at the same property."
        />
      ) : (
        <HostPropertyMediaGallery
          items={items}
          disabled={disabled}
          onSave={handleSave}
          onSetCover={handleSetCover}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
