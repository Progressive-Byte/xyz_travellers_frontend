"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  getAdminHostApplications,
  reviewAdminHostApplication,
  type AdminHostApplicationReviewAction,
  type AdminHostApplicationQueueItem,
} from "@/lib/admin";

const inputClassName =
  "w-full rounded-[20px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium";

const formatDate = (value: string | null) => {
  if (!value) {
    return "Not provided";
  }

  return new Date(value).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getApplicantName = (item: AdminHostApplicationQueueItem) => {
  const name = `${item.user.firstName} ${item.user.lastName}`.trim();
  return name || "Unnamed applicant";
};

export const AdminHostApplicationsPage: React.FC = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState<AdminHostApplicationQueueItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [sortOrder, setSortOrder] = useState<"submitted-desc" | "submitted-asc" | "name-asc">(
    "submitted-desc",
  );
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);
  const [action, setAction] = useState<AdminHostApplicationReviewAction>("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewingUserId, setReviewingUserId] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadApplications = async () => {
      setIsLoading(true);
      setPageError("");

      try {
        const queue = await getAdminHostApplications(token);

        if (!isActive) {
          return;
        }

        setApplications(queue);
        setSelectedUserId((current) => {
          if (current && queue.some((item) => item.user.id === current)) {
            return current;
          }

          return queue[0]?.user.id ?? "";
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setApplications([]);
        setSelectedUserId("");
        setPageError(
          error instanceof ApiError
            ? error.message || "Unable to load the host application queue right now."
            : "Unable to load the host application queue right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadApplications();

    return () => {
      isActive = false;
    };
  }, [retryKey, token]);

  const counts = useMemo(
    () =>
      applications.reduce<Record<string, number>>(
        (accumulator, item) => {
          const status = item.verification.status || "unknown";
          accumulator.total = (accumulator.total ?? 0) + 1;
          accumulator[status] = (accumulator[status] ?? 0) + 1;
          return accumulator;
        },
        { total: 0 },
      ),
    [applications],
  );

  const statusTabs = useMemo(
    () => [
      { value: "all", label: "All", count: counts.total ?? 0 },
      ...Object.entries(counts)
        .filter(([key]) => key !== "total")
        .map(([key, count]) => ({
          value: key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          count,
        })),
    ],
    [counts],
  );

  const filteredApplications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const nextApplications = applications.filter((item) => {
      const status = item.verification.status || "unknown";

      if (statusFilter !== "all" && status !== statusFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        getApplicantName(item),
        item.user.email,
        item.user.id,
        item.verification.userId,
        item.verification.status,
        ...item.user.roles,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });

    nextApplications.sort((left, right) => {
      if (sortOrder === "name-asc") {
        return getApplicantName(left).localeCompare(getApplicantName(right));
      }

      const leftTimestamp = left.verification.submittedAt
        ? new Date(left.verification.submittedAt).getTime()
        : 0;
      const rightTimestamp = right.verification.submittedAt
        ? new Date(right.verification.submittedAt).getTime()
        : 0;

      if (sortOrder === "submitted-asc") {
        return leftTimestamp - rightTimestamp;
      }

      return rightTimestamp - leftTimestamp;
    });

    return nextApplications;
  }, [applications, searchQuery, sortOrder, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));
  const pagedApplications = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredApplications.slice(startIndex, startIndex + pageSize);
  }, [filteredApplications, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, searchQuery, sortOrder, statusFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const selectedApplication = useMemo(
    () => applications.find((item) => item.user.id === selectedUserId) ?? null,
    [applications, selectedUserId],
  );

  const submittedDocuments = selectedApplication?.verification.documents ?? [];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !selectedApplication) {
      return;
    }

    setPageError("");
    setSuccessMessage("");

    if (action === "reject" && !rejectionReason.trim()) {
      setPageError("Rejection reason is required when rejecting a host application.");
      return;
    }

    setIsSubmitting(true);
    setReviewingUserId(selectedApplication.user.id);

    try {
      await reviewAdminHostApplication(token, selectedApplication.user.id, {
        action,
        rejectionReason,
      });

      setApplications((current) => current.filter((item) => item.user.id !== selectedApplication.user.id));
      setSelectedUserId((current) => {
        if (current !== selectedApplication.user.id) {
          return current;
        }

        const remaining = applications.filter((item) => item.user.id !== selectedApplication.user.id);
        return remaining[0]?.user.id ?? "";
      });
      setRejectionReason("");
      setAction("approve");
      setSuccessMessage(
        action === "approve"
          ? "Host application approved successfully. The user needs to log in again to receive updated roles."
          : "Host application rejected successfully.",
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setPageError(error.message);
      } else {
        setPageError("Unable to review the host application right now.");
      }
    } finally {
      setIsSubmitting(false);
      setReviewingUserId("");
    }
  };

  return (
    <AdminShell
      badge="Admin Moderation"
      title="Host Applications"
      subtitle="Review the submitted host application queue in a compact table workspace, then approve or reject from the selected application panel."
    >
      {pageError ? (
        <div className="mb-4 rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
          {pageError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-4 rounded-[22px] border border-primary/35 bg-primary-light/80 px-4 py-4 text-[14px] leading-6 text-text-primary">
          {successMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="surface-card rounded-[28px] p-6 text-[14px] text-text-secondary">
          Loading host application queue...
        </div>
      ) : applications.length === 0 ? (
        <div className="surface-card rounded-[28px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            No pending applications
          </p>
          <h2 className="mt-2.5 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            The host review queue is clear
          </h2>
          <p className="mt-3 max-w-3xl text-[14px] leading-6 text-text-secondary">
            New submitted host applications will appear here automatically when they enter the admin review queue.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Refresh queue
            </button>
          </div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="surface-card rounded-[28px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            No matching applications
          </p>
          <h2 className="mt-2.5 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
            Adjust your search or filters
          </h2>
          <p className="mt-3 max-w-3xl text-[14px] leading-6 text-text-secondary">
            No host applications match the current search, status filter, and sorting combination.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setSortOrder("submitted-desc");
                setPageSize(10);
              }}
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="surface-card overflow-hidden rounded-[28px]">
            <div className="border-b border-border-light px-4 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap gap-2">
                  {statusTabs.map((tab) => {
                    const isActive = statusFilter === tab.value;

                    return (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setStatusFilter(tab.value)}
                        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 ${
                          isActive
                            ? "border-primary/45 bg-primary-light text-text-primary shadow-soft"
                            : "border-border-light bg-white text-text-secondary hover:border-border hover:text-text-primary"
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] ${
                            isActive ? "bg-white text-text-primary" : "bg-surface text-text-secondary"
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[13px] text-text-secondary">
                    {filteredApplications.length} application{filteredApplications.length === 1 ? "" : "s"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRetryKey((current) => current + 1)}
                    className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,0.75fr))]">
                <label className="flex min-w-0 flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by applicant, email, user ID, or role"
                    className={inputClassName}
                  />
                </label>

                <label className="flex min-w-0 flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Sort
                  </span>
                  <select
                    value={sortOrder}
                    onChange={(event) =>
                      setSortOrder(event.target.value as "submitted-desc" | "submitted-asc" | "name-asc")
                    }
                    className={inputClassName}
                  >
                    <option value="submitted-desc">Newest submitted</option>
                    <option value="submitted-asc">Oldest submitted</option>
                    <option value="name-asc">Applicant name</option>
                  </select>
                </label>

                <label className="flex min-w-0 flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Page size
                  </span>
                  <select
                    value={pageSize}
                    onChange={(event) => setPageSize(Number(event.target.value))}
                    className={inputClassName}
                  >
                    {[5, 10, 20, 30].map((size) => (
                      <option key={size} value={size}>
                        {size} per page
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1080px] w-full border-collapse">
                <thead className="bg-[rgba(245,243,237,0.92)]">
                  <tr className="border-b border-border-light">
                    {["Applicant", "Email", "Status", "Roles", "Documents", "Submitted", "Actions"].map(
                      (heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>

                <tbody>
                  {pagedApplications.map((item) => {
                    const isSelected = selectedUserId === item.user.id;
                    const status = item.verification.status || "unknown";

                    return (
                      <tr
                        key={item.user.id}
                        className={`border-b border-border-light last:border-b-0 ${
                          isSelected
                            ? "bg-primary-light/45"
                            : "odd:bg-white even:bg-[rgba(255,252,247,0.45)] hover:bg-[rgba(255,252,247,0.9)]"
                        }`}
                      >
                        <td className="px-4 py-3.5 align-middle">
                          <div className="min-w-0 max-w-[260px]">
                            <p className="truncate text-[14px] font-semibold text-text-primary">
                              {getApplicantName(item)}
                            </p>
                            <p className="mt-1 truncate text-[12px] leading-5 text-text-secondary">
                              {item.user.id}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 align-middle text-[13px] text-text-primary">
                          {item.user.email}
                        </td>

                        <td className="px-4 py-3.5 align-middle">
                          <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-1 text-[12px] font-medium capitalize text-text-primary">
                            {status}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 align-middle text-[13px] text-text-primary">
                          {item.user.roles.join(", ") || "No roles"}
                        </td>

                        <td className="px-4 py-3.5 align-middle text-[13px] text-text-primary">
                          {item.verification.documents.length}
                        </td>

                        <td className="px-4 py-3.5 align-middle text-[13px] text-text-primary">
                          {formatDate(item.verification.submittedAt)}
                        </td>

                        <td className="px-4 py-3.5 align-middle">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedUserId(item.user.id)}
                              className="inline-flex items-center justify-center rounded-[12px] bg-primary px-3 py-1.5 text-[12px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
                            >
                              Review
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-border-light px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] text-text-secondary">
                  Page {page} of {totalPages}
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-3 py-2 text-[12px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page === totalPages}
                    className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-3 py-2 text-[12px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[0.96fr_1.04fr]">
            <section className="surface-card rounded-[28px] p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                Selected Application
              </p>
              {selectedApplication ? (
                <>
                  <h2 className="mt-4 font-sora text-[26px] font-bold tracking-[-0.04em] text-text-primary">
                    {getApplicantName(selectedApplication)}
                  </h2>
                  <div className="mt-5 space-y-3 text-[14px] leading-6 text-text-secondary">
                    <p>
                      <span className="font-semibold text-text-primary">User ID:</span>{" "}
                      {selectedApplication.user.id}
                    </p>
                    <p>
                      <span className="font-semibold text-text-primary">Email:</span>{" "}
                      {selectedApplication.user.email}
                    </p>
                    <p>
                      <span className="font-semibold text-text-primary">Roles:</span>{" "}
                      {selectedApplication.user.roles.join(", ") || "No roles"}
                    </p>
                    <p>
                      <span className="font-semibold text-text-primary">Active account:</span>{" "}
                      {selectedApplication.user.isActive ? "Yes" : "No"}
                    </p>
                    <p>
                      <span className="font-semibold text-text-primary">Submitted:</span>{" "}
                      {formatDate(selectedApplication.verification.submittedAt)}
                    </p>
                    {selectedApplication.verification.rejectionReason ? (
                      <p>
                        <span className="font-semibold text-text-primary">Rejection reason:</span>{" "}
                        {selectedApplication.verification.rejectionReason}
                      </p>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-[24px] border border-dashed border-border bg-surface px-5 py-6 text-[14px] leading-6 text-text-secondary">
                  Select an application row from the queue to review its documents and submit an admin decision.
                </div>
              )}
            </section>

            <section className="surface-card rounded-[28px] p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                Review Panel
              </p>
              {selectedApplication ? (
                <>
                  <div className="mt-4 rounded-[24px] border border-border-light bg-surface px-4 py-4">
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
                        No documents were returned for this application.
                      </p>
                    )}
                  </div>

                  <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
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

                    <button
                      type="submit"
                      disabled={isSubmitting || reviewingUserId === selectedApplication.user.id}
                      className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
                    >
                      {isSubmitting || reviewingUserId === selectedApplication.user.id
                        ? "Saving review..."
                        : action === "approve"
                          ? "Approve application"
                          : "Reject application"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="mt-4 rounded-[24px] border border-dashed border-border bg-surface px-5 py-6 text-[14px] leading-6 text-text-secondary">
                  Choose a queue item first to view documents and submit the moderation action.
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </AdminShell>
  );
};
