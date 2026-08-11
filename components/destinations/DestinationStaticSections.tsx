"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  buildFrontDestinationHref,
  type FrontDestinationStaticSection,
  type FrontTransportItem,
  type FrontFoodItem,
  type FrontPaginationMeta,
} from "@/lib/front";

type StaticPaginationProps = {
  pagination: FrontPaginationMeta;
  hrefBuilder: (page: number) => string;
  sectionLabel: string;
};

const StaticSectionPagination: React.FC<StaticPaginationProps> = ({
  pagination,
  hrefBuilder,
  sectionLabel,
}) => {
  const router = useRouter();
  const { page, totalPages } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers: number[] = [];
  const maxVisible = 5;
  const half = Math.floor(maxVisible / 2);
  const start = Math.max(1, Math.min(page - half, totalPages - maxVisible + 1));
  const end = Math.min(totalPages, Math.max(page + half, maxVisible));

  for (let p = start; p <= end; p += 1) {
    pageNumbers.push(p);
  }

  const goToPage = (nextPage: number, e: React.MouseEvent) => {
    e.preventDefault();
    const nextUrl = hrefBuilder(nextPage);
    if (!nextUrl) return;
    router.replace(nextUrl, { scroll: false });
  };

  const buttonClass = (isActive: boolean, disabled = false) =>
    `inline-flex h-10 w-10 items-center justify-center rounded-[14px] text-[13px] font-semibold transition-all duration-200 md:h-11 md:w-11 ${
      disabled
        ? "border border-border bg-surface text-text-secondary opacity-50 cursor-not-allowed"
        : isActive
          ? "bg-primary text-text-primary shadow-glow"
          : "border border-border bg-card text-text-primary shadow-soft hover:-translate-y-0.5 hover:border-primary hover:shadow-medium"
    }`.trim();

  return (
    <nav
      aria-label={`${sectionLabel} pagination`}
      className="mt-8 flex items-center justify-center gap-2"
    >
      {page > 1 ? (
        <a
          href={hrefBuilder(page - 1)}
          onClick={(e) => goToPage(page - 1, e)}
          aria-label={`Previous page of ${sectionLabel}`}
          className={buttonClass(false)}
        >
          ‹
        </a>
      ) : (
        <span className={buttonClass(false, true)} aria-hidden>
          ‹
        </span>
      )}

      {start > 1 ? (
        <>
          <a
            href={hrefBuilder(1)}
            onClick={(e) => goToPage(1, e)}
            aria-label={`Go to ${sectionLabel} page 1`}
            className={buttonClass(false)}
          >
            1
          </a>
          {start > 2 ? (
            <span className="px-1 text-text-secondary" aria-hidden>
              …
            </span>
          ) : null}
        </>
      ) : null}

      {pageNumbers.map((pageNumber) => (
        <a
          key={pageNumber}
          href={hrefBuilder(pageNumber)}
          onClick={(e) => goToPage(pageNumber, e)}
          aria-label={`Go to ${sectionLabel} page ${pageNumber}`}
          aria-current={pageNumber === page ? "page" : undefined}
          className={buttonClass(pageNumber === page)}
        >
          {pageNumber}
        </a>
      ))}

      {end < totalPages ? (
        <>
          {end < totalPages - 1 ? (
            <span className="px-1 text-text-secondary" aria-hidden>
              …
            </span>
          ) : null}
          <a
            href={hrefBuilder(totalPages)}
            onClick={(e) => goToPage(totalPages, e)}
            aria-label={`Go to ${sectionLabel} page ${totalPages}`}
            className={buttonClass(false)}
          >
            {totalPages}
          </a>
        </>
      ) : null}

      {page < totalPages ? (
        <a
          href={hrefBuilder(page + 1)}
          onClick={(e) => goToPage(page + 1, e)}
          aria-label={`Next page of ${sectionLabel}`}
          className={buttonClass(false)}
        >
          ›
        </a>
      ) : (
        <span className={buttonClass(false, true)} aria-hidden>
          ›
        </span>
      )}
    </nav>
  );
};

