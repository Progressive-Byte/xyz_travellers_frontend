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
    <div className="group flex-shrink-0 w-[176px] cursor-pointer">
      <div className="relative h-[132px] w-full overflow-hidden rounded-2xl bg-border-light">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="176px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>

      <div className="pt-3">
        <p className="text-[13px] font-semibold text-text-primary leading-5">
          {location}
        </p>

        <div className="mt-1 flex items-center gap-1.5 text-[12px] leading-5">
          <span className="font-semibold text-primary">BDT {price.toLocaleString()}</span>
          <span className="text-border">•</span>
          {typeof rating === "number" ? (
            <span className="font-medium text-text-primary">{rating.toFixed(2)}</span>
          ) : null}
          {isNew ? (
            <>
              <span className="text-border">•</span>
              <span className="font-medium text-text-secondary">New</span>
            </>
          ) : null}
        </div>

        <p className="mt-1 text-[12px] text-text-secondary leading-5">
          {title}
        </p>
      </div>
    </div>
  );
};
