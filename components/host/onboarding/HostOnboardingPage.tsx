"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HostOnboardingEmptyState } from "@/components/host/onboarding/HostOnboardingEmptyState";
import { HostOnboardingShell } from "@/components/host/onboarding/HostOnboardingShell";
import { HostOnboardingStatusCard } from "@/components/host/onboarding/HostOnboardingStatusCard";
import {
  getHostOnboardingViewState,
  type HostOnboardingViewState,
} from "@/components/host/onboarding/hostOnboarding";
import { useAuth } from "@/context/AuthContext";
import {
  getHostIdentityVerificationStatus,
  type HostIdentityVerificationStatus,
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
  const [status, setStatus] = useState<HostIdentityVerificationStatus | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadStatus = async () => {
      setIsLoading(true);
      setError("");

      try {
        const nextStatus = await getHostIdentityVerificationStatus(token);

        if (!isActive) {
          return;
        }

        setStatus(nextStatus);
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

  const viewState = useMemo<HostOnboardingViewState>(() => getHostOnboardingViewState(status), [status]);

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

    if (viewState === "noDraft") {
      return <HostOnboardingEmptyState actions={sharedActions} />;
    }

    if (viewState === "draft") {
      return (
        <HostOnboardingStatusCard
          badge="Draft saved"
          title="Your host application draft is waiting"
          description="We found an onboarding draft for this account. You are not approved as a host yet, but your application progress is already recognized."
          note="Return here when you are ready to continue the onboarding process or refresh this page to check for status changes."
          actions={sharedActions}
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

    if (viewState === "rejected") {
      return (
        <HostOnboardingStatusCard
          badge="Needs updates"
          title="Your host application needs revision"
          description="The last host onboarding submission for this account was rejected. Review the reason below, then return when you are ready to continue the onboarding process."
          accent="danger"
          rejectionReason={status?.rejectionReason}
          note="Keep the rejection reason nearby so your next update can address exactly what was requested."
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
              {status?.rawStatus ? status.rawStatus : "No application yet"}
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-text-secondary">
              {status?.updatedAt
                ? `Last update recorded: ${new Date(status.updatedAt).toLocaleDateString("en-BD", {
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
