"use client";

import React from "react";
import { type HostPropertyStatus } from "@/lib/host";

type HostPropertySubmitPanelProps = {
  status: HostPropertyStatus;
  isChecklistComplete: boolean;
  missingLabels: string[];
  isSubmitting: boolean;
  disabled: boolean;
  onSubmit: () => void;
};

export const HostPropertySubmitPanel: React.FC<HostPropertySubmitPanelProps> = ({
  status,
  isChecklistComplete,
  missingLabels,
  isSubmitting,
  disabled,
  onSubmit,
}) => {
  const title =
    status === "submitted"
      ? "This property is already in review"
      : status === "approved"
        ? "This property is already approved"
        : status === "rejected"
          ? "Prepare the listing for resubmission"
          : "Submit this property for review";

  const description =
    status === "submitted"
      ? "The listing is with the admin team right now. You can keep watching the status card below for any review outcome."
      : status === "approved"
        ? "The listing has already cleared review. No further submission action is needed here."
        : status === "rejected"
          ? "Once the missing items below are resolved, submit the property again so the admin team can review the updated proof and listing data."
          : "Submission sends the listing to the admin review queue. Make sure the checklist is complete before you continue.";

  const buttonLabel =
    status === "rejected" ? "Resubmit for review" : "Submit for review";

  const showButton = status === "draft" || status === "rejected";

  return (
    <div className="surface-card rounded-panel p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
        Final handoff
      </p>
      <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
        {title}
      </h2>
      <p className="mt-4 text-[14px] leading-7 text-text-secondary">{description}</p>

      {!isChecklistComplete && showButton ? (
        <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50/80 px-4 py-4">
          <p className="text-[13px] font-semibold text-red-700">Submission is still blocked.</p>
          <p className="mt-2 text-[14px] leading-6 text-red-700">
            Finish these items first: {missingLabels.join(", ")}.
          </p>
        </div>
      ) : null}

      {isChecklistComplete && showButton ? (
        <div className="mt-5 rounded-[20px] border border-primary/30 bg-primary-light/80 px-4 py-4 text-[14px] leading-6 text-text-primary">
          The checklist is complete. This listing is ready for admin review submission.
        </div>
      ) : null}

      {showButton ? (
        <div className="mt-6">
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled}
            className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
          >
            {isSubmitting ? "Submitting..." : buttonLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
};
