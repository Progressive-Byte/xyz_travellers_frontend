"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { HostShell } from "@/components/host/HostShell";
import { HostPropertyEditorShell } from "@/components/host/properties/HostPropertyEditorShell";
import { HostPropertyUnitForm } from "@/components/host/properties/units/HostPropertyUnitForm";
import { HostPropertyUnitsList } from "@/components/host/properties/units/HostPropertyUnitsList";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  createEmptyHostPropertyUnit,
  createHostPropertyUnit,
  deleteHostPropertyUnit,
  getHostAmenities,
  getHostProperty,
  getHostPropertyUnits,
  isHostPropertyEditable,
  updateHostPropertyUnit,
  type HostPropertyDetail,
  type HostPropertyReferenceOption,
  type HostPropertyUnit,
  type UpsertHostPropertyUnitPayload,
} from "@/lib/host";

type HostPropertyUnitsPageProps = {
  propertyId: string;
};

type UnitFormErrors = Partial<
  Record<keyof Pick<UpsertHostPropertyUnitPayload, "name" | "capacity" | "bedrooms" | "bathrooms" | "beds"> | "form", string>
>;

const UnitsPageSkeleton = () => (
  <HostShell badge="Add Property">
    <div className="space-y-6">
      <div className="surface-card rounded-panel h-72 animate-pulse bg-white/75" />
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="surface-card rounded-panel h-[700px] animate-pulse bg-white/75" />
          <div className="surface-card rounded-panel h-[360px] animate-pulse bg-white/75" />
        </div>
        <div className="space-y-6">
          <div className="surface-card rounded-panel h-[240px] animate-pulse bg-white/75" />
          <div className="surface-card rounded-panel h-[240px] animate-pulse bg-white/75" />
        </div>
      </div>
    </div>
  </HostShell>
);

const toUnitFormValues = (unit?: HostPropertyUnit): UpsertHostPropertyUnitPayload => {
  const emptyUnit = createEmptyHostPropertyUnit();

  return {
    name: unit?.name ?? emptyUnit.name,
    capacity: unit?.capacity ?? emptyUnit.capacity,
    bedrooms: unit?.bedrooms ?? emptyUnit.bedrooms,
    bathrooms: unit?.bathrooms ?? emptyUnit.bathrooms,
    beds: unit?.beds ?? emptyUnit.beds,
    amenities: unit?.amenities ?? emptyUnit.amenities,
    isActive: unit?.isActive ?? emptyUnit.isActive,
  };
};

const isNumericFieldValid = (value: string) => !value.trim() || !Number.isNaN(Number(value));

