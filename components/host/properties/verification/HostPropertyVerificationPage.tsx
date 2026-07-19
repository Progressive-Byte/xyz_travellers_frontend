"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { HostShell } from "@/components/host/HostShell";
import { HostPropertyEditorShell } from "@/components/host/properties/HostPropertyEditorShell";
import { HostPropertyReviewChecklist } from "@/components/host/properties/review-submit/HostPropertyReviewChecklist";
import { HostPropertySubmissionStatusCard } from "@/components/host/properties/review-submit/HostPropertySubmissionStatusCard";
import { HostPropertySubmitPanel } from "@/components/host/properties/review-submit/HostPropertySubmitPanel";
import { HostPropertyVerificationList } from "@/components/host/properties/verification/HostPropertyVerificationList";
import { HostPropertyVerificationNotesForm } from "@/components/host/properties/verification/HostPropertyVerificationNotesForm";
import { HostPropertyVerificationUploader } from "@/components/host/properties/verification/HostPropertyVerificationUploader";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  createEmptyHostUnitCalendarRules,
  createEmptyHostPropertySubmissionStatus,
  createEmptyHostPropertyVerification,
  createEmptyHostUnitPricing,
  getHostBusinesses,
  getHostProperty,
  getHostPropertyMedia,
  getHostPropertySubmissionChecklist,
  getHostPropertySubmissionStatus,
  getHostPropertyUnits,
  getHostPropertyVerification,
  getHostUnitCalendar,
  getHostUnitPricing,
  isHostPropertyEditable,
  submitHostPropertyForReview,
  updateHostPropertyVerification,
  type HostPropertyDetail,
  type HostPropertyMediaItem,
  type HostPropertySubmissionStatus,
  type HostPropertyUnit,
  type HostPropertyVerification,
  type HostBusiness,
  type HostUnitCalendarRules,
  type HostUnitPricing,
} from "@/lib/host";

type HostPropertyVerificationPageProps = {
  propertyId: string;
};

const VerificationPageSkeleton = () => (
  <HostShell badge="Add Property">
    <div className="space-y-6">
      <div className="surface-card rounded-panel h-72 animate-pulse bg-white/75" />
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="surface-card rounded-panel h-[320px] animate-pulse bg-white/75" />
          <div className="surface-card rounded-panel h-[280px] animate-pulse bg-white/75" />
        </div>
        <div className="space-y-6">
          <div className="surface-card rounded-panel h-[360px] animate-pulse bg-white/75" />
          <div className="surface-card rounded-panel h-[260px] animate-pulse bg-white/75" />
        </div>
      </div>
    </div>
  </HostShell>
);

