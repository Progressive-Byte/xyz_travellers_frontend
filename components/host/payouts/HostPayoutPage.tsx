"use client";

import React, { useEffect, useMemo, useState } from "react";
import { HostPayoutHistorySection } from "@/components/host/operations/payouts/HostPayoutHistorySection";
import { HostShell } from "@/components/host/HostShell";
import { HostPayoutForm } from "@/components/host/payouts/HostPayoutForm";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  createEmptyHostPayoutProfile,
  getHostPayoutHistory,
  getHostPayoutHistoryDetail,
  getHostPayoutProfile,
  getHostPayoutSetupStatus,
  updateHostPayoutProfile,
  type HostPayoutHistoryItem,
  type HostPayoutProfile,
} from "@/lib/host";

type PayoutFormErrors = Partial<Record<keyof HostPayoutProfile | "form", string>>;

const PayoutSkeleton = () => (
  <HostShell badge="Setup">
    <div className="grid gap-6 lg:grid-cols-[1.25fr_0.8fr]">
      <div className="surface-card rounded-panel h-[620px] animate-pulse bg-white/75" />
      <div className="space-y-6">
        <div className="surface-card rounded-panel h-52 animate-pulse bg-white/75" />
        <div className="surface-card rounded-panel h-60 animate-pulse bg-white/75" />
      </div>
    </div>
  </HostShell>
);

