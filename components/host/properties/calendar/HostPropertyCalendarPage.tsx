"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { HostShell } from "@/components/host/HostShell";
import { HostPropertyBlockDatesForm } from "@/components/host/properties/calendar/HostPropertyBlockDatesForm";
import { HostPropertyBlockedDatesList } from "@/components/host/properties/calendar/HostPropertyBlockedDatesList";
import { HostPropertyCalendarRulesForm } from "@/components/host/properties/calendar/HostPropertyCalendarRulesForm";
import { HostPropertyCalendarUnitSelector } from "@/components/host/properties/calendar/HostPropertyCalendarUnitSelector";
import { HostPropertyEditorShell } from "@/components/host/properties/HostPropertyEditorShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  blockHostUnitDates,
  createEmptyHostUnitCalendarRules,
  getHostProperty,
  getHostPropertyUnits,
  getHostUnitAvailabilityPreview,
  getHostUnitCalendar,
  isHostPropertyEditable,
  unblockHostUnitDates,
  updateHostUnitCalendarRules,
  type BlockHostUnitDatesPayload,
  type HostPropertyDetail,
  type HostPropertyUnit,
  type HostUnitAvailabilityPreview,
  type HostUnitBlockedDate,
  type HostUnitCalendarRules,
} from "@/lib/host";

type HostPropertyCalendarPageProps = {
  propertyId: string;
};

type RulesErrors = Partial<
  Record<keyof Pick<HostUnitCalendarRules, "minimumStay" | "maximumStay"> | "form", string>
>;
type BlockErrors = Partial<Record<keyof BlockHostUnitDatesPayload | "form", string>>;

const CalendarPageSkeleton = () => (
  <HostShell badge="Add Property">
    <div className="space-y-6">
      <div className="surface-card rounded-panel h-72 animate-pulse bg-white/75" />
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="surface-card rounded-panel h-[280px] animate-pulse bg-white/75" />
          <div className="surface-card rounded-panel h-[260px] animate-pulse bg-white/75" />
        </div>
        <div className="space-y-6">
          <div className="surface-card rounded-panel h-[320px] animate-pulse bg-white/75" />
          <div className="surface-card rounded-panel h-[280px] animate-pulse bg-white/75" />
        </div>
      </div>
    </div>
  </HostShell>
);

const createEmptyBlockPayload = (): BlockHostUnitDatesPayload => ({
  startDate: "",
  endDate: "",
  note: "",
});

const isNumericFieldValid = (value: string) => !value.trim() || !Number.isNaN(Number(value));

