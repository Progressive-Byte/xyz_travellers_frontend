"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GuestShell } from "@/components/guest/GuestShell";
import {
  getGuestBookingStatusLabel,
  GuestBookingStatusPill,
} from "@/components/guest/bookings/GuestBookingStatusPill";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  getGuestBookings,
  getGuestPropertyLookups,
  type GuestBooking,
} from "@/lib/guest";

type BookingFilterValue =
  | "all"
  | "under_review"
  | "payment_pending"
  | "paid"
  | "completed"
  | "cancelled"
  | "rejected";

const bookingFilters: Array<{ label: string; value: BookingFilterValue }> = [
  { label: "All bookings", value: "all" },
  { label: "Under Review", value: "under_review" },
  { label: "Payment Pending", value: "payment_pending" },
  { label: "Paid", value: "paid" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Declined", value: "rejected" },
];

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

const BookingsSkeleton = () => (
  <GuestShell badge="Guest Portal">
    <div className="space-y-6">
      <div className="surface-card h-24 animate-pulse rounded-panel bg-white/75" />
      <div className="surface-card h-[560px] animate-pulse rounded-panel bg-white/75" />
    </div>
  </GuestShell>
);

export const GuestBookingsPage: React.FC = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<GuestBooking[]>([]);
  const [propertyLookup, setPropertyLookup] = useState<
    Awaited<ReturnType<typeof getGuestPropertyLookups>>
  >({});
  const [selectedFilter, setSelectedFilter] = useState<BookingFilterValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadBookings = async () => {
      setIsLoading(true);
      setError("");

      try {
        const results = await getGuestBookings(token);
        const lookups = await getGuestPropertyLookups(results.map((booking) => booking.propertyId));

        if (!isActive) {
          return;
        }

        setBookings(results);
        setPropertyLookup(lookups);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load your bookings right now."
            : "We couldn't load your bookings right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadBookings();

    return () => {
      isActive = false;
    };
  }, [retryKey, token]);

  const filteredBookings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return bookings.filter((booking) => {
      if (selectedFilter !== "all") {
        if (
          selectedFilter === "under_review" &&
          !["pending", "host_confirmed"].includes(booking.status)
        ) {
          return false;
        }

        if (selectedFilter === "payment_pending" && booking.status !== "confirmed") {
          return false;
        }

        if (
          selectedFilter !== "under_review" &&
          selectedFilter !== "payment_pending" &&
          booking.status !== selectedFilter
        ) {
          return false;
        }
      }

      if (!normalizedQuery) {
        return true;
      }

      const property = propertyLookup[booking.propertyId];
      const searchHaystack = [
        booking.id,
        property?.propertyTitle,
        property?.unitNamesById[booking.unitId],
        getGuestBookingStatusLabel(booking.status),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchHaystack.includes(normalizedQuery);
    });
  }, [bookings, propertyLookup, searchQuery, selectedFilter]);

  if (isLoading) {
    return <BookingsSkeleton />;
  }

  return (
    <GuestShell
      badge="Bookings"
      topbarAction={
        <Link
          href="/search"
          className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-3 py-2 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
        >
          Browse stays
        </Link>
      }
    >
      <div className="space-y-0">
        <section className="surface-card overflow-hidden rounded-panel">
          <div className="p-5">
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Booking workspace
                </p>
                <h2 className="mt-2 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
                  Manage review steps, payment-ready bookings, and past trips
                </h2>
                <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                  Keep every booking request, payment step, and stay history easy to scan from one table.
                </p>
              </div>

              <div className="border-t border-border-light pt-5">
                <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search booking or property"
                    className="w-full rounded-[18px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/15 focus:shadow-medium"
                  />

                  <div className="flex flex-wrap gap-2">
                    {bookingFilters.map((filter) => {
                      const isActive = selectedFilter === filter.value;

                      return (
                        <button
                          key={filter.value}
                          type="button"
                          onClick={() => setSelectedFilter(filter.value)}
                          className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
                            isActive
                              ? "bg-primary text-text-primary shadow-glow"
                              : "border border-border bg-card text-text-secondary shadow-soft hover:border-text-primary/15 hover:text-text-primary"
                          }`}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <div className="border-b border-border-light bg-[rgba(180,35,24,0.04)] px-5 py-4">
              <p className="text-[14px] text-[var(--color-danger,#b42318)]">{error}</p>
              <button
                type="button"
                onClick={() => setRetryKey((current) => current + 1)}
                className="mt-3 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
              >
                Retry
              </button>
            </div>
          ) : null}

          {filteredBookings.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-[860px] w-full border-collapse">
                <thead className="bg-[rgba(245,243,237,0.92)]">
                  <tr className="border-b border-border-light">
                    {["Booking", "Stay", "Guests", "Price", "Status", "Action"].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className={`px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary ${
                          heading === "Action" ? "text-right" : "text-left"
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map((booking) => {
                    const property = propertyLookup[booking.propertyId];
                    const totalGuests = booking.adultGuests + booking.childGuests;

                    return (
                      <tr
                        key={booking.id}
                        className="border-b border-border-light last:border-b-0 odd:bg-white even:bg-[rgba(255,252,247,0.45)] hover:bg-[rgba(255,252,247,0.9)]"
                      >
                        <td className="px-4 py-3.5 align-middle">
                          <div className="min-w-0 max-w-[360px]">
                            <p className="truncate text-[14px] font-semibold text-text-primary">
                              {property?.propertyTitle ||
                                `Booking ${booking.id.slice(-6).toUpperCase()}`}
                            </p>
                            <p className="mt-1 truncate text-[12px] leading-5 text-text-secondary">
                              {property?.unitNamesById[booking.unitId] || booking.unitId}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 align-middle text-[13px] text-text-primary">
                          <span className="text-text-secondary">
                            {formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 align-middle text-[13px] text-text-primary">
                          <span className="text-text-secondary">
                            {totalGuests} guest{totalGuests === 1 ? "" : "s"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 align-middle text-[13px] font-semibold text-text-primary">
                          {formatCurrency(
                            booking.pricingSnapshot.subtotal ?? booking.pricing.subtotal ?? 0,
                            booking.pricingSnapshot.currency || booking.pricing.currency || "BDT",
                          )}
                        </td>
                        <td className="px-4 py-3.5 align-middle">
                          <GuestBookingStatusPill status={booking.status} />
                        </td>
                        <td className="px-4 py-3.5 align-middle text-right">
                          <Link
                            href={`/guest/bookings/${booking.id}`}
                            className="inline-flex items-center justify-center rounded-[12px] border border-border bg-white px-3 py-1.5 text-[12px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <p className="text-[16px] font-semibold text-text-primary">No bookings found</p>
              <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                Adjust your filter or start a new stay request from the public listings.
              </p>
              <Link
                href="/search"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
              >
                Browse stays
              </Link>
            </div>
          )}
        </section>
      </div>
    </GuestShell>
  );
};
