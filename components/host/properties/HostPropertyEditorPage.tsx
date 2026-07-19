"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HostShell } from "@/components/host/HostShell";
import { HostPropertyBasicsForm } from "@/components/host/properties/HostPropertyBasicsForm";
import { HostPropertyEditorShell } from "@/components/host/properties/HostPropertyEditorShell";
import { HostPropertyLocationForm } from "@/components/host/properties/HostPropertyLocationForm";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  createEmptyHostPropertyDetail,
  getHostAmenities,
  getHostCommissionInfo,
  getHostProperty,
  getHostPropertyTypes,
  isHostPropertyEditable,
  updateHostProperty,
  type HostPropertyCommissionInfo,
  type HostPropertyDetail,
  type HostPropertyReferenceOption,
} from "@/lib/host";

type BasicsErrors = Partial<
  Record<keyof Pick<HostPropertyDetail, "name" | "description" | "propertyType" | "ownershipType"> | "form", string>
>;

type LocationErrors = Partial<
  Record<keyof Pick<HostPropertyDetail, "address" | "city" | "country" | "lat" | "lng" | "houseRules"> | "form", string>
>;

type HostPropertyEditorPageProps = {
  propertyId: string;
};

const EditorSkeleton = () => (
  <HostShell badge="Add Property">
    <div className="space-y-6">
      <div className="surface-card rounded-panel h-72 animate-pulse bg-white/75" />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="surface-card rounded-panel h-[620px] animate-pulse bg-white/75" />
          <div className="surface-card rounded-panel h-[520px] animate-pulse bg-white/75" />
        </div>
        <div className="space-y-6">
          <div className="surface-card rounded-panel h-56 animate-pulse bg-white/75" />
          <div className="surface-card rounded-panel h-56 animate-pulse bg-white/75" />
        </div>
      </div>
    </div>
  </HostShell>
);

