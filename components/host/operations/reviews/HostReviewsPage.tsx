"use client";

import React, { useEffect, useMemo, useState } from "react";
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
}> = ({ title, subtitle, reviews, emptyText }) => (
  <div className="surface-card rounded-panel p-6">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">{subtitle}</p>
    <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">{title}</h2>

    {reviews.length > 0 ? (
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
  const { token } = useAuth();
  const [propertyReviews, setPropertyReviews] = useState<HostReview[]>([]);
  const [guestReviews, setGuestReviews] = useState<HostReview[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadReviews = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [propertyResults, guestResults] = await Promise.all([
          getHostPropertyReviews(token),
          getHostGuestReviews(token),
        ]);

        if (!isActive) {
          return;
        }

        setPropertyReviews(propertyResults);
        setGuestReviews(guestResults);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load your reviews workspace right now."
            : "We couldn't load your reviews workspace right now.",
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
  }, [retryKey, token]);

  const propertyAverage = useMemo(() => getAverageRating(propertyReviews), [propertyReviews]);
  const guestAverage = useMemo(() => getAverageRating(guestReviews), [guestReviews]);

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

      {error ? (
        <div className="mt-8 surface-card rounded-panel px-6 py-8">
          <p className="text-[15px] font-semibold text-text-primary">Reviews unavailable</p>
          <p className="mt-3 max-w-2xl text-[14px] leading-7 text-text-secondary">{error}</p>
          <button
            type="button"
            onClick={() => setRetryKey((current) => current + 1)}
            className="mt-6 inline-flex items-center justify-center rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
          >
            Reload reviews
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <ReviewSection
            title="Property feedback"
            subtitle="Read-only reviews"
            reviews={propertyReviews}
            emptyText="No property reviews are available yet. Guest feedback will appear here once completed stays start receiving reviews."
          />
          <ReviewSection
            title="Guest reviews written"
            subtitle="Host-side review history"
            reviews={guestReviews}
            emptyText="No guest reviews are visible yet. Once completed reservations receive a host review, that history will show up here."
          />
        </div>
      )}

      <div className="mt-8 surface-card rounded-panel px-6 py-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          Operational note
        </p>
        <p className="mt-3 max-w-4xl text-[14px] leading-7 text-text-secondary">
          Property reviews remain read-only in this version. Guest review creation is supported by the backend only for completed reservations, so this workspace focuses on honest review visibility instead of showing a generic form without reservation context.
        </p>
      </div>
    </HostShell>
  );
};
