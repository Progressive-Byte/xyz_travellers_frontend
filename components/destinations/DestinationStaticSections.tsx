import React from "react";
import Image from "next/image";
import Link from "next/link";
import type {
  FrontDestinationStaticSection,
  FrontTransportItem,
  FrontFoodItem,
  FrontPaginationMeta,
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

  const buttonClass = (isActive: boolean, disabled = false) =>
    `flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold transition-all duration-200 md:h-9 md:w-9 ${
      disabled
        ? "border border-border bg-surface text-text-secondary opacity-50 cursor-not-allowed"
        : isActive
          ? "bg-primary text-text-primary shadow-glow"
          : "border border-border bg-card text-text-primary shadow-soft hover:-translate-y-0.5 hover:border-primary hover:shadow-medium"
    }`.trim();

  return (
    <nav
      aria-label={`${sectionLabel} pagination`}
      className="mt-6 flex items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link
          href={hrefBuilder(page - 1)}
          aria-label={`Previous page of ${sectionLabel}`}
          className={buttonClass(false)}
        >
          ‹
        </Link>
      ) : (
        <span className={buttonClass(false, true)} aria-hidden>
          ‹
        </span>
      )}

      {start > 1 ? (
        <>
          <Link href={hrefBuilder(1)} aria-label={`Go to ${sectionLabel} page 1`} className={buttonClass(false)}>
            1
          </Link>
          {start > 2 ? (
            <span className="px-1 text-text-secondary" aria-hidden>
              …
            </span>
          ) : null}
        </>
      ) : null}

      {pageNumbers.map((pageNumber) => (
        <Link
          key={pageNumber}
          href={hrefBuilder(pageNumber)}
          aria-label={`Go to ${sectionLabel} page ${pageNumber}`}
          aria-current={pageNumber === page ? "page" : undefined}
          className={buttonClass(pageNumber === page)}
        >
          {pageNumber}
        </Link>
      ))}

      {end < totalPages ? (
        <>
          {end < totalPages - 1 ? (
            <span className="px-1 text-text-secondary" aria-hidden>
              …
            </span>
          ) : null}
          <Link
            href={hrefBuilder(totalPages)}
            aria-label={`Go to ${sectionLabel} page ${totalPages}`}
            className={buttonClass(false)}
          >
            {totalPages}
          </Link>
        </>
      ) : null}

      {page < totalPages ? (
        <Link
          href={hrefBuilder(page + 1)}
          aria-label={`Next page of ${sectionLabel}`}
          className={buttonClass(false)}
        >
          ›
        </Link>
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

const TransportCard: React.FC<{ item: FrontTransportItem }> = ({ item }) => {
  const telHref = isLikelyPhoneLinkable(item.contactNumber)
    ? `tel:${item.contactNumber.replace(/\s/g, "")}`
    : undefined;

  return (
    <article className="surface-card flex h-full flex-col gap-3 rounded-[22px] px-4 py-4 md:px-5 md:py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-primary-light text-text-primary">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M4 16c0-3.866 3.582-7 8-7s8 3.134 8 7" />
              <path d="M7 16v2M17 16v2" />
              <rect x="3" y="18" width="18" height="3" rx="1" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold text-text-primary">
              {item.companyName}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
          Contact
        </p>
      </div>

      {telHref ? (
        <a
          href={telHref}
          className="mt-1 inline-flex items-center gap-2 rounded-2xl bg-primary-light px-3 py-2.5 text-[14px] font-semibold text-text-primary transition-all duration-200 hover:bg-primary hover:shadow-soft"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
          </svg>
          <span className="truncate">{item.contactNumber}</span>
        </a>
      ) : (
        <p className="mt-1 truncate rounded-2xl bg-surface px-3 py-2.5 text-[14px] font-medium text-text-primary">
          {item.contactNumber || "Contact unavailable"}
        </p>
      )}

      {item.description ? (
        <p className="mt-1 text-[13px] leading-6 text-text-secondary line-clamp-3">
          {item.description}
        </p>
      ) : null}
    </article>
  );
};

const FoodCard: React.FC<{ item: FrontFoodItem }> = ({ item }) => {
  const telHref = isLikelyPhoneLinkable(item.phoneNumber)
    ? `tel:${item.phoneNumber.replace(/\s/g, "")}`
    : undefined;

  return (
    <article className="surface-card flex h-full flex-col gap-3 rounded-[22px] px-4 py-4 md:px-5 md:py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-primary-light text-text-primary">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M3 11h18" />
              <path d="M5 11a6 6 0 016-6 2 2 0 012 2v14M13 7a6 6 0 016 6" />
              <path d="M7 11v10M13 19v2M17 13v8" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold text-text-primary">
              {item.restaurantName}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
          Location
        </p>
      </div>

      <p className="truncate rounded-2xl bg-surface px-3 py-2 text-[13px] font-medium text-text-primary">
        {item.location || "Address not provided"}
      </p>

      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
          Phone
        </p>
      </div>

      {telHref ? (
        <a
          href={telHref}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary-light px-3 py-2.5 text-[14px] font-semibold text-text-primary transition-all duration-200 hover:bg-primary hover:shadow-soft"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
          </svg>
          <span className="truncate">{item.phoneNumber}</span>
        </a>
      ) : (
        <p className="truncate rounded-2xl bg-surface px-3 py-2.5 text-[14px] font-medium text-text-primary">
          {item.phoneNumber || "Phone unavailable"}
        </p>
      )}

      {item.description ? (
        <p className="mt-1 text-[13px] leading-6 text-text-secondary line-clamp-3">
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
  paginationHrefBuilder: (page: number) => string;
  renderCard: (item: TItem) => React.ReactNode;
};

const DestinationStaticSectionInner = <TItem,>({
  kind,
  section,
  sectionLabel,
  sectionEyebrow,
  emptyStateMessage,
  paginationHrefBuilder,
  renderCard,
}: DestinationStaticSectionProps<TItem>) => {
  const { items, pagination, title, subtitle, heroImageUrl } = section;
  const hasItems = items.length > 0;

  return (
    <section className="section-shell bg-background py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <span className="section-badge">{sectionEyebrow}</span>
          <h2 className="section-heading mt-6 !text-[28px] md:!text-[36px]">{title}</h2>
          {subtitle ? <p className="section-subtitle mx-auto mt-5">{subtitle}</p> : null}
          <div className="section-divider mx-auto mt-6" />
        </div>

        <div className="surface-card-strong rounded-panel p-5 md:p-6 lg:p-7">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)] lg:gap-7">
            <div className="relative flex min-h-[260px] overflow-hidden rounded-[24px] border border-border bg-surface lg:min-h-full">
              {heroImageUrl ? (
                <Image
                  src={heroImageUrl}
                  alt={title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority={false}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary-light text-text-primary shadow-glow">
                    {kind === "transport" ? (
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                        <path d="M4 16c0-3.866 3.582-7 8-7s8 3.134 8 7" />
                        <rect x="3" y="18" width="18" height="3" rx="1" />
                      </svg>
                    ) : (
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                        <path d="M3 11h18" />
                        <path d="M5 11a6 6 0 016-6 2 2 0 012 2v14" />
                      </svg>
                    )}
                  </div>
                  <p className="max-w-[220px] text-[13px] font-medium leading-6 text-text-secondary">
                    Image coming soon for {title}
                  </p>
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-col">
              {hasItems ? (
                <ul className="grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-2">
                  {items.map((item: TItem, index: number) => (
                    <li key={(item as { id?: string }).id || `${sectionLabel}-${index}`} className="flex">
                      {renderCard(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex h-full items-center">
                  <div className="w-full rounded-[24px] border border-dashed border-border bg-surface px-6 py-10 text-center">
                    <p className="text-[14px] font-semibold text-text-primary">{emptyStateMessage}</p>
                  </div>
                </div>
              )}

              <StaticSectionPagination
                pagination={pagination}
                hrefBuilder={paginationHrefBuilder}
                sectionLabel={sectionLabel}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const DestinationTransportSection: React.FC<{
  section: FrontDestinationStaticSection<FrontTransportItem>;
  paginationHrefBuilder: (page: number) => string;
}> = ({ section, paginationHrefBuilder }) => (
  <DestinationStaticSectionInner<FrontTransportItem>
    kind="transport"
    section={section}
    sectionLabel="transportation services"
    sectionEyebrow="Getting around"
    emptyStateMessage="No transport services curated for this location yet."
    paginationHrefBuilder={paginationHrefBuilder}
    renderCard={(item) => <TransportCard item={item} />}
  />
);

export const DestinationFoodSection: React.FC<{
  section: FrontDestinationStaticSection<FrontFoodItem>;
  paginationHrefBuilder: (page: number) => string;
}> = ({ section, paginationHrefBuilder }) => (
  <DestinationStaticSectionInner<FrontFoodItem>
    kind="food"
    section={section}
    sectionLabel="food recommendations"
    sectionEyebrow="Local flavors"
    emptyStateMessage="No food / restaurant recommendations curated for this location yet."
    paginationHrefBuilder={paginationHrefBuilder}
    renderCard={(item) => <FoodCard item={item} />}
  />
);
