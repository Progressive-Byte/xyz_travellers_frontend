'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFrontLocationPills, type FrontLocationPill } from "@/lib/front";

const isSundarban = (pill: FrontLocationPill) =>
  pill.slug.toLowerCase().startsWith("sundarban") || pill.name.toLowerCase().startsWith("sundarban");

export const SundarbanFeature: React.FC = () => {
  const [location, setLocation] = useState<FrontLocationPill | null>(null);

  useEffect(() => {
    let cancelled = false;

    getFrontLocationPills()
      .then((pills) => {
        if (!cancelled) setLocation(pills.find(isSundarban) ?? null);
      })
      .catch(() => {
        if (!cancelled) setLocation(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Only render once the Sundarban quick location exists, so the card never links to a 404.
  if (!location) return null;

  const locationLabel = [location.city, location.country].filter(Boolean).join(", ");
  const hasImage = Boolean(location.heroImageUrl);

  return (
    <section className="bg-card pt-5 md:pt-10">
      <div className="mx-auto max-w-7xl px-6">
        <Link
          href={location.href}
          className={`group relative flex min-h-[240px] flex-col justify-end overflow-hidden rounded-panel p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium md:min-h-[300px] md:p-8 ${
            hasImage ? "border border-border shadow-soft" : "surface-card-strong"
          }`}
        >
          {location.heroImageUrl ? (
            <>
              <Image
                src={location.heroImageUrl}
                alt={location.name}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/10" />
            </>
          ) : null}

          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              {hasImage ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-soft ring-1 ring-white/20 backdrop-blur-md">
                  <span className="inline-flex h-2 w-2 rounded-full bg-primary shadow-glow" />
                  Featured destination
                </span>
              ) : (
                <span className="section-badge">Featured destination</span>
              )}
              <h3
                className={`mt-4 font-sora text-[32px] font-bold leading-[1.05] tracking-[-0.04em] md:text-[42px] ${
                  hasImage ? "text-white [text-shadow:0_8px_30px_rgba(0,0,0,0.45)]" : "text-text-primary"
                }`}
              >
                {location.name}
              </h3>
              <p className={`mt-3 max-w-2xl text-[15px] leading-7 ${hasImage ? "text-white/85" : "text-text-secondary"}`}>
                {locationLabel ? `${locationLabel} · ` : ""}Stays, local transport and food spots for your mangrove trip.
              </p>
            </div>

            <span className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-colors duration-200 group-hover:bg-primary-hover md:self-end">
              Explore {location.name}
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" strokeLinecap="round" />
                <path d="M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
};
