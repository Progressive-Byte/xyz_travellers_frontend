"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { ApiError } from "@/lib/api";

type FavoriteButtonProps = {
  propertyId: string;
  className?: string;
};

type TooltipState = {
  message: string;
  top: number;
  left: number;
  width: number;
  arrowLeft: number;
  placement: "top" | "bottom";
};

const TOOLTIP_MAX_WIDTH = 264;
const VIEWPORT_MARGIN = 12;
const ESTIMATED_TOOLTIP_HEIGHT = 72;

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
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [entered, setEntered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const saved = isSaved(propertyId);
  const isPending = pendingPropertyId === propertyId;

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!tooltip) {
      setEntered(false);
      return;
    }
    const raf = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(raf);
  }, [tooltip]);

  const showNotice = (message: string) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const width = Math.min(TOOLTIP_MAX_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
    let left = rect.right - width;
    left = Math.max(VIEWPORT_MARGIN, Math.min(left, window.innerWidth - width - VIEWPORT_MARGIN));

    const spaceBelow = window.innerHeight - rect.bottom;
    const placement: "top" | "bottom" =
      spaceBelow < ESTIMATED_TOOLTIP_HEIGHT + VIEWPORT_MARGIN && rect.top > ESTIMATED_TOOLTIP_HEIGHT
        ? "top"
        : "bottom";
    const top = placement === "bottom" ? rect.bottom + 10 : rect.top - 10;

    const buttonCenter = rect.left + rect.width / 2;
    const arrowLeft = Math.max(18, Math.min(buttonCenter - left, width - 18));

    setEntered(false);
    setTooltip({ message, top, left, width, arrowLeft, placement });

    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = window.setTimeout(() => setTooltip(null), 3200);
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
      <button
        ref={buttonRef}
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

      {tooltip && typeof document !== "undefined"
        ? createPortal(
            <div
              role="status"
              style={{
                top: tooltip.top,
                left: tooltip.left,
                width: tooltip.width,
                transform:
                  tooltip.placement === "top"
                    ? `translateY(calc(-100% + ${entered ? "0px" : "4px"}))`
                    : entered
                      ? "translateY(0)"
                      : "translateY(-4px)",
              }}
              className={`fixed z-[999] rounded-2xl bg-text-primary px-4 py-3 text-[13px] font-medium leading-5 text-white shadow-strong transition-opacity duration-200 ${
                entered ? "opacity-100" : "opacity-0"
              }`}
            >
              <span
                className={`absolute h-3 w-3 rotate-45 bg-text-primary ${
                  tooltip.placement === "bottom" ? "-top-1.5" : "-bottom-1.5"
                }`}
                style={{ left: tooltip.arrowLeft, marginLeft: -6 }}
              />
              {tooltip.message}
            </div>,
            document.body,
          )
        : null}
    </span>
  );
};
