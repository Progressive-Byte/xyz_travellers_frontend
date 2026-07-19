"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HostShell } from "@/components/host/HostShell";
import { HostReservationsList } from "@/components/host/operations/reservations/HostReservationsList";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  getHostReservations,
  type HostReservation,
  type HostReservationStatus,
} from "@/lib/host";

const reservationFilters: Array<{ label: string; value: "all" | HostReservationStatus }> = [
  { label: "All stays", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Rejected", value: "rejected" },
];

const ReservationsSkeleton = () => (
  <HostShell badge="Operations">
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="surface-card rounded-panel h-36 animate-pulse bg-white/75" />
        ))}
      </div>
      <div className="surface-card rounded-panel h-[520px] animate-pulse bg-white/75" />
    </div>
  </HostShell>
);

const MetricCard: React.FC<{ label: string; value: number; helper: string }> = ({
  label,
  value,
  helper,
}) => (
  <div className="surface-card rounded-panel p-5">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
      {label}
    </p>
    <p className="mt-4 font-sora text-[30px] font-bold tracking-[-0.04em] text-text-primary">{value}</p>
    <p className="mt-2 text-[14px] leading-6 text-text-secondary">{helper}</p>
  </div>
);

export const HostReservationsPage: React.FC = () => {
  const { token } = useAuth();
  const [reservations, setReservations] = useState<HostReservation[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<"all" | HostReservationStatus>("all");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadReservations = async () => {
      setIsLoading(true);
      setError("");

      try {
        const results = await getHostReservations(token);

        if (!isActive) {
          return;
        }

        setReservations(results);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load your reservation activity right now."
            : "We couldn't load your reservation activity right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadReservations();

    return () => {
      isActive = false;
    };
  }, [retryKey, token]);

  const filteredReservations = useMemo(() => {
    if (selectedFilter === "all") {
      return reservations;
    }

    return reservations.filter((reservation) => reservation.status === selectedFilter);
  }, [reservations, selectedFilter]);

  const counts = useMemo(
    () => ({
      total: reservations.length,
      pending: reservations.filter((reservation) => reservation.status === "pending").length,
      accepted: reservations.filter((reservation) => reservation.status === "accepted").length,
      completed: reservations.filter((reservation) => reservation.status === "completed").length,
    }),
    [reservations],
  );

  if (isLoading) {
    return <ReservationsSkeleton />;
  }

  return (
    <HostShell
      badge="Operations"
      title="Reservations"
      subtitle="Review booking flow, stay timing, and guest readiness from one operational workspace."
      headerAside={
        <>
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Attention now
            </p>
            <p className="mt-3 text-[17px] font-semibold text-text-primary">{counts.pending} pending</p>
          </div>
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Accepted stays
            </p>
            <p className="mt-3 text-[17px] font-semibold text-text-primary">{counts.accepted} active</p>
          </div>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Total reservations"
          value={counts.total}
          helper="All booking records tied to your host inventory."
        />
        <MetricCard
          label="Pending response"
          value={counts.pending}
          helper="Requests that still need a host decision."
        />
        <MetricCard
          label="Completed stays"
          value={counts.completed}
          helper="Past reservations already closed out in the system."
        />
      </div>

      <div className="mt-8 surface-card rounded-panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Stay queue
            </p>
            <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
              Booking activity
            </h2>
            <p className="mt-3 max-w-3xl text-[14px] leading-7 text-text-secondary">
              Filter by status to focus on requests that need review or inspect every reservation in one stream.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {reservationFilters.map((filter) => {
              const isActive = selectedFilter === filter.value;

              return (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-text-primary shadow-glow"
                      : "border border-border-light bg-white text-text-secondary hover:border-text-primary/15 hover:text-text-primary"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-border bg-[rgba(184,82,82,0.05)] px-5 py-6">
            <p className="text-[15px] font-semibold text-text-primary">Reservations unavailable</p>
            <p className="mt-2 max-w-2xl text-[14px] leading-7 text-text-secondary">{error}</p>
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="mt-5 inline-flex items-center justify-center rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Reload reservations
            </button>
          </div>
        ) : filteredReservations.length > 0 ? (
          <div className="mt-6">
            <HostReservationsList reservations={filteredReservations} />
          </div>
        ) : (
          <div className="mt-6 rounded-[24px] border border-dashed border-border-light bg-white/80 px-5 py-6">
            <p className="text-[15px] font-semibold text-text-primary">No reservations in this view yet</p>
            <p className="mt-2 max-w-2xl text-[14px] leading-7 text-text-secondary">
              Approved listings will surface here once guests start requesting or completing stays.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/host/properties"
                className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
              >
                Review properties
              </Link>
              <Link
                href="/host/dashboard"
                className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </HostShell>
  );
};
