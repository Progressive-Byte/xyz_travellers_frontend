"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { HostShell } from "@/components/host/HostShell";
import {
  formatHostCurrency,
  formatHostDate,
  formatHostDateTime,
  getGuestCountLabel,
  getReservationStatusClasses,
  getReservationStatusLabel,
} from "@/components/host/operations/hostOperations";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  getHostReservation,
  type HostReservation,
} from "@/lib/host";

type HostReservationDetailPageProps = {
  reservationId: string;
};

const ReservationDetailSkeleton = () => (
  <HostShell badge="Operations">
    <div className="space-y-6">
      <div className="surface-card rounded-panel h-44 animate-pulse bg-white/75" />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="surface-card rounded-panel h-[520px] animate-pulse bg-white/75" />
        <div className="surface-card rounded-panel h-[420px] animate-pulse bg-white/75" />
      </div>
    </div>
  </HostShell>
);

const DetailCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-[20px] border border-border-light bg-white/80 px-4 py-4">
    <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">{label}</p>
    <p className="mt-2 text-[15px] font-semibold text-text-primary">{value}</p>
  </div>
);

const GuestDetailCard: React.FC<{ reservation: HostReservation }> = ({ reservation }) => {
  const guestLabel = reservation.guestName || "Guest details unavailable";
  const guestReference = reservation.guestId
    ? `Guest ref · ${reservation.guestId.slice(-6).toUpperCase()}`
    : "Guest reference pending";
  const guestMeta = [reservation.guestEmail, reservation.guestPhone].filter(Boolean).join(" · ");

  return (
    <div className="rounded-[20px] border border-border-light bg-white/80 px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Guest</p>
      <p className="mt-2 text-[15px] font-semibold text-text-primary">{guestLabel}</p>
      <p className="mt-1 text-[12px] text-text-secondary">{guestMeta || guestReference}</p>
      {guestMeta ? <p className="mt-1 text-[12px] text-text-secondary">{guestReference}</p> : null}
    </div>
  );
};

