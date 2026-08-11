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
    <div className="mb-4 w-full md:mb-6">
      <div className="mb-3 flex items-end justify-between gap-3 md:mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-text-secondary">
            Quick locations
          </p>
          <p className="mt-1.5 text-[13px] leading-5 text-text-secondary/90">
            Jump straight to a popular destination.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-background via-background/95 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-background via-background/95 to-transparent" />

        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="relative z-30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-soft"
            aria-label="Scroll left"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            className="scrollbar-hide flex min-w-0 flex-1 items-center gap-3 overflow-x-auto scroll-smooth px-1 py-1"
            role="list"
            aria-label="Destination shortcuts"
          >
            {isLoading
              ? Array.from({ length: pillCount }).map((_, index) => (
                  <div
                    key={`pill-skeleton-${index}`}
                    role="listitem"
                    className="h-11 w-28 shrink-0 animate-pulse rounded-full bg-surface-muted/90 md:h-12 md:w-32"
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
                      className={`group inline-flex shrink-0 items-center rounded-full border px-5 py-2.5 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                        isActive
                          ? "border-primary bg-primary text-text-primary shadow-glow"
                          : "border-border bg-card text-text-primary shadow-soft hover:border-primary/50 hover:shadow-medium"
                      }`}
                    >
                      <span className="whitespace-nowrap max-w-[240px]">
                        {pill.name}
                      </span>
                    </Link>
                  );
                })}
          </div>

          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="relative z-30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-soft"
            aria-label="Scroll right"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
