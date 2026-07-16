'use client';

import React, { useMemo, useRef } from "react";
import { ListingCard } from "@/components/ui/ListingCard";

const imageUrl = (prompt: string, imageSize: string) =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${encodeURIComponent(imageSize)}`;

type Listing = {
  id: number;
  title: string;
  location: string;
  price: number;
  rating?: number;
  isNew?: boolean;
  imagePrompt: string;
};

type ListingRailProps = {
  title: string;
  subtitle: string;
  listings: Listing[];
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
          key={listing.id}
          title={listing.title}
          location={listing.location}
          price={listing.price}
          rating={listing.rating}
          isNew={listing.isNew}
          imageUrl={imageUrl(listing.imagePrompt, "landscape_4_3")}
        />
      ))}
    </div>
  </div>
);

export const Listings: React.FC = () => {
  const newArrivalsRef = useRef<HTMLDivElement>(null);
  const bangladeshRef = useRef<HTMLDivElement>(null);

  const newArrivals = useMemo<Listing[]>(
    () => [
      {
        id: 1,
        title: "Cozy Apartment",
        location: "Bashundhara",
        price: 4999,
        rating: undefined,
        isNew: true,
        imagePrompt:
          "bright modern apartment interior, minimal design, cozy sofa, warm daylight, realistic photo",
      },
      {
        id: 2,
        title: "Modern Stay",
        location: "Uttara | Sector 9",
        price: 6999,
        rating: undefined,
        isNew: true,
        imagePrompt:
          "modern living room interior, neutral palette, wide angle, realistic photo, soft natural light",
      },
      {
        id: 3,
        title: "Diplomatic Zone",
        location: "Baridhara | Diplomatic Zone",
        price: 12959,
        rating: undefined,
        isNew: true,
        imagePrompt:
          "luxury bedroom interior, hotel style, premium textures, warm lighting, realistic photo",
      },
      {
        id: 4,
        title: "City Apartment",
        location: "Moddho Badda",
        price: 3699,
        rating: 4.8,
        isNew: false,
        imagePrompt:
          "small stylish apartment interior, tidy, contemporary furniture, evening ambience, realistic photo",
      },
      {
        id: 5,
        title: "Jashiri Abashon",
        location: "Jashiri Abashon",
        price: 12500,
        rating: undefined,
        isNew: true,
        imagePrompt:
          "night exterior of modern villa, architectural lighting, high contrast, realistic photo",
      },
      {
        id: 6,
        title: "Cozy Room",
        location: "Adabor | Mohammadpur",
        price: 2499,
        rating: 5.0,
        isNew: false,
        imagePrompt: "cozy bedroom interior, clean sheets, warm lamp light, realistic photo",
      },
    ],
    [],
  );

  const bangladeshGetaways = useMemo<Listing[]>(
    () => [
      {
        id: 11,
        title: "Triplex Apartment",
        location: "Triplex Apartment, Bashundhara",
        price: 18500,
        rating: 5.0,
        isNew: false,
        imagePrompt:
          "lush green garden with small house, bangladesh countryside vibe, daytime, realistic photo",
      },
      {
        id: 12,
        title: "Premium Stay",
        location: "Dhanmondi",
        price: 7500,
        rating: 5.0,
        isNew: false,
        imagePrompt:
          "bright airy apartment interior, cream and wood tones, realistic photo, soft shadows",
      },
      {
        id: 13,
        title: "City Retreat",
        location: "Mymensingh",
        price: 4999,
        rating: 5.0,
        isNew: false,
        imagePrompt: "simple clean room interior, minimalist, daylight, realistic photo",
      },
      {
        id: 14,
        title: "Family Apartment",
        location: "Banasree, Dhaka",
        price: 7000,
        rating: 5.0,
        isNew: false,
        imagePrompt:
          "comfortable living room with tv and sofa, warm evening light, realistic photo",
      },
      {
        id: 15,
        title: "Uttara Stay",
        location: "Uttara, Dhaka",
        price: 4199,
        rating: undefined,
        isNew: true,
        imagePrompt: "apartment interior with balcony light, modern decor, realistic photo",
      },
      {
        id: 16,
        title: "Heritage Stay",
        location: "Bogura",
        price: 5499,
        rating: undefined,
        isNew: true,
        imagePrompt:
          "cozy traditional room, warm colors, bangladesh travel vibe, realistic photo",
      },
    ],
    [],
  );

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
