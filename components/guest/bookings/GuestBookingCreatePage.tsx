"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GuestShell } from "@/components/guest/GuestShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { getFrontPropertyDetails, parseFrontStayFilters, type FrontPropertyDetail } from "@/lib/front";
import { createGuestBooking } from "@/lib/guest";

type GuestBookingCreatePageProps = {
  propertyId?: string;
  unitId?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number | null;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const parseWholeNumber = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : -1;
};

const buildPropertyReturnHref = ({
  propertyId,
  unitId,
  checkIn,
  checkOut,
  guests,
}: {
  propertyId?: string;
  unitId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number | null;
}) => {
  if (!propertyId) {
    return "/search";
  }

  const params = new URLSearchParams();

  if (checkIn) {
    params.set("checkIn", checkIn);
  }

  if (checkOut) {
    params.set("checkOut", checkOut);
  }

  if (typeof guests === "number" && guests > 0) {
    params.set("guests", String(guests));
  }

  if (unitId) {
    params.set("unitId", unitId);
  }

  const query = params.toString();
  return query ? `/properties/${propertyId}?${query}` : `/properties/${propertyId}`;
};

const BookingCreateSkeleton = () => (
  <GuestShell badge="New Booking">
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
      <div className="surface-card h-[540px] animate-pulse rounded-panel bg-white/75" />
      <div className="surface-card h-[540px] animate-pulse rounded-panel bg-white/75" />
    </div>
  </GuestShell>
);

const SummaryRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 rounded-[18px] border border-border bg-card px-4 py-3">
    <span className="text-[13px] text-text-secondary">{label}</span>
    <span className="text-right text-[14px] font-semibold text-text-primary">{value}</span>
  </div>
);

