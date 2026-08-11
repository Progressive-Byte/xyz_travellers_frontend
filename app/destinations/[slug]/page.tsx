import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DestinationListingsSection } from "@/components/destinations/DestinationListingsSection";
import {
  DestinationFoodSection,
  DestinationTransportSection,
} from "@/components/destinations/DestinationStaticSections";
import { ApiError } from "@/lib/api";
import {
  buildFrontDestinationHref,
  getFrontDestinationPage,
  type FrontDestinationPage,
} from "@/lib/front";

type DestinationPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    listingsPage?: string;
    transportPage?: string;
    foodPage?: string;
  }>;
};

const parsePageParam = (value?: string) => {
  if (!value) {
    return 1;
  }

  const parsed = Number(value.trim());

  if (!Number.isFinite(parsed) || parsed < 1 || !Number.isInteger(parsed)) {
    return 1;
  }

  return parsed;
};

const DEFAULT_TITLE = "Destinations · XYZ Travellers";
const DEFAULT_DESCRIPTION =
  "Explore stays, local transport, and curated restaurant recommendations for XYZ Travellers destinations.";

export async function generateMetadata({
  params,
}: DestinationPageProps): Promise<Metadata> {
  const { slug } = await params;

  let fallbackTitle = DEFAULT_TITLE;
  let fallbackDescription = DEFAULT_DESCRIPTION;

  try {
    const page = await getFrontDestinationPage(slug);

    fallbackTitle = page.location.name
      ? `${page.location.name} · Stays, transport & food · XYZ Travellers`
      : DEFAULT_TITLE;
    fallbackDescription =
      page.location.description ||
      (page.location.name
        ? `Browse stays, local transport, and curated food recommendations near ${page.location.name}.`
        : DEFAULT_DESCRIPTION);
  } catch {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
    };
  }

  return {
    title: fallbackTitle,
    description: fallbackDescription,
    openGraph: {
      title: fallbackTitle,
      description: fallbackDescription,
      siteName: "XYZ Travellers",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: fallbackTitle,
      description: fallbackDescription,
    },
  };
}

