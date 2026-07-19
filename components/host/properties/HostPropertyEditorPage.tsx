"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HostShell } from "@/components/host/HostShell";
import { HostPropertyBasicsForm } from "@/components/host/properties/HostPropertyBasicsForm";
import { getHostPropertyEditorStepHref } from "@/components/host/properties/hostPropertyEditor";
import { HostPropertyEditorShell } from "@/components/host/properties/HostPropertyEditorShell";
import { HostPropertyLocationForm } from "@/components/host/properties/HostPropertyLocationForm";
import { HostPropertyBusinessDocumentsSelector } from "@/components/host/properties/ownership/HostPropertyBusinessDocumentsSelector";
import { HostPropertyBusinessSelector } from "@/components/host/properties/ownership/HostPropertyBusinessSelector";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  createEmptyHostPropertyDetail,
  getHostBusinesses,
  getHostBusinessDocuments,
  getHostCommissionInfo,
  getHostProperty,
  getHostPropertyTypes,
  isHostPropertyEditable,
  updateHostProperty,
  type HostBusiness,
  type HostBusinessDocument,
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

type CommercialErrors = Partial<Record<"businessId" | "selectedBusinessDocumentIds" | "form", string>>;

type HostPropertyEditorPageProps = {
  propertyId: string;
};