export const HostPropertyCalendarPage: React.FC<HostPropertyCalendarPageProps> = ({ propertyId }) => {
  const { token } = useAuth();
  const [property, setProperty] = useState<HostPropertyDetail | null>(null);
  const [units, setUnits] = useState<HostPropertyUnit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [rules, setRules] = useState<HostUnitCalendarRules>(createEmptyHostUnitCalendarRules());
  const [availability, setAvailability] = useState<HostUnitAvailabilityPreview | null>(null);
  const [blockValues, setBlockValues] = useState<BlockHostUnitDatesPayload>(createEmptyBlockPayload());
  const [pageError, setPageError] = useState("");
  const [calendarError, setCalendarError] = useState("");
  const [rulesErrors, setRulesErrors] = useState<RulesErrors>({});
  const [blockErrors, setBlockErrors] = useState<BlockErrors>({});
  const [rulesSuccessMessage, setRulesSuccessMessage] = useState("");
  const [blockSuccessMessage, setBlockSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [isSavingRules, setIsSavingRules] = useState(false);
  const [isBlockingDates, setIsBlockingDates] = useState(false);
  const [activeUnblockId, setActiveUnblockId] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadCalendarPage = async () => {
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
            ? requestError.message || "We couldn't load this property's calendar workspace right now."
            : "We couldn't load this property's calendar workspace right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadCalendarPage();

    return () => {
      isActive = false;
    };
  }, [propertyId, retryKey, token]);

  useEffect(() => {
    if (!token || !selectedUnitId) {
      setRules(createEmptyHostUnitCalendarRules());
      setAvailability(null);
      return;
    }

    let isActive = true;

    const loadSelectedUnitCalendar = async () => {
      setIsCalendarLoading(true);
      setCalendarError("");
      setRulesErrors({});
      setBlockErrors({});
      setRulesSuccessMessage("");
      setBlockSuccessMessage("");

      try {
        const [calendarResult, availabilityResult] = await Promise.all([
          getHostUnitCalendar(token, selectedUnitId),
          getHostUnitAvailabilityPreview(token, selectedUnitId),
        ]);

        if (!isActive) {
          return;
        }

        setRules(calendarResult);
        setAvailability(availabilityResult);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setCalendarError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load this unit's calendar right now."
            : "We couldn't load this unit's calendar right now.",
        );
      } finally {
        if (isActive) {
          setIsCalendarLoading(false);
        }
      }
    };

    void loadSelectedUnitCalendar();

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

  const refreshSelectedUnitCalendar = async () => {
    if (!token || !selectedUnitId) {
      return;
    }

    const [calendarResult, availabilityResult] = await Promise.all([
      getHostUnitCalendar(token, selectedUnitId),
      getHostUnitAvailabilityPreview(token, selectedUnitId),
    ]);
    setRules(calendarResult);
    setAvailability(availabilityResult);
  };

  const validateRules = () => {
    const nextErrors: RulesErrors = {};

    if (!isNumericFieldValid(rules.minimumStay)) {
      nextErrors.minimumStay = "Minimum stay should be a valid number.";
    }

    if (!isNumericFieldValid(rules.maximumStay)) {
      nextErrors.maximumStay = "Maximum stay should be a valid number.";
    }

    return nextErrors;
  };

  const validateBlockValues = () => {
    const nextErrors: BlockErrors = {};

    if (!blockValues.startDate) {
      nextErrors.startDate = "Please choose a start date.";
    }

    if (!blockValues.endDate) {
      nextErrors.endDate = "Please choose an end date.";
    }

    if (blockValues.startDate && blockValues.endDate && blockValues.endDate < blockValues.startDate) {
      nextErrors.endDate = "End date should be on or after the start date.";
    }

    return nextErrors;
  };

  const handleRulesChange = (field: keyof Pick<HostUnitCalendarRules, "minimumStay" | "maximumStay">, value: string) => {
    setRules((current) => ({ ...current, [field]: value }));
    setRulesErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    setRulesSuccessMessage("");
  };

  const handleBlockChange = (field: keyof BlockHostUnitDatesPayload, value: string) => {
    setBlockValues((current) => ({ ...current, [field]: value }));
    setBlockErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    setBlockSuccessMessage("");
  };

  const handleRulesSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !selectedUnitId || !canEdit) {
      return;
    }

    const nextErrors = validateRules();

    if (Object.keys(nextErrors).length > 0) {
      setRulesErrors(nextErrors);
      setRulesSuccessMessage("");
      return;
    }

    setIsSavingRules(true);
    setRulesErrors({});
    setRulesSuccessMessage("");

    try {
      const nextRules = await updateHostUnitCalendarRules(token, selectedUnitId, {
        minimumStay: rules.minimumStay,
        maximumStay: rules.maximumStay,
      });

      setRules((current) => ({
        ...current,
        minimumStay: nextRules.minimumStay,
        maximumStay: nextRules.maximumStay,
        note: nextRules.note,
      }));
      setRulesSuccessMessage("Calendar rules updated successfully.");
      await refreshSelectedUnitCalendar();
    } catch (requestError) {
      setRulesErrors({
        form:
          requestError instanceof ApiError
            ? requestError.message || "We couldn't save these calendar rules right now."
            : "We couldn't save these calendar rules right now.",
      });
    } finally {
      setIsSavingRules(false);
    }
  };

  const handleBlockSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !selectedUnitId || !canEdit) {
      return;
    }

    const nextErrors = validateBlockValues();

    if (Object.keys(nextErrors).length > 0) {
      setBlockErrors(nextErrors);
      setBlockSuccessMessage("");
      return;
    }

    setIsBlockingDates(true);
    setBlockErrors({});
    setBlockSuccessMessage("");

    try {
      await blockHostUnitDates(token, selectedUnitId, blockValues);
      await refreshSelectedUnitCalendar();
      setBlockValues(createEmptyBlockPayload());
      setBlockSuccessMessage("Blocked dates updated successfully.");
    } catch (requestError) {
      setBlockErrors({
        form:
          requestError instanceof ApiError
            ? requestError.message || "We couldn't block these dates right now."
            : "We couldn't block these dates right now.",
      });
    } finally {
      setIsBlockingDates(false);
    }
  };

  const handleUnblock = async (blockedDate: HostUnitBlockedDate) => {
    if (!token || !selectedUnitId || !canEdit) {
      return;
    }

    setActiveUnblockId(blockedDate.id || `${blockedDate.startDate}-${blockedDate.endDate}`);
    setBlockErrors({});
    setBlockSuccessMessage("");

    try {
      await unblockHostUnitDates(token, selectedUnitId, blockedDate);
      await refreshSelectedUnitCalendar();
      setBlockSuccessMessage("Blocked dates updated successfully.");
    } catch (requestError) {
      setBlockErrors({
        form:
          requestError instanceof ApiError
            ? requestError.message || "We couldn't unblock these dates right now."
            : "We couldn't unblock these dates right now.",
      });
    } finally {
      setActiveUnblockId(null);
    }
  };

  if (isLoading) {
    return <CalendarPageSkeleton />;
  }

  if (pageError || !property) {
    return (
      <HostShell badge="Add Property">
        <div className="surface-card rounded-panel p-6 md:p-8">
          <p className="text-[14px] leading-7 text-text-secondary">
            {pageError || "We couldn't load this property's calendar workspace right now."}
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
              href={`/host/properties/${propertyId}/pricing`}
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Back to pricing
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
        currentStep="calendar"
        title={property.name || "Untitled property"}
        status={property.status}
        description="Calendar controls keep unit availability honest. Set minimum and maximum stay rules, then block dates intentionally before verification and submission arrive."
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
              Calendar setup depends on inventory
            </h2>
            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-text-secondary">
              Stay rules and blocked dates are configured per unit. Create at least one unit first, then
              come back here to shape its availability.
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
              <HostPropertyCalendarUnitSelector
                units={units}
                selectedUnitId={selectedUnitId}
                onSelect={setSelectedUnitId}
              />

              <HostPropertyBlockedDatesList
                blockedDates={rules.blockedDates}
                disabled={!canEdit}
                activeUnblockId={activeUnblockId}
                onUnblock={handleUnblock}
              />

              <div className="surface-card rounded-panel p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Navigation
                </p>
                <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                  Ready for the next stage
                </h2>
                <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                  Pricing remains available in the previous step. Verification and review stay intentionally
                  ahead as the next chunk.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/host/properties/${propertyId}/pricing`}
                    className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                  >
                    Back to pricing
                  </Link>
                  <Link
                    href="/host/properties"
                    className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                  >
                    View properties
                  </Link>
                </div>
              </div>
            </div>

            {calendarError ? (
              <div className="surface-card rounded-panel p-6">
                <p className="text-[14px] leading-7 text-text-secondary">{calendarError}</p>
              </div>
            ) : isCalendarLoading ? (
              <div className="space-y-6">
                <div className="surface-card rounded-panel h-[280px] animate-pulse bg-white/75" />
                <div className="surface-card rounded-panel h-[260px] animate-pulse bg-white/75" />
              </div>
            ) : (
              <div className="space-y-6">
                <HostPropertyCalendarRulesForm
                  values={rules}
                  errors={rulesErrors}
                  successMessage={rulesSuccessMessage}
                  isSubmitting={isSavingRules}
                  disabled={!canEdit}
                  onChange={handleRulesChange}
                  onSubmit={handleRulesSubmit}
                />

                <HostPropertyBlockDatesForm
                  values={blockValues}
                  errors={blockErrors}
                  successMessage={blockSuccessMessage}
                  isSubmitting={isBlockingDates}
                  disabled={!canEdit}
                  onChange={handleBlockChange}
                  onSubmit={handleBlockSubmit}
                />

                {availability ? (
                  <div className="surface-card rounded-panel p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      Availability preview
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[20px] border border-border-light bg-white/80 px-4 py-4">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                          Available dates
                        </p>
                        <p className="mt-2 text-[20px] font-semibold text-text-primary">
                          {availability.availableDates.length}
                        </p>
                      </div>
                      <div className="rounded-[20px] border border-border-light bg-white/80 px-4 py-4">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                          Blocked dates
                        </p>
                        <p className="mt-2 text-[20px] font-semibold text-text-primary">
                          {availability.blockedDates.length}
                        </p>
                      </div>
                    </div>
                    {availability.summary ? (
                      <p className="mt-4 text-[14px] leading-7 text-text-secondary">{availability.summary}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}
      </HostPropertyEditorShell>
    </HostShell>
  );
};
