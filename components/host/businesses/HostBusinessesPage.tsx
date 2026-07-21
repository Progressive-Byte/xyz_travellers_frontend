"use client";

import React, { useEffect, useMemo, useState } from "react";
import { HostShell } from "@/components/host/HostShell";
import { HostBusinessForm } from "@/components/host/businesses/HostBusinessForm";
import { HostBusinessesList } from "@/components/host/businesses/HostBusinessesList";
import { type BusinessDocumentType } from "@/components/host/businesses/documents/businessDocumentTypes";
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
  <HostShell badge="Businesses">
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

  if (!values.businessName.trim()) {
    errors.businessName = "Please enter the business name.";
  }

  if (!values.businessAddress.trim()) {
    errors.businessAddress = "Please enter the business address.";
  }

  if (!values.contactName.trim()) {
    errors.contactName = "Please enter the contact name.";
  }

  if (!values.contactEmail.trim()) {
    errors.contactEmail = "Please enter the contact email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail.trim())) {
    errors.contactEmail = "Please enter a valid contact email.";
  }

  if (!values.contactPhone.trim()) {
    errors.contactPhone = "Please enter the contact phone.";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"updated-desc" | "updated-asc" | "name-asc">(
    "updated-desc",
  );
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [isCreateModeActive, setIsCreateModeActive] = useState(false);

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

  const filteredBusinesses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const nextBusinesses = businesses.filter((business) => {
      if (!query) {
        return true;
      }

      return [
        business.name,
        business.registrationNumber,
        business.taxVatNumber,
        business.country,
        business.address,
        business.contactName,
        business.contactEmail,
        business.contactPhone,
        business.status,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
    });

    nextBusinesses.sort((left, right) => {
      if (sortOrder === "name-asc") {
        return (left.name || "Untitled business").localeCompare(right.name || "Untitled business");
      }

      const leftTimestamp = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
      const rightTimestamp = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;

      if (sortOrder === "updated-asc") {
        return leftTimestamp - rightTimestamp;
      }

      return rightTimestamp - leftTimestamp;
    });

    return nextBusinesses;
  }, [businesses, searchQuery, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredBusinesses.length / pageSize));
  const pagedBusinesses = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredBusinesses.slice(startIndex, startIndex + pageSize);
  }, [filteredBusinesses, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, searchQuery, sortOrder]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const updateFormValue = (field: keyof UpsertHostBusinessPayload, value: string | boolean) => {
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
    setIsCreateModeActive(false);
    setFormValues({
      businessName: match.name,
      registrationNumber: match.registrationNumber,
      taxVatNumber: match.taxVatNumber,
      businessAddress: match.address,
      contactName: match.contactName,
      contactEmail: match.contactEmail,
      contactPhone: match.contactPhone,
      isActive: match.isActive,
    });
    setFormErrors({});
    setFormSuccessMessage("");
  };

  const resetForm = () => {
    const empty = createEmptyHostBusiness();

    setEditingBusinessId("");
    setIsCreateModeActive(false);
    setFormValues({
      businessName: empty.businessName,
      registrationNumber: empty.registrationNumber,
      taxVatNumber: empty.taxVatNumber,
      businessAddress: empty.businessAddress,
      contactName: empty.contactName,
      contactEmail: empty.contactEmail,
      contactPhone: empty.contactPhone,
      isActive: empty.isActive,
    });
    setFormErrors({});
    setFormSuccessMessage("");
  };

  const beginCreate = () => {
    resetForm();
    setIsCreateModeActive(true);
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
    metadata: { title: string; documentType: BusinessDocumentType; note: string },
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
        isActive: true,
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
      <HostShell badge="Businesses">
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
      badge="Businesses"
      topbarAction={
        <button
          type="button"
          onClick={beginCreate}
          className="inline-flex items-center justify-center rounded-[16px] bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
        >
          Add business
        </button>
      }
    >
      {pageError ? (
        <div className="mb-5 rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
          {pageError}
        </div>
      ) : null}

      {businesses.length === 0 ? (
        isCreateModeActive ? (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <HostBusinessForm
                values={formValues}
                errors={formErrors}
                successMessage=""
                isSubmitting={isSavingBusiness}
                mode="create"
                onChange={updateFormValue}
                onSubmit={handleBusinessSubmit}
                onCancel={resetForm}
              />
            </div>

            <div className="space-y-6">
              <div className="surface-card rounded-panel p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  First business profile
                </p>
                <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                  Create the reusable business record first
                </h2>
                <div className="mt-5 space-y-3">
                  {[
                    "Use the legal business name and registered address.",
                    "Add the main business contact details you want to manage later.",
                    "After the record is created, the document library panel will open automatically.",
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
          </div>
        ) : (
          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              No businesses yet
            </p>
            <h2 className="mt-2.5 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
              Start your first business profile
            </h2>
            <p className="mt-3 max-w-3xl text-[14px] leading-6 text-text-secondary">
              Create one reusable business record so commercial properties can reuse the same identity and document library.
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={beginCreate}
                className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
              >
                Create business
              </button>
            </div>
          </div>
        )
      ) : filteredBusinesses.length === 0 ? (
        <div className="surface-card rounded-panel p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            No matching businesses
          </p>
          <h2 className="mt-2.5 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
            Adjust your search
          </h2>
          <p className="mt-3 max-w-3xl text-[14px] leading-6 text-text-secondary">
            No business profiles match the current search and sorting combination.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSortOrder("updated-desc");
                setPageSize(10);
              }}
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Clear search
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="surface-card overflow-hidden rounded-panel">
            <div className="border-b border-border-light px-4 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/45 bg-primary-light px-3.5 py-2 text-[13px] font-semibold text-text-primary shadow-soft">
                    <span>All businesses</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-text-primary">
                      {businesses.length}
                    </span>
                  </div>
                  {selectedBusiness ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-border-light bg-white px-3.5 py-2 text-[13px] font-semibold text-text-primary shadow-soft">
                      <span>Selected</span>
                      <span className="truncate max-w-[180px] text-[12px] font-medium text-text-secondary">
                        {selectedBusiness.name}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[13px] text-text-secondary">
                    {filteredBusinesses.length} business{filteredBusinesses.length === 1 ? "" : "es"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRetryKey((current) => current + 1)}
                    className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                  >
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={beginCreate}
                    className="inline-flex items-center justify-center rounded-[16px] bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
                  >
                    Add business
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,0.75fr))]">
                <label className="flex min-w-0 flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                    Search
                  </span>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search business, registration, contact"
                    className="h-11 rounded-[16px] border border-border bg-white px-3.5 text-[14px] text-text-primary outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:border-primary/60"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                    Sort
                  </span>
                  <select
                    value={sortOrder}
                    onChange={(event) =>
                      setSortOrder(event.target.value as "updated-desc" | "updated-asc" | "name-asc")
                    }
                    className="h-11 rounded-[16px] border border-border bg-white px-3.5 text-[14px] text-text-primary outline-none transition-all duration-200 focus:border-primary/60"
                  >
                    <option value="updated-desc">Last updated</option>
                    <option value="updated-asc">Oldest updated</option>
                    <option value="name-asc">Name A-Z</option>
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                    Page size
                  </span>
                  <select
                    value={pageSize}
                    onChange={(event) => setPageSize(Number(event.target.value))}
                    className="h-11 rounded-[16px] border border-border bg-white px-3.5 text-[14px] text-text-primary outline-none transition-all duration-200 focus:border-primary/60"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </label>
              </div>

              {formSuccessMessage ? (
                <div className="mt-4 rounded-[18px] border border-primary/25 bg-primary-light/60 px-4 py-3">
                  <p className="text-[13px] leading-6 text-[rgb(35,92,69)]">{formSuccessMessage}</p>
                </div>
              ) : null}
            </div>

            <HostBusinessesList
              businesses={pagedBusinesses}
              selectedBusinessId={selectedBusinessId}
              deletingBusinessId={deletingBusinessId}
              onSelect={setSelectedBusinessId}
              onEdit={beginEdit}
              onDelete={(businessId) => void handleDeleteBusiness(businessId)}
            />

            <div className="border-t border-border-light px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] text-text-secondary">
                  Showing {(page - 1) * pageSize + 1}-
                  {Math.min(page * pageSize, filteredBusinesses.length)} of {filteredBusinesses.length} businesses
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-3.5 py-2 text-[12px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Previous
                  </button>
                  <div className="flex items-center rounded-[14px] border border-border-light bg-card px-3.5 py-2 text-[12px] font-semibold text-text-primary">
                    Page {page} of {totalPages}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page === totalPages}
                    className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-3.5 py-2 text-[12px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <HostBusinessForm
                values={formValues}
                errors={formErrors}
                successMessage=""
                isSubmitting={isSavingBusiness}
                mode={editingBusinessId ? "edit" : "create"}
                onChange={updateFormValue}
                onSubmit={handleBusinessSubmit}
                onCancel={editingBusinessId ? resetForm : undefined}
              />
            </div>

            <div className="space-y-6">
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
        </div>
      )}
    </HostShell>
  );
};
