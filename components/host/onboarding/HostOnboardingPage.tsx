"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HostOnboardingShell } from "@/components/host/onboarding/HostOnboardingShell";
import { HostOnboardingStatusCard } from "@/components/host/onboarding/HostOnboardingStatusCard";
import { HostOnboardingWorkspace } from "@/components/host/onboarding/HostOnboardingWorkspace";
import {
  getHostOnboardingViewState,
  type HostOnboardingViewState,
} from "@/components/host/onboarding/hostOnboarding";
import { useAuth } from "@/context/AuthContext";
import {
  createHostIdentityVerificationDraft,
  getHostIdentityVerification,
  submitHostEnable,
  updateHostIdentityVerificationDraft,
  type HostIdentityVerification,
  type HostIdentityVerificationDocument,
} from "@/lib/host";

const OnboardingLoadingState = () => (
  <HostOnboardingShell
    title="Host onboarding"
    subtitle="We are checking your current host application status so we can send you to the right next step."
  >
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
      <div className="surface-card rounded-panel h-80 animate-pulse bg-white/75" />
      <div className="space-y-6">
        <div className="surface-card rounded-panel h-40 animate-pulse bg-white/75" />
        <div className="surface-card rounded-panel h-40 animate-pulse bg-white/75" />
      </div>
    </div>
  </HostOnboardingShell>
);

