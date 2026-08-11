import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocationPillStrip } from "@/components/destinations/LocationPillStrip";
import {
  buildFrontDestinationHref,
  getFrontDestinationPage,
  getFrontLocationPills,
} from "@/lib/front";

export const metadata: Metadata = {
  title: "Destinations · XYZ Travellers",
  description:
    "Browse all XYZ Travellers destinations. Explore curated stays, local transport, and food recommendations per location.",
};

const DestinationsGridCard: React.FC<{
  rank: number;
  name: string;
  slug: string;
  locationLabel: string;
}> = ({ rank, name, slug, locationLabel }) => {
  return (
    <li>
      <Link
        href={buildFrontDestinationHref(slug)}
        className="surface-card-strong group relative flex h-full min-h-[180px] flex-col overflow-hidden rounded-[26px] border border-border shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-medium"
        aria-label={`Explore ${name} destination guide`}
      >
        <div className="flex flex-1 flex-col justify-between gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                  Destination
                </p>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  #{rank}
                </span>
              </div>
              <h3 className="mt-3 font-sora text-[20px] font-bold leading-tight tracking-[-0.03em] text-text-primary">
                {name || "Destination"}
              </h3>
              {locationLabel ? (
                <p className="mt-1 line-clamp-2 text-[13px] text-text-secondary">
                  {locationLabel}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border/80 pt-4">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-text-secondary">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary shadow-glow" />
              Stay, move, eat
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-text-primary shadow-glow transition-colors duration-200 group-hover:bg-primary-hover">
              Explore
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" strokeLinecap="round" />
                <path d="M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
};

type DestinationsIndexPageProps = {
  searchParams?: Promise<{ preview?: string }>;
};

export default async function DestinationsIndexPage({ searchParams }: DestinationsIndexPageProps) {
  let pills: Awaited<ReturnType<typeof getFrontLocationPills>> = [];
  let sampleStats: { stays: number; transport: number; food: number } | null = null;
  let errorMessage = "";

  try {
    pills = await getFrontLocationPills();
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to load the destinations list right now.";
  }

  if (pills.length > 0) {
    try {
      const firstDestination = await getFrontDestinationPage(pills[0].slug);
      sampleStats = {
        stays: firstDestination.listingsSection.pagination.total,
        transport: firstDestination.transportSection.pagination.total,
        food: firstDestination.foodSection.pagination.total,
      };
    } catch {
      sampleStats = null;
    }
  }

  void searchParams;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main id="top" className="bg-background">
        <section className="section-shell overflow-visible bg-background pb-4 pt-8 md:pb-6 md:pt-12">
          <div className="mx-auto max-w-7xl px-6">
            <div className="surface-card-strong flex flex-col gap-6 overflow-hidden rounded-[32px] p-6 md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div className="min-w-0">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary transition-colors duration-200 hover:text-primary"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5" strokeLinecap="round" />
                      <path d="M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back home
                  </Link>

                  <div className="mt-5">
                    <span className="section-badge">Destinations</span>
                    <h1 className="mt-4 font-sora text-[36px] font-bold leading-[1.05] tracking-[-0.04em] text-text-primary md:text-[48px]">
                      Browse every destination we serve
                    </h1>
                    <p className="mt-4 max-w-3xl text-[15px] leading-8 text-text-secondary md:text-[16px]">
                      Each destination page bundles short-term stays, trusted local transport, and curated restaurant picks in one place.
                    </p>
                  </div>

                  <div className="mt-8">
                    <LocationPillStrip />
                  </div>
                </div>

                {sampleStats ? (
                  <div className="shrink-0 md:min-w-[240px]">
                    <div className="grid grid-cols-3 gap-3 md:grid-cols-1 md:gap-4">
                      <div className="rounded-[20px] border border-border bg-card px-4 py-4 shadow-soft md:px-5 md:py-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                          Sample stays
                        </p>
                        <p className="mt-2 font-sora text-[22px] font-bold tracking-[-0.03em] text-text-primary">
                          {sampleStats.stays}
                        </p>
                      </div>
                      <div className="rounded-[20px] border border-border bg-card px-4 py-4 shadow-soft md:px-5 md:py-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                          Sample transport
                        </p>
                        <p className="mt-2 font-sora text-[22px] font-bold tracking-[-0.03em] text-text-primary">
                          {sampleStats.transport}
                        </p>
                      </div>
                      <div className="rounded-[20px] border border-border bg-card px-4 py-4 shadow-soft md:px-5 md:py-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                          Sample food
                        </p>
                        <p className="mt-2 font-sora text-[22px] font-bold tracking-[-0.03em] text-text-primary">
                          {sampleStats.food}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell bg-background pb-16 pt-4 md:pb-24 md:pt-6">
          <div className="mx-auto max-w-7xl px-6">
            {errorMessage ? (
              <div className="mb-6 rounded-[24px] border border-primary bg-primary-light px-6 py-5 text-[14px] font-medium text-text-primary shadow-soft">
                {errorMessage}
              </div>
            ) : null}

            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="section-badge">All destinations</p>
                <h2 className="mt-3 font-sora text-[26px] font-bold leading-tight tracking-[-0.03em] text-text-primary md:text-[32px]">
                  {pills.length > 0
                    ? `${pills.length} destination${pills.length === 1 ? "" : "s"}, fully curated`
                    : "Destinations coming soon"}
                </h2>
              </div>
            </div>

            {pills.length === 0 && !errorMessage ? (
              <div className="rounded-panel flex flex-col items-center justify-center gap-4 border border-dashed border-border px-8 py-20 text-center shadow-soft">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light">
                  <svg className="h-7 w-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M12 21s-6-4.35-6-10a6 6 0 1112 0c0 5.65-6 10-6 10z" />
                    <circle cx="12" cy="11" r="2.5" />
                  </svg>
                </div>
                <div>
                  <p className="font-sora text-[20px] font-semibold text-text-primary">
                    Destinations are being prepared
                  </p>
                  <p className="mt-2 text-[14px] text-text-secondary">
                    Check back soon to explore curated stays, transport, and food for each location.
                  </p>
                </div>
                <Link
                  href="/"
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-colors duration-200 hover:bg-primary-hover"
                >
                  Browse stays
                </Link>
              </div>
            ) : null}

            {pills.length > 0 ? (
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {pills.map((pill, index) => {
                  const locationLabel = [pill.city, pill.country].filter(Boolean).join(", ");

                  return (
                    <DestinationsGridCard
                      key={pill.id || `destination-${index}`}
                      rank={index + 1}
                      name={pill.name}
                      slug={pill.slug}
                      locationLabel={locationLabel}
                    />
                  );
                })}
              </ul>
            ) : null}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
