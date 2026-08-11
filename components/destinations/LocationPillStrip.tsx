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

const PILL_AUTO_PX_PER_SECOND = 30;

export const LocationPillStrip: React.FC = () => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const lastFrameRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pathname = usePathname();
  const [pills, setPills] = useState<FrontLocationPill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const isHoveredRef = useRef(false);
  const isFocusedRef = useRef(false);
  const isTouchingRef = useRef(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyTransform = () => {
    const track = trackRef.current;
    if (!track) return;
    const halfWidth = track.scrollWidth / 2;
    if (!halfWidth) {
      track.style.transform = "translateX(0)";
      return;
    }
    let offset = progressRef.current % halfWidth;
    if (offset > 0) offset -= halfWidth;
    track.style.transform = `translateX(${offset}px)`;
  };

  const recomputePause = () => {
    const shouldPause =
      isHoveredRef.current || isFocusedRef.current || isTouchingRef.current;
    setIsPaused(shouldPause);
  };

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
    const tick = (now: number) => {
      if (lastFrameRef.current == null) lastFrameRef.current = now;
      const dtMs = now - lastFrameRef.current;
      lastFrameRef.current = now;

      if (!isPaused) {
        const dtSec = dtMs / 1000;
        progressRef.current = progressRef.current - PILL_AUTO_PX_PER_SECOND * dtSec;
      }

      applyTransform();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastFrameRef.current = null;
    };
  }, [isPaused, pills.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ro = new ResizeObserver(() => {
      applyTransform();
    });
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [pills.length, isLoading]);

  const activeSlug = pathname?.startsWith("/destinations/")
    ? pathname.split("/destinations/")[1]?.split("?")[0] ?? ""
    : "";

  if (!isLoading && pills.length === 0 && !error) {
    return null;
  }

  const pillCount = Math.max(6, pills.length);

  const step = (direction: "left" | "right") => {
    const wrap = wrapRef.current;
    const amount = wrap ? Math.max(280, Math.round(wrap.clientWidth * 0.7)) : 320;
    const track = trackRef.current;
    if (track) {
      track.style.transition =
        "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)";
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
      transitionTimerRef.current = setTimeout(() => {
        if (trackRef.current) {
          trackRef.current.style.transition = "";
        }
        transitionTimerRef.current = null;
      }, 520);
    }
    progressRef.current = progressRef.current + (direction === "left" ? amount : -amount);
    applyTransform();
  };

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
            onClick={() => step("left")}
            className="relative z-30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface hover:shadow-medium"
            aria-label="Scroll quick locations left"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div
            ref={wrapRef}
            className="relative min-w-0 flex-1 overflow-hidden"
            onMouseEnter={() => {
              isHoveredRef.current = true;
              recomputePause();
            }}
            onMouseLeave={() => {
              isHoveredRef.current = false;
              recomputePause();
            }}
            onFocus={() => {
              isFocusedRef.current = true;
              recomputePause();
            }}
            onBlur={() => {
              isFocusedRef.current = false;
              recomputePause();
            }}
            onTouchStart={() => {
              isTouchingRef.current = true;
              recomputePause();
            }}
            onTouchEnd={() => {
              isTouchingRef.current = false;
              if (resumeTimerRef.current) {
                clearTimeout(resumeTimerRef.current);
              }
              resumeTimerRef.current = setTimeout(() => {
                resumeTimerRef.current = null;
                recomputePause();
              }, 2500);
            }}
          >
            <div ref={trackRef} className="w-max flex items-center gap-3 py-1">
              {isLoading
                ? Array.from({ length: pillCount * 2 }).map((_, index) => (
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
                        key={`first-${pill.id || pill.slug}`}
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
              {!isLoading &&
                pills.map((pill) => {
                  const isActive = pill.slug && pill.slug === activeSlug;

                  return (
                    <Link
                      key={`dupe-${pill.id || pill.slug}`}
                      href={pill.href}
                      role="listitem"
                      aria-hidden="true"
                      tabIndex={-1}
                      aria-current={isActive ? "page" : undefined}
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
          </div>

          <button
            type="button"
            onClick={() => step("right")}
            className="relative z-30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface hover:shadow-medium"
            aria-label="Scroll quick locations right"
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
