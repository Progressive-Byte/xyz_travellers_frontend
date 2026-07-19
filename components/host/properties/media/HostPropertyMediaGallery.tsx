"use client";

import React from "react";
import { HostPropertyMediaCard } from "@/components/host/properties/media/HostPropertyMediaCard";
import { type HostPropertyMediaItem } from "@/lib/host";

type HostPropertyMediaGalleryProps = {
  items: HostPropertyMediaItem[];
  disabled: boolean;
  onSave: (mediaId: string, payload: { caption: string; sortOrder: string }) => Promise<void>;
  onSetCover: (mediaId: string) => Promise<void>;
  onDelete: (mediaId: string) => Promise<void>;
};

export const HostPropertyMediaGallery: React.FC<HostPropertyMediaGalleryProps> = ({
  items,
  disabled,
  onSave,
  onSetCover,
  onDelete,
}) => {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {items.map((item) => (
        <HostPropertyMediaCard
          key={item.id}
          item={item}
          disabled={disabled}
          onSave={(payload) => onSave(item.id, payload)}
          onSetCover={() => onSetCover(item.id)}
          onDelete={() => onDelete(item.id)}
        />
      ))}
    </div>
  );
};
