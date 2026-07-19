"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { HostShell } from "@/components/host/HostShell";
import { HostPropertyEditorShell } from "@/components/host/properties/HostPropertyEditorShell";
import { HostPropertyPricingForm } from "@/components/host/properties/pricing/HostPropertyPricingForm";
import { HostPropertyPricingUnitSelector } from "@/components/host/properties/pricing/HostPropertyPricingUnitSelector";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  createEmptyHostUnitPricing,
  getHostProperty,
  getHostPropertyUnits,
  getHostUnitPricing,
  isHostPropertyEditable,
  updateHostUnitPricing,
  type HostPropertyDetail,
  type HostPropertyUnit,
  type HostUnitPricing,
} from "@/lib/host";

type HostPropertyPricingPageProps = {
  propertyId: string;
};

type PricingErrors = Partial<
  Record<keyof Pick<HostUnitPricing, "basePrice" | "discountedPrice" | "currency"> | "form", string>
>;

const PricingPageSkeleton = () => (
  <HostShell badge="Add Property">
    <div className="space-y-6">
      <div className="surface-card rounded-panel h-72 animate-pulse bg-white/75" />
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="surface-card rounded-panel h-[280px] animate-pulse bg-white/75" />
          <div className="surface-card rounded-panel h-[220px] animate-pulse bg-white/75" />
        </div>
        <div className="surface-card rounded-panel h-[420px] animate-pulse bg-white/75" />
      </div>
    </div>
  </HostShell>
);

const isNumericFieldValid = (value: string) => !value.trim() || !Number.isNaN(Number(value));