export const GuestBookingCreatePage: React.FC<GuestBookingCreatePageProps> = ({
  propertyId,
  unitId,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}) => {
  const router = useRouter();
  const { token } = useAuth();
  const [detail, setDetail] = useState<FrontPropertyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [adultGuests, setAdultGuests] = useState(
    initialGuests && initialGuests > 0 ? String(initialGuests) : "1",
  );
  const [childGuests, setChildGuests] = useState("0");
  const [specialRequests, setSpecialRequests] = useState("");
  const [couponCode, setCouponCode] = useState("");

  const stayFilters = useMemo(
    () =>
      parseFrontStayFilters({
        checkIn: initialCheckIn ?? null,
        checkOut: initialCheckOut ?? null,
        guests: initialGuests ?? null,
      }),
    [initialCheckIn, initialCheckOut, initialGuests],
  );

  useEffect(() => {
    if (!propertyId || stayFilters.error) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadProperty = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const result = await getFrontPropertyDetails(propertyId, {
          checkIn: stayFilters.checkIn || undefined,
          checkOut: stayFilters.checkOut || undefined,
          guests: stayFilters.guests,
        });

        if (!isActive) {
          return;
        }

        setDetail(result);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLoadError(
          error instanceof ApiError
            ? error.message || "We couldn't load the selected stay right now."
            : "We couldn't load the selected stay right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadProperty();

    return () => {
      isActive = false;
    };
  }, [propertyId, retryKey, stayFilters.checkIn, stayFilters.checkOut, stayFilters.error, stayFilters.guests]);

  const propertyReturnHref = useMemo(
    () =>
      buildPropertyReturnHref({
        propertyId,
        unitId,
        checkIn: stayFilters.checkIn,
        checkOut: stayFilters.checkOut,
        guests: stayFilters.guests,
      }),
    [propertyId, stayFilters.checkIn, stayFilters.checkOut, stayFilters.guests, unitId],
  );

  const selectedUnit = useMemo(() => {
    if (!detail || !unitId) {
      return null;
    }

    return detail.units.find((unit) => unit.id === unitId) ?? null;
  }, [detail, unitId]);

  const totalGuests = parseWholeNumber(adultGuests) + parseWholeNumber(childGuests);

  if (isLoading) {
    return <BookingCreateSkeleton />;
  }

  return (
    <GuestShell
      badge="New Booking"
      topbarAction={
        <Link
          href={propertyReturnHref}
          className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-3 py-2 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
        >
          Back to stay
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
        <section className="surface-card rounded-panel p-5 sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Booking request
            </p>
            <h1 className="mt-2 font-sora text-[30px] font-bold tracking-[-0.05em] text-text-primary">
              Confirm your stay details
            </h1>
            <p className="mt-2 max-w-3xl text-[14px] leading-6 text-text-secondary">
              Review the selected unit, set your final guest counts, and send the booking request to
              the host.
            </p>
          </div>

          {!propertyId ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-border bg-card px-5 py-6">
              <p className="text-[15px] font-semibold text-text-primary">No property selected</p>
              <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                Choose a property and unit first from the public property details page.
              </p>
              <Link
                href="/search"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
              >
                Browse stays
              </Link>
            </div>
          ) : stayFilters.error ? (
            <div className="mt-6 rounded-[24px] border border-[var(--color-danger,#b42318)]/15 bg-[rgba(180,35,24,0.04)] px-5 py-6">
              <p className="text-[15px] font-semibold text-text-primary">Stay details need attention</p>
              <p className="mt-2 text-[14px] leading-6 text-[var(--color-danger,#b42318)]">
                {stayFilters.error}
              </p>
              <Link
                href={propertyReturnHref}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
              >
                Fix on property page
              </Link>
            </div>
          ) : loadError ? (
            <div className="mt-6 rounded-[24px] border border-[var(--color-danger,#b42318)]/15 bg-[rgba(180,35,24,0.04)] px-5 py-6">
              <p className="text-[15px] font-semibold text-text-primary">Selected stay unavailable</p>
              <p className="mt-2 text-[14px] leading-6 text-[var(--color-danger,#b42318)]">
                {loadError}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setRetryKey((current) => current + 1)}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
                >
                  Retry
                </button>
                <Link
                  href={propertyReturnHref}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                >
                  Back to property
                </Link>
              </div>
            </div>
          ) : !selectedUnit ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-border bg-card px-5 py-6">
              <p className="text-[15px] font-semibold text-text-primary">Choose a unit before booking</p>
              <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                The selected unit is missing or no longer available for the current stay filters.
              </p>
              <Link
                href={propertyReturnHref}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
              >
                Pick a unit
              </Link>
            </div>
          ) : (
            <form
              className="mt-6 space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();

                if (!token) {
                  setSubmitError("You need to log in again before submitting a booking request.");
                  return;
                }

                const parsedAdults = parseWholeNumber(adultGuests);
                const parsedChildren = parseWholeNumber(childGuests);

                if (parsedAdults < 1) {
                  setSubmitError("At least 1 adult guest is required.");
                  return;
                }

                if (parsedChildren < 0) {
                  setSubmitError("Children count must be 0 or higher.");
                  return;
                }

                const nextGuestTotal = parsedAdults + parsedChildren;

                if (nextGuestTotal < 1) {
                  setSubmitError("Add at least 1 guest before continuing.");
                  return;
                }

                if (selectedUnit.capacity && nextGuestTotal > selectedUnit.capacity) {
                  setSubmitError(`This unit supports up to ${selectedUnit.capacity} guests.`);
                  return;
                }

                setIsSubmitting(true);
                setSubmitError("");

                try {
                  const booking = await createGuestBooking(token, {
                    propertyId,
                    unitId: selectedUnit.id,
                    checkInDate: stayFilters.checkIn,
                    checkOutDate: stayFilters.checkOut,
                    adultGuests: parsedAdults,
                    childGuests: parsedChildren,
                    specialRequests,
                    couponCode,
                  });

                  router.push(`/guest/bookings/${booking.id}`);
                  router.refresh();
                } catch (error) {
                  setSubmitError(
                    error instanceof ApiError
                      ? error.message || "We couldn't submit your booking request right now."
                      : "We couldn't submit your booking request right now.",
                  );
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-text-primary">Adults</span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                      Required
                    </span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={adultGuests}
                    onChange={(event) => {
                      setAdultGuests(event.target.value.replace(/[^\d]/g, ""));
                      setSubmitError("");
                    }}
                    className="w-full rounded-[22px] border border-border bg-card px-4 py-3.5 text-[15px] text-text-primary shadow-soft outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-text-primary">Children</span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                      Optional
                    </span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={childGuests}
                    onChange={(event) => {
                      setChildGuests(event.target.value.replace(/[^\d]/g, ""));
                      setSubmitError("");
                    }}
                    className="w-full rounded-[22px] border border-border bg-card px-4 py-3.5 text-[15px] text-text-primary shadow-soft outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium"
                  />
                </label>
              </div>

              <div className="rounded-[22px] border border-border bg-surface px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[13px] font-medium text-text-secondary">Total guests</span>
                  <span className="text-[14px] font-semibold text-text-primary">
                    {totalGuests > 0 ? `${totalGuests} guest${totalGuests === 1 ? "" : "s"}` : "Add guests"}
                  </span>
                </div>
                {selectedUnit.capacity ? (
                  <p className="mt-2 text-[12px] leading-5 text-text-secondary">
                    This unit supports up to {selectedUnit.capacity} guest
                    {selectedUnit.capacity === 1 ? "" : "s"}.
                  </p>
                ) : null}
              </div>

              <label className="block">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-text-primary">Special requests</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                    Optional
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={specialRequests}
                  onChange={(event) => {
                    setSpecialRequests(event.target.value);
                    setSubmitError("");
                  }}
                  placeholder="Need early check-in if possible"
                  className="w-full rounded-[22px] border border-border bg-card px-4 py-3.5 text-[15px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium"
                />
              </label>

              <label className="block">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-text-primary">Coupon code</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                    Optional
                  </span>
                </div>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(event) => {
                    setCouponCode(event.target.value.toUpperCase());
                    setSubmitError("");
                  }}
                  placeholder="WELCOME10"
                  className="w-full rounded-[22px] border border-border bg-card px-4 py-3.5 text-[15px] uppercase text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium"
                />
              </label>

              {submitError ? (
                <div className="rounded-[22px] border border-[var(--color-danger,#b42318)]/15 bg-[rgba(180,35,24,0.04)] px-4 py-3 text-[14px] text-[var(--color-danger,#b42318)]">
                  {submitError}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3.5 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Submitting..." : "Send booking request"}
                </button>

                <Link
                  href={propertyReturnHref}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-3.5 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                >
                  Change selection
                </Link>
              </div>
            </form>
          )}
        </section>

        <aside className="space-y-6">
          <section className="surface-card rounded-panel p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Stay summary
            </p>
            <h2 className="mt-2 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              {detail?.property.title || "Selected stay"}
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-text-secondary">
              {detail?.location.locationLabel || "Property details will appear here once the stay loads."}
            </p>

            <div className="mt-5 space-y-3">
              <SummaryRow label="Unit" value={selectedUnit?.unitName || "Select a unit first"} />
              <SummaryRow
                label="Stay dates"
                value={
                  stayFilters.checkIn && stayFilters.checkOut
                    ? `${formatDate(stayFilters.checkIn)} to ${formatDate(stayFilters.checkOut)}`
                    : "Add both dates"
                }
              />
              <SummaryRow
                label="Discovery guests"
                value={
                  typeof stayFilters.guests === "number" && stayFilters.guests > 0
                    ? `${stayFilters.guests} guest${stayFilters.guests === 1 ? "" : "s"}`
                    : "Not set"
                }
              />
              <SummaryRow
                label="Rate"
                value={selectedUnit?.pricing.nightlyLabel || detail?.pricing.minNightlyLabel || "Rate unavailable"}
              />
              <SummaryRow
                label="Estimated total"
                value={
                  selectedUnit?.pricing.stayTotalLabel ||
                  detail?.pricing.minStayTotalLabel ||
                  "Calculated after host pricing check"
                }
              />
            </div>
          </section>

          <section className="surface-card rounded-panel p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              What happens next
            </p>
            <div className="mt-4 space-y-3">
              {[
                "Your booking request is created immediately with a pending status.",
                "The host reviews the request and can accept or reject it.",
                "Payment and messaging steps continue from the guest portal after booking creation.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[18px] border border-border-light bg-card px-4 py-3 text-[13px] leading-6 text-text-secondary"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </GuestShell>
  );
};
