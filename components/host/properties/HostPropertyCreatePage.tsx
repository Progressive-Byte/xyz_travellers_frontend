"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HostShell } from "@/components/host/HostShell";
import { HostPropertyBusinessDocumentsSelector } from "@/components/host/properties/ownership/HostPropertyBusinessDocumentsSelector";
import { HostPropertyBusinessSelector } from "@/components/host/properties/ownership/HostPropertyBusinessSelector";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  createEmptyHostPropertyDetail,
  createHostProperty,
  getHostBusinesses,
  getHostBusinessDocuments,
  getHostPropertyTypes,
  type HostBusiness,
  type HostBusinessDocument,
  type HostPropertyDetail,
  type HostPropertyReferenceOption,
} from "@/lib/host";

type CreatePropertyErrors = Partial<
  Record<
    | "name"
    | "description"
    | "propertyType"
    | "ownershipType"
    | "businessId"
    | "selectedBusinessDocumentIds"
    | "form",
    string
  >
>;

const inputClassName =
  "w-full rounded-[22px] border border-border bg-card px-4 py-3.5 text-[15px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium";

export const HostPropertyCreatePage: React.FC = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [values, setValues] = useState<HostPropertyDetail>(createEmptyHostPropertyDetail());
  const [propertyTypes, setPropertyTypes] = useState<HostPropertyReferenceOption[]>([]);
  const [businesses, setBusinesses] = useState<HostBusiness[]>([]);
  const [businessDocuments, setBusinessDocuments] = useState<HostBusinessDocument[]>([]);
  const [errors, setErrors] = useState<CreatePropertyErrors>({});
  const [pageError, setPageError] = useState("");
  const [businessNotice, setBusinessNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBusinessDocuments, setIsLoadingBusinessDocuments] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadPage = async () => {
      setIsLoading(true);
      setPageError("");
      setBusinessNotice("");

      try {
        const [propertyTypesResult, businessesResult] = await Promise.all([
          getHostPropertyTypes(token),
          getHostBusinesses(token).catch(() => [] as HostBusiness[]),
        ]);

        if (!isActive) {
          return;
        }

        setPropertyTypes(propertyTypesResult);
        setBusinesses(businessesResult);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setPageError(
          error instanceof ApiError
            ? error.message || "We couldn't load the property form right now."
            : "We couldn't load the property form right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadPage();

    return () => {
      isActive = false;
    };
  }, [retryKey, token]);

  useEffect(() => {
    if (!token || values.ownershipType.trim().toLowerCase() !== "commercial" || !values.businessId.trim()) {
      setBusinessDocuments([]);
      return;
    }

    let isActive = true;

    const loadDocuments = async () => {
      setIsLoadingBusinessDocuments(true);
      setBusinessNotice("");

      try {
        const nextDocuments = await getHostBusinessDocuments(token, values.businessId);

        if (!isActive) {
          return;
        }

        setBusinessDocuments(nextDocuments);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setBusinessDocuments([]);
        setBusinessNotice(
          error instanceof ApiError
            ? error.message || "We couldn't load reusable business documents for the selected business."
            : "We couldn't load reusable business documents for the selected business.",
        );
      } finally {
        if (isActive) {
          setIsLoadingBusinessDocuments(false);
        }
      }
    };

    void loadDocuments();

    return () => {
      isActive = false;
    };
  }, [token, values.businessId, values.ownershipType]);

  const selectedBusiness = useMemo(
    () => businesses.find((business) => business.id === values.businessId) ?? null,
    [businesses, values.businessId],
  );

  const updateValue = (field: keyof HostPropertyDetail, value: string | string[]) => {
    setValues((current) => {
      if (field === "ownershipType" && value !== "commercial") {
        return {
          ...current,
          ownershipType: typeof value === "string" ? value : "",
          businessId: "",
          businessName: "",
          selectedBusinessDocumentIds: [],
        };
      }

      if (field === "businessId") {
        const businessId = typeof value === "string" ? value : "";
        const businessName = businesses.find((business) => business.id === businessId)?.name ?? "";

        return {
          ...current,
          businessId,
          businessName,
          selectedBusinessDocumentIds: [],
        };
      }

      return { ...current, [field]: value } as HostPropertyDetail;
    });

    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const toggleBusinessDocument = (documentId: string) => {
    setValues((current) => ({
      ...current,
      selectedBusinessDocumentIds: current.selectedBusinessDocumentIds.includes(documentId)
        ? current.selectedBusinessDocumentIds.filter((item) => item !== documentId)
        : [...current.selectedBusinessDocumentIds, documentId],
    }));
    setErrors((current) => ({ ...current, selectedBusinessDocumentIds: undefined, form: undefined }));
  };

  const validate = () => {
    const nextErrors: CreatePropertyErrors = {};

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

    if (values.ownershipType.trim().toLowerCase() === "commercial" && !values.businessId.trim()) {
      nextErrors.businessId = "Please select a business profile for this commercial property.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || isSubmitting) {
      return;
    }

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const property = await createHostProperty(token, {
        name: values.name,
        description: values.description,
        propertyType: values.propertyType,
        ownershipType: values.ownershipType,
        businessId: values.businessId,
        selectedBusinessDocumentIds: values.selectedBusinessDocumentIds,
        address: "",
        city: "",
        country: "",
        lat: "",
        lng: "",
        houseRules: "",
      });

      if (!property.id) {
        throw new ApiError("We couldn't open the new property editor right now.", 500);
      }

      router.push(`/host/properties/${property.id}/edit?step=location`);
      router.refresh();
    } catch (error) {
      setErrors({
        form:
          error instanceof ApiError
            ? error.message || "We couldn't create this property right now."
            : "We couldn't create this property right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <HostShell badge="Add Property">
        <div className="surface-card rounded-panel h-[720px] animate-pulse bg-white/75" />
      </HostShell>
    );
  }

  if (pageError) {
    return (
      <HostShell badge="Add Property">
        <div className="surface-card rounded-panel p-6 md:p-8">
          <p className="text-[14px] leading-7 text-text-secondary">{pageError}</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Try again
            </button>
          </div>
        </div>
      </HostShell>
    );
  }

  return (
    <HostShell badge="Add Property">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="surface-card rounded-panel p-6 md:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                New listing
              </p>
              <h1 className="mt-3 font-sora text-[30px] font-bold tracking-[-0.04em] text-text-primary">
                Step 1: Create property draft
              </h1>
              <p className="mt-4 max-w-3xl text-[14px] leading-7 text-text-secondary">
                Save the basics first. The next screen saves location and rules, then the workflow moves
                through media, units, pricing, calendar, and verification.
              </p>
            </div>

            <span className="rounded-full bg-primary-light px-3 py-2 text-[12px] font-semibold text-text-primary">
              Basics first
            </span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-6">
            <div className="surface-card rounded-panel p-6 md:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Basics
              </p>
              <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
                Property details
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-[13px] font-semibold text-text-primary">Property name</span>
                  <input
                    type="text"
                    value={values.name}
                    onChange={(event) => updateValue("name", event.target.value)}
                    placeholder="Give your property a guest-friendly title"
                    className={`${inputClassName} ${errors.name ? "border-red-300 focus:border-red-400" : ""}`}
                  />
                  {errors.name ? <p className="mt-2 text-[13px] text-red-600">{errors.name}</p> : null}
                </label>

                <label>
                  <span className="mb-2 block text-[13px] font-semibold text-text-primary">Property type</span>
                  <select
                    value={values.propertyType}
                    onChange={(event) => updateValue("propertyType", event.target.value)}
                    className={`${inputClassName} ${errors.propertyType ? "border-red-300 focus:border-red-400" : ""}`}
                  >
                    <option value="">Select property type</option>
                    {propertyTypes.map((option) => (
                      <option key={option.id || option.value} value={option.id || option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.propertyType ? <p className="mt-2 text-[13px] text-red-600">{errors.propertyType}</p> : null}
                </label>

                <label>
                  <span className="mb-2 block text-[13px] font-semibold text-text-primary">Ownership type</span>
                  <select
                    value={values.ownershipType}
                    onChange={(event) => updateValue("ownershipType", event.target.value)}
                    className={`${inputClassName} ${errors.ownershipType ? "border-red-300 focus:border-red-400" : ""}`}
                  >
                    <option value="">Select ownership type</option>
                    <option value="personal">Personal</option>
                    <option value="commercial">Commercial</option>
                  </select>
                  {errors.ownershipType ? (
                    <p className="mt-2 text-[13px] text-red-600">{errors.ownershipType}</p>
                  ) : null}
                </label>
              </div>

              <label className="mt-4 block">
                <span className="mb-2 block text-[13px] font-semibold text-text-primary">Description</span>
                <textarea
                  value={values.description}
                  onChange={(event) => updateValue("description", event.target.value)}
                  rows={6}
                  placeholder="Describe the stay, the atmosphere, and what makes the property special."
                  className={`${inputClassName} min-h-[160px] resize-y ${errors.description ? "border-red-300 focus:border-red-400" : ""}`}
                />
                {errors.description ? <p className="mt-2 text-[13px] text-red-600">{errors.description}</p> : null}
              </label>

            </div>

            <div className="surface-card rounded-panel p-6 md:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Step 2 preview
              </p>
              <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
                Location comes next
              </h2>
              <div className="mt-5 space-y-3">
                {[
                  "Save this step first to create the draft property record.",
                  "The next page saves address, city, country, map points, and house rules.",
                  "After that, the listing continues through media, units, pricing, calendar, and verification.",
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
          </div>

          <div className="space-y-6">
            <div className="surface-card rounded-panel p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Commercial linkage
              </p>
              <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                Business connection
              </h2>
              <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                Only required when the ownership type is commercial.
              </p>

              <div className="mt-5 space-y-5">
                <HostPropertyBusinessSelector
                  ownershipType={values.ownershipType}
                  businesses={businesses}
                  value={values.businessId}
                  disabled={isSubmitting}
                  error={errors.businessId}
                  onChange={(businessId) => updateValue("businessId", businessId)}
                />

                {values.ownershipType.trim().toLowerCase() === "commercial" && isLoadingBusinessDocuments ? (
                  <div className="rounded-[22px] border border-border-light bg-white/80 px-4 py-4 text-[14px] leading-6 text-text-secondary">
                    Loading reusable business documents...
                  </div>
                ) : null}

                <HostPropertyBusinessDocumentsSelector
                  ownershipType={values.ownershipType}
                  documents={businessDocuments}
                  selectedDocumentIds={values.selectedBusinessDocumentIds}
                  disabled={isSubmitting}
                  error={errors.selectedBusinessDocumentIds}
                  onToggle={toggleBusinessDocument}
                />

                {businessNotice ? (
                  <div className="rounded-[18px] border border-border-light bg-surface px-4 py-4 text-[14px] leading-6 text-text-secondary">
                    {businessNotice}
                  </div>
                ) : null}

                {selectedBusiness ? (
                  <div className="rounded-[18px] border border-border-light bg-surface px-4 py-4 text-[14px] leading-6 text-text-secondary">
                    Selected business: <span className="font-semibold text-text-primary">{selectedBusiness.name}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="surface-card rounded-panel p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Create
              </p>
              <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                Save and continue
              </h2>
              <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                This page does not auto-submit. Clicking the button creates the draft property and
                opens the next location step immediately.
              </p>

              {errors.form ? (
                <div className="mt-5 rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
                  {errors.form}
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
                >
                  {isSubmitting ? "Creating property..." : "Create draft and continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </HostShell>
  );
};