const isLikelyPhoneLinkable = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7;
};

const TransportCard: React.FC<{ item: FrontTransportItem; index: number }> = ({ item, index }) => {
  const telHref = isLikelyPhoneLinkable(item.contactNumber)
    ? `tel:${item.contactNumber.replace(/\s/g, "")}`
    : undefined;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-border bg-white px-5 py-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-medium md:px-6 md:py-6">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-primary-light via-primary-light to-primary/25 text-text-primary shadow-soft ring-1 ring-primary/15">
            <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-text-primary text-[10px] font-bold text-primary">
              {index + 1}
            </span>
            <svg className="relative h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M4 16c0-3.866 3.582-7 8-7s8 3.134 8 7" />
              <path d="M7 16v2M17 16v2" />
              <rect x="3" y="18" width="18" height="3" rx="1" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="truncate font-sora text-[18px] font-semibold tracking-[-0.03em] text-text-primary">
              {item.companyName}
            </p>
            <span className="mt-1 inline-flex items-center rounded-full border border-border-light bg-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
              Transport service
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
          Contact
        </p>
        <span className="h-px flex-1 bg-border-light" />
      </div>

      <div className="mt-3">
        {telHref ? (
          <a
            href={telHref}
            className="inline-flex w-full items-center justify-between gap-3 rounded-[18px] border border-primary/25 bg-gradient-to-r from-primary-light via-primary-light/90 to-primary/10 px-4 py-3 text-[14px] font-semibold text-text-primary transition-all duration-200 hover:from-primary hover:via-primary hover:to-primary-hover hover:text-text-primary hover:shadow-soft"
          >
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
              <span className="truncate">{item.contactNumber}</span>
            </span>
            <svg className="h-4 w-4 shrink-0 text-text-primary/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M13 5l7 7-7 7" />
            </svg>
          </a>
        ) : (
          <div className="w-full rounded-[18px] border border-border bg-surface px-4 py-3 text-[14px] font-medium text-text-primary">
            {item.contactNumber || "Contact unavailable"}
          </div>
        )}
      </div>

      {item.description ? (
        <p className="mt-4 text-[13px] leading-6 text-text-secondary line-clamp-3">
          {item.description}
        </p>
      ) : null}
    </article>
  );
};

const FoodCard: React.FC<{ item: FrontFoodItem; index: number }> = ({ item, index }) => {
  const telHref = isLikelyPhoneLinkable(item.phoneNumber)
    ? `tel:${item.phoneNumber.replace(/\s/g, "")}`
    : undefined;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-border bg-white px-5 py-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-medium md:px-6 md:py-6">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-primary-light via-primary-light to-primary/25 text-text-primary shadow-soft ring-1 ring-primary/15">
            <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-text-primary text-[10px] font-bold text-primary">
              {index + 1}
            </span>
            <svg className="relative h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M3 11h18" />
              <path d="M5 11a6 6 0 016-6 2 2 0 012 2v14M13 7a6 6 0 016 6" />
              <path d="M7 11v10M13 19v2M17 13v8" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="truncate font-sora text-[18px] font-semibold tracking-[-0.03em] text-text-primary">
              {item.restaurantName}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-border-light bg-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                Restaurant
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-secondary/80">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="truncate">{item.location || "Address not provided"}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
          Call & order
        </p>
        <span className="h-px flex-1 bg-border-light" />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3">
        <div className="flex items-start gap-2 rounded-[18px] border border-border-light bg-surface px-4 py-2.5 text-[13px] font-medium text-text-primary">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="truncate">{item.location || "Address not provided"}</span>
        </div>

        {telHref ? (
          <a
            href={telHref}
            className="inline-flex w-full items-center justify-between gap-3 rounded-[18px] border border-primary/25 bg-gradient-to-r from-primary-light via-primary-light/90 to-primary/10 px-4 py-3 text-[14px] font-semibold text-text-primary transition-all duration-200 hover:from-primary hover:via-primary hover:to-primary-hover hover:text-text-primary hover:shadow-soft"
          >
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
              <span className="truncate">{item.phoneNumber}</span>
            </span>
            <svg className="h-4 w-4 shrink-0 text-text-primary/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M13 5l7 7-7 7" />
            </svg>
          </a>
        ) : (
          <div className="w-full rounded-[18px] border border-border bg-surface px-4 py-3 text-[14px] font-medium text-text-primary">
            {item.phoneNumber || "Phone unavailable"}
          </div>
        )}
      </div>

      {item.description ? (
        <p className="mt-4 text-[13px] leading-6 text-text-secondary line-clamp-3">
          {item.description}
        </p>
      ) : null}
    </article>
  );
};

