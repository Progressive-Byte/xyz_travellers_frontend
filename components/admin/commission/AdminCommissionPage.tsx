"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  getAdminCommission,
  updateAdminCommission,
  type AdminCommissionConfig,
} from "@/lib/admin";

const inputClassName =
  "w-full rounded-[20px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium";

const MetricCard: React.FC<{ label: string; value: string; helper: string }> = ({
  label,
  value,
  helper,
}) => (
  <div className="rounded-[22px] border border-border-light bg-card px-5 py-4 shadow-soft">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">{label}</p>
    <p className="mt-3 font-sora text-[26px] font-bold tracking-[-0.04em] text-text-primary">{value}</p>
    <p className="mt-2 text-[13px] leading-6 text-text-secondary">{helper}</p>
  </div>
);

export const AdminCommissionPage: React.FC = () => {
  const { token } = useAuth();
  const [commission, setCommission] = useState<AdminCommissionConfig | null>(null);
  const [defaultCommissionPercent, setDefaultCommissionPercent] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadCommission = async () => {
      setIsLoading(true);
      setPageError("");

      try {
        const result = await getAdminCommission(token);

        if (!isActive) {
          return;
        }

        setCommission(result);
        setDefaultCommissionPercent(
          result.defaultCommissionPercent !== null ? String(result.defaultCommissionPercent) : "",
        );
        setNotes(result.notes);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setCommission(null);
        setDefaultCommissionPercent("");
        setNotes("");
        setPageError(
          error instanceof ApiError
            ? error.message || "Unable to load the commission configuration right now."
            : "Unable to load the commission configuration right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadCommission();

    return () => {
      isActive = false;
    };
  }, [retryKey, token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    setPageError("");
    setSuccessMessage("");

    const parsedPercent = Number(defaultCommissionPercent.trim());

    if (!Number.isFinite(parsedPercent) || parsedPercent < 0) {
      setPageError("Default commission percent must be a valid non-negative number.");
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateAdminCommission(token, {
        defaultCommissionPercent: parsedPercent,
        notes,
      });

      setCommission(result);
      setDefaultCommissionPercent(
        result.defaultCommissionPercent !== null ? String(result.defaultCommissionPercent) : "",
      );
      setNotes(result.notes);
      setSuccessMessage("Commission configuration updated successfully.");
    } catch (error) {
      setPageError(
        error instanceof ApiError
          ? error.message || "Unable to save the commission configuration right now."
          : "Unable to save the commission configuration right now.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminShell
      badge="Admin Finance"
      title="Commission"
      subtitle="Manage the active commission settings used by guest payment confirmation."
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard
            label="Active rate"
            value={
              commission?.defaultCommissionPercent !== null &&
              commission?.defaultCommissionPercent !== undefined
                ? `${commission.defaultCommissionPercent}%`
                : "Not set"
            }
            helper="This default percent is used by the payment confirmation flow."
          />
          <MetricCard
            label="Payment impact"
            value={commission?.defaultCommissionPercent !== null ? "Ready" : "Blocked"}
            helper="Guest payment confirmation depends on having an active commission configuration."
          />
        </div>

        <section className="surface-card rounded-panel p-5 sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Commission settings
            </p>
            <h2 className="mt-2 font-sora text-[26px] font-bold tracking-[-0.04em] text-text-primary">
              Update the active default commission
            </h2>
            <p className="mt-2 max-w-3xl text-[14px] leading-6 text-text-secondary">
              This is the live commission configuration used by guest payment confirmation. No real
              gateway integration is required in this version.
            </p>
          </div>

          {isLoading ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="h-28 animate-pulse rounded-[22px] bg-white/75" />
              <div className="h-28 animate-pulse rounded-[22px] bg-white/75" />
            </div>
          ) : (
            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Default commission percent
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={defaultCommissionPercent}
                    onChange={(event) => setDefaultCommissionPercent(event.target.value)}
                    placeholder="12"
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Notes
                  </span>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Standard host commission"
                    className={inputClassName}
                  />
                </label>
              </div>

              {pageError ? (
                <div className="rounded-[20px] border border-[var(--color-danger,#b42318)]/15 bg-[rgba(180,35,24,0.04)] px-4 py-3 text-[14px] text-[var(--color-danger,#b42318)]">
                  {pageError}
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded-[20px] border border-[rgba(64,145,108,0.16)] bg-[rgba(64,145,108,0.08)] px-4 py-3 text-[14px] text-[rgb(35,92,69)]">
                  {successMessage}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSaving || isLoading}
                  className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save commission"}
                </button>
                <button
                  type="button"
                  onClick={() => setRetryKey((current) => current + 1)}
                  className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                >
                  Reload
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </AdminShell>
  );
};
