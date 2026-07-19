"use client";

import React, { useEffect, useMemo, useState } from "react";
import { HostShell } from "@/components/host/HostShell";
import { HostBusinessForm } from "@/components/host/businesses/HostBusinessForm";
import { HostBusinessesList } from "@/components/host/businesses/HostBusinessesList";
import { HostBusinessDocumentsPanel } from "@/components/host/businesses/documents/HostBusinessDocumentsPanel";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  createEmptyHostBusiness,
  createHostBusiness,
  deleteHostBusiness,
  deleteHostBusinessDocument,
  getHostBusinesses,
  getHostBusinessDocuments,
  updateHostBusiness,
  updateHostBusinessDocument,
  uploadHostBusinessDocuments,
  type HostBusiness,
  type HostBusinessDocument,
  type UpdateHostBusinessDocumentPayload,
  type UpsertHostBusinessPayload,
} from "@/lib/host";

type BusinessFormErrors = Partial<Record<keyof UpsertHostBusinessPayload | "form", string>>;

const BusinessesSkeleton = () => (
  <HostShell badge="Setup">
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <div className="surface-card rounded-panel h-[540px] animate-pulse bg-white/75" />
        <div className="surface-card rounded-panel h-[320px] animate-pulse bg-white/75" />
      </div>
      <div className="surface-card rounded-panel h-[680px] animate-pulse bg-white/75" />
    </div>
  </HostShell>
);

const validateBusiness = (values: UpsertHostBusinessPayload) => {
  const errors: BusinessFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Please enter the business name.";
  }

  if (!values.country.trim()) {
    errors.country = "Please enter the business country.";
  }

  return errors;
};

