"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HostShell } from "@/components/host/HostShell";
import {
  formatHostDateTime,
  formatRatingValue,
  formatReviewTypeLabel,
  getAverageRating,
} from "@/components/host/operations/hostOperations";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  createHostGuestReview,
  getHostGuestReviews,
  getHostPropertyReviews,
  type HostReview,
} from "@/lib/host";

const ReviewsSkeleton = () => (
  <HostShell badge="Operations">
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="surface-card rounded-panel h-36 animate-pulse bg-white/75" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="surface-card rounded-panel h-[520px] animate-pulse bg-white/75" />
        <div className="surface-card rounded-panel h-[520px] animate-pulse bg-white/75" />
      </div>
    </div>
  </HostShell>
);

const MetricCard: React.FC<{ label: string; value: string; helper: string }> = ({
  label,
  value,
  helper,
}) => (
  <div className="surface-card rounded-panel p-5">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
      {label}
    </p>
    <p className="mt-4 font-sora text-[30px] font-bold tracking-[-0.04em] text-text-primary">{value}</p>
    <p className="mt-2 text-[14px] leading-6 text-text-secondary">{helper}</p>
  </div>
);

const ReviewSection: React.FC<{
  title: string;
  subtitle: string;
  reviews: HostReview[];
  emptyText: string;
  errorText?: string;
}> = ({ title, subtitle, reviews, emptyText, errorText = "" }) => (
  <div className="surface-card rounded-panel p-6">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">{subtitle}</p>
    <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">{title}</h2>

    {errorText ? (
      <div className="mt-6 rounded-[24px] border border-dashed border-border bg-[rgba(184,82,82,0.05)] px-5 py-6 text-[14px] leading-7 text-text-secondary">
        {errorText}
      </div>
    ) : reviews.length > 0 ? (
      <div className="mt-6 space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-[24px] border border-border-light bg-white/80 px-5 py-5 shadow-soft"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[16px] font-semibold text-text-primary">
                  {review.title || formatReviewTypeLabel(review.reviewType)}
                </p>
                <p className="mt-1 text-[13px] text-text-secondary">
                  {review.propertyName || "Property pending"} · {review.unitName || "Unit pending"}
                </p>
              </div>
              <span className="rounded-full bg-primary-light px-3 py-1.5 text-[12px] font-semibold text-text-primary">
                {formatRatingValue(review.rating)}
              </span>
            </div>
            <p className="mt-4 text-[14px] leading-7 text-text-primary">
              {review.comment || "No written comment was included for this review."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-[12px] text-text-secondary">
              <span>{formatReviewTypeLabel(review.reviewType)}</span>
              <span>{formatHostDateTime(review.createdAt)}</span>
              <span>Guest: {review.guestName || "Unknown"}</span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="mt-6 rounded-[24px] border border-dashed border-border-light bg-white/80 px-5 py-6 text-[14px] leading-7 text-text-secondary">
        {emptyText}
      </div>
    )}
  </div>
);

export const HostReviewsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [propertyReviews, setPropertyReviews] = useState<HostReview[]>([]);
  const [guestReviews, setGuestReviews] = useState<HostReview[]>([]);
  const [propertyError, setPropertyError] = useState("");
  const [guestError, setGuestError] = useState("");
  const [ratingFilter, setRatingFilter] = useState(searchParams.get("rating")?.trim() || "");
  const [reviewRating, setReviewRating] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const reservationId = searchParams.get("reservationId")?.trim() || "";
  const searchParamRating = searchParams.get("rating")?.trim() || "";

  useEffect(() => {
    setRatingFilter(searchParamRating);
  }, [searchParamRating]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadReviews = async () => {
      setIsLoading(true);
      setPropertyError("");
      setGuestError("");

      try {
        const [propertyResults, guestResults] = await Promise.allSettled([
          getHostPropertyReviews(token, {
            reservationId: reservationId || undefined,
            rating: ratingFilter || undefined,
          }),
          getHostGuestReviews(token, {
            reservationId: reservationId || undefined,
            rating: ratingFilter || undefined,
          }),
        ]);

        if (!isActive) {
          return;
        }

        setPropertyReviews(propertyResults.status === "fulfilled" ? propertyResults.value : []);
        setGuestReviews(guestResults.status === "fulfilled" ? guestResults.value : []);
        setPropertyError(
          propertyResults.status === "rejected"
            ? propertyResults.reason instanceof ApiError
              ? propertyResults.reason.message || "We couldn't load property reviews right now."
              : "We couldn't load property reviews right now."
            : "",
        );
        setGuestError(
          guestResults.status === "rejected"
            ? guestResults.reason instanceof ApiError
              ? guestResults.reason.message || "We couldn't load guest reviews right now."
              : "We couldn't load guest reviews right now."
            : "",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadReviews();

    return () => {
      isActive = false;
    };
  }, [ratingFilter, reservationId, retryKey, token]);

  const propertyAverage = useMemo(() => getAverageRating(propertyReviews), [propertyReviews]);
  const guestAverage = useMemo(() => getAverageRating(guestReviews), [guestReviews]);
  const hasRatingFilter = Boolean(ratingFilter);

  if (isLoading) {
    return <ReviewsSkeleton />;
  }

  return (
    <HostShell
      badge="Operations"
      title="Reviews"
      subtitle="Track guest feedback on properties and the guest reviews already written from completed stays."
      headerAside={
        <>
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Property reviews
            </p>
            <p className="mt-3 text-[17px] font-semibold text-text-primary">{propertyReviews.length}</p>
          </div>
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Guest reviews
            </p>
            <p className="mt-3 text-[17px] font-semibold text-text-primary">{guestReviews.length}</p>
          </div>
        </>
      }
    >
      {reservationId ? (
        <div className="surface-card rounded-panel p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-3xl text-[14px] leading-6 text-text-secondary">
              Showing reviews for reservation #{reservationId.slice(-6).toUpperCase()}.
            </p>
            <Link
              href={`/host/reservations/${reservationId}`}
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Back to reservation
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-6 surface-card rounded-panel p-6">
        <div className="flex flex-wrap justify-end gap-3">
            <label className="block">
              <span className="sr-only">Filter by rating</span>
              <select
                value={ratingFilter}
                onChange={(event) => setRatingFilter(event.target.value)}
                className="rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-colors duration-200 focus:border-text-primary/25"
              >
                <option value="">All ratings</option>
                <option value="5">5 / 5</option>
                <option value="4">4 / 5</option>
                <option value="3">3 / 5</option>
                <option value="2">2 / 5</option>
                <option value="1">1 / 5</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                setRatingFilter("");
                setRetryKey((current) => current + 1);
              }}
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Clear filters
            </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Property review average"
          value={propertyAverage !== null ? formatRatingValue(propertyAverage) : "No ratings"}
          helper="Guest feedback left on your properties."
        />
        <MetricCard
          label="Guest review average"
          value={guestAverage !== null ? formatRatingValue(guestAverage) : "No ratings"}
          helper="Reviews already written by the host after completed stays."
        />
        <MetricCard
          label="Total review activity"
          value={String(propertyReviews.length + guestReviews.length)}
          helper="Combined property and guest review records available right now."
        />
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={() => setRetryKey((current) => current + 1)}
          className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
        >
          Reload reviews
        </button>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ReviewSection
          title="Property feedback"
          subtitle="Read-only reviews"
          reviews={propertyReviews}
          errorText={propertyError}
          emptyText={
            hasRatingFilter
              ? "No property reviews match the selected rating right now. Change the filter to inspect the broader review history."
              : "No property reviews are available yet. Guest feedback will appear here once completed stays start receiving reviews."
          }
        />
        <ReviewSection
          title="Guest reviews written"
          subtitle="Host-side review history"
          reviews={guestReviews}
          errorText={guestError}
          emptyText={
            hasRatingFilter
              ? "No guest reviews match the selected rating right now. Change the filter to inspect the broader review history."
              : "No guest reviews are visible yet. Once completed reservations receive a host review, that history will show up here."
          }
        />
      </div>

      {reservationId ? (
        <div className="mt-8 surface-card rounded-panel px-6 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Guest review action
          </p>
          <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
            Write a guest review for this stay
          </h2>
          <p className="mt-3 max-w-4xl text-[14px] leading-7 text-text-secondary">
            Use this form only for a completed reservation. The backend keeps the final eligibility rules, including one host guest review per reservation.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                Rating
              </span>
              <select
                value={reviewRating}
                onChange={(event) => {
                  setReviewRating(event.target.value);
                  setCreateError("");
                  setCreateSuccess("");
                }}
                className="mt-2 w-full rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-colors duration-200 focus:border-text-primary/25"
              >
                <option value="">Choose rating</option>
                <option value="5">5 / 5</option>
                <option value="4">4 / 5</option>
                <option value="3">3 / 5</option>
                <option value="2">2 / 5</option>
                <option value="1">1 / 5</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                Title
              </span>
              <input
                value={reviewTitle}
                onChange={(event) => {
                  setReviewTitle(event.target.value);
                  setCreateError("");
                  setCreateSuccess("");
                }}
                placeholder="Respectful guest"
                className="mt-2 w-full rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-colors duration-200 placeholder:text-text-secondary focus:border-text-primary/25"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
              Comment
            </span>
            <textarea
              value={reviewComment}
              onChange={(event) => {
                setReviewComment(event.target.value);
                setCreateError("");
                setCreateSuccess("");
              }}
              rows={5}
              placeholder="Communication was clear and the unit was left in good condition."
              className="mt-2 w-full rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-colors duration-200 placeholder:text-text-secondary focus:border-text-primary/25"
            />
          </label>

          {createError ? (
            <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
              {createError}
            </div>
          ) : null}

          {createSuccess ? (
            <div className="mt-5 rounded-[20px] border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-[14px] leading-6 text-emerald-700">
              {createSuccess}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={async () => {
                if (!token) {
                  return;
                }

                if (!reviewRating.trim()) {
                  setCreateError("Choose a rating before creating the guest review.");
                  setCreateSuccess("");
                  return;
                }

                if (!reviewComment.trim()) {
                  setCreateError("Add a short review comment before submitting.");
                  setCreateSuccess("");
                  return;
                }

                setIsCreating(true);
                setCreateError("");
                setCreateSuccess("");

                try {
                  await createHostGuestReview(token, {
                    reservationId,
                    rating: reviewRating,
                    title: reviewTitle,
                    comment: reviewComment,
                  });
                  setReviewRating("");
                  setReviewTitle("");
                  setReviewComment("");
                  setCreateSuccess("Guest review created successfully.");
                  setRetryKey((current) => current + 1);
                } catch (requestError) {
                  setCreateError(
                    requestError instanceof ApiError
                      ? requestError.message || "We couldn't create this guest review right now."
                      : "We couldn't create this guest review right now.",
                  );
                } finally {
                  setIsCreating(false);
                }
              }}
              disabled={isCreating}
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreating ? "Saving review..." : "Create guest review"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 surface-card rounded-panel px-6 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Operational note
          </p>
          <p className="mt-3 max-w-4xl text-[14px] leading-7 text-text-secondary">
            Property reviews remain read-only in this version. To create a guest review, enter this workspace from a completed reservation so the review stays tied to the correct stay context.
          </p>
        </div>
      )}
    </HostShell>
  );
};
