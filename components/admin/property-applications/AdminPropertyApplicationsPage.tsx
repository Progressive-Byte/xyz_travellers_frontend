"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  getAdminPropertyApplication,
  getAdminPropertyApplications,
  reviewAdminPropertyApplication,
  type AdminPropertyApplicationDetail,
  type AdminPropertyApplicationReviewAction,
  type AdminPropertyApplicationSummary,
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

const getHostName = (item: AdminPropertyApplicationSummary | AdminPropertyApplicationDetail) => {
  const name = `${item.host.firstName} ${item.host.lastName}`.trim();
  return name || "Unnamed host";
};

const getStatusTone = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-50 text-green-700";
    case "rejected":
      return "bg-red-50 text-red-700";
    case "submitted":
      return "bg-amber-50 text-amber-700";
    case "draft":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-surface text-text-primary";
  }
};

export const AdminPropertyApplicationsPage: React.FC = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState<AdminPropertyApplicationSummary[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<AdminPropertyApplicationDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [sortOrder, setSortOrder] = useState<"submitted-desc" | "submitted-asc" | "name-asc">(
    "submitted-desc",
  );
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);
  const [action, setAction] = useState<AdminPropertyApplicationReviewAction>("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const [pageError, setPageError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadApplications = async () => {
      setIsLoading(true);
      setPageError("");

      try {
        const queue = await getAdminPropertyApplications(token);

        if (!isActive) {
          return;
        }

        setApplications(queue);
        setSelectedPropertyId((current) => {
          if (current && queue.some((item) => item.id === current)) {
            return current;
          }

          return queue[0]?.id ?? "";
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setApplications([]);
        setSelectedPropertyId("");
        setSelectedDetail(null);
        setPageError(
          error instanceof ApiError
            ? error.message || "Unable to load the property application inventory right now."
            : "Unable to load the property application inventory right now.",
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

  useEffect(() => {
    if (!token || !selectedPropertyId) {
      setSelectedDetail(null);
      setDetailError("");
      return;
    }

    let isActive = true;

    const loadDetail = async () => {
      setIsDetailLoading(true);
      setDetailError("");

      try {
        const detail = await getAdminPropertyApplication(token, selectedPropertyId);

        if (!isActive) {
          return;
        }

        setSelectedDetail(detail);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setSelectedDetail(null);
        setDetailError(
          error instanceof ApiError
            ? error.message || "Unable to load the selected property review snapshot."
            : "Unable to load the selected property review snapshot.",
        );
      } finally {
        if (isActive) {
          setIsDetailLoading(false);
        }
      }
    };

    void loadDetail();

    return () => {
      isActive = false;
    };
  }, [selectedPropertyId, token]);

  const counts = useMemo(
    () =>
      applications.reduce<Record<string, number>>(
        (accumulator, item) => {
          const status = item.status || "unknown";
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
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        item.propertyName,
        item.id,
        item.propertyTypeId,
        item.ownershipType,
        item.status,
        item.city,
        item.country,
        item.host.id,
        getHostName(item),
        item.host.email,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });

    nextApplications.sort((left, right) => {
      if (sortOrder === "name-asc") {
        return left.propertyName.localeCompare(right.propertyName);
      }

      const leftTimestamp = left.submittedAt ? new Date(left.submittedAt).getTime() : 0;
      const rightTimestamp = right.submittedAt ? new Date(right.submittedAt).getTime() : 0;

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

  const selectedSummary = useMemo(
    () => applications.find((item) => item.id === selectedPropertyId) ?? null,
    [applications, selectedPropertyId],
  );

  const canReviewSelectedProperty = selectedDetail?.property.status === "submitted";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !selectedDetail) {
      return;
    }

    setPageError("");
    setSuccessMessage("");

    if (!canReviewSelectedProperty) {
      setPageError("Only submitted properties can be approved or rejected.");
      return;
    }

    if (action === "reject" && !rejectionReason.trim()) {
      setPageError("Rejection reason is required when rejecting a property application.");
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewResult = await reviewAdminPropertyApplication(token, selectedDetail.property.id, {
        action,
        rejectionReason,
      });

      setApplications((current) =>
        current.map((item) =>
          item.id === selectedDetail.property.id
            ? {
                ...item,
                status: reviewResult.status,
                reviewedAt: reviewResult.reviewedAt,
                rejectionReason: reviewResult.rejectionReason,
              }
            : item,
        ),
      );
      setSelectedDetail((current) =>
        current
          ? {
              ...current,
              property: {
                ...current.property,
                status: reviewResult.status,
                reviewedAt: reviewResult.reviewedAt,
                reviewedBy: reviewResult.reviewedBy,
                rejectionReason: reviewResult.rejectionReason,
              },
            }
          : current,
      );
      setRejectionReason("");
      setAction("approve");
      setSuccessMessage(
        action === "approve"
          ? "Property approved successfully."
          : "Property rejected successfully.",
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setPageError(error.message);
      } else {
        setPageError("Unable to review the property application right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminShell
      badge="Admin Moderation"
      title="Property Applications"
      subtitle="Review property submissions in a compact moderation inventory, then approve or reject from the selected property panel."
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
          Loading property applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="surface-card rounded-[28px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            No properties yet
          </p>
          <h2 className="mt-2.5 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            The property inventory is empty
          </h2>
          <p className="mt-3 max-w-3xl text-[14px] leading-6 text-text-secondary">
            Property drafts, submissions, approvals, and rejections will appear here when hosts start
            creating listings.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Refresh inventory
            </button>
          </div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="surface-card rounded-[28px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            No matching properties
          </p>
          <h2 className="mt-2.5 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
            Adjust your search or filters
          </h2>
          <p className="mt-3 max-w-3xl text-[14px] leading-6 text-text-secondary">
            No properties match the current search, status filter, and sorting combination.
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
                    {filteredApplications.length} propert{filteredApplications.length === 1 ? "y" : "ies"}
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
                    placeholder="Search by property, host, email, city, country, or status"
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
                    <option value="name-asc">Property name</option>
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
              <table className="min-w-[1120px] w-full border-collapse">
                <thead className="bg-[rgba(245,243,237,0.92)]">
                  <tr className="border-b border-border-light">
                    {["Property", "Host", "Location", "Status", "Units", "Readiness", "Actions"].map(
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
                    const isSelected = selectedPropertyId === item.id;

                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-border-light last:border-b-0 ${
                          isSelected
                            ? "bg-primary-light/45"
                            : "odd:bg-white even:bg-[rgba(255,252,247,0.45)] hover:bg-[rgba(255,252,247,0.9)]"
                        }`}
                      >
                        <td className="px-4 py-3.5 align-middle">
                          <div className="min-w-0 max-w-[280px]">
                            <p className="truncate text-[14px] font-semibold text-text-primary">
                              {item.propertyName || "Untitled property"}
                            </p>
                            <p className="mt-1 truncate text-[12px] leading-5 text-text-secondary">
                              {item.id}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 align-middle">
                          <div className="min-w-0 max-w-[220px]">
                            <p className="truncate text-[13px] font-medium text-text-primary">
                              {getHostName(item)}
                            </p>
                            <p className="mt-1 truncate text-[12px] leading-5 text-text-secondary">
                              {item.host.email}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 align-middle text-[13px] text-text-primary">
                          {[item.city, item.country].filter(Boolean).join(", ") || "Not provided"}
                        </td>

                        <td className="px-4 py-3.5 align-middle">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium capitalize ${getStatusTone(
                              item.status,
                            )}`}
                          >
                            {item.status || "unknown"}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 align-middle text-[13px] text-text-primary">
                          {item.unitsCount ?? 0}
                        </td>

                        <td className="px-4 py-3.5 align-middle text-[13px] text-text-primary">
                          <div className="space-y-1">
                            <p>Docs: {item.hasVerificationDocuments ? "Yes" : "No"}</p>
                            <p>Cover: {item.hasCoverMedia ? "Yes" : "No"}</p>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 align-middle">
                          <button
                            type="button"
                            onClick={() => setSelectedPropertyId(item.id)}
                            className="inline-flex items-center justify-center rounded-[12px] bg-primary px-3 py-1.5 text-[12px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
                          >
                            Review
                          </button>
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

          <div className="mt-4 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
            <section className="surface-card rounded-[28px] p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                Selected Property
              </p>

              {isDetailLoading ? (
                <div className="mt-4 rounded-[24px] border border-border-light bg-surface px-5 py-6 text-[14px] leading-6 text-text-secondary">
                  Loading selected property snapshot...
                </div>
              ) : detailError ? (
                <div className="mt-4 rounded-[24px] border border-red-200 bg-red-50/80 px-5 py-6 text-[14px] leading-6 text-red-700">
                  {detailError}
                </div>
              ) : selectedDetail ? (
                <>
                  <h2 className="mt-4 font-sora text-[26px] font-bold tracking-[-0.04em] text-text-primary">
                    {selectedDetail.property.propertyName || "Untitled property"}
                  </h2>
                  <div className="mt-5 space-y-3 text-[14px] leading-6 text-text-secondary">
                    <p>
                      <span className="font-semibold text-text-primary">Property ID:</span>{" "}
                      {selectedDetail.property.id}
                    </p>
                    <p>
                      <span className="font-semibold text-text-primary">Host:</span>{" "}
                      {getHostName(selectedDetail)} ({selectedDetail.host.email})
                    </p>
                    <p>
                      <span className="font-semibold text-text-primary">Ownership:</span>{" "}
                      {selectedDetail.property.ownershipType || "Not provided"}
                    </p>
                    <p>
                      <span className="font-semibold text-text-primary">Location:</span>{" "}
                      {[selectedDetail.property.city, selectedDetail.property.country]
                        .filter(Boolean)
                        .join(", ") || "Not provided"}
                    </p>
                    <p>
                      <span className="font-semibold text-text-primary">Status:</span>{" "}
                      {selectedDetail.property.status || "unknown"}
                    </p>
                    <p>
                      <span className="font-semibold text-text-primary">Submitted:</span>{" "}
                      {formatDate(selectedDetail.property.submittedAt)}
                    </p>
                    <p>
                      <span className="font-semibold text-text-primary">Reviewed:</span>{" "}
                      {formatDate(selectedDetail.property.reviewedAt)}
                    </p>
                    {selectedDetail.property.rejectionReason ? (
                      <p>
                        <span className="font-semibold text-text-primary">Rejection reason:</span>{" "}
                        {selectedDetail.property.rejectionReason}
                      </p>
                    ) : null}
                    {selectedDetail.property.description ? (
                      <p>
                        <span className="font-semibold text-text-primary">Description:</span>{" "}
                        {selectedDetail.property.description}
                      </p>
                    ) : null}
                    {selectedDetail.property.houseRules ? (
                      <p>
                        <span className="font-semibold text-text-primary">House rules:</span>{" "}
                        {selectedDetail.property.houseRules}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-5 rounded-[24px] border border-border-light bg-surface px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                      Moderation readiness
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[18px] border border-border-light bg-white px-4 py-3">
                        <p className="text-[12px] text-text-secondary">Units</p>
                        <p className="mt-1 text-[16px] font-semibold text-text-primary">
                          {selectedDetail.units.length}
                        </p>
                      </div>
                      <div className="rounded-[18px] border border-border-light bg-white px-4 py-3">
                        <p className="text-[12px] text-text-secondary">Verification docs</p>
                        <p className="mt-1 text-[16px] font-semibold text-text-primary">
                          {selectedDetail.verification?.documents.length ?? 0}
                        </p>
                      </div>
                      <div className="rounded-[18px] border border-border-light bg-white px-4 py-3">
                        <p className="text-[12px] text-text-secondary">Media items</p>
                        <p className="mt-1 text-[16px] font-semibold text-text-primary">
                          {selectedDetail.media.length}
                        </p>
                      </div>
                      <div className="rounded-[18px] border border-border-light bg-white px-4 py-3">
                        <p className="text-[12px] text-text-secondary">Business linked</p>
                        <p className="mt-1 text-[16px] font-semibold text-text-primary">
                          {selectedDetail.business ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : selectedSummary ? (
                <div className="mt-4 rounded-[24px] border border-dashed border-border bg-surface px-5 py-6 text-[14px] leading-6 text-text-secondary">
                  Select this property again to reload its moderation snapshot.
                </div>
              ) : (
                <div className="mt-4 rounded-[24px] border border-dashed border-border bg-surface px-5 py-6 text-[14px] leading-6 text-text-secondary">
                  Select a property row from the inventory to review its submitted materials.
                </div>
              )}
            </section>

            <section className="surface-card rounded-[28px] p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                Review Panel
              </p>

              {isDetailLoading ? (
                <div className="mt-4 rounded-[24px] border border-border-light bg-surface px-5 py-6 text-[14px] leading-6 text-text-secondary">
                  Loading review panel...
                </div>
              ) : detailError ? (
                <div className="mt-4 rounded-[24px] border border-red-200 bg-red-50/80 px-5 py-6 text-[14px] leading-6 text-red-700">
                  {detailError}
                </div>
              ) : selectedDetail ? (
                <>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-[24px] border border-border-light bg-surface px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                        Verification documents
                      </p>
                      {selectedDetail.verification?.documents.length ? (
                        <div className="mt-3 space-y-3">
                          {selectedDetail.verification.documents.map((document, index) => (
                            <div
                              key={`${document.documentType}-${index}`}
                              className="rounded-[20px] border border-border-light bg-white px-4 py-4"
                            >
                              <p className="text-[14px] font-semibold capitalize text-text-primary">
                                {document.documentType.replace(/_/g, " ")}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {document.fileUrl ? (
                                  <a
                                    href={document.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-3 py-2 text-[12px] font-semibold text-text-primary shadow-soft"
                                  >
                                    Open file
                                  </a>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-[14px] leading-6 text-text-secondary">
                          No verification documents were returned for this property.
                        </p>
                      )}
                    </div>

                    <div className="rounded-[24px] border border-border-light bg-surface px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                        Media and units
                      </p>
                      <div className="mt-3 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-[20px] border border-border-light bg-white px-4 py-4">
                          <p className="text-[13px] font-semibold text-text-primary">
                            Media ({selectedDetail.media.length})
                          </p>
                          {selectedDetail.media.length > 0 ? (
                            <div className="mt-3 space-y-2">
                              {selectedDetail.media.slice(0, 4).map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between gap-3 rounded-[14px] border border-border-light px-3 py-2"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-[12px] font-medium text-text-primary">
                                      {item.caption || item.originalFileName || item.storedFileName || item.id}
                                    </p>
                                    <p className="mt-1 text-[11px] text-text-secondary">
                                      {item.isCover ? "Cover media" : item.mediaType || "Media"}
                                    </p>
                                  </div>
                                  {item.mediaUrl ? (
                                    <a
                                      href={item.mediaUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center justify-center rounded-[12px] border border-border bg-white px-3 py-1.5 text-[11px] font-semibold text-text-primary"
                                    >
                                      Open
                                    </a>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-3 text-[13px] leading-6 text-text-secondary">
                              No media returned.
                            </p>
                          )}
                        </div>

                        <div className="rounded-[20px] border border-border-light bg-white px-4 py-4">
                          <p className="text-[13px] font-semibold text-text-primary">
                            Units ({selectedDetail.units.length})
                          </p>
                          {selectedDetail.units.length > 0 ? (
                            <div className="mt-3 space-y-2">
                              {selectedDetail.units.map((unit) => (
                                <div
                                  key={unit.id}
                                  className="rounded-[14px] border border-border-light px-3 py-2"
                                >
                                  <p className="text-[12px] font-medium text-text-primary">
                                    {unit.unitName || "Untitled unit"}
                                  </p>
                                  <p className="mt-1 text-[11px] text-text-secondary">
                                    {[
                                      unit.unitNumber ? `No. ${unit.unitNumber}` : "",
                                      unit.unitType,
                                      unit.capacity ? `Capacity ${unit.capacity}` : "",
                                    ]
                                      .filter(Boolean)
                                      .join(" • ") || "Unit details not provided"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-3 text-[13px] leading-6 text-text-secondary">
                              No units returned.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedDetail.business ? (
                      <div className="rounded-[24px] border border-border-light bg-surface px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                          Business linkage
                        </p>
                        <div className="mt-3 rounded-[20px] border border-border-light bg-white px-4 py-4 text-[13px] leading-6 text-text-secondary">
                          <p>
                            <span className="font-semibold text-text-primary">Business:</span>{" "}
                            {selectedDetail.business.businessName}
                          </p>
                          <p>
                            <span className="font-semibold text-text-primary">Contact:</span>{" "}
                            {selectedDetail.business.contactName} ({selectedDetail.business.contactEmail})
                          </p>
                          <p>
                            <span className="font-semibold text-text-primary">Documents:</span>{" "}
                            {selectedDetail.business.selectedDocuments.length}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                    <label className="block">
                      <span className="mb-2 block text-[13px] font-semibold text-text-primary">Action</span>
                      <select
                        value={action}
                        onChange={(event) => setAction(event.target.value as AdminPropertyApplicationReviewAction)}
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
                          placeholder="Explain why the property application is being rejected."
                          className={`${inputClassName} min-h-[120px] resize-y`}
                        />
                      </label>
                    ) : null}

                    {!canReviewSelectedProperty ? (
                      <div className="rounded-[18px] border border-border-light bg-surface px-4 py-3 text-[13px] leading-6 text-text-secondary">
                        This property is currently <span className="font-semibold text-text-primary">{selectedDetail.property.status}</span>.
                        Only submitted properties can be approved or rejected.
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={isSubmitting || !canReviewSelectedProperty}
                      className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting
                        ? "Saving review..."
                        : action === "approve"
                          ? "Approve property"
                          : "Reject property"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="mt-4 rounded-[24px] border border-dashed border-border bg-surface px-5 py-6 text-[14px] leading-6 text-text-secondary">
                  Choose a property row first to inspect its moderation snapshot and submit the admin decision.
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </AdminShell>
  );
};