const resolveReferenceId = (
  value: string,
  options: HostPropertyReferenceOption[],
) => {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return "";
  }

  return (
    options.find((option) =>
      [option.id, option.value, option.label].some(
        (candidate) => candidate.trim().toLowerCase() === normalized,
      ),
    )?.id || value
  );
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [values, setValues] = useState<HostPropertyDetail>(createEmptyHostPropertyDetail());
  const [propertyTypes, setPropertyTypes] = useState<HostPropertyReferenceOption[]>([]);
  const [commissionInfo, setCommissionInfo] = useState<HostPropertyCommissionInfo | null>(null);
  const [businesses, setBusinesses] = useState<HostBusiness[]>([]);
  const [businessDocuments, setBusinessDocuments] = useState<HostBusinessDocument[]>([]);
  const [error, setError] = useState("");
  const [basicsErrors, setBasicsErrors] = useState<BasicsErrors>({});
  const [locationErrors, setLocationErrors] = useState<LocationErrors>({});
  const [commercialErrors, setCommercialErrors] = useState<CommercialErrors>({});
  const [basicsSuccessMessage, setBasicsSuccessMessage] = useState("");
  const [locationSuccessMessage, setLocationSuccessMessage] = useState("");
  const [commercialNotice, setCommercialNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingBasics, setIsSavingBasics] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [isLoadingBusinessDocuments, setIsLoadingBusinessDocuments] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const requestedStep = searchParams.get("step");
  const currentStep =
    requestedStep === "location"
      ? "location"
      : "basics";
  const locationStepHref =
    getHostPropertyEditorStepHref(propertyId, "location") ??
    `/host/properties/${propertyId}/edit?step=location`;

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
      setCommercialErrors({});
      setBasicsSuccessMessage("");
      setLocationSuccessMessage("");
      setCommercialNotice("");

      try {
        const [property, propertyTypesResult, commissionResult] = await Promise.all([
          getHostProperty(token, propertyId),
          getHostPropertyTypes(token),
          getHostCommissionInfo(token),
        ]);

        if (!isActive) {
          return;
        }

        setValues({
          ...property,
          propertyType: resolveReferenceId(property.propertyType, propertyTypesResult),
        });
        setPropertyTypes(propertyTypesResult);
        setCommissionInfo(commissionResult);

        try {
          const businessesResult = await getHostBusinesses(token);

          if (!isActive) {
            return;
          }

          setBusinesses(businessesResult);
          setCommercialNotice(
            property.ownershipType.trim().toLowerCase() === "commercial" && businessesResult.length === 0
              ? "Commercial ownership is selected, but no reusable business profile exists yet. Create one in the Businesses workspace, then come back here to link it."
              : "",
          );
        } catch (businessError) {
          if (!isActive) {
            return;
          }

          setBusinesses([]);
          setCommercialNotice(
            businessError instanceof ApiError
              ? businessError.message ||
                  "We couldn't load reusable business records right now, so the commercial linkage section may be incomplete."
              : "We couldn't load reusable business records right now, so the commercial linkage section may be incomplete.",
          );
        }
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

  useEffect(() => {
    if (!token || values.ownershipType.trim().toLowerCase() !== "commercial" || !values.businessId.trim()) {
      setBusinessDocuments([]);
      setCommercialErrors((current) => ({
        ...current,
        businessId: undefined,
        selectedBusinessDocumentIds: undefined,
      }));
      return;
    }

    let isActive = true;

    const loadBusinessDocuments = async () => {
      setIsLoadingBusinessDocuments(true);

      try {
        const documents = await getHostBusinessDocuments(token, values.businessId);

        if (!isActive) {
          return;
        }

        setBusinessDocuments(documents);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setBusinessDocuments([]);
        setCommercialNotice(
          requestError instanceof ApiError
            ? requestError.message ||
                "We couldn't load reusable business documents for the selected business right now."
            : "We couldn't load reusable business documents for the selected business right now.",
        );
      } finally {
        if (isActive) {
          setIsLoadingBusinessDocuments(false);
        }
      }
    };

    void loadBusinessDocuments();

    return () => {
      isActive = false;
    };
  }, [token, values.businessId, values.ownershipType]);

  const canEdit = useMemo(() => isHostPropertyEditable(values.status), [values.status]);

  const handleChange = (field: keyof HostPropertyDetail, value: string | string[]) => {
    setValues((current) => {
      if (field === "businessId") {
        return {
          ...current,
          businessId: typeof value === "string" ? value : "",
          selectedBusinessDocumentIds: [],
        };
      }

      return { ...current, [field]: value } as HostPropertyDetail;
    });
    setBasicsErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    setLocationErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    setCommercialErrors((current) => ({
      ...current,
      businessId: undefined,
      selectedBusinessDocumentIds: undefined,
      form: undefined,
    }));
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

  const validateCommercial = () => {
    const nextErrors: CommercialErrors = {};

    if (values.ownershipType.trim().toLowerCase() === "commercial" && !values.businessId.trim()) {
      nextErrors.businessId = "Please select a business profile for this commercial property.";
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
      businessId: values.businessId,
      selectedBusinessDocumentIds: values.selectedBusinessDocumentIds,
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

  const handleBusinessDocumentToggle = (documentId: string) => {
    setValues((current) => {
      const exists = current.selectedBusinessDocumentIds.includes(documentId);

      return {
        ...current,
        selectedBusinessDocumentIds: exists
          ? current.selectedBusinessDocumentIds.filter((item) => item !== documentId)
          : [...current.selectedBusinessDocumentIds, documentId],
      };
    });
    setCommercialErrors((current) => ({ ...current, selectedBusinessDocumentIds: undefined, form: undefined }));
  };

  const handleBasicsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canEdit) {
      return;
    }

    const nextErrors = validateBasics();
    const nextCommercialErrors = validateCommercial();

    if (Object.keys(nextErrors).length > 0 || Object.keys(nextCommercialErrors).length > 0) {
      setBasicsErrors(nextErrors);
      setCommercialErrors(nextCommercialErrors);
      setBasicsSuccessMessage("");
      return;
    }

    setIsSavingBasics(true);
    setBasicsErrors({});
    setCommercialErrors({});
    setBasicsSuccessMessage("");

    try {
      await saveProperty(() => {
        setBasicsSuccessMessage("Basics saved successfully.");
        router.push(locationStepHref);
        router.refresh();
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
        setLocationSuccessMessage("Location saved successfully.");
        router.push(`/host/properties/${propertyId}/media`);
        router.refresh();
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
        propertyId={propertyId}
        currentStep={currentStep}
        title={values.name || "Untitled property"}
        status={values.status}
        description={
          currentStep === "basics"
            ? "This step saves the property foundations first, including ownership and any required business linkage for commercial listings."
            : "This step saves the address, map points, and house rules before the listing moves into media, units, pricing, calendar, and verification."
        }
        headerAside={
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Editability
            </p>
            <p className="mt-3 text-[16px] font-semibold text-text-primary">
              {canEdit ? "Editable now" : "Read-only right now"}
            </p>
          </div>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            {currentStep === "basics" ? (
              <HostPropertyBasicsForm
                values={values}
                propertyTypes={propertyTypes}
                errors={basicsErrors}
                isSubmitting={isSavingBasics}
                successMessage={basicsSuccessMessage}
                disabled={!canEdit}
                submitLabel="Save basics and continue"
                onChange={handleChange}
                onSubmit={handleBasicsSubmit}
              />
            ) : (
              <HostPropertyLocationForm
                values={values}
                errors={locationErrors}
                isSubmitting={isSavingLocation}
                successMessage={locationSuccessMessage}
                disabled={!canEdit}
                submitLabel="Save location and continue"
                onChange={(field, value) => handleChange(field, value)}
                onSubmit={handleLocationSubmit}
              />
            )}
          </div>

          <div className="space-y-6">
            <div className="surface-card rounded-panel p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Current step
              </p>
              <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                {currentStep === "basics" ? "Save the property foundation" : "Save the location details"}
              </h2>
              <div className="mt-5 space-y-3">
                {(
                  currentStep === "basics"
                    ? [
                        "Use a clear guest-facing title from the start.",
                        "Choose the right ownership type now so later workflow steps stay aligned.",
                        "For commercial listings, link the correct business before moving on.",
                      ]
                    : [
                        "Complete address, city, and country before media uploads.",
                        "Map points can stay optional, but valid coordinates save cleanly here.",
                        "House rules belong here so later submission review sees the saved policy.",
                      ]
                ).map((item) => (
                  <div
                    key={item}
                    className="rounded-[20px] border border-border-light bg-white/80 px-4 py-3 text-[14px] leading-6 text-text-primary"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {currentStep === "basics" ? (
              <div className="surface-card rounded-panel p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Commercial support
                </p>
                <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                  Link the business when needed
                </h2>
                <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                  Personal listings can continue without business linkage. Commercial listings should
                  point to one reusable business profile before the draft moves forward.
                </p>

                {commercialNotice ? (
                  <div className="mt-5 rounded-[20px] border border-border-light bg-surface px-4 py-4 text-[14px] leading-6 text-text-secondary">
                    {commercialNotice}
                  </div>
                ) : null}

                <div className="mt-5 space-y-4">
                  <HostPropertyBusinessSelector
                    ownershipType={values.ownershipType}
                    businesses={businesses}
                    value={values.businessId}
                    disabled={!canEdit}
                    error={commercialErrors.businessId}
                    onChange={(businessId) => handleChange("businessId", businessId)}
                  />

                  {isLoadingBusinessDocuments ? (
                    <div className="rounded-[22px] border border-border-light bg-white/80 px-5 py-5">
                      <div className="h-24 animate-pulse rounded-[18px] bg-surface" />
                    </div>
                  ) : (
                    <HostPropertyBusinessDocumentsSelector
                      ownershipType={values.ownershipType}
                      documents={businessDocuments}
                      selectedDocumentIds={values.selectedBusinessDocumentIds}
                      disabled={!canEdit || !values.businessId}
                      error={commercialErrors.selectedBusinessDocumentIds}
                      onToggle={handleBusinessDocumentToggle}
                    />
                  )}
                </div>

                {commercialErrors.form ? (
                  <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
                    {commercialErrors.form}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/host/businesses"
                    className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                  >
                    Open businesses
                  </Link>
                </div>
              </div>
            ) : commissionInfo ? (
              <div className="surface-card rounded-panel p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Commission reference
                </p>
                <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                  {commissionInfo.rate || "Commission information available"}
                </h2>
                <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                  {commissionInfo.note || "Keep the commission reference nearby as you move into pricing and final submission readiness."}
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
                  This editor focuses on draft and rejected listings. Submitted and approved states can
                  stay visible without pretending full post-submission editing is already ready.
                </p>
              </div>
            ) : (
              <div className="surface-card rounded-panel p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Next step
                </p>
                <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                  {currentStep === "basics" ? "Location saves next" : "Media opens next"}
                </h2>
                <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                  {currentStep === "basics"
                    ? "Saving this step moves the workflow into address, city, country, coordinates, and house rules."
                    : "After location saves, the listing continues into gallery uploads, cover-image selection, and video links."}
                </p>
                <div className="mt-6">
                  <Link
                    href={
                      currentStep === "basics"
                        ? locationStepHref
                        : `/host/properties/${propertyId}/media`
                    }
                    className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                  >
                    {currentStep === "basics" ? "Open location step" : "Open media manager"}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </HostPropertyEditorShell>
    </HostShell>
  );
};