export const HostPropertyEditorPage: React.FC<HostPropertyEditorPageProps> = ({ propertyId }) => {
  const { token } = useAuth();
  const [values, setValues] = useState<HostPropertyDetail>(createEmptyHostPropertyDetail());
  const [propertyTypes, setPropertyTypes] = useState<HostPropertyReferenceOption[]>([]);
  const [amenities, setAmenities] = useState<HostPropertyReferenceOption[]>([]);
  const [commissionInfo, setCommissionInfo] = useState<HostPropertyCommissionInfo | null>(null);
  const [error, setError] = useState("");
  const [basicsErrors, setBasicsErrors] = useState<BasicsErrors>({});
  const [locationErrors, setLocationErrors] = useState<LocationErrors>({});
  const [basicsSuccessMessage, setBasicsSuccessMessage] = useState("");
  const [locationSuccessMessage, setLocationSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingBasics, setIsSavingBasics] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadPropertyEditor = async () => {
      setIsLoading(true);
      setError("");
      setBasicsErrors({});
      setLocationErrors({});
      setBasicsSuccessMessage("");
      setLocationSuccessMessage("");

      try {
        const [property, propertyTypesResult, amenitiesResult, commissionResult] = await Promise.all([
          getHostProperty(token, propertyId),
          getHostPropertyTypes(token),
          getHostAmenities(token),
          getHostCommissionInfo(token),
        ]);

        if (!isActive) {
          return;
        }

        setValues(property);
        setPropertyTypes(propertyTypesResult);
        setAmenities(amenitiesResult);
        setCommissionInfo(commissionResult);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load this property draft right now."
            : "We couldn't load this property draft right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadPropertyEditor();

    return () => {
      isActive = false;
    };
  }, [propertyId, retryKey, token]);

  const canEdit = useMemo(() => isHostPropertyEditable(values.status), [values.status]);

  const handleChange = (field: keyof HostPropertyDetail, value: string | string[]) => {
    setValues((current) => ({ ...current, [field]: value } as HostPropertyDetail));
    setBasicsErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    setLocationErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    setBasicsSuccessMessage("");
    setLocationSuccessMessage("");
  };

  const validateBasics = () => {
    const nextErrors: BasicsErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = "Please enter the property name.";
    }

    if (!values.description.trim()) {
      nextErrors.description = "Please add a short property description.";
    }

    if (!values.propertyType.trim()) {
      nextErrors.propertyType = "Please choose the property type.";
    }

    if (!values.ownershipType.trim()) {
      nextErrors.ownershipType = "Please choose the ownership type.";
    }

    return nextErrors;
  };

  const validateLocation = () => {
    const nextErrors: LocationErrors = {};

    if (!values.address.trim()) {
      nextErrors.address = "Please enter the property address.";
    }

    if (!values.city.trim()) {
      nextErrors.city = "Please enter the city.";
    }

    if (!values.country.trim()) {
      nextErrors.country = "Please enter the country.";
    }

    if (values.lat.trim() && Number.isNaN(Number(values.lat))) {
      nextErrors.lat = "Latitude should be a valid number.";
    }

    if (values.lng.trim() && Number.isNaN(Number(values.lng))) {
      nextErrors.lng = "Longitude should be a valid number.";
    }

    return nextErrors;
  };

  const saveProperty = async (onSuccess: (property: HostPropertyDetail) => void) => {
    if (!token) {
      return;
    }

    const property = await updateHostProperty(token, propertyId, {
      name: values.name,
      description: values.description,
      propertyType: values.propertyType,
      ownershipType: values.ownershipType,
      amenities: values.amenities,
      address: values.address,
      city: values.city,
      country: values.country,
      lat: values.lat,
      lng: values.lng,
      houseRules: values.houseRules,
    });

    setValues(property);
    onSuccess(property);
  };

  const handleBasicsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canEdit) {
      return;
    }

    const nextErrors = validateBasics();

    if (Object.keys(nextErrors).length > 0) {
      setBasicsErrors(nextErrors);
      setBasicsSuccessMessage("");
      return;
    }

    setIsSavingBasics(true);
    setBasicsErrors({});
    setBasicsSuccessMessage("");

    try {
      await saveProperty(() => {
        setBasicsSuccessMessage("Draft updated successfully.");
      });
    } catch (requestError) {
      setBasicsErrors({
        form:
          requestError instanceof ApiError
            ? requestError.message || "We couldn't save the basics right now."
            : "We couldn't save the basics right now.",
      });
    } finally {
      setIsSavingBasics(false);
    }
  };

  const handleLocationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canEdit) {
      return;
    }

    const nextErrors = validateLocation();

    if (Object.keys(nextErrors).length > 0) {
      setLocationErrors(nextErrors);
      setLocationSuccessMessage("");
      return;
    }

    setIsSavingLocation(true);
    setLocationErrors({});
    setLocationSuccessMessage("");

    try {
      await saveProperty(() => {
        setLocationSuccessMessage("Draft updated successfully.");
      });
    } catch (requestError) {
      setLocationErrors({
        form:
          requestError instanceof ApiError
            ? requestError.message || "We couldn't save the location right now."
            : "We couldn't save the location right now.",
      });
    } finally {
      setIsSavingLocation(false);
    }
  };

  if (isLoading) {
    return <EditorSkeleton />;
  }

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
      <HostPropertyEditorShell
        title={values.name || "Untitled property"}
        status={values.status}
        headerAside={
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Editability
            </p>
            <p className="mt-3 text-[16px] font-semibold text-text-primary">
              {canEdit ? "Editable in this chunk" : "Read-only right now"}
            </p>
          </div>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <HostPropertyBasicsForm
              values={values}
              propertyTypes={propertyTypes}
              amenities={amenities}
              errors={basicsErrors}
              isSubmitting={isSavingBasics}
              successMessage={basicsSuccessMessage}
              disabled={!canEdit}
              onChange={handleChange}
              onSubmit={handleBasicsSubmit}
            />

            <HostPropertyLocationForm
              values={values}
              errors={locationErrors}
              isSubmitting={isSavingLocation}
              successMessage={locationSuccessMessage}
              disabled={!canEdit}
              onChange={(field, value) => handleChange(field, value)}
              onSubmit={handleLocationSubmit}
            />
          </div>

          <div className="space-y-6">
            <div className="surface-card rounded-panel p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Current draft
              </p>
              <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                Keep the first steps clean
              </h2>
              <div className="mt-5 space-y-3">
                {[
                  "Use a clear guest-facing title from the start.",
                  "Choose the right ownership type now so later steps stay aligned.",
                  "Complete city, country, and address details before media and pricing stages land.",
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

            {commissionInfo ? (
              <div className="surface-card rounded-panel p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Commission reference
                </p>
                <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                  {commissionInfo.rate || "Commission information available"}
                </h2>
                <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                  {commissionInfo.note || "Reference pricing and commission details will matter more once later listing stages open."}
                </p>
              </div>
            ) : null}

            {!canEdit ? (
              <div className="surface-card rounded-panel p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Current status
                </p>
                <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                  Editing is limited for this property
                </h2>
                <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                  This first Chunk 4 editor focuses on draft and rejected listings. Submitted and approved
                  states can stay visible without pretending full post-submission editing is already ready.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </HostPropertyEditorShell>
    </HostShell>
  );
};
