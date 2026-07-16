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
  imageUrl = "https://coresg-normal.trae.ai/api/v1/text_to_image?prompt=modern%20apartment%20room%20in%20city&image_size=square_hd",
}) => {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer">
      <div className="relative h-64">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
        />
        {isNew && (
          <span className="absolute top-4 left-4 bg-primary text-text-primary px-3 py-1 rounded-full text-sm font-semibold">
            New
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-text-primary">{location}</h3>
            <p className="text-sm text-text-secondary">{title}</p>
          </div>
          {rating && (
            <div className="flex items-center">
              <span className="text-sm font-medium text-text-primary">
                {rating.toFixed(2)}
              </span>
            </div>
          )}
        </div>
        <div className="mt-2">
          <p className="text-text-primary">
            <span className="font-semibold">BDT {price.toLocaleString()}</span>{" "}
            per day
          </p>
        </div>
      </div>
    </div>
  );
};
