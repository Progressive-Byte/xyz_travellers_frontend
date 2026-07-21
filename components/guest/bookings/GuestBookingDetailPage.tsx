"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GuestShell } from "@/components/guest/GuestShell";
import { GuestBookingStatusPill } from "@/components/guest/bookings/GuestBookingStatusPill";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  cancelGuestBooking,
  getGuestBooking,
  getGuestPropertyLookups,
  type GuestBooking,
} from "@/lib/guest";

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

const DetailCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-[22px] border border-border bg-card px-4 py-4 shadow-soft">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
      {label}
    </p>
    <p className="mt-2 text-[15px] font-semibold text-text-primary">{value}</p>
  </div>
);

const BookingDetailSkeleton = () => (
  <GuestShell badge="Bookings">
    <div className="space-y-6">
      <div className="surface-card h-32 animate-pulse rounded-panel bg-white/75" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="surface-card h-[520px] animate-pulse rounded-panel bg-white/75" />
        <div className="surface-card h-[520px] animate-pulse rounded-panel bg-white/75" />
      </div>
    </div>
  </GuestShell>
);

export const GuestBookingDetailPage: React.FC<{ bookingId: string }> = ({ bookingId }) => {
  const router = useRouter();
  const { token } = useAuth();
  const [booking, setBooking] = useState<GuestBooking | null>(null);
  const [propertyLookup, setPropertyLookup] = useState<
    Awaited<ReturnType<typeof getGuestPropertyLookups>>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadBooking = async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await getGuestBooking(token, bookingId);
        const lookups = await getGuestPropertyLookups([result.propertyId]);

        if (!isActive) {
          return;
        }

        setBooking(result);
        setPropertyLookup(lookups);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load this booking right now."
            : "We couldn't load this booking right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadBooking();

    return () => {
      isActive = false;
    };
  }, [bookingId, retryKey, token]);

  const property = booking ? propertyLookup[booking.propertyId] : null;
  const totalGuests = (booking?.adultGuests ?? 0) + (booking?.childGuests ?? 0);
  const canCancel = booking ? ["pending", "accepted"].includes(booking.status) : false;
  const totalPrice = booking
    ? booking.pricingSnapshot.subtotal ?? booking.pricing.subtotal ?? 0
    : 0;
  const totalCurrency = booking?.pricingSnapshot.currency || booking?.pricing.currency || "BDT";

  const timelineItems = useMemo(() => {
    if (!booking) {
      return [];
    }

    return [
      booking.createdAt ? `Created on ${formatDate(booking.createdAt)}` : "",
      booking.respondedAt ? `Host responded on ${formatDate(booking.respondedAt)}` : "",
      booking.cancelledAt ? `Cancelled on ${formatDate(booking.cancelledAt)}` : "",
      booking.completedAt ? `Completed on ${formatDate(booking.completedAt)}` : "",
    ].filter(Boolean);
  }, [booking]);

  if (isLoading) {
    return <BookingDetailSkeleton />;
  }

  return (
    <GuestShell
      badge="Booking Detail"
      topbarAction={
        <Link
          href="/guest/bookings"
          className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-3 py-2 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
        >
          Back to bookings
        </Link>
      }
    >
      <div className="space-y-6">
        {error ? (
          <div className="surface-card rounded-panel border border-[var(--color-danger,#b42318)]/15 bg-[rgba(180,35,24,0.04)] p-5">
            <p className="text-[14px] leading-6 text-[var(--color-danger,#b42318)]">{error}</p>
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Retry
            </button>
          </div>
        ) : null}

        {booking ? (
          <>
            <section className="surface-card rounded-panel p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Reservation overview
                  </p>
                  <h1 className="mt-2 font-sora text-[32px] font-bold tracking-[-0.05em] text-text-primary">
                    {property?.propertyTitle || `Booking ${booking.id.slice(-6).toUpperCase()}`}
                  </h1>
                  <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                    {property?.unitNamesById[booking.unitId] || booking.unitId} ·{" "}
                    {property?.locationLabel || booking.propertyId}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <GuestBookingStatusPill status={booking.status} />
                  <span className="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    {totalGuests} guest{totalGuests === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_360px]">
              <div className="space-y-6">
                <section className="surface-card rounded-panel p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Stay details
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <DetailCard label="Check in" value={formatDate(booking.checkInDate)} />
                    <DetailCard label="Check out" value={formatDate(booking.checkOutDate)} />
                    <DetailCard label="Adults" value={String(booking.adultGuests)} />
                    <DetailCard label="Children" value={String(booking.childGuests)} />
                  </div>

                  {booking.statusReason ? (
                    <div className="mt-5 rounded-[22px] border border-border bg-surface px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                        Status note
                      </p>
                      <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                        {booking.statusReason}
                      </p>
                    </div>
                  ) : null}

                  {booking.specialRequests ? (
                    <div className="mt-5 rounded-[22px] border border-border bg-surface px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                        Special requests
                      </p>
                      <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                        {booking.specialRequests}
                      </p>
                    </div>
                  ) : null}
                </section>

                <section className="surface-card rounded-panel p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Booking timeline
                  </p>

                  <div className="mt-5 space-y-3">
                    {timelineItems.length ? (
                      timelineItems.map((item) => (
                        <div
                          key={item}
                          className="rounded-[18px] border border-border-light bg-card px-4 py-3 text-[14px] text-text-secondary shadow-soft"
                        >
                          {item}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[18px] border border-dashed border-border bg-card px-4 py-5 text-[14px] text-text-secondary">
                        Timeline updates will appear here as your booking moves forward.
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="surface-card rounded-panel p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Pricing snapshot
                  </p>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-border bg-card px-4 py-3">
                      <span className="text-[14px] text-text-secondary">Total stay</span>
                      <span className="text-[15px] font-semibold text-text-primary">
                        {formatCurrency(totalPrice, totalCurrency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-border bg-card px-4 py-3">
                      <span className="text-[14px] text-text-secondary">Nights</span>
                      <span className="text-[15px] font-semibold text-text-primary">
                        {booking.pricingSnapshot.nights ?? booking.pricing.nights ?? 0}
                      </span>
                    </div>
                    {booking.couponCode ? (
                      <div className="flex items-center justify-between gap-3 rounded-[18px] border border-border bg-card px-4 py-3">
                        <span className="text-[14px] text-text-secondary">Coupon</span>
                        <span className="text-[15px] font-semibold text-text-primary">
                          {booking.couponCode}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </section>

                {canCancel ? (
                  <section className="surface-card rounded-panel p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      Need to cancel?
                    </p>
                    <h2 className="mt-2 font-sora text-[22px] font-bold tracking-[-0.04em] text-text-primary">
                      Cancel this booking request
                    </h2>
                    <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                      Add a short reason so the cancellation record stays clear on both sides.
                    </p>

                    <textarea
                      value={cancelReason}
                      onChange={(event) => {
                        setCancelReason(event.target.value);
                        setCancelError("");
                      }}
                      rows={4}
                      placeholder="Travel plans changed"
                      className="mt-4 w-full rounded-[22px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/15 focus:shadow-medium"
                    />

                    {cancelError ? (
                      <p className="mt-3 text-[13px] text-[var(--color-danger,#b42318)]">
                        {cancelError}
                      </p>
                    ) : null}

                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={async () => {
                        if (!token) {
                          return;
                        }

                        if (!cancelReason.trim()) {
                          setCancelError("Cancellation reason is required.");
                          return;
                        }

                        setIsCancelling(true);
                        setCancelError("");

                        try {
                          const updatedBooking = await cancelGuestBooking(
                            token,
                            booking.id,
                            cancelReason,
                          );
                          setBooking(updatedBooking);
                          setCancelReason("");
                          router.refresh();
                        } catch (requestError) {
                          setCancelError(
                            requestError instanceof ApiError
                              ? requestError.message || "Unable to cancel this booking right now."
                              : "Unable to cancel this booking right now.",
                          );
                        } finally {
                          setIsCancelling(false);
                        }
                      }}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isCancelling ? "Cancelling..." : "Cancel booking"}
                    </button>
                  </section>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </GuestShell>
  );
};
