"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HostShell } from "@/components/host/HostShell";
import {
  getHostPropertyEditorStepHref,
  getNextIncompleteHostPropertyStep,
} from "@/components/host/properties/hostPropertyEditor";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  createEmptyHostPropertyVerification,
  createEmptyHostUnitCalendarRules,
  createEmptyHostUnitPricing,
  getHostBusinesses,
  getHostProperty,
  getHostPropertyMedia,
  getHostPropertyUnits,
  getHostPropertyVerification,
  getHostUnitCalendar,
  getHostUnitPricing,
} from "@/lib/host";

type HostPropertyContinuePageProps = {
  propertyId: string;
};

export const HostPropertyContinuePage: React.FC<HostPropertyContinuePageProps> = ({
  propertyId,
}) => {
  const router = useRouter();
  const { token } = useAuth();
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const resumePropertyDraft = async () => {
      setError("");

      try {
        const property = await getHostProperty(token, propertyId);
        const [mediaResult, unitsResult, verificationResult, businessesResult] =
          await Promise.allSettled([
            getHostPropertyMedia(token, propertyId),
            getHostPropertyUnits(token, propertyId),
            getHostPropertyVerification(token, propertyId),
            getHostBusinesses(token),
          ]);

        const mediaItems = mediaResult.status === "fulfilled" ? mediaResult.value : [];
        const units = unitsResult.status === "fulfilled" ? unitsResult.value : [];
        const verification =
          verificationResult.status === "fulfilled"
            ? verificationResult.value
            : {
                ...createEmptyHostPropertyVerification(),
                propertyId,
              };
        const businesses =
          businessesResult.status === "fulfilled" ? businessesResult.value : [];

        const unitDetails = await Promise.all(
          units.map(async (unit) => {
            const [pricingResult, calendarResult] = await Promise.allSettled([
              getHostUnitPricing(token, unit.id),
              getHostUnitCalendar(token, unit.id),
            ]);

            return {
              pricing:
                pricingResult.status === "fulfilled"
                  ? pricingResult.value
                  : {
                      ...createEmptyHostUnitPricing(),
                      unitId: unit.id,
                    },
              calendar:
                calendarResult.status === "fulfilled"
                  ? calendarResult.value
                  : {
                      ...createEmptyHostUnitCalendarRules(),
                      unitId: unit.id,
                    },
            };
          }),
        );

        if (!isActive) {
          return;
        }

        const nextStep = getNextIncompleteHostPropertyStep({
          property,
          mediaItems,
          units,
          pricings: unitDetails.map((item) => item.pricing),
          calendars: unitDetails.map((item) => item.calendar),
          verification,
          businesses,
        });

        router.replace(
          getHostPropertyEditorStepHref(propertyId, nextStep) ??
            `/host/properties/${propertyId}/edit?step=basics`,
        );
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't reopen this property draft right now."
            : "We couldn't reopen this property draft right now.",
        );
      }
    };

    void resumePropertyDraft();

    return () => {
      isActive = false;
    };
  }, [propertyId, retryKey, router, token]);

  if (error) {
    return (
      <HostShell badge="Add Property">
        <div className="surface-card rounded-panel p-6 md:p-8">
          <p className="text-[14px] leading-7 text-text-secondary">{error}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Try again
            </button>
            <Link
              href={`/host/properties/${propertyId}/edit?step=basics`}
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Open basics
            </Link>
            <Link
              href="/host/properties"
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Back to properties
            </Link>
          </div>
        </div>
      </HostShell>
    );
  }

  return (
    <HostShell badge="Add Property">
      <div className="surface-card rounded-panel p-6 md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          Resume draft
        </p>
        <h1 className="mt-3 font-sora text-[30px] font-bold tracking-[-0.04em] text-text-primary">
          Opening the next incomplete property step
        </h1>
        <p className="mt-4 max-w-3xl text-[14px] leading-7 text-text-secondary">
          Saved data is being checked across basics, location, media, units, pricing, calendar, and
          verification so this draft can reopen in the right place.
        </p>
      </div>
    </HostShell>
  );
};
