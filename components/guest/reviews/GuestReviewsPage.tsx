"use client";

import React, { useEffect, useMemo, useState } from "react";
import { GuestShell } from "@/components/guest/GuestShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  createGuestPropertyReview,
  getGuestBookings,
  getGuestPropertyLookups,
  getGuestReviews,
  type CreateGuestPropertyReviewPayload,
  type GuestBooking,
  type GuestPropertyReview,
} from "@/lib/guest";

const ratingFields: Array<keyof CreateGuestPropertyReviewPayload["ratings"]> = [
  "cleanliness",
  "accuracy",
  "communication",
  "checkIn",
  "value",
  "overall",
];

const defaultRatings = {
  cleanliness: 5,
  accuracy: 5,
  communication: 5,
  checkIn: 5,
  value: 5,
  overall: 5,
};

const formatDate = (value: string | null) => {
  if (!value) {
    return "Recently";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const GuestReviewsPage: React.FC = () => {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<GuestPropertyReview[]>([]);
  const [completedBookings, setCompletedBookings] = useState<GuestBooking[]>([]);
  const [propertyLookup, setPropertyLookup] = useState<
    Awaited<ReturnType<typeof getGuestPropertyLookups>>
  >({});
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [comment, setComment] = useState("");
  const [ratings, setRatings] = useState(defaultRatings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadReviewsData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [reviewResults, bookingResults] = await Promise.all([
          getGuestReviews(token),
          getGuestBookings(token, { status: "completed" }),
        ]);
        const propertyIds = Array.from(
          new Set([...reviewResults.map((item) => item.propertyId), ...bookingResults.map((item) => item.propertyId)]),
        ).filter(Boolean);
        const lookups = await getGuestPropertyLookups(propertyIds);

        if (!isActive) {
          return;
        }

        setReviews(reviewResults);
        setCompletedBookings(bookingResults);
        setPropertyLookup(lookups);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load your reviews right now."
            : "We couldn't load your reviews right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadReviewsData();

    return () => {
      isActive = false;
    };
  }, [retryKey, token]);

  const reviewedReservationIds = useMemo(
    () => new Set(reviews.map((review) => review.reservationId)),
    [reviews],
  );
  const eligibleBookings = useMemo(
    () => completedBookings.filter((booking) => !reviewedReservationIds.has(booking.id)),
    [completedBookings, reviewedReservationIds],
  );

  return (
    <GuestShell badge="Reviews">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="surface-card overflow-hidden rounded-panel">
          <div className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Reviews workspace
            </p>
            <h1 className="mt-2 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
              Review completed stays and track past feedback
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-text-secondary">
              Completed bookings can be reviewed once. Your review history stays connected to each stay.
            </p>
          </div>

          {error ? (
            <div className="border-t border-border-light bg-[rgba(180,35,24,0.04)] px-5 py-4">
              <p className="text-[14px] leading-6 text-[var(--color-danger,#b42318)]">{error}</p>
            </div>
          ) : null}
          {successMessage ? (
            <div className="border-t border-border-light bg-[rgba(64,145,108,0.08)] px-5 py-4">
              <p className="text-[14px] leading-6 text-[rgb(35,92,69)]">{successMessage}</p>
            </div>
          ) : null}

          {isLoading ? (
            <div className="space-y-3 border-t border-border-light px-5 py-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-[22px] bg-white/75" />
              ))}
            </div>
          ) : reviews.length ? (
            <div className="space-y-3 border-t border-border-light px-5 py-5">
              {reviews.map((review) => {
                const property = propertyLookup[review.propertyId];

                return (
                  <div key={review.id} className="rounded-[22px] border border-border-light bg-card px-4 py-4 shadow-soft">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-semibold text-text-primary">
                          {property?.propertyTitle || review.propertyId}
                        </p>
                        <p className="mt-1 text-[13px] text-text-secondary">
                          {property?.unitNamesById[review.unitId] || "Reviewed unit"}
                        </p>
                      </div>
                      <span className="rounded-full border border-primary/25 bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-text-primary">
                        Overall {review.ratings.overall}/5
                      </span>
                    </div>

                    <p className="mt-3 text-[14px] leading-6 text-text-secondary">
                      {review.comment || "No comment added."}
                    </p>
                    <p className="mt-3 text-[12px] text-text-secondary">{formatDate(review.createdAt)}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border-t border-border-light px-5 py-10 text-center">
              <p className="text-[15px] font-semibold text-text-primary">No reviews submitted yet</p>
              <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                Once you review a completed booking, it will appear here.
              </p>
            </div>
          )}
        </section>

        <section className="surface-card rounded-panel p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Leave a review
          </p>

          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Completed booking
              </span>
              <select
                value={selectedBookingId}
                onChange={(event) => setSelectedBookingId(event.target.value)}
                className="w-full rounded-[20px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium"
              >
                <option value="">Select a booking</option>
                {eligibleBookings.map((booking) => {
                  const property = propertyLookup[booking.propertyId];
                  return (
                    <option key={booking.id} value={booking.id}>
                      {(property?.propertyTitle || booking.propertyId) + " - " + (property?.unitNamesById[booking.unitId] || booking.unitId)}
                    </option>
                  );
                })}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              {ratingFields.map((field) => (
                <label key={field} className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    {field}
                  </span>
                  <select
                    value={String(ratings[field])}
                    onChange={(event) =>
                      setRatings((current) => ({
                        ...current,
                        [field]: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-[18px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Comment
              </span>
              <textarea
                rows={5}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="w-full rounded-[20px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium"
              />
            </label>

            <button
              type="button"
              disabled={isSubmitting || !eligibleBookings.length}
              onClick={async () => {
                if (!token) {
                  return;
                }

                if (!selectedBookingId) {
                  setError("Select a completed booking to review.");
                  return;
                }

                setIsSubmitting(true);
                setError("");
                setSuccessMessage("");

                try {
                  const result = await createGuestPropertyReview(token, {
                    bookingId: selectedBookingId,
                    ratings,
                    comment,
                  });

                  setReviews((current) => [result, ...current]);
                  setSelectedBookingId("");
                  setComment("");
                  setRatings(defaultRatings);
                  setSuccessMessage("Review submitted successfully.");
                } catch (requestError) {
                  setError(
                    requestError instanceof ApiError
                      ? requestError.message || "Unable to submit your review right now."
                      : "Unable to submit your review right now.",
                  );
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit review"}
            </button>

            {!eligibleBookings.length ? (
              <p className="text-[13px] leading-6 text-text-secondary">
                No completed bookings are currently waiting for a review.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </GuestShell>
  );
};
