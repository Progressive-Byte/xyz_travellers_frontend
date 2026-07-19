'use client';

import React, { useMemo, useRef } from "react";
import { ListingCard } from "@/components/ui/ListingCard";
import { properties, type Property } from "@/data/properties";
import type { HomeCategory } from "@/data/homeCategories";

type ListingRailProps = {
  title: string;
  subtitle: string;
  listings: Property[];
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

type ListingsProps = {
  activeCategory: HomeCategory;
};

const dedupeProperties = (items: Property[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
};

const buildCategoryListings = (activeCategory: HomeCategory) => {
  const apartmentMatches = dedupeProperties(
    properties.filter(
      (property) =>
        /apartment/i.test(property.title) ||
        /apartment|serviced stay|residence/i.test(property.propertyType),
    ),
  ).slice(0, 6);

  const roomMatches = dedupeProperties(
    properties.filter(
      (property) =>
        property.guestCount <= 5 ||
        property.bedroomCount <= 2 ||
        property.pricePerNight <= 7000,
    ),
  ).slice(0, 6);

  const hotelMatches = dedupeProperties(
    properties.filter(
      (property) =>
        property.pricePerNight >= 7000 ||
        property.rating === 5 ||
        /premium|executive|triplex/i.test(property.propertyType),
    ),
  ).slice(0, 6);

  const content = {
    Apartments: {
      railTitle: "Popular apartments",
      railSubtitle:
        "A tighter apartment-focused mix for city stays, family visits, and short residential bookings.",
      listings: apartmentMatches,
    },
    Rooms: {
      railTitle: "Popular room-style stays",
      railSubtitle:
        "A compact mix of lighter stays that keeps the booking flow simple and fast.",
      listings: roomMatches,
    },
    Hotels: {
      railTitle: "Popular hotel-style stays",
      railSubtitle:
        "A more elevated set of stays selected for stronger finish, comfort, and premium booking appeal.",
      listings: hotelMatches,
    },
  } satisfies Record<HomeCategory, {
    railTitle: string;
    railSubtitle: string;
    listings: Property[];
  }>;

  return content[activeCategory];
};

export const Listings: React.FC<ListingsProps> = ({ activeCategory }) => {
  const listingsRef = useRef<HTMLDivElement>(null);
  const listingContent = useMemo(() => buildCategoryListings(activeCategory), [activeCategory]);

  const scrollByAmount = (element: HTMLDivElement | null, direction: "left" | "right") => {
    if (!element) return;
    const amount = Math.round(element.clientWidth * 0.88);
    element.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="bg-card pb-16 pt-5 md:pb-20 md:pt-10">
      <div className="mx-auto max-w-7xl px-6">
        <ListingRail
          title={listingContent.railTitle}
          subtitle={listingContent.railSubtitle}
          listings={listingContent.listings}
          railRef={listingsRef}
          onScrollLeft={() => scrollByAmount(listingsRef.current, "left")}
          onScrollRight={() => scrollByAmount(listingsRef.current, "right")}
        />
      </div>
    </section>
  );
};
