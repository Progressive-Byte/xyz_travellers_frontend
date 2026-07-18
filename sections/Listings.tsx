'use client';

import React, { useRef } from "react";
import { ListingCard } from "@/components/ui/ListingCard";
import { getPropertiesByRail } from "@/data/properties";

type ListingRailProps = {
  title: string;
  subtitle: string;
  listings: ReturnType<typeof getPropertiesByRail>;
  railRef: React.RefObject<HTMLDivElement | null>;
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
        <p className="mt-2 max-w-2xl text-[15px] leading-7 text-text-secondary">
          {subtitle}
        </p>
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
          key={listing.slug}
          title={listing.title}
          location={listing.location}
          price={listing.pricePerNight}
          rating={listing.rating}
          isNew={listing.isNew}
          imageUrl={listing.gallery[0]?.src}
          href={`/properties/${listing.slug}`}
        />
      ))}
    </div>
  </div>
);

export const Listings: React.FC = () => {
  const newArrivalsRef = useRef<HTMLDivElement>(null);
  const bangladeshRef = useRef<HTMLDivElement>(null);
  const newArrivals = getPropertiesByRail("new-arrivals");
  const bangladeshGetaways = getPropertiesByRail("bangladesh-getaways");

  const scrollByAmount = (element: HTMLDivElement | null, direction: "left" | "right") => {
    if (!element) return;
    const amount = Math.round(element.clientWidth * 0.88);
    element.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="bg-card py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-badge">Featured Stays</span>
          <h2 className="section-heading mt-6">Handpicked places worth booking next</h2>
          <p className="section-subtitle mx-auto mt-5">
            Browse fresh arrivals and guest-loved stays curated to feel reliable,
            polished, and easy to compare at a glance.
          </p>
          <div className="section-divider mx-auto mt-6" />
        </div>

        <div className="mt-12 space-y-8">
          <ListingRail
            title="New Arrivals"
            subtitle="Freshly listed properties with strong visuals, clean interiors, and flexible stay options."
            listings={newArrivals}
            railRef={newArrivalsRef}
            onScrollLeft={() => scrollByAmount(newArrivalsRef.current, "left")}
            onScrollRight={() => scrollByAmount(newArrivalsRef.current, "right")}
          />

          <ListingRail
            title="Bangladesh Getaways"
            subtitle="A wider mix of city stays, family-ready homes, and destination-focused escapes across the country."
            listings={bangladeshGetaways}
            railRef={bangladeshRef}
            onScrollLeft={() => scrollByAmount(bangladeshRef.current, "left")}
            onScrollRight={() => scrollByAmount(bangladeshRef.current, "right")}
          />
        </div>
      </div>
    </section>
  );
};
