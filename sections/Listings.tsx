'use client';

import React, { useRef } from "react";
import { ListingCard } from "@/components/ui/ListingCard";
import type { FrontHomepageSection } from "@/lib/front";

type ListingRailProps = {
  title: string;
  subtitle?: string;
  listings: FrontHomepageSection["items"];
  railRef: (node: HTMLDivElement | null) => void;
  onScrollLeft: () => void;
  onScrollRight: () => void;
};

const ArrowButton: React.FC<{
  direction: "left" | "right";
  onClick: () => void;
}> = ({ direction, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface hover:shadow-medium"
    aria-label={`Scroll ${direction}`}
  >
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path
        d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </button>
);

const ListingRail: React.FC<ListingRailProps> = ({
  title,
  subtitle,
  listings,
  railRef,
  onScrollLeft,
  onScrollRight,
}) => (
  <div className="surface-card-strong rounded-panel p-5 md:p-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h3 className="font-sora text-[26px] font-bold tracking-[-0.04em] text-text-primary">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-[15px] leading-7 text-text-secondary">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <ArrowButton direction="left" onClick={onScrollLeft} />
        <ArrowButton direction="right" onClick={onScrollRight} />
      </div>
    </div>

    <div
      ref={railRef}
      className="scrollbar-hide mt-7 flex gap-5 overflow-x-auto scroll-smooth pb-2"
    >
      {listings.map((listing) => (
        <ListingCard
          key={listing.propertyId}
          title={listing.title}
          location={listing.locationLabel}
          priceLabel={listing.price.displayLabel}
          rating={listing.rating?.average ?? undefined}
          ratingLabel={listing.rating?.displayLabel}
          ratingCount={listing.rating?.count ?? 0}
          badge={listing.badge}
          imageUrl={listing.coverImageUrl}
          href={listing.href}
        />
      ))}
    </div>
  </div>
);

type ListingsProps = {
  sections: FrontHomepageSection[];
  isLoading?: boolean;
  error?: string;
};

export const Listings: React.FC<ListingsProps> = ({ sections, isLoading = false, error = "" }) => {
  const railRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollByAmount = (element: HTMLDivElement | null, direction: "left" | "right") => {
    if (!element) return;
    const amount = Math.round(element.clientWidth * 0.88);
    element.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="bg-card pb-16 pt-5 md:pb-20 md:pt-10">
      <div className="mx-auto max-w-7xl px-6">
        {error ? (
          <div className="surface-card-strong rounded-panel p-6 text-[14px] text-text-secondary">
            {error}
          </div>
        ) : null}

        {!error && isLoading ? (
          <div className="surface-card-strong rounded-panel p-6">
            <div className="h-8 w-52 animate-pulse rounded-full bg-surface" />
            <div className="mt-7 flex gap-5 overflow-hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[308px] w-[220px] flex-shrink-0 animate-pulse rounded-[26px] bg-surface"
                />
              ))}
            </div>
          </div>
        ) : null}

        {!error && !isLoading && sections.length === 0 ? (
          <div className="surface-card-strong rounded-panel p-6 text-[14px] text-text-secondary">
            No curated stays are available for this tab yet.
          </div>
        ) : null}

        {!error && !isLoading ? (
          <div className="space-y-6">
            {sections.map((section) => (
              <ListingRail
                key={section.key || section.sectionId || section.title}
                title={section.title}
                listings={section.items}
                railRef={(node) => {
                  railRefs.current[section.key || section.sectionId || section.title] = node;
                }}
                onScrollLeft={() =>
                  scrollByAmount(
                    railRefs.current[section.key || section.sectionId || section.title] ?? null,
                    "left",
                  )
                }
                onScrollRight={() =>
                  scrollByAmount(
                    railRefs.current[section.key || section.sectionId || section.title] ?? null,
                    "right",
                  )
                }
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};