export const HostPayoutPage: React.FC = () => {
  const { token } = useAuth();
  const [values, setValues] = useState<HostPayoutProfile>(createEmptyHostPayoutProfile());
  const [errors, setErrors] = useState<PayoutFormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [historyRetryKey, setHistoryRetryKey] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [payoutHistory, setPayoutHistory] = useState<HostPayoutHistoryItem[]>([]);
  const [selectedPayoutId, setSelectedPayoutId] = useState("");
  const [selectedPayout, setSelectedPayout] = useState<HostPayoutHistoryItem | null>(null);
  const [historyError, setHistoryError] = useState("");
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadPayoutProfile = async () => {
      setIsLoading(true);
      setErrors({});
      setSuccessMessage("");

      try {
        const payoutProfile = await getHostPayoutProfile(token);

        if (!isActive) {
          return;
        }

        setValues(payoutProfile ?? createEmptyHostPayoutProfile());
      } catch (error) {
        if (!isActive) {
          return;
        }

        setValues(createEmptyHostPayoutProfile());
        setErrors({
          form:
            error instanceof ApiError
              ? error.message || "We couldn't load your payout setup right now."
              : "We couldn't load your payout setup right now.",
        });
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadPayoutProfile();

    return () => {
      isActive = false;
    };
  }, [retryKey, token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadPayoutHistory = async () => {
      setIsHistoryLoading(true);
      setHistoryError("");

      try {
        const history = await getHostPayoutHistory(token);

        if (!isActive) {
          return;
        }

        setPayoutHistory(history);
        setSelectedPayoutId((current) => {
          if (current && history.some((item) => item.id === current)) {
            return current;
          }

          return history[0]?.id ?? "";
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setPayoutHistory([]);
        setSelectedPayoutId("");
        setSelectedPayout(null);
        setHistoryError(
          error instanceof ApiError
            ? error.message || "We couldn't load payout history right now."
            : "We couldn't load payout history right now.",
        );
      } finally {
        if (isActive) {
          setIsHistoryLoading(false);
        }
      }
    };

    void loadPayoutHistory();

    return () => {
      isActive = false;
    };
  }, [historyRetryKey, token]);

  useEffect(() => {
    if (!token || !selectedPayoutId) {
      setSelectedPayout(null);
      return;
    }

    let isActive = true;

    const loadSelectedPayout = async () => {
      try {
        const payout = await getHostPayoutHistoryDetail(token, selectedPayoutId);

        if (!isActive) {
          return;
        }

        setSelectedPayout(payout);
      } catch (error) {
        if (!isActive) {
          return;
        }

        const fallback = payoutHistory.find((item) => item.id === selectedPayoutId) ?? null;
        setSelectedPayout(fallback);

        if (error instanceof ApiError && !historyError) {
          setHistoryError(error.message || "We couldn't load one payout detail right now.");
        }
      }
    };

    void loadSelectedPayout();

    return () => {
      isActive = false;
    };
  }, [historyError, payoutHistory, selectedPayoutId, token]);

  const setupStatus = useMemo(() => getHostPayoutSetupStatus(values), [values]);

  const updateValue = (field: keyof HostPayoutProfile, value: string) => {
    setValues((current) => {
      const nextValues = { ...current, [field]: value };

      if (field === "payoutMethod" && value !== current.payoutMethod) {
        if (value === "bank_transfer") {
          nextValues.walletProvider = "";
          nextValues.walletNumber = "";
        }

        if (value === "mobile_wallet") {
          nextValues.bankName = "";
          nextValues.branchName = "";
          nextValues.accountNumber = "";
          nextValues.routingNumber = "";
          nextValues.swiftCode = "";
        }

        if (!value) {
          nextValues.bankName = "";
          nextValues.branchName = "";
          nextValues.accountNumber = "";
          nextValues.routingNumber = "";
          nextValues.swiftCode = "";
          nextValues.walletProvider = "";
          nextValues.walletNumber = "";
        }
      }

      return nextValues;
    });

    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    setSuccessMessage("");
  };

  const validate = () => {
    const nextErrors: PayoutFormErrors = {};

    if (!values.accountHolderName.trim()) {
      nextErrors.accountHolderName = "Please enter the account holder name.";
    }

    if (!values.payoutMethod) {
      nextErrors.payoutMethod = "Please choose a payout method.";
    }

    if (!values.billingAddress.trim()) {
      nextErrors.billingAddress = "Please enter the billing address.";
    }

    if (!values.country.trim()) {
      nextErrors.country = "Please enter the payout country.";
    }

    if (!values.currency.trim()) {
      nextErrors.currency = "Please enter the payout currency.";
    }

    if (values.payoutMethod === "bank_transfer") {
      if (!values.bankName.trim()) {
        nextErrors.bankName = "Please enter the bank name.";
      }

      if (!values.accountNumber.trim()) {
        nextErrors.accountNumber = "Please enter the account number.";
      }
    }

    if (values.payoutMethod === "mobile_wallet") {
      if (!values.walletProvider.trim()) {
        nextErrors.walletProvider = "Please enter the wallet provider.";
      }

      if (!values.walletNumber.trim()) {
        nextErrors.walletNumber = "Please enter the wallet number.";
      }
    }

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const payoutProfile = await updateHostPayoutProfile(token, values);
      setValues(payoutProfile);
      setSuccessMessage("Payout profile saved.");
    } catch (error) {
      setErrors({
        form:
          error instanceof ApiError
            ? error.message || "We couldn't save your payout setup right now."
            : "We couldn't save your payout setup right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <PayoutSkeleton />;
  }

  return (
    <HostShell
      badge="Setup"
      headerAside={
        <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Payout readiness
          </p>
          <p className="mt-3 text-[17px] font-semibold text-text-primary">
            {setupStatus.isComplete ? "Payout setup ready" : `${setupStatus.missingFields.length} updates left`}
          </p>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.8fr]">
        <HostPayoutForm
          values={values}
          errors={errors}
          isSubmitting={isSubmitting}
          successMessage={successMessage}
          onChange={updateValue}
          onSubmit={handleSubmit}
        />

        <div className="space-y-6">
          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Payout setup
            </p>
            <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              Keep payout instructions ready
            </h2>
            <div className="mt-5 space-y-3">
              {[
                "Use bank transfer for traditional account payouts.",
                "Use mobile wallet if your payout flow depends on wallet settlement.",
                "Billing, country, and currency keep your payout profile consistent.",
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

          {!setupStatus.isComplete ? (
            <div className="surface-card rounded-panel p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Still missing
              </p>
              <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                Finish payout readiness
              </h2>
              <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                Complete the remaining payout details so later earnings and payout flows start from a ready profile.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {setupStatus.missingFields.map((field) => (
                  <span
                    key={field}
                    className="rounded-full border border-border-light bg-white/80 px-3 py-1.5 text-[12px] font-semibold text-text-primary"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Retry
            </p>
            <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              Reload payout data
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-text-secondary">
              If payout details changed elsewhere, refresh the current setup record before editing again.
            </p>
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="mt-5 inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Reload payout setup
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <HostPayoutHistorySection
          items={payoutHistory}
          selectedPayout={selectedPayout}
          isLoading={isHistoryLoading}
          error={historyError}
          onRetry={() => setHistoryRetryKey((current) => current + 1)}
          onSelect={setSelectedPayoutId}
        />
      </div>
    </HostShell>
  );
};
