"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ListingCard } from "@/components/ui/ListingCard";
import {
  buildFrontDestinationHref,
  type FrontDestinationListingsSection,
  type FrontDestinationLocation,
} from "@/lib/front";

type DestinationListingsSectionProps = {
  section: FrontDestinationListingsSection;
  location: FrontDestinationLocation;
  slug: string;
  transportPage: number;
  foodPage: number;
};

const PageButton: React.FC<{
  page?: number;
  label?: string;
  ariaLabel: string;
  href?: string;
  isActive?: boolean;
  disabled?: boolean;
  direction?: "prev" | "next";
  onClick?: (e: React.MouseEvent) => void;
}> = ({ page, label, ariaLabel, href, isActive = false, disabled = false, direction, onClick }) => {
  const content =
    direction === "prev" ? (
      "‹"
    ) : direction === "next" ? (
      "›"
    ) : (
      <span>{label ?? page}</span>
    );

  const baseClassName =
    "flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold transition-all duration-200 md:h-10 md:w-10".trim();

  const variantClass = isActive
    ? "bg-primary text-text-primary shadow-glow"
    : disabled
      ? "border border-border bg-surface text-text-secondary opacity-50 cursor-not-allowed"
      : "border border-border bg-card text-text-primary shadow-soft hover:-translate-y-0.5 hover:border-primary hover:shadow-medium";

  if (disabled && !href) {
    return (
      <span className={`${baseClassName} ${variantClass}`} aria-hidden>
        {content}
      </span>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        aria-label={ariaLabel}
        aria-current={isActive ? "page" : undefined}
        className={`${baseClassName} ${variantClass}`}
      >
        {content}
      </a>
    );
  }

  return null;
};

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  hrefBuilder: (page: number) => string;
}> = ({ currentPage, totalPages, hrefBuilder }) => {
  const router = useRouter();
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers: number[] = [];
  const maxVisible = 5;
  const half = Math.floor(maxVisible / 2);
  const start = Math.max(1, Math.min(currentPage - half, totalPages - maxVisible + 1));
  const end = Math.min(totalPages, Math.max(currentPage + half, maxVisible));

  for (let p = start; p <= end; p += 1) {
    pageNumbers.push(p);
  }

  const goToPage = (nextPage: number, e: React.MouseEvent) => {
    e.preventDefault();
    const nextUrl = hrefBuilder(nextPage);
    if (!nextUrl) return;
    router.replace(nextUrl, { scroll: false });
  };

  return (
    <nav aria-label="Listing pagination" className="mt-10 flex items-center justify-center gap-2">
      <PageButton
        direction="prev"
        ariaLabel="Previous page of listings"
        href={currentPage > 1 ? hrefBuilder(currentPage - 1) : undefined}
        disabled={currentPage <= 1}
        onClick={currentPage > 1 ? (e) => goToPage(currentPage - 1, e) : undefined}
      />

      {start > 1 ? (
        <>
          <PageButton
            page={1}
            href={hrefBuilder(1)}
            ariaLabel="Go to page 1"
            onClick={(e) => goToPage(1, e)}
          />
          {start > 2 ? (
            <span className="px-1 text-text-secondary" aria-hidden>…</span>
          ) : null}
        </>
      ) : null}

      {pageNumbers.map((page) => (
        <PageButton
          key={page}
          page={page}
          href={hrefBuilder(page)}
          isActive={page === currentPage}
          ariaLabel={`Go to page ${page}`}
          onClick={(e) => goToPage(page, e)}
        />
      ))}

      {end < totalPages ? (
        <>
          {end < totalPages - 1 ? (
            <span className="px-1 text-text-secondary" aria-hidden>…</span>
          ) : null}
          <PageButton
            page={totalPages}
            href={hrefBuilder(totalPages)}
            ariaLabel={`Go to page ${totalPages}`}
            onClick={(e) => goToPage(totalPages, e)}
          />
        </>
      ) : null}

      <PageButton
        direction="next"
        ariaLabel="Next page of listings"
        href={currentPage < totalPages ? hrefBuilder(currentPage + 1) : undefined}
        disabled={currentPage >= totalPages}
        onClick={currentPage < totalPages ? (e) => goToPage(currentPage + 1, e) : undefined}
      />
    </nav>
  );
};

export const DestinationListingsSection: React.FC<DestinationListingsSectionProps> = ({
  section,
  location,
  slug,
  transportPage,
  foodPage,
}) => {
  const { items, pagination } = section;
  const hasItems = items.length > 0;
  const fallbackTitle = location.name
    ? `Stays in ${location.name}${location.city ? ` · ${location.city}` : ""}${location.country ? `, ${location.country}` : ""}`
    : "Stays in this destination";
  const title = section.title || fallbackTitle;
  const subtitle = section.subtitle || location.description || "";
  const hrefBuilder = (nextListingsPage: number) =>
    buildFrontDestinationHref(slug, {
      listingsPage: nextListingsPage,
      transportPage,
      foodPage,
    });

  return (
    <section className="section-shell bg-background py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="surface-card-strong rounded-panel p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <span className="section-badge">Stays</span>
              <h2 className="section-heading mt-6 !text-[26px] md:!text-[34px]">
                {title}
              </h2>
              {subtitle ? (
                <p className="section-subtitle mt-4">{subtitle}</p>
              ) : null}
            </div>

            <div className="shrink-0">
              <p className="text-right text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                {pagination.total > 0
                  ? `${pagination.total} stay${pagination.total === 1 ? "" : "s"}`
                  : "No stays yet"}
              </p>
            </div>
          </div>

          {hasItems ? (
            <ul className="mt-10 grid list-none gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {items.map((listing) => (
                <li key={listing.propertyId} className="flex">
                  <ListingCard
                    propertyId={listing.propertyId}
                    title={listing.title}
                    location={listing.locationLabel}
                    priceLabel={listing.price.displayLabel}
                    rating={listing.rating?.average ?? undefined}
                    ratingLabel={listing.rating?.displayLabel}
                    ratingCount={listing.rating?.count ?? 0}
                    badge={listing.badge}
                    imageUrl={listing.coverImageUrl}
                    href={listing.href}
                    className="w-full"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-10 rounded-[24px] border border-dashed border-border bg-surface px-6 py-10 text-center">
              <p className="text-[14px] font-semibold text-text-primary">
                No stays are available for this location yet.
              </p>
              <p className="mt-2 text-[13px] text-text-secondary">
                Transport services and food recommendations are still curated below.
              </p>
            </div>
          )}

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            hrefBuilder={hrefBuilder}
          />
        </div>
      </div>
    </section>
  );
};