export const HostPropertyPricingPage: React.FC<HostPropertyPricingPageProps> = ({ propertyId }) => {
  const { token } = useAuth();
  const [property, setProperty] = useState<HostPropertyDetail | null>(null);
  const [units, setUnits] = useState<HostPropertyUnit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [values, setValues] = useState<HostUnitPricing>(createEmptyHostUnitPricing());
  const [pricingError, setPricingError] = useState("");
  const [pageError, setPageError] = useState("");
  const [errors, setErrors] = useState<PricingErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadPricingPage = async () => {
      setIsLoading(true);
      setPageError("");

      try {
        const [propertyResult, unitsResult] = await Promise.all([
          getHostProperty(token, propertyId),
          getHostPropertyUnits(token, propertyId),
        ]);

        if (!isActive) {
          return;
        }

        setProperty(propertyResult);
        setUnits(unitsResult);
        setSelectedUnitId((current) =>
          current && unitsResult.some((unit) => unit.id === current)
            ? current
            : unitsResult[0]?.id ?? "",
        );
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setPageError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load this property's pricing workspace right now."
            : "We couldn't load this property's pricing workspace right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadPricingPage();

    return () => {
      isActive = false;
    };
  }, [propertyId, retryKey, token]);

  useEffect(() => {
    if (!token || !selectedUnitId) {
      setValues(createEmptyHostUnitPricing());
      return;
    }

    let isActive = true;

    const loadSelectedUnitPricing = async () => {
      setIsPricingLoading(true);
      setPricingError("");
      setErrors({});
      setSuccessMessage("");

      try {
        const pricing = await getHostUnitPricing(token, selectedUnitId);

        if (!isActive) {
          return;
        }

        setValues(pricing);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setPricingError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load this unit's pricing right now."
            : "We couldn't load this unit's pricing right now.",
        );
      } finally {
        if (isActive) {
          setIsPricingLoading(false);
        }
      }
    };

    void loadSelectedUnitPricing();

    return () => {
      isActive = false;
    };
  }, [selectedUnitId, token]);

  const canEdit = useMemo(
    () => (property ? isHostPropertyEditable(property.status) : false),
    [property],
  );
  const selectedUnit = useMemo(
    () => units.find((unit) => unit.id === selectedUnitId) ?? null,
    [selectedUnitId, units],
  );

  const validateForm = () => {
    const nextErrors: PricingErrors = {};

    if (!values.basePrice.trim()) {
      nextErrors.basePrice = "Please enter a base price.";
    } else if (!isNumericFieldValid(values.basePrice)) {
      nextErrors.basePrice = "Base price should be a valid number.";
    }

    if (!isNumericFieldValid(values.discountedPrice)) {
      nextErrors.discountedPrice = "Discounted price should be a valid number.";
    }

    if (!values.currency.trim()) {
      nextErrors.currency = "Please enter the currency code.";
    }

    return nextErrors;
  };

  const handleChange = (field: keyof Pick<HostUnitPricing, "basePrice" | "discountedPrice" | "currency">, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    setSuccessMessage("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !selectedUnitId || !canEdit) {
      return;
    }

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSuccessMessage("");
      return;
    }

    setIsSaving(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const pricing = await updateHostUnitPricing(token, selectedUnitId, {
        basePrice: values.basePrice,
        discountedPrice: values.discountedPrice,
        currency: values.currency,
      });

      setValues(pricing);
      setSuccessMessage("Pricing updated successfully.");
    } catch (requestError) {
      setErrors({
        form:
          requestError instanceof ApiError
            ? requestError.message || "We couldn't save this unit's pricing right now."
            : "We couldn't save this unit's pricing right now.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PricingPageSkeleton />;
  }

  if (pageError || !property) {
    return (
      <HostShell badge="Add Property">
        <div className="surface-card rounded-panel p-6 md:p-8">
          <p className="text-[14px] leading-7 text-text-secondary">
            {pageError || "We couldn't load this property's pricing workspace right now."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Try again
            </button>
            <Link
              href={`/host/properties/${propertyId}/units`}
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Back to units
            </Link>
          </div>
        </div>
      </HostShell>
    );
  }

  return (
    <HostShell badge="Add Property">
      <HostPropertyEditorShell
        propertyId={propertyId}
        currentStep="pricing"
        title={property.name || "Untitled property"}
        status={property.status}
        description="Pricing is configured per unit. Set clear base rates and currency now so calendar rules and later submission checks rest on real commercial data."
        headerAside={
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Selected unit
            </p>
            <p className="mt-3 text-[16px] font-semibold text-text-primary">
              {selectedUnit?.name || "Choose a unit"}
            </p>
          </div>
        }
      >
        {units.length === 0 ? (
          <div className="surface-card rounded-panel p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Units needed first
            </p>
            <h2 className="mt-3 font-sora text-[30px] font-bold tracking-[-0.04em] text-text-primary">
              Create inventory before pricing it
            </h2>
            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-text-secondary">
              Pricing belongs to a specific unit. Add at least one unit first, then return here to set
              the rate and currency for that inventory.
            </p>
            <div className="mt-6">
              <Link
                href={`/host/properties/${propertyId}/units`}
                className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
              >
                Open units
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <HostPropertyPricingUnitSelector
                units={units}
                selectedUnitId={selectedUnitId}
                onSelect={setSelectedUnitId}
              />

              <div className="surface-card rounded-panel p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Navigation
                </p>
                <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                  Keep setup moving
                </h2>
                <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                  Units remain editable in the previous step. Once pricing looks right, move into
                  calendar rules and blocked dates.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/host/properties/${propertyId}/units`}
                    className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                  >
                    Back to units
                  </Link>
                  <Link
                    href={`/host/properties/${propertyId}/calendar`}
                    className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
                  >
                    Open calendar
                  </Link>
                </div>
              </div>
            </div>

            {pricingError ? (
              <div className="surface-card rounded-panel p-6">
                <p className="text-[14px] leading-7 text-text-secondary">{pricingError}</p>
              </div>
            ) : isPricingLoading ? (
              <div className="surface-card rounded-panel h-[360px] animate-pulse bg-white/75" />
            ) : (
              <HostPropertyPricingForm
                values={values}
                errors={errors}
                successMessage={successMessage}
                isSubmitting={isSaving}
                disabled={!canEdit}
                onChange={handleChange}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        )}
      </HostPropertyEditorShell>
    </HostShell>
  );
};
