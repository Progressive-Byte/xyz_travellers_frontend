"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { HostShell } from "@/components/host/HostShell";
import { HostPropertiesList } from "@/components/host/properties/HostPropertiesList";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { deleteHostProperty, getHostProperties, type HostPropertySummary } from "@/lib/host";

const PropertiesSkeleton = () => (
  <HostShell badge="Properties">
    <div className="space-y-6">
      <div className="surface-card rounded-panel h-40 animate-pulse bg-white/75" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="surface-card rounded-panel h-56 animate-pulse bg-white/75" />
        ))}
      </div>
    </div>
  </HostShell>
);

export const HostPropertiesPage: React.FC = () => {
  const { token } = useAuth();
  const [properties, setProperties] = useState<HostPropertySummary[]>([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingPropertyId, setDeletingPropertyId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | HostPropertySummary["status"]
  >("all");
  const [sortOrder, setSortOrder] = useState<"updated-desc" | "updated-asc" | "name-asc">(
    "updated-desc",
  );
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadProperties = async () => {
      setIsLoading(true);
      setError("");
      setSuccessMessage("");

      try {
        const nextProperties = await getHostProperties(token);

        if (!isActive) {
          return;
        }

        setProperties(nextProperties);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setProperties([]);
        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load your properties right now."
            : "We couldn't load your properties right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadProperties();

    return () => {
      isActive = false;
    };
  }, [retryKey, token]);

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

  const statusTabs: Array<{
    value: "all" | HostPropertySummary["status"];
    label: string;
    count: number;
  }> = [
    { value: "all", label: "All", count: counts.total },
    { value: "draft", label: "Draft", count: counts.draft },
    { value: "submitted", label: "Submitted", count: counts.submitted },
    { value: "approved", label: "Approved", count: counts.approved },
    { value: "rejected", label: "Rejected", count: counts.rejected },
  ];

  const filteredProperties = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const nextProperties = properties.filter((property) => {
      if (statusFilter !== "all" && property.status !== statusFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        property.name,
        property.city,
        property.country,
        property.propertyType,
        property.address,
        property.ownershipType,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
    });

    nextProperties.sort((left, right) => {
      if (sortOrder === "name-asc") {
        return (left.name || "Untitled property").localeCompare(right.name || "Untitled property");
      }

      const leftTimestamp = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
      const rightTimestamp = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;

      if (sortOrder === "updated-asc") {
        return leftTimestamp - rightTimestamp;
      }

      return rightTimestamp - leftTimestamp;
    });

    return nextProperties;
  }, [properties, searchQuery, sortOrder, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / pageSize));
  const pagedProperties = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredProperties.slice(startIndex, startIndex + pageSize);
  }, [filteredProperties, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, searchQuery, sortOrder, statusFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (isLoading) {
    return <PropertiesSkeleton />;
  }

  const handleDelete = async (property: HostPropertySummary) => {
    if (!token) {
      return;
    }

    setDeletingPropertyId(property.id);
    setError("");
    setSuccessMessage("");

    try {
      await deleteHostProperty(token, property.id);
      setProperties((current) => current.filter((item) => item.id !== property.id));
      setSuccessMessage("Property deleted successfully.");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message || "We couldn't delete this property right now."
          : "We couldn't delete this property right now.",
      );
    } finally {
      setDeletingPropertyId("");
    }
  };

  return (
    <HostShell
      badge="Properties"
      topbarAction={
        <Link
          href="/host/properties/new"
          className="inline-flex items-center justify-center rounded-[16px] bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
        >
          Add property
        </Link>
      }
    >
      {error ? (
        <div className="surface-card rounded-panel p-5">
          <p className="text-[13px] leading-6 text-text-secondary">{error}</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="surface-card rounded-panel p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            No properties yet
          </p>
          <h2 className="mt-2.5 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            Start your first listing draft
          </h2>
          <p className="mt-3 max-w-3xl text-[14px] leading-6 text-text-secondary">
            Your property workspace is ready. Create a draft listing now, then continue through basics
            and location before continuing into media, units, pricing, calendar, and verification.
          </p>
          <div className="mt-5">
            <Link
              href="/host/properties/new"
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Create draft property
            </Link>
          </div>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="surface-card rounded-panel p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            No matching listings
          </p>
          <h2 className="mt-2.5 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
            Adjust your search or filters
          </h2>
          <p className="mt-3 max-w-3xl text-[14px] leading-6 text-text-secondary">
            No listings match the current search, status filter, and sorting combination.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setSortOrder("updated-desc");
                setPageSize(10);
              }}
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : (
        <div className="surface-card overflow-hidden rounded-panel">
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
                  {filteredProperties.length} listing{filteredProperties.length === 1 ? "" : "s"}
                </p>
                <button
                  type="button"
                  onClick={() => setRetryKey((current) => current + 1)}
                  className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                >
                  Refresh
                </button>
                <Link
                  href="/host/properties/new"
                  className="inline-flex items-center justify-center rounded-[16px] bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
                >
                  Add property
                </Link>
              </div>
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,0.75fr))]">
              <label className="flex min-w-0 flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                  Search
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search property, city, country, type"
                  className="h-11 rounded-[16px] border border-border bg-white px-3.5 text-[14px] text-text-primary outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:border-primary/60"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                  Sort
                </span>
                <select
                  value={sortOrder}
                  onChange={(event) =>
                    setSortOrder(event.target.value as "updated-desc" | "updated-asc" | "name-asc")
                  }
                  className="h-11 rounded-[16px] border border-border bg-white px-3.5 text-[14px] text-text-primary outline-none transition-all duration-200 focus:border-primary/60"
                >
                  <option value="updated-desc">Last updated</option>
                  <option value="updated-asc">Oldest updated</option>
                  <option value="name-asc">Name A-Z</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                  Page size
                </span>
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  className="h-11 rounded-[16px] border border-border bg-white px-3.5 text-[14px] text-text-primary outline-none transition-all duration-200 focus:border-primary/60"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>
            </div>

            {successMessage ? (
              <div className="mt-4 rounded-[18px] border border-primary/25 bg-primary-light/60 px-4 py-3">
                <p className="text-[13px] leading-6 text-[rgb(35,92,69)]">{successMessage}</p>
              </div>
            ) : null}
          </div>

          <HostPropertiesList
            properties={pagedProperties}
            deletingPropertyId={deletingPropertyId}
            onDelete={handleDelete}
          />

          <div className="border-t border-border-light px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-text-secondary">
                Showing {(page - 1) * pageSize + 1}-
                {Math.min(page * pageSize, filteredProperties.length)} of {filteredProperties.length} listings
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-3.5 py-2 text-[12px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Previous
                </button>
                <div className="flex items-center rounded-[14px] border border-border-light bg-card px-3.5 py-2 text-[12px] font-semibold text-text-primary">
                  Page {page} of {totalPages}
                </div>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-3.5 py-2 text-[12px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </HostShell>
  );
};
