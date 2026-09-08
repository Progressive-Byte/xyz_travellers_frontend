"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { ApiError } from "@/lib/api";

type FavoriteButtonProps = {
  propertyId: string;
  className?: string;
};

const HeartIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    className="h-[18px] w-[18px]"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 20.25c-.28 0-.55-.09-.77-.27C7.64 17.3 3 13.36 3 9.14 3 6.3 5.24 4 8 4c1.54 0 3.02.75 4 1.94C13 4.75 14.46 4 16 4c2.76 0 5 2.3 5 5.14 0 4.22-4.64 8.16-8.23 10.84-.22.18-.49.27-.77.27Z"
    />
  </svg>
);

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ propertyId, className = "" }) => {
  const { isAuthenticated, isHydrated } = useAuth();
  const { canUseWishlist, isSaved, toggle, pendingPropertyId } = useWishlist();
  const [notice, setNotice] = useState("");

  const saved = isSaved(propertyId);
  const isPending = pendingPropertyId === propertyId;

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isHydrated) {
      return;
    }

    if (!canUseWishlist) {
      showNotice(
        isAuthenticated
          ? "Only guest accounts can save properties to a wishlist."
          : "Log in as a guest to save properties to your wishlist.",
      );
      return;
    }

    try {
      await toggle(propertyId);
    } catch (error) {
      showNotice(error instanceof ApiError ? error.message : "Unable to update wishlist right now.");
    }
  };

  return (
    <span className={className}>
      <span className="relative inline-flex">
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={saved}
          className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-70 ${
            saved
              ? "border-primary/40 bg-primary text-text-primary"
              : "border-border bg-white/90 text-text-primary backdrop-blur"
          }`}
        >
          <HeartIcon filled={saved} />
        </button>

        {notice ? (
          <span className="absolute right-0 top-full z-30 mt-2 w-56 rounded-[14px] border border-border bg-card px-3 py-2 text-[12px] leading-5 text-text-primary shadow-strong">
            {notice}
          </span>
        ) : null}
      </span>
    </span>
  );
};
