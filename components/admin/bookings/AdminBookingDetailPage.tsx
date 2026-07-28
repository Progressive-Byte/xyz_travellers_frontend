"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  getAdminBooking,
  updateAdminBookingStatus,
  type AdminBookingDetail,
  type AdminBookingStatus,
} from "@/lib/admin";

type AdminBookingAction = {
  status: Exclude<AdminBookingStatus, "paid">;
  label: string;
};

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

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "Not available";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
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

const DetailCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-[22px] border border-border bg-card px-4 py-4 shadow-soft">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
      {label}
    </p>
    <p className="mt-2 text-[15px] font-semibold text-text-primary">{value}</p>
  </div>
);

const BookingDetailSkeleton = () => (
  <AdminShell badge="Admin Operations" title="Booking Detail" subtitle="Loading booking detail.">
    <div className="space-y-6">
      <div className="surface-card h-32 animate-pulse rounded-[28px] bg-white/75" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="surface-card h-[560px] animate-pulse rounded-[28px] bg-white/75" />
        <div className="surface-card h-[560px] animate-pulse rounded-[28px] bg-white/75" />
      </div>
    </div>
  </AdminShell>
);

export const AdminBookingDetailPage: React.FC<{ bookingId: string }> = ({ bookingId }) => {
  const { token } = useAuth();
  const [booking, setBooking] = useState<AdminBookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionReason, setActionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadBooking = async () => {
      setIsLoading(true);
      setPageError("");
      setActionError("");
      setActionSuccess("");

      try {
        const result = await getAdminBooking(token, bookingId);

        if (!isActive) {
          return;
        }

        setBooking(result);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setPageError(
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

  const availableActions = useMemo<AdminBookingAction[]>(() => {
    if (!booking) {
      return [];
    }

    switch (booking.status) {
      case "pending":
        return [
          { status: "host_confirmed", label: "Mark host confirmed" },
          { status: "rejected", label: "Reject booking" },
          { status: "cancelled", label: "Cancel booking" },
        ];
      case "host_confirmed":
        return [
          { status: "confirmed", label: "Confirm booking" },
          { status: "cancelled", label: "Cancel booking" },
        ];
      case "confirmed":
        return [{ status: "cancelled", label: "Cancel booking" }];
      case "paid":
        return [
          { status: "cancelled", label: "Cancel booking" },
          { status: "completed", label: "Mark complete" },
        ];
      default:
        return [];
    }
  }, [booking]);

  const handleStatusUpdate = async (status: Exclude<AdminBookingStatus, "paid">) => {
    if (!token || !booking) {
      return;
    }

    if (status === "rejected" && !actionReason.trim()) {
      setActionError("Add a short reason before rejecting a booking.");
      return;
    }

    setIsSubmitting(true);
    setActionError("");
    setActionSuccess("");

    try {
      const updated = await updateAdminBookingStatus(token, booking.id, {
        status,
        reason: actionReason,
      });

      setBooking(updated);
      setActionReason("");
      setActionSuccess("Booking status updated successfully.");
    } catch (requestError) {
      setActionError(
        requestError instanceof ApiError
          ? requestError.message || "We couldn't update this booking right now."
          : "We couldn't update this booking right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <BookingDetailSkeleton />;
  }

  if (!booking || pageError) {
    return (
      <AdminShell
        badge="Admin Operations"
        title="Booking detail"
        subtitle="Inspect one booking with host and guest context."
      >
        <div className="surface-card rounded-[28px] px-6 py-8">
          <p className="text-[15px] font-semibold text-text-primary">Booking unavailable</p>
          <p className="mt-3 max-w-2xl text-[14px] leading-7 text-text-secondary">
            {pageError || "We couldn't load this booking right now."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Reload booking
            </button>
            <Link
              href="/admin/bookings"
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Back to bookings
            </Link>
          </div>
        </div>
      </AdminShell>
    );
  }

  const totalGuests = booking.adultGuests + booking.childGuests;
  const currency = booking.pricingSnapshot.currency || "BDT";

  return (
    <AdminShell
      badge="Admin Operations"
      title={`Booking #${booking.id.slice(-6).toUpperCase()}`}
      subtitle="Review both parties, the pricing snapshot, and the current admin-owned workflow state."
      topbarAction={
        <Link
          href="/admin/bookings"
          className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-3 py-2 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
        >
          Back to bookings
        </Link>
      }
    >
      <div className="space-y-6">
        <section className="surface-card rounded-[28px] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Booking overview
              </p>
              <h1 className="mt-2 font-sora text-[30px] font-bold tracking-[-0.05em] text-text-primary">
                {booking.property.propertyName || `Booking ${booking.id.slice(-6).toUpperCase()}`}
              </h1>
              <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                {booking.unit.unitName || "Unit pending"} · {booking.property.city || "City pending"}
                {booking.property.country ? `, ${booking.property.country}` : ""}
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getStatusClasses(booking.status)}`}
            >
              {getStatusLabel(booking.status)}
            </span>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
          <div className="space-y-6">
            <section className="surface-card rounded-[28px] p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Stay details
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <DetailCard label="Check in" value={formatDate(booking.checkInDate)} />
                <DetailCard label="Check out" value={formatDate(booking.checkOutDate)} />
                <DetailCard label="Guests" value={`${totalGuests} guest${totalGuests === 1 ? "" : "s"}`} />
                <DetailCard label="Created" value={formatDateTime(booking.createdAt)} />
              </div>

              {booking.statusReason ? (
                <div className="mt-5 rounded-[22px] border border-border bg-surface px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Status note
                  </p>
                  <p className="mt-2 text-[14px] leading-6 text-text-secondary">{booking.statusReason}</p>
                </div>
              ) : null}

              {booking.specialRequests ? (
                <div className="mt-5 rounded-[22px] border border-border bg-surface px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Special requests
                  </p>
                  <p className="mt-2 text-[14px] leading-6 text-text-secondary">{booking.specialRequests}</p>
                </div>
              ) : null}
            </section>

            <section className="surface-card rounded-[28px] p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Contacts
              </p>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[22px] border border-border bg-card px-4 py-4 shadow-soft">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Guest
                  </p>
                  <p className="mt-2 text-[16px] font-semibold text-text-primary">
                    {booking.guest.fullName || "Guest pending"}
                  </p>
                  <p className="mt-2 text-[14px] text-text-secondary">
                    {booking.guest.phone || "Phone unavailable"}
                  </p>
                  <p className="mt-1 text-[14px] text-text-secondary">
                    {booking.guest.email || "Email unavailable"}
                  </p>
                </div>

                <div className="rounded-[22px] border border-border bg-card px-4 py-4 shadow-soft">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Host
                  </p>
                  <p className="mt-2 text-[16px] font-semibold text-text-primary">
                    {booking.host.fullName || "Host pending"}
                  </p>
                  <p className="mt-2 text-[14px] text-text-secondary">
                    {booking.host.phone || "Phone unavailable"}
                  </p>
                  <p className="mt-1 text-[14px] text-text-secondary">
                    {booking.host.email || "Email unavailable"}
                  </p>
                </div>
              </div>
            </section>

            <section className="surface-card rounded-[28px] p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Pricing snapshot
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <DetailCard
                  label="Base price"
                  value={formatCurrency(booking.pricingSnapshot.basePrice, currency)}
                />
                <DetailCard
                  label="Discounted price"
                  value={formatCurrency(booking.pricingSnapshot.discountedPrice, currency)}
                />
                <DetailCard
                  label="Per night applied"
                  value={formatCurrency(booking.pricingSnapshot.pricePerNightApplied, currency)}
                />
                <DetailCard
                  label="Nights"
                  value={
                    booking.pricingSnapshot.nights !== null
                      ? String(booking.pricingSnapshot.nights)
                      : "Not available"
                  }
                />
                <DetailCard
                  label="Subtotal"
                  value={formatCurrency(booking.pricingSnapshot.subtotal, currency)}
                />
                <DetailCard
                  label="Coupon"
                  value={booking.couponCode || "No coupon"}
                />
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="surface-card rounded-[28px] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Timeline
              </p>
              <div className="mt-5 space-y-3">
                <DetailCard label="Created" value={formatDateTime(booking.createdAt)} />
                <DetailCard label="Host confirmed" value={formatDateTime(booking.hostConfirmedAt)} />
                <DetailCard label="Confirmed" value={formatDateTime(booking.confirmedAt)} />
                <DetailCard label="Paid" value={formatDateTime(booking.paidAt)} />
                <DetailCard label="Cancelled" value={formatDateTime(booking.cancelledAt)} />
                <DetailCard label="Completed" value={formatDateTime(booking.completedAt)} />
              </div>
            </section>

            <section className="surface-card rounded-[28px] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Actions
              </p>
              <h2 className="mt-2 font-sora text-[22px] font-bold tracking-[-0.04em] text-text-primary">
                Update admin workflow status
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                Move the booking through the phone-confirmed workflow using only the transitions valid for its current state.
              </p>

              {availableActions.length ? (
                <>
                  <textarea
                    value={actionReason}
                    onChange={(event) => {
                      setActionReason(event.target.value);
                      setActionError("");
                    }}
                    rows={4}
                    placeholder="Optional note or reason for this update"
                    className="mt-4 w-full rounded-[22px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/15 focus:shadow-medium"
                  />

                  <div className="mt-4 flex flex-wrap gap-3">
                    {availableActions.map((action) => (
                      <button
                        key={action.status}
                        type="button"
                        onClick={() => void handleStatusUpdate(action.status)}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSubmitting ? "Saving..." : action.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-[22px] border border-dashed border-border bg-card px-4 py-4 text-[14px] leading-6 text-text-secondary">
                  No direct admin action is shown for this booking state right now.
                </div>
              )}

              {actionError ? (
                <p className="mt-3 text-[13px] text-[var(--color-danger,#b42318)]">{actionError}</p>
              ) : null}
              {actionSuccess ? (
                <p className="mt-3 text-[13px] text-[rgb(35,92,69)]">{actionSuccess}</p>
              ) : null}
            </section>

            <section className="surface-card rounded-[28px] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Recent payments
              </p>
              <div className="mt-4 space-y-3">
                {booking.recentTransactions.length ? (
                  booking.recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="rounded-[18px] border border-border bg-card px-4 py-3 shadow-soft"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[14px] font-semibold text-text-primary">
                            {transaction.transactionType || "reservation_payment"}
                          </p>
                          <p className="mt-1 text-[12px] text-text-secondary">
                            {transaction.status || "Unknown"} · {formatDate(transaction.processedAt || transaction.createdAt)}
                          </p>
                        </div>
                        <span className="text-[14px] font-semibold text-text-primary">
                          {formatCurrency(transaction.grossAmount, transaction.currency)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[18px] border border-dashed border-border bg-card px-4 py-4 text-[14px] leading-6 text-text-secondary">
                    No payment records are attached to this booking yet.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AdminShell>
  );
};
