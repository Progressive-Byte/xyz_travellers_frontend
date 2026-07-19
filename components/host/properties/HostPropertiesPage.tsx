"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { HostShell } from "@/components/host/HostShell";
import { HostPropertiesList } from "@/components/host/properties/HostPropertiesList";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { getHostProperties, type HostPropertySummary } from "@/lib/host";

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
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadProperties = async () => {
      setIsLoading(true);
      setError("");

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

  if (isLoading) {
    return <PropertiesSkeleton />;
  }

  return (
    <HostShell
      badge="Properties"
      headerAside={
        <>
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Listings total
            </p>
            <p className="mt-3 text-[17px] font-semibold text-text-primary">{counts.total}</p>
          </div>
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Drafts to continue
            </p>
            <p className="mt-3 text-[17px] font-semibold text-text-primary">{counts.draft + counts.rejected}</p>
          </div>
        </>
      }
      topbarAction={
        <Link
          href="/host/properties/new"
          className="inline-flex items-center justify-center rounded-[16px] bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
        >
          Add property
        </Link>
      }
    >
      <div className="surface-card mb-6 rounded-panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Listings overview
            </p>
            <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
              Keep drafts moving
            </h2>
            <p className="mt-3 max-w-3xl text-[14px] leading-7 text-text-secondary">
              Review draft, submitted, approved, and rejected properties in one place, then jump straight
              into the listing workflow when you are ready to add another property.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/host/properties/new"
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Add property
            </Link>
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Refresh list
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="surface-card rounded-panel p-6">
          <p className="text-[14px] leading-7 text-text-secondary">{error}</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="surface-card rounded-panel p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            No properties yet
          </p>
          <h2 className="mt-3 font-sora text-[32px] font-bold tracking-[-0.04em] text-text-primary">
            Start your first listing draft
          </h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-text-secondary">
            Your property workspace is ready. Create a draft listing now, then continue through basics
            and location before later media, units, pricing, and verification steps land.
          </p>
          <div className="mt-6">
            <Link
              href="/host/properties/new"
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Create draft property
            </Link>
          </div>
        </div>
      ) : (
        <HostPropertiesList properties={properties} />
      )}
    </HostShell>
  );
};
