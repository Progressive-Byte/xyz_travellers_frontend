import React from "react";
import { ListingCard } from "@/components/ui/ListingCard";

const listings = [
  {
    id: 1,
    title: "Cozy Apartment",
    location: "Uttara",
    price: 7500,
    rating: 5.0,
    isNew: false,
  },
  {
    id: 2,
    title: "Modern Room",
    location: "Gulshan 2",
    price: 4300,
    rating: 5.0,
    isNew: false,
  },
  {
    id: 3,
    title: "Luxury Stay",
    location: "Near 300 Feet",
    price: 7999,
    rating: undefined,
    isNew: true,
  },
  {
    id: 4,
    title: "Budget Room",
    location: "Uttara",
    price: 4399,
    rating: undefined,
    isNew: true,
  },
  {
    id: 5,
    title: "Spacious Apartment",
    location: "Banasree",
    price: 5800,
    rating: undefined,
    isNew: true,
  },
  {
    id: 6,
    title: "Elegant Room",
    location: "Dhanmondi",
    price: 5999,
    rating: 5.0,
    isNew: false,
  },
];

export const Listings: React.FC = () => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-sora text-3xl font-bold text-false-black mb-8">
          Popular stays
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              title={listing.title}
              location={listing.location}
              price={listing.price}
              rating={listing.rating}
              isNew={listing.isNew}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