type DestinationStaticSectionProps<TItem> = {
  kind: "transport" | "food";
  section: FrontDestinationStaticSection<TItem>;
  sectionLabel: string;
  sectionEyebrow: string;
  emptyStateMessage: string;
  slug: string;
  listingsPage: number;
  siblingPage: number;
  axis: "transportPage" | "foodPage";
  renderCard: (item: TItem, index: number) => React.ReactNode;
};

const DestinationStaticSectionInner = <TItem,>({
  kind,
  section,
  sectionLabel,
  sectionEyebrow,
  emptyStateMessage,
  slug,
  listingsPage,
  siblingPage,
  axis,
  renderCard,
}: DestinationStaticSectionProps<TItem>) => {
  const { items, pagination, title, subtitle, heroImageUrl } = section;
  const hasItems = items.length > 0;
  const paginationHrefBuilder = (nextPage: number) =>
    buildFrontDestinationHref(slug, {
      listingsPage,
      [axis]: nextPage,
      [axis === "transportPage" ? "foodPage" : "transportPage"]: siblingPage,
    } as Parameters<typeof buildFrontDestinationHref>[1]);

  return (
    <section className="section-shell bg-background py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-6">
        {heroImageUrl ? (
          <div className="relative mb-10 overflow-hidden rounded-[32px] border border-border shadow-medium sm:mb-12">
            <div className="relative aspect-[16/6] w-full sm:aspect-[21/6]">
              <Image
                src={heroImageUrl}
                alt={title}
                fill
                sizes="(max-width: 1024px) 100vw, 1280px"
                className="object-cover"
                priority={false}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/35" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-10">
              <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-soft backdrop-blur-md ring-1 ring-white/20">
                    <span className="inline-flex h-2 w-2 rounded-full bg-primary shadow-glow" />
                    {sectionEyebrow}
                  </span>
                  <h2 className="section-heading mt-5 !text-[34px] md:!text-[44px] !text-white !leading-[1.02] font-sora font-bold [text-shadow:0_8px_30px_rgba(0,0,0,0.45)]">
                    {title}
                  </h2>
                  {subtitle ? (
                    <p className="mt-4 max-w-2xl text-[15px] font-medium leading-7 text-white/90 md:text-[16px] [text-shadow:0_4px_14px_rgba(0,0,0,0.45)]">
                      {subtitle}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-black/35 px-4 py-2.5 backdrop-blur-md shadow-medium ring-1 ring-white/10">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-text-primary shadow-soft">
                    {kind === "transport" ? (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 16c0-3.866 3.582-7 8-7s8 3.134 8 7" />
                        <rect x="3" y="18" width="18" height="3" rx="1" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 11h18" />
                        <path d="M5 11a6 6 0 016-6 2 2 0 012 2v14M13 7a6 6 0 016 6" />
                      </svg>
                    )}
                  </span>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                      Showing
                    </p>
                    <p className="text-[14px] font-bold text-white">
                      {items.length > 0
                        ? `${pagination.page === 1 ? 1 : (pagination.page - 1) * pagination.pageSize + 1}–${
                            Math.min(pagination.page * pagination.pageSize, pagination.total)
                          } of ${pagination.total}`
                        : `0 of ${pagination.total}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-10 flex flex-col items-start justify-between gap-6 md:mb-12 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="section-badge">{sectionEyebrow}</span>
              <h2 className="section-heading mt-5 !text-[32px] md:!text-[40px]">{title}</h2>
              {subtitle ? (
                <p className="section-subtitle mt-4 !max-w-none !text-left">{subtitle}</p>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-full border border-border-light bg-card px-4 py-2 shadow-soft">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-light text-text-primary">
                {kind === "transport" ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 16c0-3.866 3.582-7 8-7s8 3.134 8 7" />
                    <rect x="3" y="18" width="18" height="3" rx="1" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11h18" />
                    <path d="M5 11a6 6 0 016-6 2 2 0 012 2v14M13 7a6 6 0 016 6" />
                  </svg>
                )}
              </span>
              <div className="text-left">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                  Showing
                </p>
                <p className="text-[13px] font-semibold text-text-primary">
                  {items.length > 0
                    ? `${pagination.page === 1 ? 1 : (pagination.page - 1) * pagination.pageSize + 1}–${
                        Math.min(pagination.page * pagination.pageSize, pagination.total)
                      } of ${pagination.total}`
                    : `0 of ${pagination.total}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {hasItems ? (
          <>
            <ul className="grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item: TItem, index: number) => (
                <li
                  key={(item as { id?: string }).id || `${sectionLabel}-${index}`}
                  className="flex"
                >
                  {renderCard(item, index)}
                </li>
              ))}
            </ul>

            <StaticSectionPagination
              pagination={pagination}
              hrefBuilder={paginationHrefBuilder}
              sectionLabel={sectionLabel}
            />
          </>
        ) : (
          <div className="w-full rounded-[26px] border border-dashed border-border bg-card px-6 py-14 text-center shadow-soft">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary-light text-text-primary shadow-glow">
              {kind === "transport" ? (
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 16c0-3.866 3.582-7 8-7s8 3.134 8 7" />
                  <rect x="3" y="18" width="18" height="3" rx="1" />
                </svg>
              ) : (
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 11h18" />
                  <path d="M5 11a6 6 0 016-6 2 2 0 012 2v14M13 7a6 6 0 016 6" />
                </svg>
              )}
            </div>
            <p className="mt-5 font-sora text-[22px] font-semibold tracking-[-0.03em] text-text-primary">
              Nothing to show yet
            </p>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-6 text-text-secondary">
              {emptyStateMessage}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export const DestinationTransportSection: React.FC<{
  section: FrontDestinationStaticSection<FrontTransportItem>;
  slug: string;
  listingsPage: number;
  foodPage: number;
}> = ({ section, slug, listingsPage, foodPage }) => (
  <DestinationStaticSectionInner<FrontTransportItem>
    kind="transport"
    section={section}
    sectionLabel="transportation services"
    sectionEyebrow="Getting around"
    emptyStateMessage="No transport services curated for this location yet."
    slug={slug}
    listingsPage={listingsPage}
    siblingPage={foodPage}
    axis="transportPage"
    renderCard={(item, index) => <TransportCard item={item} index={index} />}
  />
);

export const DestinationFoodSection: React.FC<{
  section: FrontDestinationStaticSection<FrontFoodItem>;
  slug: string;
  listingsPage: number;
  transportPage: number;
}> = ({ section, slug, listingsPage, transportPage }) => (
  <DestinationStaticSectionInner<FrontFoodItem>
    kind="food"
    section={section}
    sectionLabel="food recommendations"
    sectionEyebrow="Local flavors"
    emptyStateMessage="No food / restaurant recommendations curated for this location yet."
    slug={slug}
    listingsPage={listingsPage}
    siblingPage={transportPage}
    axis="foodPage"
    renderCard={(item, index) => <FoodCard item={item} index={index} />}
  />
);
