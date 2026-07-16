'use client';

import React, { useMemo, useRef } from "react";
import { ListingCard } from "@/components/ui/ListingCard";

const imageUrl = (prompt: string, image_size: string) =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${encodeURIComponent(image_size)}`;

type Listing = {
  id: number;
  title: string;
  location: string;
  price: number;
  rating?: number;
  isNew?: boolean;
  imagePrompt: string;
};

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
        imagePrompt:
          "cozy bedroom interior, clean sheets, warm lamp light, realistic photo",
      },
    ],
    [],
  );

  const bangladeshGateaways = useMemo<Listing[]>(
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
        imagePrompt:
          "simple clean room interior, minimalist, daylight, realistic photo",
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
        imagePrompt:
          "apartment interior with balcony light, modern decor, realistic photo",
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

  const scrollByAmount = (el: HTMLDivElement | null, dir: "left" | "right") => {
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="bg-card py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-sora text-2xl font-bold text-text-primary">New Arrivals</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByAmount(newArrivalsRef.current, "left")}
              className="h-8 w-8 rounded-full border border-border bg-card text-text-primary hover:bg-background transition-colors grid place-items-center"
              aria-label="Scroll left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(newArrivalsRef.current, "right")}
              className="h-8 w-8 rounded-full border border-border bg-card text-text-primary hover:bg-background transition-colors grid place-items-center"
              aria-label="Scroll right"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={newArrivalsRef}
          className="scrollbar-hide mt-5 flex gap-6 overflow-x-auto scroll-smooth pb-2"
        >
          {newArrivals.map((listing) => (
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

        <div className="mt-12 flex items-center justify-between">
          <h2 className="font-sora text-2xl font-bold text-text-primary">
            Bangladesh Gateaways
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByAmount(bangladeshRef.current, "left")}
              className="h-8 w-8 rounded-full border border-border bg-card text-text-primary hover:bg-background transition-colors grid place-items-center"
              aria-label="Scroll left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(bangladeshRef.current, "right")}
              className="h-8 w-8 rounded-full border border-border bg-card text-text-primary hover:bg-background transition-colors grid place-items-center"
              aria-label="Scroll right"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={bangladeshRef}
          className="scrollbar-hide mt-5 flex gap-6 overflow-x-auto scroll-smooth pb-2"
        >
          {bangladeshGateaways.map((listing) => (
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
    </section>
  );
};