export const HostPropertyUnitsPage: React.FC<HostPropertyUnitsPageProps> = ({ propertyId }) => {
  const { token } = useAuth();
  const [property, setProperty] = useState<HostPropertyDetail | null>(null);
  const [units, setUnits] = useState<HostPropertyUnit[]>([]);
  const [amenities, setAmenities] = useState<HostPropertyReferenceOption[]>([]);
  const [values, setValues] = useState<UpsertHostPropertyUnitPayload>(toUnitFormValues());
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [errors, setErrors] = useState<UnitFormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingUnitId, setDeletingUnitId] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadUnitsPage = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [propertyResult, unitsResult, amenitiesResult] = await Promise.all([
          getHostProperty(token, propertyId),
          getHostPropertyUnits(token, propertyId),
          getHostAmenities(token),
        ]);

        if (!isActive) {
          return;
        }

        setProperty(propertyResult);
        setUnits(unitsResult);
        setAmenities(amenitiesResult);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load this property's units right now."
            : "We couldn't load this property's units right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadUnitsPage();

    return () => {
      isActive = false;
    };
  }, [propertyId, retryKey, token]);

  const canEdit = useMemo(
    () => (property ? isHostPropertyEditable(property.status) : false),
    [property],
  );
  const activeUnitsCount = useMemo(() => units.filter((unit) => unit.isActive).length, [units]);

  const refreshUnits = async () => {
    if (!token) {
      return;
    }

    const nextUnits = await getHostPropertyUnits(token, propertyId);
    setUnits(nextUnits);
  };

  const validateForm = () => {
    const nextErrors: UnitFormErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = "Please enter a unit name.";
    }

    if (!values.capacity.trim()) {
      nextErrors.capacity = "Please enter the guest capacity.";
    } else if (!isNumericFieldValid(values.capacity)) {
      nextErrors.capacity = "Capacity should be a valid number.";
    }

    if (!isNumericFieldValid(values.bedrooms)) {
      nextErrors.bedrooms = "Bedrooms should be a valid number.";
    }

    if (!isNumericFieldValid(values.bathrooms)) {
      nextErrors.bathrooms = "Bathrooms should be a valid number.";
    }

    if (!isNumericFieldValid(values.beds)) {
      nextErrors.beds = "Beds should be a valid number.";
    }

    return nextErrors;
  };

  const resetForm = () => {
    setValues(toUnitFormValues());
    setEditingUnitId(null);
    setErrors({});
  };

  const handleChange = (field: keyof UpsertHostPropertyUnitPayload, value: string | string[] | boolean) => {
    setValues((current) => ({ ...current, [field]: value } as UpsertHostPropertyUnitPayload));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    setSuccessMessage("");
  };

  const handleEdit = (unit: HostPropertyUnit) => {
    setEditingUnitId(unit.id);
    setValues(toUnitFormValues(unit));
    setErrors({});
    setSuccessMessage("");
  };

  const handleDelete = async (unit: HostPropertyUnit) => {
    if (!token || !canEdit) {
      return;
    }

    if (!window.confirm(`Delete "${unit.name || "this unit"}" from the property?`)) {
      return;
    }

    setDeletingUnitId(unit.id);
    setErrors({});
    setSuccessMessage("");

    try {
      await deleteHostPropertyUnit(token, propertyId, unit.id);
      await refreshUnits();

      if (editingUnitId === unit.id) {
        resetForm();
      }

      setSuccessMessage("Unit removed successfully.");
    } catch (requestError) {
      setErrors({
        form:
          requestError instanceof ApiError
            ? requestError.message || "We couldn't delete this unit right now."
            : "We couldn't delete this unit right now.",
      });
    } finally {
      setDeletingUnitId(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !canEdit) {
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
      if (editingUnitId) {
        const updatedUnit = await updateHostPropertyUnit(token, propertyId, editingUnitId, values);
        await refreshUnits();
        setValues(toUnitFormValues(updatedUnit));
        setSuccessMessage("Unit updated successfully.");
      } else {
        await createHostPropertyUnit(token, propertyId, values);
        await refreshUnits();
        setValues(toUnitFormValues());
        setSuccessMessage("Unit created successfully.");
      }
    } catch (requestError) {
      setErrors({
        form:
          requestError instanceof ApiError
            ? requestError.message || "We couldn't save this unit right now."
            : "We couldn't save this unit right now.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <UnitsPageSkeleton />;
  }

  if (error || !property) {
    return (
      <HostShell badge="Add Property">
        <div className="surface-card rounded-panel p-6 md:p-8">
          <p className="text-[14px] leading-7 text-text-secondary">
            {error || "We couldn't load this property's units right now."}
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
              href={`/host/properties/${propertyId}/media`}
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Back to media
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
        currentStep="units"
        title={property.name || "Untitled property"}
        status={property.status}
        description="Units turn the listing from a presentation draft into real inventory. Define what guests can actually book before you move into pricing and calendar controls."
        headerAside={
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Inventory count
            </p>
            <p className="mt-3 text-[16px] font-semibold text-text-primary">
              {units.length} unit{units.length === 1 ? "" : "s"} total
            </p>
          </div>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <HostPropertyUnitForm
              values={values}
              amenities={amenities}
              errors={errors}
              successMessage={successMessage}
              isSubmitting={isSaving}
              disabled={!canEdit}
              mode={editingUnitId ? "edit" : "create"}
              onChange={handleChange}
              onCancel={editingUnitId ? resetForm : undefined}
              onSubmit={handleSubmit}
            />

            {units.length === 0 ? (
              <div className="surface-card rounded-panel p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  No units yet
                </p>
                <h2 className="mt-3 font-sora text-[30px] font-bold tracking-[-0.04em] text-text-primary">
                  Create the first bookable unit
                </h2>
                <p className="mt-4 max-w-3xl text-[15px] leading-7 text-text-secondary">
                  Pricing and calendar rules are both unit-based. Start with one clean unit now, then
                  move forward into rates and blocked-date setup.
                </p>
              </div>
            ) : (
              <HostPropertyUnitsList
                units={units}
                disabled={!canEdit}
                deletingUnitId={deletingUnitId}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>

          <div className="space-y-6">
            <div className="surface-card rounded-panel p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Units summary
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[20px] border border-border-light bg-white/80 px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Total units</p>
                  <p className="mt-2 text-[20px] font-semibold text-text-primary">{units.length}</p>
                </div>
                <div className="rounded-[20px] border border-border-light bg-white/80 px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Active units</p>
                  <p className="mt-2 text-[20px] font-semibold text-text-primary">{activeUnitsCount}</p>
                </div>
              </div>
            </div>

            <div className="surface-card rounded-panel p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Workflow guidance
              </p>
              <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                Keep inventory practical
              </h2>
              <div className="mt-5 space-y-3">
                {[
                  "Use unit names that will still make sense once pricing and blocked dates are configured.",
                  "Set realistic guest capacity now so later booking controls do not drift from the real stay.",
                  "Leave a unit inactive when it should not move forward into pricing yet.",
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

            <div className="surface-card rounded-panel p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Navigation
              </p>
              <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                Keep moving through setup
              </h2>
              <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                Media remains available in the previous step. Once at least one unit exists, continue into
                pricing and then calendar rules.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/host/properties/${propertyId}/media`}
                  className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                >
                  Back to media
                </Link>
                <Link
                  href={`/host/properties/${propertyId}/pricing`}
                  className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
                >
                  Open pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </HostPropertyEditorShell>
    </HostShell>
  );
};
