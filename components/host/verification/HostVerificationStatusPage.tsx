"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { HostShell } from "@/components/host/HostShell";
import { HostOnboardingStatusCard } from "@/components/host/onboarding/HostOnboardingStatusCard";
import { getHostOnboardingViewState } from "@/components/host/onboarding/hostOnboarding";
import { HostPropertyStatusPill } from "@/components/host/properties/HostPropertyStatusPill";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  getHostIdentityVerificationStatus,
  getHostProperties,
  getHostPropertySubmissionStatus,
  isHostPropertyEditable,
  type HostIdentityVerificationStatus,
  type HostPropertySubmissionStatus,
  type HostPropertySummary,
} from "@/lib/host";

type PropertyStatusRecord = {
  property: HostPropertySummary;
  submissionStatus: HostPropertySubmissionStatus | null;
};

const formatTimestamp = (value: string | null) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatUpdatedAt = (value: string | null) => {
  if (!value) {
    return "Recently updated";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently updated";
  }

  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
  }).format(date);
};

const VerificationSkeleton = () => (
  <HostShell
    badge="Verification Status"
    title="Verification status"
    subtitle="We are checking your host approval and listing review activity so the right next actions are ready."
  >
    <div className="space-y-6">
      <div className="surface-card rounded-panel h-32 animate-pulse bg-white/75" />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card rounded-panel h-72 animate-pulse bg-white/75" />
        <div className="surface-card rounded-panel h-72 animate-pulse bg-white/75" />
      </div>
      <div className="surface-card rounded-panel h-96 animate-pulse bg-white/75" />
    </div>
  </HostShell>
);

const SectionHeading: React.FC<{
  badge: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ badge, title, description, action }) => (
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
        {badge}
      </p>
      <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-[14px] leading-7 text-text-secondary">{description}</p>
    </div>
    {action ? <div>{action}</div> : null}
  </div>
);

const MetricCard: React.FC<{ label: string; value: number; helper: string }> = ({
  label,
  value,
  helper,
}) => (
  <div className="rounded-[22px] border border-border-light bg-card px-4 py-4 shadow-soft">
    <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">{label}</p>
    <p className="mt-3 text-[28px] font-semibold text-text-primary">{value}</p>
    <p className="mt-2 text-[13px] leading-6 text-text-secondary">{helper}</p>
  </div>
);

const StatusPanelCard: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <div className="surface-card rounded-panel p-6">
    <h3 className="font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">{title}</h3>
    <p className="mt-3 text-[14px] leading-7 text-text-secondary">{description}</p>
    <div className="mt-5">{children}</div>
  </div>
);