export const HostBusinessesPage: React.FC = () => {
  const { token } = useAuth();
  const [businesses, setBusinesses] = useState<HostBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [formValues, setFormValues] = useState<UpsertHostBusinessPayload>(createEmptyHostBusiness());
  const [formErrors, setFormErrors] = useState<BusinessFormErrors>({});
  const [formSuccessMessage, setFormSuccessMessage] = useState("");
  const [editingBusinessId, setEditingBusinessId] = useState("");
  const [documents, setDocuments] = useState<HostBusinessDocument[]>([]);
  const [documentsError, setDocumentsError] = useState("");
  const [pageError, setPageError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(false);
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);
  const [deletingBusinessId, setDeletingBusinessId] = useState("");
  const [savingDocumentId, setSavingDocumentId] = useState("");
  const [deletingDocumentId, setDeletingDocumentId] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [documentsRetryKey, setDocumentsRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadBusinesses = async () => {
      setIsLoading(true);
      setPageError("");
      setFormErrors({});
      setFormSuccessMessage("");

      try {
        const businessResults = await getHostBusinesses(token);

        if (!isActive) {
          return;
        }

        setBusinesses(businessResults);
        setSelectedBusinessId((current) => {
          if (current && businessResults.some((item) => item.id === current)) {
            return current;
          }

          return businessResults[0]?.id ?? "";
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setPageError(
          error instanceof ApiError
            ? error.message || "We couldn't load your businesses right now."
            : "We couldn't load your businesses right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadBusinesses();

    return () => {
      isActive = false;
    };
  }, [retryKey, token]);

  useEffect(() => {
    if (!token || !selectedBusinessId) {
      setDocuments([]);
      setDocumentsError("");
      return;
    }

    let isActive = true;

    const loadDocuments = async () => {
      setIsDocumentsLoading(true);
      setDocumentsError("");

      try {
        const documentResults = await getHostBusinessDocuments(token, selectedBusinessId);

        if (!isActive) {
          return;
        }

        setDocuments(documentResults);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setDocuments([]);
        setDocumentsError(
          error instanceof ApiError
            ? error.message || "We couldn't load this business document library right now."
            : "We couldn't load this business document library right now.",
        );
      } finally {
        if (isActive) {
          setIsDocumentsLoading(false);
        }
      }
    };

    void loadDocuments();

    return () => {
      isActive = false;
    };
  }, [documentsRetryKey, selectedBusinessId, token]);

  const selectedBusiness = useMemo(
    () => businesses.find((item) => item.id === selectedBusinessId) ?? null,
    [businesses, selectedBusinessId],
  );

  const updateFormValue = (field: keyof UpsertHostBusinessPayload, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    setFormSuccessMessage("");
  };

  const beginEdit = (businessId: string) => {
    const match = businesses.find((item) => item.id === businessId);

    if (!match) {
      return;
    }

    setEditingBusinessId(match.id);
    setFormValues({
      name: match.name,
      registrationNumber: match.registrationNumber,
      country: match.country,
      address: match.address,
      note: match.note,
    });
    setFormErrors({});
    setFormSuccessMessage("");
  };

  const resetForm = () => {
    const empty = createEmptyHostBusiness();

    setEditingBusinessId("");
    setFormValues({
      name: empty.name,
      registrationNumber: empty.registrationNumber,
      country: empty.country,
      address: empty.address,
      note: empty.note,
    });
    setFormErrors({});
    setFormSuccessMessage("");
  };

  const handleBusinessSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    const nextErrors = validateBusiness(formValues);

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      setFormSuccessMessage("");
      return;
    }

    setIsSavingBusiness(true);
    setFormErrors({});
    setFormSuccessMessage("");

    try {
      const savedBusiness = editingBusinessId
        ? await updateHostBusiness(token, editingBusinessId, formValues)
        : await createHostBusiness(token, formValues);

      setBusinesses((current) => {
        if (editingBusinessId) {
          return current.map((item) => (item.id === savedBusiness.id ? savedBusiness : item));
        }

        return [savedBusiness, ...current];
      });
      setSelectedBusinessId(savedBusiness.id);
      setFormSuccessMessage(
        editingBusinessId ? "Business updated successfully." : "Business created successfully.",
      );

      if (!editingBusinessId) {
        resetForm();
      } else {
        beginEdit(savedBusiness.id);
      }
    } catch (error) {
      setFormErrors({
        form:
          error instanceof ApiError
            ? error.message || "We couldn't save this business right now."
            : "We couldn't save this business right now.",
      });
    } finally {
      setIsSavingBusiness(false);
    }
  };

  const handleDeleteBusiness = async (businessId: string) => {
    if (!token) {
      return;
    }

    setDeletingBusinessId(businessId);
    setPageError("");

    try {
      await deleteHostBusiness(token, businessId);
      setBusinesses((current) => {
        const nextBusinesses = current.filter((item) => item.id !== businessId);

        setSelectedBusinessId((currentSelected) => {
          if (currentSelected !== businessId) {
            return currentSelected;
          }

          return nextBusinesses[0]?.id ?? "";
        });

        return nextBusinesses;
      });

      if (editingBusinessId === businessId) {
        resetForm();
      }
    } catch (error) {
      setPageError(
        error instanceof ApiError
          ? error.message || "We couldn't delete this business right now."
          : "We couldn't delete this business right now.",
      );
    } finally {
      setDeletingBusinessId("");
    }
  };

  const handleUploadDocuments = async (
    files: File[],
    metadata: { title: string; documentType: string; note: string },
  ) => {
    if (!token || !selectedBusinessId) {
      return;
    }

    setIsUploadingDocuments(true);
    setDocumentsError("");

    try {
      const nextDocuments = await uploadHostBusinessDocuments(token, selectedBusinessId, {
        files,
        title: metadata.title,
        documentType: metadata.documentType,
        note: metadata.note,
      });

      setDocuments(nextDocuments);
    } finally {
      setIsUploadingDocuments(false);
    }
  };

  const handleSaveDocument = async (
    documentId: string,
    payload: UpdateHostBusinessDocumentPayload,
  ) => {
    if (!token || !selectedBusinessId) {
      return;
    }

    setSavingDocumentId(documentId);

    try {
      const savedDocument = await updateHostBusinessDocument(
        token,
        selectedBusinessId,
        documentId,
        payload,
      );

      setDocuments((current) =>
        current.map((item) => (item.id === savedDocument.id ? savedDocument : item)),
      );
    } finally {
      setSavingDocumentId("");
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!token || !selectedBusinessId) {
      return;
    }

    setDeletingDocumentId(documentId);

    try {
      await deleteHostBusinessDocument(token, selectedBusinessId, documentId);
      setDocuments((current) => current.filter((item) => item.id !== documentId));
    } finally {
      setDeletingDocumentId("");
    }
  };

  if (isLoading) {
    return <BusinessesSkeleton />;
  }

  if (pageError && businesses.length === 0) {
    return (
      <HostShell badge="Setup">
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
    <HostShell
      badge="Setup"
      headerAside={
        <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Library status
          </p>
          <p className="mt-3 text-[17px] font-semibold text-text-primary">
            {businesses.length === 0 ? "No businesses yet" : `${businesses.length} business record${businesses.length === 1 ? "" : "s"}`}
          </p>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <HostBusinessForm
            values={formValues}
            errors={formErrors}
            successMessage={formSuccessMessage}
            isSubmitting={isSavingBusiness}
            mode={editingBusinessId ? "edit" : "create"}
            onChange={updateFormValue}
            onSubmit={handleBusinessSubmit}
            onCancel={editingBusinessId ? resetForm : undefined}
          />

          {pageError ? (
            <div className="rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
              {pageError}
            </div>
          ) : null}

          <HostBusinessesList
            businesses={businesses}
            selectedBusinessId={selectedBusinessId}
            deletingBusinessId={deletingBusinessId}
            onSelect={setSelectedBusinessId}
            onEdit={beginEdit}
            onDelete={(businessId) => void handleDeleteBusiness(businessId)}
          />
        </div>

        <div className="space-y-6">
          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Why this matters
            </p>
            <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              Keep commercial ownership reusable
            </h2>
            <div className="mt-5 space-y-3">
              {[
                "Use one reusable business record instead of repeating the same setup across every commercial property.",
                "Store reusable business proof here so listing-specific verification can stay focused on the property itself.",
                "Commercial property readiness stays more honest when the business and document layer is visible up front.",
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

          <HostBusinessDocumentsPanel
            business={selectedBusiness}
            documents={documents}
            isLoading={isDocumentsLoading}
            isUploading={isUploadingDocuments}
            savingDocumentId={savingDocumentId}
            deletingDocumentId={deletingDocumentId}
            error={documentsError}
            onUpload={handleUploadDocuments}
            onSaveDocument={handleSaveDocument}
            onDeleteDocument={handleDeleteDocument}
            onRetry={() => setDocumentsRetryKey((current) => current + 1)}
          />
        </div>
      </div>
    </HostShell>
  );
};