export const HostReservationDetailPage: React.FC<HostReservationDetailPageProps> = ({
  reservationId,
}) => {
  const { token } = useAuth();
  const [reservation, setReservation] = useState<HostReservation | null>(null);
  const [pageError, setPageError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadReservation = async () => {
      setIsLoading(true);
      setPageError("");

      try {
        const result = await getHostReservation(token, reservationId);

        if (!isActive) {
          return;
        }

        setReservation(result);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setPageError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load this reservation right now."
            : "We couldn't load this reservation right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadReservation();

    return () => {
      isActive = false;
    };
  }, [reservationId, retryKey, token]);

  if (isLoading) {
    return <ReservationDetailSkeleton />;
  }

  if (!reservation || pageError) {
    return (
      <HostShell
        badge="Operations"
        title="Reservation detail"
        subtitle="Inspect one stay, its guest details, and the current booking status."
      >
        <div className="surface-card rounded-panel px-6 py-8">
          <p className="text-[15px] font-semibold text-text-primary">Reservation unavailable</p>
          <p className="mt-3 max-w-2xl text-[14px] leading-7 text-text-secondary">
            {pageError || "We couldn't load this reservation right now."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Reload reservation
            </button>
            <Link
              href="/host/reservations"
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Back to reservations
            </Link>
          </div>
        </div>
      </HostShell>
    );
  }

  const currency = reservation.pricingSnapshot.currency || "BDT";

  return (
    <HostShell
      badge="Operations"
      title={`Reservation #${reservation.id.slice(-6).toUpperCase()}`}
      subtitle="Review stay timing, guest context, pricing snapshot, and admin-managed booking progress from one read-only page."
      headerAside={
        <>
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Current status
            </p>
            <p className="mt-3">
              <span
                className={`inline-flex rounded-full px-3 py-1.5 text-[13px] font-semibold ${getReservationStatusClasses(reservation.status)}`}
              >
                {getReservationStatusLabel(reservation.status)}
              </span>
            </p>
          </div>
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Stay value
            </p>
            <p className="mt-3 text-[17px] font-semibold text-text-primary">
              {reservation.pricingSnapshot.subtotal !== null
                ? formatHostCurrency(reservation.pricingSnapshot.subtotal, currency)
                : "Amount pending"}
            </p>
          </div>
        </>
      }
    >
      <div className="flex flex-wrap gap-3">
        <Link
          href="/host/reservations"
          className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
        >
          Back to reservations
        </Link>
        {reservation.guestId ? (
          <Link
            href={`/host/messages?reservationId=${reservation.id}`}
            className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
          >
            Open messages
          </Link>
        ) : null}
        {reservation.status === "completed" ? (
          <Link
            href={`/host/reviews?reservationId=${reservation.id}`}
            className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
          >
            Write guest review
          </Link>
        ) : null}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Stay summary
            </p>
            <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
              {reservation.propertyName || "Property pending"}
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-text-secondary">
              {reservation.unitName || "Unit pending"} · {reservation.guestName || "Guest pending"}
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <DetailCard label="Check-in" value={formatHostDate(reservation.checkInDate)} />
              <DetailCard label="Check-out" value={formatHostDate(reservation.checkOutDate)} />
              <DetailCard
                label="Guests"
                value={getGuestCountLabel(reservation.adultGuests, reservation.childGuests)}
              />
              <DetailCard label="Created" value={formatHostDateTime(reservation.createdAt)} />
            </div>
          </div>

          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Pricing snapshot
            </p>
            <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              Financial details tied to this stay
            </h2>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <DetailCard
                label="Base price"
                value={formatHostCurrency(reservation.pricingSnapshot.basePrice, currency)}
              />
              <DetailCard
                label="Discounted price"
                value={formatHostCurrency(reservation.pricingSnapshot.discountedPrice, currency)}
              />
              <DetailCard
                label="Per night applied"
                value={formatHostCurrency(reservation.pricingSnapshot.pricePerNightApplied, currency)}
              />
              <DetailCard
                label="Nights"
                value={
                  reservation.pricingSnapshot.nights !== null
                    ? String(reservation.pricingSnapshot.nights)
                    : "Not available"
                }
              />
              <DetailCard
                label="Subtotal"
                value={formatHostCurrency(reservation.pricingSnapshot.subtotal, currency)}
              />
              <GuestDetailCard reservation={reservation} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Operational notes
            </p>
            <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              Current timeline
            </h2>

            <div className="mt-5 space-y-3">
              <DetailCard
                label="Host confirmed at"
                value={formatHostDateTime(reservation.hostConfirmedAt)}
              />
              <DetailCard
                label="Confirmed at"
                value={formatHostDateTime(reservation.confirmedAt || reservation.respondedAt)}
              />
              <DetailCard label="Paid at" value={formatHostDateTime(reservation.paidAt)} />
              <DetailCard label="Responded at" value={formatHostDateTime(reservation.respondedAt)} />
              <DetailCard label="Cancelled at" value={formatHostDateTime(reservation.cancelledAt)} />
              <DetailCard label="Completed at" value={formatHostDateTime(reservation.completedAt)} />
            </div>

            {reservation.responseReason || reservation.statusReason ? (
              <div className="mt-5 rounded-[20px] border border-border-light bg-white/85 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Reason</p>
                <p className="mt-2 text-[14px] leading-7 text-text-primary">
                  {reservation.responseReason || reservation.statusReason}
                </p>
              </div>
            ) : null}
          </div>

          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Reservation workflow
            </p>
            <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              Admin-managed lifecycle
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-text-secondary">
              Booking decisions now happen through the admin portal after direct coordination with the guest and host.
            </p>
            <div className="mt-5 rounded-[20px] border border-dashed border-border-light bg-white/80 px-4 py-4 text-[14px] leading-7 text-text-secondary">
              {reservation.status === "completed"
                ? "This stay is completed. Use the review handoff above if you want to leave a guest review from the correct reservation context."
                : "Hosts can keep track of reservation context here, while admin staff handle confirmation, payment readiness, cancellations, and completion updates."}
            </div>
          </div>
        </div>
      </div>
    </HostShell>
  );
};
