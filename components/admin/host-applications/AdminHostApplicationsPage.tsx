"use client";

import React, { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  reviewAdminHostApplication,
  type AdminHostApplicationReviewAction,
  type AdminHostApplicationReviewResult,
} from "@/lib/admin";

const inputClassName =
  "w-full rounded-[20px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium";

export const AdminHostApplicationsPage: React.FC = () => {
  const { token } = useAuth();
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState<AdminHostApplicationReviewAction>("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewResult, setReviewResult] = useState<AdminHostApplicationReviewResult | null>(null);

  const submittedDocuments = useMemo(
    () => reviewResult?.verification.documents ?? [],
    [reviewResult?.verification.documents],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    if (!userId.trim()) {
      setErrorMessage("Enter the target host user ID first.");
      return;
    }

    if (action === "reject" && !rejectionReason.trim()) {
      setErrorMessage("Rejection reason is required when rejecting a host application.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await reviewAdminHostApplication(token, userId.trim(), {
        action,
        rejectionReason,
      });

      setReviewResult(result);
      setSuccessMessage(
        action === "approve"
          ? "Host application approved successfully. The user needs to log in again to receive updated roles."
          : "Host application rejected successfully.",
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to review the host application right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminShell
      badge="Admin Moderation"
      title="Host Applications"
      subtitle="Use the documented review endpoint to approve or reject a host application by target user ID."
    >
      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="surface-card rounded-[28px] p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
            Review Action
          </p>
          <h2 className="mt-4 font-sora text-[26px] font-bold tracking-[-0.04em] text-text-primary">
            Direct host application review
          </h2>
          <p className="mt-3 text-[14px] leading-6 text-text-secondary">
            The scoped admin API set currently provides the review action endpoint, not a list endpoint.
            This first workspace is therefore built as a direct review form by user ID.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold text-text-primary">Target user ID</span>
              <input
                type="text"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="6a4f7c54ae97f293a4032eff"
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold text-text-primary">Action</span>
              <select
                value={action}
                onChange={(event) => setAction(event.target.value as AdminHostApplicationReviewAction)}
                className={inputClassName}
              >
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
              </select>
            </label>

            {action === "reject" ? (
              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-text-primary">
                  Rejection reason
                </span>
                <textarea
                  rows={4}
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  placeholder="Explain why the host application is being rejected."
                  className={`${inputClassName} min-h-[120px] resize-y`}
                />
              </label>
            ) : null}

            {errorMessage ? (
              <div className="rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-[22px] border border-primary/35 bg-primary-light/80 px-4 py-4 text-[14px] leading-6 text-text-primary">
                {successMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
            >
              {isSubmitting ? "Saving review..." : action === "approve" ? "Approve application" : "Reject application"}
            </button>
          </form>
        </section>

        <section className="surface-card rounded-[28px] p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
            Latest Response
          </p>
          {reviewResult ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[22px] border border-border-light bg-surface px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Verification status
                  </p>
                  <p className="mt-3 text-[15px] font-semibold capitalize text-text-primary">
                    {reviewResult.verification.status || "Unknown"}
                  </p>
                </div>
                <div className="rounded-[22px] border border-border-light bg-surface px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    User roles
                  </p>
                  <p className="mt-3 text-[15px] font-semibold text-text-primary">
                    {reviewResult.user.roles.join(", ") || "No roles returned"}
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-border-light bg-surface px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                  Reviewed user
                </p>
                <div className="mt-3 space-y-1 text-[14px] leading-6 text-text-secondary">
                  <p>
                    <span className="font-semibold text-text-primary">User ID:</span> {reviewResult.user.id}
                  </p>
                  <p>
                    <span className="font-semibold text-text-primary">Email:</span> {reviewResult.user.email}
                  </p>
                  <p>
                    <span className="font-semibold text-text-primary">Submitted at:</span>{" "}
                    {reviewResult.verification.submittedAt || "Not provided"}
                  </p>
                  {reviewResult.verification.rejectionReason ? (
                    <p>
                      <span className="font-semibold text-text-primary">Rejection reason:</span>{" "}
                      {reviewResult.verification.rejectionReason}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[24px] border border-border-light bg-surface px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                  Submitted documents
                </p>
                {submittedDocuments.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {submittedDocuments.map((document, index) => (
                      <div
                        key={`${document.documentType}-${index}`}
                        className="rounded-[20px] border border-border-light bg-white px-4 py-4"
                      >
                        <p className="text-[14px] font-semibold capitalize text-text-primary">
                          {document.documentType.replace(/_/g, " ")}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {document.documentFront ? (
                            <a
                              href={document.documentFront}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-3 py-2 text-[12px] font-semibold text-text-primary shadow-soft"
                            >
                              Open front
                            </a>
                          ) : null}
                          {document.documentBack ? (
                            <a
                              href={document.documentBack}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-3 py-2 text-[12px] font-semibold text-text-primary shadow-soft"
                            >
                              Open back
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-[14px] leading-6 text-text-secondary">
                    No documents were returned in the latest review response.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-[24px] border border-dashed border-border bg-surface px-5 py-6 text-[14px] leading-6 text-text-secondary">
              Review results will appear here after the first approve or reject action.
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
};
