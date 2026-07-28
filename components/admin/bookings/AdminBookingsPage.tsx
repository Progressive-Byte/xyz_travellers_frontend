"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  getAdminBookings,
  type AdminBookingStatus,
  type AdminBookingSummary,
} from "@/lib/admin";

type BookingFilterValue = "all" | AdminBookingStatus;

const bookingFilters: Array<{ label: string; value: BookingFilterValue }> = [
  { label: "All bookings", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Host confirmed", value: "host_confirmed" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Paid", value: "paid" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Rejected", value: "rejected" },
];

const formatDate = (value: string | null) => {
  if (!value) {
    return "Not available";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (value: number | null, currency = "BDT") =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const getStatusLabel = (status: AdminBookingStatus) => {
  switch (status) {
    case "pending":
      return "Pending";
    case "host_confirmed":
      return "Host confirmed";
    case "confirmed":
      return "Confirmed";
    case "paid":
      return "Paid";
    case "rejected":
      return "Rejected";
    case "cancelled":
      return "Cancelled";
    case "completed":
      return "Completed";
    default:
      return "Status";
  }
};

const getStatusClasses = (status: AdminBookingStatus) => {
  switch (status) {
    case "pending":
      return "border-[rgba(214,167,44,0.24)] bg-[rgba(214,167,44,0.12)] text-[rgb(120,91,41)]";
    case "host_confirmed":
      return "border-[rgba(164,121,63,0.22)] bg-[rgba(164,121,63,0.1)] text-[rgb(120,91,41)]";
    case "confirmed":
      return "border-[rgba(57,115,230,0.24)] bg-[rgba(57,115,230,0.1)] text-[rgba(44,79,152,1)]";
    case "paid":
      return "border-[rgba(35,181,128,0.24)] bg-[rgba(35,181,128,0.12)] text-[rgb(35,92,69)]";
    case "rejected":
      return "border-[rgba(180,35,24,0.22)] bg-[rgba(180,35,24,0.1)] text-[var(--color-danger,#b42318)]";
    case "cancelled":
      return "border-border bg-surface text-text-secondary";
    case "completed":
      return "border-[rgba(57,115,230,0.24)] bg-[rgba(57,115,230,0.1)] text-[rgba(44,79,152,1)]";
    default:
      return "border-border bg-white text-text-secondary";
  }
};

const countGuests = (booking: AdminBookingSummary) => booking.adultGuests + booking.childGuests;

const BookingsSkeleton = () => (
  <AdminShell badge="Admin Operations" title="Bookings" subtitle="Loading the booking workspace.">
    <div className="space-y-4">
      <div className="surface-card h-24 animate-pulse rounded-[28px] bg-white/75" />
      <div className="surface-card h-[620px] animate-pulse rounded-[28px] bg-white/75" />
    </div>
  </AdminShell>
);

export const AdminBookingsPage: React.FC = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<AdminBookingSummary[]>([]);
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
        const result = await getAdminBookings(token);

        if (!isActive) {
          return;
        }

        setBookings(result);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load admin bookings right now."
            : "We couldn't load admin bookings right now.",
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
      if (selectedFilter !== "all" && booking.status !== selectedFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        booking.id,
        booking.property.propertyName,
        booking.unit.unitName,
        booking.guest.fullName,
        booking.guest.phone,
        booking.host.fullName,
        booking.host.phone,
        getStatusLabel(booking.status),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [bookings, searchQuery, selectedFilter]);

  const metrics = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((booking) => booking.status === "pending").length,
      paymentReady: bookings.filter((booking) => booking.status === "confirmed").length,
      paid: bookings.filter((booking) => booking.status === "paid").length,
    }),
    [bookings],
  );

  if (isLoading) {
    return <BookingsSkeleton />;
  }

  return (
    <AdminShell
      badge="Admin Operations"
      title="Bookings"
      subtitle="Review booking requests, contact both sides, and move stays through the admin-mediated lifecycle."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total bookings", value: metrics.total, helper: "All booking records in the admin workspace." },
          { label: "Pending", value: metrics.pending, helper: "Requests that still need the first admin review pass." },
          { label: "Payment pending", value: metrics.paymentReady, helper: "Bookings confirmed and ready for guest payment." },
          { label: "Paid", value: metrics.paid, helper: "Bookings already settled and moving toward stay completion." },
        ].map((metric) => (
          <div key={metric.label} className="surface-card rounded-[28px] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
              {metric.label}
            </p>
            <p className="mt-4 font-sora text-[30px] font-bold tracking-[-0.04em] text-text-primary">
              {metric.value}
            </p>
            <p className="mt-2 text-[14px] leading-6 text-text-secondary">{metric.helper}</p>
          </div>
        ))}
      </div>

      <section className="surface-card mt-4 overflow-hidden rounded-[28px]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                Booking Queue
              </p>
              <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
                Admin booking workspace
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                Keep the guest, host, property, and payment status visible from one table-first workspace.
              </p>
            </div>

            <div className="border-t border-border-light pt-5">
              <div className="grid gap-3 lg:grid-cols-[320px_minmax(0,1fr)]">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search guest, host, property, phone, or booking"
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
          <div className="border-t border-border-light bg-[rgba(180,35,24,0.04)] px-5 py-4">
            <p className="text-[14px] text-[var(--color-danger,#b42318)]">{error}</p>
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="mt-3 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Retry
            </button>
          </div>
        ) : filteredBookings.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-[1120px] w-full border-collapse">
              <thead className="bg-[rgba(245,243,237,0.92)]">
                <tr className="border-b border-border-light">
                  {["Booking", "Guest", "Host", "Stay", "Total", "Status", "Action"].map((heading) => (
                    <th
                      key={heading}
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
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-border-light last:border-b-0 odd:bg-white even:bg-[rgba(255,252,247,0.45)] hover:bg-[rgba(255,252,247,0.9)]"
                  >
                    <td className="px-4 py-3.5 align-middle">
                      <div className="min-w-0 max-w-[300px]">
                        <p className="truncate text-[14px] font-semibold text-text-primary">
                          {booking.property.propertyName || `Booking ${booking.id.slice(-6).toUpperCase()}`}
                        </p>
                        <p className="mt-1 truncate text-[12px] leading-5 text-text-secondary">
                          {booking.unit.unitName || "Unit pending"} · Ref #{booking.id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <p className="text-[13px] font-semibold text-text-primary">
                        {booking.guest.fullName || "Guest pending"}
                      </p>
                      <p className="mt-1 text-[12px] text-text-secondary">
                        {booking.guest.phone || booking.guest.email || "Contact unavailable"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <p className="text-[13px] font-semibold text-text-primary">
                        {booking.host.fullName || "Host pending"}
                      </p>
                      <p className="mt-1 text-[12px] text-text-secondary">
                        {booking.host.phone || booking.host.email || "Contact unavailable"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 align-middle text-[13px] text-text-primary">
                      <p>{formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)}</p>
                      <p className="mt-1 text-[12px] text-text-secondary">
                        {countGuests(booking)} guest{countGuests(booking) === 1 ? "" : "s"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 align-middle text-[13px] font-semibold text-text-primary">
                      {formatCurrency(
                        booking.pricingSnapshot.subtotal,
                        booking.pricingSnapshot.currency,
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getStatusClasses(booking.status)}`}
                      >
                        {getStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 align-middle text-right">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="inline-flex items-center justify-center rounded-[12px] border border-border bg-white px-3 py-1.5 text-[12px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-[16px] font-semibold text-text-primary">No bookings found</p>
            <p className="mt-2 text-[14px] leading-6 text-text-secondary">
              Adjust the current filter or search to return to the full booking queue.
            </p>
          </div>
        )}
      </section>
    </AdminShell>
  );
};
