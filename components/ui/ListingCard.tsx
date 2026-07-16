import React from "react";
import Image from "next/image";

interface ListingCardProps {
  title: string;
  location: string;
  price: number;
  rating?: number;
  isNew?: boolean;
  imageUrl?: string;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  title,
  location,
  price,
  rating,
  isNew = false,
  imageUrl,
}) => {
  return (
    <article className="group hover-lift w-[220px] flex-shrink-0 cursor-pointer rounded-[26px] border border-border bg-card p-3 shadow-soft">
      <div className="relative h-[170px] overflow-hidden rounded-[20px] bg-surface-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="220px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-text-primary shadow-soft">
            {location}
          </span>
          {isNew ? (
            <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-text-primary">
              New
            </span>
          ) : null}
        </div>
      </div>

      <div className="px-1 pb-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[17px] font-semibold leading-6 text-text-primary">{title}</p>
            <p className="mt-1 text-[13px] font-medium text-text-secondary">{location}</p>
          </div>

          {typeof rating === "number" ? (
            <div className="rounded-full bg-surface px-2.5 py-1 text-[12px] font-semibold text-text-primary">
              {rating.toFixed(1)}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
              From
            </p>
            <p className="mt-1 text-[18px] font-bold leading-none text-text-primary">
              BDT {price.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-1 text-[12px] font-medium text-text-secondary">
            <span className="text-primary">★</span>
            <span>{typeof rating === "number" ? "Guest favorite" : "Fresh listing"}</span>
          </div>
        </div>
      </div>
    </article>
  );
};