export const HostPropertyVerificationPage: React.FC<HostPropertyVerificationPageProps> = ({
  propertyId,
}) => {
  const { token } = useAuth();
  const [property, setProperty] = useState<HostPropertyDetail | null>(null);
  const [mediaItems, setMediaItems] = useState<HostPropertyMediaItem[]>([]);
  const [units, setUnits] = useState<HostPropertyUnit[]>([]);
  const [pricings, setPricings] = useState<HostUnitPricing[]>([]);
  const [calendars, setCalendars] = useState<HostUnitCalendarRules[]>([]);
  const [businesses, setBusinesses] = useState<HostBusiness[]>([]);
  const [verification, setVerification] = useState<HostPropertyVerification>(
    createEmptyHostPropertyVerification(),
  );
  const [submissionStatus, setSubmissionStatus] = useState<HostPropertySubmissionStatus>(
    createEmptyHostPropertySubmissionStatus(),
  );
  const [noteValue, setNoteValue] = useState("");
  const [pageError, setPageError] = useState("");
  const [noteError, setNoteError] = useState("");
  const [noteSuccessMessage, setNoteSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [pageNotice, setPageNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadVerificationPage = async () => {
      setIsLoading(true);
      setPageError("");
      setPageNotice("");
      setSubmitError("");

      try {
        const [propertyResult, mediaResult, unitsResult, verificationResult, statusResult, businessesResult] =
          await Promise.all([
            getHostProperty(token, propertyId),
            getHostPropertyMedia(token, propertyId),
            getHostPropertyUnits(token, propertyId),
            getHostPropertyVerification(token, propertyId),
            getHostPropertySubmissionStatus(token, propertyId),
            getHostBusinesses(token).catch(() => []),
          ]);

        const unitDetails = await Promise.all(
          unitsResult.map(async (unit) => {
            const [pricingResult, calendarResult] = await Promise.allSettled([
              getHostUnitPricing(token, unit.id),
              getHostUnitCalendar(token, unit.id),
            ]);

            const pricing =
              pricingResult.status === "fulfilled"
                ? pricingResult.value
                : {
                    ...createEmptyHostUnitPricing(),
                    unitId: unit.id,
                  };
            const calendar =
              calendarResult.status === "fulfilled"
                ? calendarResult.value
                : {
                    ...createEmptyHostUnitCalendarRules(),
                    unitId: unit.id,
                  };

            return {
              pricing,
              calendar,
              hasWarning:
                pricingResult.status === "rejected" || calendarResult.status === "rejected",
            };
          }),
        );

        if (!isActive) {
          return;
        }

        setProperty(propertyResult);
        setMediaItems(mediaResult);
        setUnits(unitsResult);
        setPricings(unitDetails.map((item) => item.pricing));
        setCalendars(unitDetails.map((item) => item.calendar));
        setBusinesses(businessesResult);
        setVerification(verificationResult);
        setSubmissionStatus(statusResult);
        setNoteValue(verificationResult.note);
        setPageNotice(
          unitDetails.some((item) => item.hasWarning)
            ? "Some unit pricing or calendar data could not be loaded fully, so the checklist is showing only the information we could confirm."
            : "",
        );
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setPageError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load this property's verification workspace right now."
            : "We couldn't load this property's verification workspace right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadVerificationPage();

    return () => {
      isActive = false;
    };
  }, [propertyId, retryKey, token]);

  const pageStatus = submissionStatus.status || property?.status || "draft";
  const canEdit = isHostPropertyEditable(pageStatus);
  const checklist = useMemo(() => {
    if (!property) {
      return null;
    }

    return getHostPropertySubmissionChecklist({
      property,
      mediaItems,
      units,
      pricings,
      calendars,
      verification,
      businesses,
    });
  }, [businesses, calendars, mediaItems, pricings, property, units, verification]);
  const missingItems = checklist?.items.filter((item) => !item.isComplete) ?? [];

  const syncPropertyStatus = (nextStatus: HostPropertySubmissionStatus) => {
    setSubmissionStatus(nextStatus);
    setProperty((current) =>
      current
        ? {
            ...current,
            status: nextStatus.status,
            rawStatus: nextStatus.rawStatus,
            updatedAt: nextStatus.updatedAt || current.updatedAt,
          }
        : current,
    );
  };

  const handleUpload = async (files: File[]) => {
    if (!token || !canEdit) {
      return;
    }

    setIsUploading(true);
    setPageError("");
    setNoteError("");
    setNoteSuccessMessage("");

    try {
      const nextVerification = await updateHostPropertyVerification(token, propertyId, {
        files,
        note: noteValue,
      });

      setVerification(nextVerification);
      setNoteValue(nextVerification.note);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNoteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !canEdit) {
      return;
    }

    setIsSavingNote(true);
    setNoteError("");
    setNoteSuccessMessage("");

    try {
      const nextVerification = await updateHostPropertyVerification(token, propertyId, {
        files: [],
        note: noteValue,
      });

      setVerification(nextVerification);
      setNoteValue(nextVerification.note);
      setNoteSuccessMessage("Verification note saved successfully.");
    } catch (requestError) {
      setNoteError(
        requestError instanceof ApiError
          ? requestError.message || "We couldn't save this verification note right now."
          : "We couldn't save this verification note right now.",
      );
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!token || !checklist?.isComplete || !canEdit) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const nextStatus = await submitHostPropertyForReview(token, propertyId);
      syncPropertyStatus(nextStatus);
    } catch (requestError) {
      setSubmitError(
        requestError instanceof ApiError
          ? requestError.message || "We couldn't submit this property for review right now."
          : "We couldn't submit this property for review right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <VerificationPageSkeleton />;
  }

  if (pageError || !property || !checklist) {
    return (
      <HostShell badge="Add Property">
        <div className="surface-card rounded-panel p-6 md:p-8">
          <p className="text-[14px] leading-7 text-text-secondary">
            {pageError || "We couldn't load this property's verification workspace right now."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Try again
            </button>
            <Link
              href={`/host/properties/${propertyId}/calendar`}
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Back to calendar
            </Link>
          </div>
        </div>
      </HostShell>
    );
  }

  return (
    <HostShell badge="Add Property">
      <HostPropertyEditorShell
        propertyId={propertyId}
        currentStep="verification"
        title={property.name || "Untitled property"}
        status={pageStatus}
        description="Verification is the final host-facing step before admin review. Attach proof, review the submission checklist, and send the property into moderation with confidence."
        headerAside={
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Verification files
            </p>
            <p className="mt-3 text-[16px] font-semibold text-text-primary">
              {verification.documents.length} file{verification.documents.length === 1 ? "" : "s"} attached
            </p>
            <p className="mt-2 text-[13px] leading-6 text-text-secondary">
              {checklist.isComplete ? "Checklist ready for submission." : `${missingItems.length} checklist item${missingItems.length === 1 ? "" : "s"} still need attention.`}
            </p>
          </div>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <HostPropertyVerificationUploader
              disabled={!canEdit}
              isUploading={isUploading}
              onUpload={handleUpload}
            />

            <HostPropertyVerificationNotesForm
              value={noteValue}
              error={noteError}
              successMessage={noteSuccessMessage}
              disabled={!canEdit}
              isSubmitting={isSavingNote}
              onChange={(value) => {
                setNoteValue(value);
                setNoteError("");
                setNoteSuccessMessage("");
              }}
              onSubmit={handleNoteSubmit}
            />

            <HostPropertyVerificationList documents={verification.documents} />
          </div>

          <div className="space-y-6">
            {pageNotice ? (
              <div className="rounded-[20px] border border-border-light bg-surface px-4 py-4 text-[14px] leading-6 text-text-secondary">
                {pageNotice}
              </div>
            ) : null}

            <HostPropertyReviewChecklist propertyId={propertyId} checklist={checklist} />

            {submitError ? (
              <div className="rounded-[20px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
                {submitError}
              </div>
            ) : null}

            <HostPropertySubmitPanel
              status={pageStatus}
              isChecklistComplete={checklist.isComplete}
              missingLabels={missingItems.map((item) => item.label)}
              isSubmitting={isSubmitting}
              disabled={!checklist.isComplete || !canEdit || isSubmitting}
              onSubmit={handleSubmitForReview}
            />

            <HostPropertySubmissionStatusCard status={submissionStatus} />
          </div>
        </div>
      </HostPropertyEditorShell>
    </HostShell>
  );
};