const DestinationHero: React.FC<{
  page: FrontDestinationPage;
  listingsPage: number;
  transportPage: number;
  foodPage: number;
}> = ({ page, listingsPage, transportPage, foodPage }) => {
  const { location } = page;
  const locationLabel = [location.city, location.country]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="section-shell overflow-visible bg-background pb-4 pt-8 md:pb-6 md:pt-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="surface-card-strong relative flex flex-col gap-6 overflow-hidden rounded-[32px] p-6 md:p-8">
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary transition-colors duration-200 hover:text-primary"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5" strokeLinecap="round" />
                  <path d="M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to home
              </Link>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="section-badge">Destination</span>
                {locationLabel ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary shadow-soft">
                    <svg className="h-3.5 w-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <path d="M12 21s-6-4.35-6-10a6 6 0 1112 0c0 5.65-6 10-6 10z" />
                      <circle cx="12" cy="11" r="2.5" />
                    </svg>
                    <span className="truncate max-w-[260px]">{locationLabel}</span>
                  </span>
                ) : null}
              </div>

              <h1 className="mt-5 font-sora text-[36px] font-bold leading-[1.05] tracking-[-0.04em] text-text-primary md:text-[48px]">
                {location.name || "Destination"}
              </h1>
              {location.description ? (
                <p className="mt-4 max-w-3xl text-[15px] leading-8 text-text-secondary md:text-[16px]">
                  {location.description}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="#stays"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover"
                >
                  Browse stays
                </Link>
                <Link
                  href="#transport"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-medium"
                >
                  Local transport
                </Link>
                <Link
                  href="#food"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-medium"
                >
                  Food & restaurants
                </Link>
              </div>
            </div>

            <div className="shrink-0 md:min-w-[240px]">
              <div className="grid grid-cols-3 gap-3 md:grid-cols-1 md:gap-4">
                <div className="rounded-[20px] border border-border bg-card px-4 py-4 shadow-soft md:px-5 md:py-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                    Stays
                  </p>
                  <p className="mt-2 font-sora text-[22px] font-bold tracking-[-0.03em] text-text-primary">
                    {page.listingsSection.pagination.total}
                  </p>
                </div>
                <div className="rounded-[20px] border border-border bg-card px-4 py-4 shadow-soft md:px-5 md:py-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                    Transport
                  </p>
                  <p className="mt-2 font-sora text-[22px] font-bold tracking-[-0.03em] text-text-primary">
                    {page.transportSection.pagination.total}
                  </p>
                </div>
                <div className="rounded-[20px] border border-border bg-card px-4 py-4 shadow-soft md:px-5 md:py-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                    Food
                  </p>
                  <p className="mt-2 font-sora text-[22px] font-bold tracking-[-0.03em] text-text-primary">
                    {page.foodSection.pagination.total}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default async function DestinationPage({ params, searchParams }: DestinationPageProps) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : undefined;
  const listingsPage = parsePageParam(query?.listingsPage);
  const transportPage = parsePageParam(query?.transportPage);
  const foodPage = parsePageParam(query?.foodPage);

  let page: FrontDestinationPage;
  let loadErrorMessage = "";

  try {
    page = await getFrontDestinationPage(slug, {
      listingsPage,
      transportPage,
      foodPage,
    });
  } catch (error) {
    if (error instanceof ApiError && [404, 400].includes(error.status)) {
      notFound();
    }

    loadErrorMessage =
      error instanceof ApiError
        ? error.message
        : "Unable to load this destination right now.";

    const fallbackLocation = {
      id: "",
      name: slug ? slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()) : "Destination",
      slug,
      city: "",
      country: "",
      description: "",
      heroImage: null,
      heroImageUrl: null,
      createdAt: null,
      updatedAt: null,
    };

    page = {
      location: fallbackLocation,
      listingsSection: {
        title: `Stays in ${fallbackLocation.name}`,
        subtitle: "",
        items: [],
        pagination: { page: listingsPage, pageSize: 12, total: 0, totalPages: 1 },
      },
      transportSection: {
        title: "Transportation Services",
        subtitle: "Local transport companies and contact details",
        heroImage: null,
        heroImageUrl: null,
        items: [],
        pagination: { page: transportPage, pageSize: 5, total: 0, totalPages: 1 },
      },
      foodSection: {
        title: "Food & Restaurant",
        subtitle: "Recommended restaurants near this location",
        heroImage: null,
        heroImageUrl: null,
        items: [],
        pagination: { page: foodPage, pageSize: 5, total: 0, totalPages: 1 },
      },
    };
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main id="top" className="overflow-visible bg-background">
        <DestinationHero
          page={page}
          listingsPage={listingsPage}
          transportPage={transportPage}
          foodPage={foodPage}
        />

        {loadErrorMessage ? (
          <div className="mx-auto max-w-7xl px-6">
            <div className="rounded-[24px] border border-primary bg-primary-light px-6 py-5 text-[14px] font-medium text-text-primary shadow-soft">
              {loadErrorMessage}
            </div>
          </div>
        ) : null}

        <div id="stays">
          <DestinationListingsSection
            section={page.listingsSection}
            location={page.location}
            slug={page.location.slug || slug}
            transportPage={transportPage}
            foodPage={foodPage}
          />
        </div>

        <div id="transport">
          <DestinationTransportSection
            section={page.transportSection}
            slug={page.location.slug || slug}
            listingsPage={listingsPage}
            foodPage={foodPage}
          />
        </div>

        <div id="food">
          <DestinationFoodSection
            section={page.foodSection}
            slug={page.location.slug || slug}
            listingsPage={listingsPage}
            transportPage={transportPage}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
