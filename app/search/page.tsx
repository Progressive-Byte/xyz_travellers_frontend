import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ListingCard } from "@/components/ui/ListingCard";
import { ApiError } from "@/lib/api";
import {
  getFrontSearchResults,
  parseFrontStayFilters,
  type FrontSearchResults,
} from "@/lib/front";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    page?: string;
  }>;
};

const parsePage = (value?: string) => {
  const parsed = Number(value ?? "1");
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
};

const buildSearchHref = (
  current: {
    q?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  },
  page: number,
) => {
  const params = new URLSearchParams();

  if (current.q?.trim()) {
    params.set("q", current.q.trim());
  }

  if (current.checkIn && current.checkOut) {
    params.set("checkIn", current.checkIn);
    params.set("checkOut", current.checkOut);
  }

  if (current.guests?.trim()) {
    params.set("guests", current.guests.trim());
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/search?${query}` : "/search";
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams ? await searchParams : undefined;
  const page = parsePage(query?.page);
  const stayFilters = parseFrontStayFilters({
    checkIn: query?.checkIn ?? null,
    checkOut: query?.checkOut ?? null,
    guests: query?.guests ?? null,
  });
  let errorMessage = stayFilters.error;
  let searchResults: FrontSearchResults = {
    items: [],
    page,
    limit: 12,
    total: 0,
    hasNextPage: false,
  };

  try {
    searchResults = await getFrontSearchResults({
      q: query?.q?.trim() || undefined,
      checkIn: stayFilters.error ? undefined : stayFilters.checkIn || undefined,
      checkOut: stayFilters.error ? undefined : stayFilters.checkOut || undefined,
      guests: stayFilters.error ? null : stayFilters.guests,
      page,
      limit: 12,
    });
  } catch (error) {
    errorMessage =
      error instanceof ApiError ? error.message : "Unable to load search results right now.";
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="section-shell bg-background pb-20 pt-8 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="surface-card-strong rounded-[30px] p-6 md:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
              Search Results
            </p>
            <h1 className="mt-3 font-sora text-[32px] font-bold tracking-[-0.04em] text-text-primary md:text-[42px]">
              {query?.q?.trim() ? `Stays for "${query.q.trim()}"` : "Explore available stays"}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2.5 text-[13px] text-text-secondary">
              {query?.q?.trim() ? (
                <span className="rounded-full border border-border bg-card px-4 py-2 font-medium shadow-soft">
                  Destination: {query.q.trim()}
                </span>
              ) : null}
              {stayFilters.checkIn && stayFilters.checkOut && !stayFilters.error ? (
                <span className="rounded-full border border-border bg-card px-4 py-2 font-medium shadow-soft">
                  Stay: {stayFilters.checkIn} to {stayFilters.checkOut}
                </span>
              ) : null}
              {stayFilters.guests ? (
                <span className="rounded-full border border-border bg-card px-4 py-2 font-medium shadow-soft">
                  Guests: {stayFilters.guests}
                </span>
              ) : null}
              <span className="rounded-full border border-border bg-card px-4 py-2 font-medium shadow-soft">
                {searchResults.total} result{searchResults.total === 1 ? "" : "s"}
              </span>
            </div>
            {errorMessage ? (
              <p className="mt-4 text-[13px] font-medium text-[var(--color-danger,#b42318)]">
                {errorMessage}
              </p>
            ) : null}
          </div>

          <section className="mt-8">
            {searchResults.items.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {searchResults.items.map((item) => (
                  <ListingCard
                    key={item.propertyId}
                    title={item.title}
                    location={item.locationLabel}
                    priceLabel={item.price.displayLabel}
                    rating={item.rating?.average ?? undefined}
                    ratingLabel={item.rating?.displayLabel}
                    ratingCount={item.rating?.count ?? 0}
                    badge={item.badge}
                    imageUrl={item.coverImageUrl}
                    href={item.href}
                    className="w-full"
                  />
                ))}
              </div>
            ) : (
              <div className="surface-card rounded-[30px] p-6 text-[14px] leading-7 text-text-secondary">
                No public properties match the current search filters yet.
              </div>
            )}
          </section>

          {searchResults.items.length ? (
            <section className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[14px] text-text-secondary">
                Page {searchResults.page} · Showing up to {searchResults.limit} items per page
              </p>
              <div className="flex items-center gap-3">
                {searchResults.page > 1 ? (
                  <Link
                    href={buildSearchHref(
                      {
                        q: query?.q,
                        checkIn: stayFilters.error ? undefined : stayFilters.checkIn || undefined,
                        checkOut:
                          stayFilters.error ? undefined : stayFilters.checkOut || undefined,
                        guests:
                          stayFilters.guests !== null ? String(stayFilters.guests) : undefined,
                      },
                      searchResults.page - 1,
                    )}
                    className="inline-flex rounded-full border border-border bg-card px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium"
                  >
                    Previous
                  </Link>
                ) : null}
                {searchResults.hasNextPage ? (
                  <Link
                    href={buildSearchHref(
                      {
                        q: query?.q,
                        checkIn: stayFilters.error ? undefined : stayFilters.checkIn || undefined,
                        checkOut:
                          stayFilters.error ? undefined : stayFilters.checkOut || undefined,
                        guests:
                          stayFilters.guests !== null ? String(stayFilters.guests) : undefined,
                      },
                      searchResults.page + 1,
                    )}
                    className="inline-flex rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover"
                  >
                    Next page
                  </Link>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