const PropertyStatusCard: React.FC<{ record: PropertyStatusRecord }> = ({ record }) => {
  const { property, submissionStatus } = record;
  const canEdit = isHostPropertyEditable(property.status);
  const editHref = `/host/properties/${property.id}/edit`;
  const verificationHref = `/host/properties/${property.id}/verification`;
  const submittedAt =
    submissionStatus?.submittedAt && submissionStatus.status !== "draft"
      ? formatTimestamp(submissionStatus.submittedAt)
      : null;
  const rejectionReason = submissionStatus?.rejectionReason || null;

  const copy = {
    draft:
      "This listing is still in progress. Continue the editor to finish the remaining setup before you submit it for review.",
    submitted:
      "This listing is currently with the admin review queue. Keep the verification page as your source of truth while you wait.",
    approved:
      "This listing has already cleared review. Use the verification page if you need to confirm the recorded submission state.",
    rejected:
      "This listing needs updates before it can return to the review queue. Check the rejection reason, then correct the affected steps.",
  }[property.status];

  return (
    <div className="surface-card rounded-panel p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            {property.propertyType || "Property listing"}
          </p>
          <h3 className="mt-3 truncate font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            {property.name || "Untitled property"}
          </h3>
          <p className="mt-3 text-[14px] leading-6 text-text-secondary">
            {property.city || property.country
              ? [property.city, property.country].filter(Boolean).join(", ")
              : "Location details are still missing from this listing."}
          </p>
        </div>

        <HostPropertyStatusPill status={property.status} />
      </div>

      <p className="mt-5 text-[14px] leading-7 text-text-secondary">{copy}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[20px] border border-border-light bg-white/85 px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Ownership</p>
          <p className="mt-2 text-[14px] font-semibold text-text-primary">
            {property.ownershipType || "Not set"}
          </p>
        </div>
        <div className="rounded-[20px] border border-border-light bg-white/85 px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">
            Last updated
          </p>
          <p className="mt-2 text-[14px] font-semibold text-text-primary">
            {formatUpdatedAt(submissionStatus?.updatedAt ?? property.updatedAt)}
          </p>
        </div>
        <div className="rounded-[20px] border border-border-light bg-white/85 px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">
            Review activity
          </p>
          <p className="mt-2 text-[14px] font-semibold text-text-primary">
            {submittedAt || (property.status === "draft" ? "Not submitted yet" : "No timestamp available")}
          </p>
        </div>
      </div>

      {rejectionReason ? (
        <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50/80 px-4 py-4">
          <p className="text-[13px] font-semibold text-red-700">Rejection reason</p>
          <p className="mt-2 text-[14px] leading-6 text-red-700">{rejectionReason}</p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={canEdit ? editHref : verificationHref}
          className="inline-flex items-center justify-center rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
        >
          {property.status === "rejected"
            ? "Fix listing"
            : property.status === "draft"
              ? "Continue listing"
              : "Open verification"}
        </Link>

        {(property.status === "rejected" || property.status === "submitted" || property.status === "approved") && (
          <Link
            href={verificationHref}
            className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
          >
            View status detail
          </Link>
        )}

        <Link
          href="/host/properties"
          className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
        >
          All properties
        </Link>
      </div>
    </div>
  );
};

export const HostVerificationStatusPage: React.FC = () => {
  const { token, user } = useAuth();
  const [identityStatus, setIdentityStatus] = useState<HostIdentityVerificationStatus | null>(null);
  const [identityError, setIdentityError] = useState("");
  const [propertiesError, setPropertiesError] = useState("");
  const [properties, setProperties] = useState<HostPropertySummary[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, HostPropertySubmissionStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadStatus = async () => {
      setIsLoading(true);
      setIdentityError("");
      setPropertiesError("");

      try {
        const [identityResult, propertiesResult] = await Promise.allSettled([
          getHostIdentityVerificationStatus(token),
          getHostProperties(token),
        ]);

        if (!isActive) {
          return;
        }

        if (identityResult.status === "fulfilled") {
          setIdentityStatus(identityResult.value);
        } else {
          setIdentityStatus(null);
          setIdentityError(
            identityResult.reason instanceof ApiError
              ? identityResult.reason.message || "We couldn't load your host approval status right now."
              : "We couldn't load your host approval status right now.",
          );
        }

        if (propertiesResult.status === "fulfilled") {
          const nextProperties = propertiesResult.value;
          setProperties(nextProperties);

          const statusTargets = nextProperties.filter(
            (property) => property.status === "submitted" || property.status === "rejected",
          );

          if (statusTargets.length === 0) {
            setStatusMap({});
            return;
          }

          const detailResults = await Promise.allSettled(
            statusTargets.map((property) => getHostPropertySubmissionStatus(token, property.id)),
          );

          if (!isActive) {
            return;
          }

          const nextStatusMap = detailResults.reduce<Record<string, HostPropertySubmissionStatus>>(
            (accumulator, result, index) => {
              if (result.status === "fulfilled") {
                accumulator[statusTargets[index].id] = result.value;
              }

              return accumulator;
            },
            {},
          );

          setStatusMap(nextStatusMap);
        } else {
          setProperties([]);
          setStatusMap({});
          setPropertiesError(
            propertiesResult.reason instanceof ApiError
              ? propertiesResult.reason.message || "We couldn't load your property review status right now."
              : "We couldn't load your property review status right now.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadStatus();

    return () => {
      isActive = false;
    };
  }, [retryKey, token]);

  const propertyRecords = useMemo<PropertyStatusRecord[]>(
    () =>
      properties.map((property) => ({
        property,
        submissionStatus: statusMap[property.id] ?? null,
      })),
    [properties, statusMap],
  );

  const counts = useMemo(
    () =>
      properties.reduce(
        (accumulator, property) => {
          accumulator.total += 1;
          accumulator[property.status] += 1;
          return accumulator;
        },
        {
          total: 0,
          draft: 0,
          submitted: 0,
          approved: 0,
          rejected: 0,
        },
      ),
    [properties],
  );

  const actionRequiredRecords = useMemo(
    () =>
      propertyRecords.filter(
        (record) => record.property.status === "draft" || record.property.status === "rejected",
      ),
    [propertyRecords],
  );

  const underReviewRecords = useMemo(
    () => propertyRecords.filter((record) => record.property.status === "submitted"),
    [propertyRecords],
  );

  const approvedRecords = useMemo(
    () => propertyRecords.filter((record) => record.property.status === "approved"),
    [propertyRecords],
  );

  if (!token || isLoading) {
    return <VerificationSkeleton />;
  }

  const onboardingViewState = getHostOnboardingViewState(identityStatus);
  const accountCard =
    identityError.length > 0 ? (
      <HostOnboardingStatusCard
        badge="Host approval"
        title="Host approval status unavailable"
        description={identityError}
        accent="warning"
        note="Your approved-host access is still active in this session. Refresh to retry the latest approval summary."
        actions={
          <button
            type="button"
            onClick={() => setRetryKey((current) => current + 1)}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
          >
            Refresh status
          </button>
        }
      />
    ) : onboardingViewState === "rejected" ? (
      <HostOnboardingStatusCard
        badge="Host approval"
        title="Host application previously rejected"
        description="Your current session still has host access, but the latest identity record reports a rejected verification state. Review the rejection reason and confirm the account status with your latest onboarding record."
        accent="danger"
        rejectionReason={identityStatus?.rejectionReason ?? null}
        note="If this status is stale, refresh the page. If it is current, contact support before making new listing submissions."
        actions={
          <button
            type="button"
            onClick={() => setRetryKey((current) => current + 1)}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
          >
            Refresh status
          </button>
        }
      />
    ) : onboardingViewState === "submitted" ? (
      <HostOnboardingStatusCard
        badge="Host approval"
        title="Host approval still under review"
        description="Your account currently has portal access, but the latest identity record still reads as under review. Keep this page as your checkpoint until the backend state settles."
        accent="warning"
        note="Use the refresh action if you have just been approved and the backend status needs a moment to catch up."
        actions={
          <button
            type="button"
            onClick={() => setRetryKey((current) => current + 1)}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
          >
            Refresh status
          </button>
        }
      />
    ) : (
      <HostOnboardingStatusCard
        badge="Host approval"
        title="Host account approved"
        description="Your host account is already approved, so you can use this page as the summary point for listing review activity, rejection reasons, and the next route that needs attention."
        accent="success"
        note="Keep draft and rejected listings moving, while submitted listings remain in the admin review queue."
        actions={
          <>
            <Link
              href="/host/properties"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Open properties
            </Link>
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:bg-surface"
            >
              Refresh status
            </button>
          </>
        }
      />
    );

  return (
    <HostShell
      badge="Verification Status"
      title="Verification status"
      subtitle="Track host approval, listing reviews, rejection reasons, and the next route to open without jumping between multiple host pages."
      headerAside={
        <>
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Needs action
            </p>
            <p className="mt-3 text-[17px] font-semibold text-text-primary">
              {counts.draft + counts.rejected}
            </p>
          </div>
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              In review
            </p>
            <p className="mt-3 text-[17px] font-semibold text-text-primary">{counts.submitted}</p>
          </div>
        </>
      }
      topbarAction={
        <Link
          href="/host/properties"
          className="inline-flex items-center justify-center rounded-[16px] bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
        >
          Open properties
        </Link>
      }
    >
      <div className="mb-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => setRetryKey((current) => current + 1)}
          className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
        >
          Refresh status
        </button>
        <Link
          href="/host/properties/new"
          className="inline-flex items-center justify-center rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
        >
          Add property
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>{accountCard}</div>

        <StatusPanelCard
          title="Property review pipeline"
          description="Use these counts to decide whether to keep editing, wait for a review decision, or jump straight into a rejected listing that needs correction."
        >
          {propertiesError ? (
            <div className="rounded-[24px] border border-dashed border-border bg-card px-5 py-6">
              <p className="text-[14px] leading-7 text-text-secondary">{propertiesError}</p>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setRetryKey((current) => current + 1)}
                  className="inline-flex items-center justify-center rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
                >
                  Retry property status
                </button>
              </div>
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-border bg-card px-5 py-6">
              <p className="text-[14px] leading-7 text-text-secondary">
                No properties exist yet. Create your first draft to start the submission and review lifecycle.
              </p>
              <div className="mt-5">
                <Link
                  href="/host/properties/new"
                  className="inline-flex items-center justify-center rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
                >
                  Create draft property
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard
                  label="Draft"
                  value={counts.draft}
                  helper="Listings still being prepared before review."
                />
                <MetricCard
                  label="Submitted"
                  value={counts.submitted}
                  helper="Listings currently waiting in the review queue."
                />
                <MetricCard
                  label="Rejected"
                  value={counts.rejected}
                  helper="Listings returned for changes before resubmission."
                />
                <MetricCard
                  label="Approved"
                  value={counts.approved}
                  helper="Listings that already cleared review."
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/host/properties"
                  className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                >
                  Open all properties
                </Link>
                <Link
                  href="/host/properties/new"
                  className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                >
                  Add another listing
                </Link>
              </div>
            </>
          )}
        </StatusPanelCard>
      </div>

      {!propertiesError && actionRequiredRecords.length > 0 ? (
        <div className="mt-8">
          <SectionHeading
            badge="Needs action"
            title="Listings to continue or correct"
            description="Draft and rejected listings still need your attention before they can complete the review cycle."
          />
          <div className="grid gap-6">
            {actionRequiredRecords.map((record) => (
              <PropertyStatusCard key={record.property.id} record={record} />
            ))}
          </div>
        </div>
      ) : null}

      {!propertiesError && underReviewRecords.length > 0 ? (
        <div className="mt-8">
          <SectionHeading
            badge="In review"
            title="Listings waiting on admin review"
            description="These listings are already in the queue. Keep the verification route as the review checkpoint while you wait for approval or feedback."
          />
          <div className="grid gap-6">
            {underReviewRecords.map((record) => (
              <PropertyStatusCard key={record.property.id} record={record} />
            ))}
          </div>
        </div>
      ) : null}

      {!propertiesError &&
      properties.length > 0 &&
      actionRequiredRecords.length === 0 &&
      underReviewRecords.length === 0 ? (
        <div className="mt-8">
          <StatusPanelCard
            title="Everything is in a calm state"
            description="There are no draft, rejected, or submitted listings demanding attention right now. Your approved listings already cleared review."
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {approvedRecords.slice(0, 6).map((record) => (
                <div
                  key={record.property.id}
                  className="rounded-[22px] border border-border-light bg-card px-4 py-4 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-text-primary">
                        {record.property.name || "Untitled property"}
                      </p>
                      <p className="mt-1 text-[13px] text-text-secondary">
                        {record.property.city || record.property.country
                          ? [record.property.city, record.property.country].filter(Boolean).join(", ")
                          : "Location pending"}
                      </p>
                    </div>
                    <HostPropertyStatusPill status="approved" />
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/host/properties/${record.property.id}/verification`}
                      className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                    >
                      View status detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </StatusPanelCard>
        </div>
      ) : null}
    </HostShell>
  );
};