export const HostOnboardingPage: React.FC = () => {
  const router = useRouter();
  const { token } = useAuth();
  const getEmptyDocument = (): HostIdentityVerificationDocument => ({
    documentType: "",
    documentFront: "",
    documentBack: "",
  });
  const sanitizeDocument = (
    document?: Partial<HostIdentityVerificationDocument> | null,
  ): HostIdentityVerificationDocument => ({
    documentType: typeof document?.documentType === "string" ? document.documentType : "",
    documentFront: typeof document?.documentFront === "string" ? document.documentFront : "",
    documentBack: typeof document?.documentBack === "string" ? document.documentBack : "",
  });
  const sanitizeDocuments = (
    nextDocuments?: Array<Partial<HostIdentityVerificationDocument> | null> | null,
  ) => {
    if (!nextDocuments?.length) {
      return [getEmptyDocument()];
    }

    return nextDocuments.map((document) => sanitizeDocument(document));
  };
  const [verification, setVerification] = useState<HostIdentityVerification | null>(null);
  const [documents, setDocuments] = useState<HostIdentityVerificationDocument[]>([getEmptyDocument()]);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadStatus = async () => {
      setIsLoading(true);
      setError("");
      setFormError("");
      setSaveError("");
      setSaveSuccess("");
      setSubmitError("");

      try {
        const nextVerification = await getHostIdentityVerification(token);

        if (!isActive) {
          return;
        }

        setVerification(nextVerification);
        setDocuments(sanitizeDocuments(nextVerification?.documents));
      } catch {
        if (!isActive) {
          return;
        }

        setError("We couldn't load your host onboarding status right now. Please try again.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadStatus();

    return () => {
      isActive = false;
    };
  }, [retryKey, token]);

  const viewState = useMemo<HostOnboardingViewState>(
    () => getHostOnboardingViewState(verification),
    [verification],
  );

  const normalizeDocumentsForSave = () => {
    const normalizedDocuments = documents
      .map((document) => ({
        documentType:
          typeof document.documentType === "string" ? document.documentType.trim() : "",
        documentFront:
          typeof document.documentFront === "string" ? document.documentFront.trim() : "",
        documentBack:
          typeof document.documentBack === "string" ? document.documentBack.trim() : "",
      }))
      .filter(
        (document) => document.documentType || document.documentFront || document.documentBack,
      );

    if (normalizedDocuments.length === 0) {
      setFormError("Add at least one identity document before saving the draft.");
      return null;
    }

    const hasInvalidDocument = normalizedDocuments.some(
      (document) => !document.documentType || !document.documentFront,
    );

    if (hasInvalidDocument) {
      setFormError("Each saved document needs a document type and a front document URL.");
      return null;
    }

    setFormError("");
    return normalizedDocuments;
  };

  const persistDraft = async (showSuccessMessage: boolean) => {
    if (!token) {
      return null;
    }

    const normalizedDocuments = normalizeDocumentsForSave();

    if (!normalizedDocuments) {
      return null;
    }

    setIsSaving(true);
    setSaveError("");
    setSubmitError("");

    try {
      const nextVerification = verification?.id
        ? await updateHostIdentityVerificationDraft(token, {
            ...normalizedDocuments[0],
          })
        : await createHostIdentityVerificationDraft(token, {
            ...normalizedDocuments[0],
          });

      setVerification(nextVerification);
      setDocuments(sanitizeDocuments(nextVerification.documents));

      if (showSuccessMessage) {
        setSaveSuccess("Host application draft saved.");
      }

      return nextVerification;
    } catch (requestError) {
      setSaveError(
        requestError instanceof Error
          ? requestError.message || "We couldn't save your host application draft right now."
          : "We couldn't save your host application draft right now.",
      );
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <OnboardingLoadingState />;
  }

  const sharedActions = (
    <>
      <button
        type="button"
        onClick={() => setRetryKey((current) => current + 1)}
        className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
      >
        Refresh status
      </button>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:bg-surface"
      >
        Back to homepage
      </Link>
    </>
  );

  const renderPrimaryContent = () => {
    if (error) {
      return (
        <HostOnboardingStatusCard
          badge="Onboarding unavailable"
          title="We couldn't load your host status"
          description={error}
          accent="danger"
          note="Your host access is still protected. Retry once your connection is stable or sign in again if the issue keeps happening."
          actions={sharedActions}
        />
      );
    }

    if (viewState === "noDraft" || viewState === "draft" || viewState === "rejected") {
      return (
        <HostOnboardingWorkspace
          documents={documents}
          status={verification}
          rejectionReason={viewState === "rejected" ? verification?.rejectionReason : null}
          formError={formError}
          saveError={saveError}
          saveSuccess={saveSuccess}
          submitError={submitError}
          isSaving={isSaving}
          isSubmitting={isSubmitting}
          onDocumentChange={(index, field, value) => {
            setDocuments((current) =>
              current.map((document, currentIndex) =>
                currentIndex === index ? { ...document, [field]: value } : document,
              ),
            );
            setFormError("");
            setSaveError("");
            setSaveSuccess("");
            setSubmitError("");
          }}
          onAddDocument={() => {
            setDocuments((current) => [...current, getEmptyDocument()]);
            setFormError("");
            setSaveError("");
            setSaveSuccess("");
            setSubmitError("");
          }}
          onRemoveDocument={(index) => {
            setDocuments((current) =>
              current.filter((_, currentIndex) => currentIndex !== index).length > 0
                ? current.filter((_, currentIndex) => currentIndex !== index)
                : [getEmptyDocument()],
            );
            setFormError("");
            setSaveError("");
            setSaveSuccess("");
            setSubmitError("");
          }}
          onSaveDraft={async () => {
            await persistDraft(true);
          }}
          onSubmitApplication={async () => {
            if (!token) {
              return;
            }

            setIsSubmitting(true);
            setSubmitError("");
            setSaveError("");
            setSaveSuccess("");

            try {
              const savedVerification = await persistDraft(false);

              if (!savedVerification) {
                return;
              }

              const nextStatus = await submitHostEnable(token);
              setVerification({
                ...savedVerification,
                ...nextStatus,
              });
            } catch (requestError) {
              setSubmitError(
                requestError instanceof Error
                  ? requestError.message || "We couldn't submit your host request right now."
                  : "We couldn't submit your host request right now.",
              );
            } finally {
              setIsSubmitting(false);
            }
          }}
          onRefresh={() => setRetryKey((current) => current + 1)}
        />
      );
    }

    if (viewState === "submitted") {
      return (
        <HostOnboardingStatusCard
          badge="Under review"
          title="Your host application has been submitted"
          description="Your onboarding request is currently waiting for review. We will keep sending you here until your approved host role is active in your session."
          accent="warning"
          note="Check back here later for updates. Once your host role is active, this route will send you into the real portal automatically."
          actions={sharedActions}
        />
      );
    }

    return (
      <HostOnboardingStatusCard
        badge="Approved on backend"
        title="Your approval looks ahead of your current session"
        description="We found an approved onboarding status, but your current session still does not have live host access. Refreshing your session or signing in again should resolve it."
        accent="success"
        note="If your host role is already active after refresh, this route will send you to the dashboard automatically."
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                router.refresh();
                setRetryKey((current) => current + 1);
              }}
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Refresh session
            </button>
            <Link
              href="/auth?mode=login&intent=host"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:bg-surface"
            >
              Sign in again
            </Link>
          </>
        }
      />
    );
  };

  return (
    <HostOnboardingShell
      title="Complete your host onboarding"
      subtitle="If your account is not approved yet, this page explains your current status and what happens next before full host portal access opens."
    >
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <div>{renderPrimaryContent()}</div>

        <div className="space-y-6">
          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              What happens here
            </p>
            <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              Follow the onboarding journey clearly
            </h2>
            <div className="mt-5 space-y-3">
              {[
                "Check whether you still need to start, continue, or wait on a host application.",
                "See draft, submitted, rejected, or approved-on-backend status without guessing.",
                "Understand the next best action before full host access opens.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[20px] border border-border-light bg-white/80 px-4 py-3 text-[14px] leading-6 text-text-primary"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Current status
            </p>
            <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              {verification?.rawStatus ? verification.rawStatus : "No application yet"}
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-text-secondary">
              {verification?.updatedAt
                ? `Last update recorded: ${new Date(verification.updatedAt).toLocaleDateString("en-BD", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}.`
                : "As soon as an onboarding draft or review record exists, this panel will reflect it here."}
            </p>
          </div>
        </div>
      </div>
    </HostOnboardingShell>
  );
};
