'use client';

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ApiError } from "@/lib/api";
import {
  getFrontLocationPills,
  type FrontLocationPill,
} from "@/lib/front";
import { subscribe as subscribeDestinations } from "@/lib/locations-store";

type ScrollButtonProps = {
  direction: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
};

const ScrollButton: React.FC<ScrollButtonProps> = ({ direction, onClick, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-soft"
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

export const LocationPillStrip: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const [pills, setPills] = useState<FrontLocationPill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await getFrontLocationPills();

        if (cancelled) {
          return;
        }

        setPills(result);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof ApiError
            ? err.message
            : "Unable to load destination shortcuts right now.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    try {
      unsubscribe = subscribeDestinations(() => {
        if (!cancelled) {
          void load();
        }
      });
    } catch {
    }

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    };

    update();
    element.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(element);
    window.addEventListener("resize", update);

    return () => {
      element.removeEventListener("scroll", update);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [pills.length]);

  const scroll = (direction: "left" | "right") => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }
    const amount = Math.max(280, Math.round(element.clientWidth * 0.7));
    element.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const activeSlug = pathname?.startsWith("/destinations/")
    ? pathname.split("/destinations/")[1]?.split("?")[0] ?? ""
    : "";

  if (!isLoading && pills.length === 0 && !error) {
    return null;
  }

  const pillCount = Math.max(6, pills.length);

  return (
    <div className="mb-5 w-full">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background via-background/95 to-transparent md:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background via-background/95 to-transparent md:w-16" />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <ScrollButton
              direction="left"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
            />
            <div
              ref={scrollRef}
              className="scrollbar-hide flex max-w-[calc(100%-88px)] items-center gap-2 overflow-x-auto scroll-smooth pb-1 md:max-w-[calc(100%-104px)]"
              role="list"
              aria-label="Destination shortcuts"
            >
              {isLoading
                ? Array.from({ length: pillCount }).map((_, index) => (
                    <div
                      key={`pill-skeleton-${index}`}
                      role="listitem"
                      className="h-10 w-28 shrink-0 animate-pulse rounded-full bg-surface-muted/90 md:h-11 md:w-32"
                      aria-hidden
                    />
                  ))
                : pills.map((pill) => {
                    const isActive = pill.slug && pill.slug === activeSlug;

                    return (
                      <Link
                        key={pill.id || pill.slug}
                        href={pill.href}
                        role="listitem"
                        aria-current={isActive ? "page" : undefined}
                        aria-label={`Explore ${pill.name}`}
                        className={`group inline-flex shrink-0 items-center rounded-full border px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] transition-all duration-200 hover:-translate-y-0.5 ${
                          isActive
                            ? "border-primary bg-primary text-text-primary shadow-glow"
                            : "border-border bg-card text-text-primary shadow-soft hover:border-primary hover:shadow-medium"
                        }`}
                      >
                        <span className="truncate max-w-[180px] md:max-w-[220px]">
                          {pill.name}
                        </span>
                      </Link>
                    );
                  })}
            </div>
            <ScrollButton
              direction="right"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
