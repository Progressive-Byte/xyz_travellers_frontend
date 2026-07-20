"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  createAdminHomepageSectionItem,
  createEmptyAdminHomepageSectionForm,
  createEmptyAdminHomepageSectionItemForm,
  deleteAdminHomepageSectionItem,
  getAdminHomepageSection,
  getAdminPropertyApplications,
  updateAdminHomepageSection,
  updateAdminHomepageSectionItem,
  type AdminHomepageSectionDetail,
  type AdminHomepageSectionItem,
  type AdminPropertyApplicationSummary,
  type CreateAdminHomepageSectionItemPayload,
  type UpdateAdminHomepageSectionItemPayload,
  type UpsertAdminHomepageSectionPayload,
} from "@/lib/admin";

const inputClassName =
  "w-full rounded-[20px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium";

type SectionErrors = Partial<Record<keyof UpsertAdminHomepageSectionPayload | "form", string>>;
type ItemErrors = Partial<Record<keyof CreateAdminHomepageSectionItemPayload | "form", string>>;

type AdminHomepageSectionDetailPageProps = {
  sectionId: string;
};

const mapSectionDetailToForm = (section: AdminHomepageSectionDetail): UpsertAdminHomepageSectionPayload => ({
  title: section.title,
  slug: section.slug,
  description: section.description,
  isActive: section.isActive,
  sortOrder: section.sortOrder?.toString() ?? "",
});

type ItemFormState = Record<string, UpdateAdminHomepageSectionItemPayload>;

export const AdminHomepageSectionDetailPage: React.FC<AdminHomepageSectionDetailPageProps> = ({
  sectionId,
}) => {
  const { token } = useAuth();
  const [section, setSection] = useState<AdminHomepageSectionDetail | null>(null);
  const [sectionForm, setSectionForm] = useState<UpsertAdminHomepageSectionPayload>(
    createEmptyAdminHomepageSectionForm(),
  );
  const [itemForm, setItemForm] = useState<CreateAdminHomepageSectionItemPayload>(
    createEmptyAdminHomepageSectionItemForm(),
  );
  const [itemEditForms, setItemEditForms] = useState<ItemFormState>({});
  const [sectionErrors, setSectionErrors] = useState<SectionErrors>({});
  const [itemErrors, setItemErrors] = useState<ItemErrors>({});
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingApprovedProperties, setIsLoadingApprovedProperties] = useState(false);
  const [approvedPropertiesError, setApprovedPropertiesError] = useState("");
  const [approvedProperties, setApprovedProperties] = useState<AdminPropertyApplicationSummary[]>([]);
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemActionKey, setItemActionKey] = useState("");

  const loadApprovedProperties = async () => {
    if (!token) {
      return;
    }

    setIsLoadingApprovedProperties(true);
    setApprovedPropertiesError("");

    try {
      const data = await getAdminPropertyApplications(token, { status: "approved" });
      setApprovedProperties(data);
    } catch (error) {
      if (error instanceof ApiError) {
        setApprovedPropertiesError(error.message);
      } else {
        setApprovedPropertiesError("Unable to load the approved property list.");
      }
    } finally {
      setIsLoadingApprovedProperties(false);
    }
  };

  const loadSection = async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setPageError("");

    try {
      const data = await getAdminHomepageSection(token, sectionId);
      setSection(data);
      setSectionForm(mapSectionDetailToForm(data));
      setItemEditForms(
        data.items.reduce<ItemFormState>((accumulator, item) => {
          accumulator[item.propertyId] = {
            sortOrder: item.sortOrder?.toString() ?? "",
            isActive: item.isActive,
          };
          return accumulator;
        }, {}),
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setPageError(error.message);
      } else {
        setPageError("Unable to load homepage section details.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSection();
  }, [sectionId, token]);

  useEffect(() => {
    void loadApprovedProperties();
  }, [token]);

  const syncSectionState = (nextSection: AdminHomepageSectionDetail) => {
    setSection(nextSection);
    setSectionForm(mapSectionDetailToForm(nextSection));
    setItemEditForms(
      nextSection.items.reduce<ItemFormState>((accumulator, item) => {
        accumulator[item.propertyId] = {
          sortOrder: item.sortOrder?.toString() ?? "",
          isActive: item.isActive,
        };
        return accumulator;
      }, {}),
    );
  };

  const validateSectionForm = () => {
    const nextErrors: SectionErrors = {};

    if (!sectionForm.title.trim()) {
      nextErrors.title = "Title is required.";
    }

    setSectionErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateItemForm = () => {
    const nextErrors: ItemErrors = {};

    if (!itemForm.propertyId.trim()) {
      nextErrors.propertyId = "Approved property is required.";
    }

    setItemErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const availableApprovedProperties = useMemo(() => {
    if (!section) {
      return approvedProperties;
    }

    const existingIds = new Set(section.items.map((item) => item.propertyId));
    return approvedProperties.filter((item) => !existingIds.has(item.id));
  }, [approvedProperties, section]);

  const approvedPropertyNameById = useMemo(
    () =>
      approvedProperties.reduce<Record<string, string>>((accumulator, item) => {
        accumulator[item.id] = item.propertyName || "Untitled property";
        return accumulator;
      }, {}),
    [approvedProperties],
  );

  const handleSaveSection = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !validateSectionForm()) {
      return;
    }

    setIsSavingSection(true);
    setSectionErrors({});
    setSuccessMessage("");
    setPageError("");

    try {
      const updated = await updateAdminHomepageSection(token, sectionId, sectionForm);
      syncSectionState(updated);
      setSuccessMessage("Section metadata updated successfully.");
    } catch (error) {
      if (error instanceof ApiError) {
        setSectionErrors({ form: error.message });
      } else {
        setSectionErrors({ form: "Unable to update section metadata." });
      }
    } finally {
      setIsSavingSection(false);
    }
  };

  const handleAddItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !validateItemForm()) {
      return;
    }

    setIsAddingItem(true);
    setItemErrors({});
    setSuccessMessage("");
    setPageError("");

    try {
      const updated = await createAdminHomepageSectionItem(token, sectionId, itemForm);
      syncSectionState(updated);
      setItemForm(createEmptyAdminHomepageSectionItemForm());
      setSuccessMessage("Property added to the homepage section successfully.");
    } catch (error) {
      if (error instanceof ApiError) {
        setItemErrors({ form: error.message });
      } else {
        setItemErrors({ form: "Unable to add the property into this section." });
      }
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleItemFormChange = (
    propertyId: string,
    field: keyof UpdateAdminHomepageSectionItemPayload,
    value: string | boolean,
  ) => {
    setItemEditForms((current) => ({
      ...current,
      [propertyId]: {
        ...(current[propertyId] ?? { sortOrder: "", isActive: true }),
        [field]: value,
      },
    }));
  };

  const handleUpdateItem = async (item: AdminHomepageSectionItem) => {
    if (!token) {
      return;
    }

    const values = itemEditForms[item.propertyId] ?? {
      sortOrder: item.sortOrder?.toString() ?? "",
      isActive: item.isActive,
    };

    const actionKey = `save-${item.propertyId}`;
    setItemActionKey(actionKey);
    setSuccessMessage("");
    setPageError("");

    try {
      const updated = await updateAdminHomepageSectionItem(token, sectionId, item.propertyId, values);
      syncSectionState(updated);
      setSuccessMessage("Section item updated successfully.");
    } catch (error) {
      if (error instanceof ApiError) {
        setPageError(error.message);
      } else {
        setPageError("Unable to update this section item.");
      }
    } finally {
      setItemActionKey("");
    }
  };

  const handleDeleteItem = async (propertyId: string) => {
    if (!token) {
      return;
    }

    const actionKey = `delete-${propertyId}`;
    setItemActionKey(actionKey);
    setSuccessMessage("");
    setPageError("");

    try {
      const updated = await deleteAdminHomepageSectionItem(token, sectionId, propertyId);
      syncSectionState(updated);
      setSuccessMessage("Property removed from the homepage section successfully.");
    } catch (error) {
      if (error instanceof ApiError) {
        setPageError(error.message);
      } else {
        setPageError("Unable to remove this property from the section.");
      }
    } finally {
      setItemActionKey("");
    }
  };

  return (
    <AdminShell
      badge="Admin Curation"
      title={section ? section.title : "Section Detail"}
      subtitle="Edit section metadata and manage the approved property IDs curated into this homepage section."
      topbarAction={
        <Link
          href="/admin/homepage-sections"
          className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-3 py-2 text-[12px] font-semibold text-text-primary shadow-soft"
        >
          Back
        </Link>
      }
    >
      {pageError ? (
        <div className="mb-4 rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
          {pageError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-4 rounded-[22px] border border-primary/35 bg-primary-light/80 px-4 py-4 text-[14px] leading-6 text-text-primary">
          {successMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="surface-card rounded-[28px] p-6 text-[14px] text-text-secondary">
          Loading homepage section...
        </div>
      ) : section ? (
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="surface-card rounded-[28px] p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
              Section Metadata
            </p>
            <h2 className="mt-4 font-sora text-[26px] font-bold tracking-[-0.04em] text-text-primary">
              Edit section settings
            </h2>

            <form className="mt-6 space-y-4" onSubmit={handleSaveSection}>
              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-text-primary">Title</span>
                <input
                  type="text"
                  value={sectionForm.title}
                  onChange={(event) =>
                    setSectionForm((current) => ({ ...current, title: event.target.value }))
                  }
                  className={inputClassName}
                />
                {sectionErrors.title ? (
                  <p className="mt-2 text-[13px] text-red-600">{sectionErrors.title}</p>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-text-primary">Slug</span>
                <input
                  type="text"
                  value={sectionForm.slug}
                  onChange={(event) =>
                    setSectionForm((current) => ({ ...current, slug: event.target.value }))
                  }
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-text-primary">Description</span>
                <textarea
                  rows={4}
                  value={sectionForm.description}
                  onChange={(event) =>
                    setSectionForm((current) => ({ ...current, description: event.target.value }))
                  }
                  className={`${inputClassName} min-h-[120px] resize-y`}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-text-primary">Sort order</span>
                <input
                  type="number"
                  min="0"
                  value={sectionForm.sortOrder}
                  onChange={(event) =>
                    setSectionForm((current) => ({ ...current, sortOrder: event.target.value }))
                  }
                  className={inputClassName}
                />
              </label>

              <label className="flex items-center gap-3 rounded-[20px] border border-border-light bg-surface px-4 py-4">
                <input
                  type="checkbox"
                  checked={sectionForm.isActive}
                  onChange={(event) =>
                    setSectionForm((current) => ({ ...current, isActive: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-border text-text-primary focus:ring-primary"
                />
                <span className="text-[14px] font-semibold text-text-primary">Keep this section active</span>
              </label>

              {sectionErrors.form ? (
                <div className="rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
                  {sectionErrors.form}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSavingSection}
                className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
              >
                {isSavingSection ? "Saving section..." : "Save section"}
              </button>
            </form>
          </section>

          <section className="space-y-4">
            <div className="surface-card rounded-[28px] p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                Add Property
              </p>
              <h2 className="mt-4 font-sora text-[26px] font-bold tracking-[-0.04em] text-text-primary">
                Add approved property
              </h2>
              <p className="mt-3 text-[14px] leading-6 text-text-secondary">
                Choose from the approved property inventory. Only approved properties can be added into a
                homepage section.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleAddItem}>
                <label className="block">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="block text-[13px] font-semibold text-text-primary">Approved property</span>
                    <button
                      type="button"
                      onClick={() => void loadApprovedProperties()}
                      className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-3 py-2 text-[12px] font-semibold text-text-primary shadow-soft disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={isLoadingApprovedProperties}
                    >
                      {isLoadingApprovedProperties ? "Refreshing..." : "Refresh list"}
                    </button>
                  </div>
                  <select
                    value={itemForm.propertyId}
                    onChange={(event) =>
                      setItemForm((current) => ({ ...current, propertyId: event.target.value }))
                    }
                    className={inputClassName}
                  >
                    <option value="">
                      {isLoadingApprovedProperties ? "Loading approved properties..." : "Select an approved property"}
                    </option>
                    {availableApprovedProperties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.propertyName || "Untitled property"} • {property.city || "City"} •{" "}
                        {property.country || "Country"}
                      </option>
                    ))}
                  </select>
                  {itemErrors.propertyId ? (
                    <p className="mt-2 text-[13px] text-red-600">{itemErrors.propertyId}</p>
                  ) : null}
                  {approvedPropertiesError ? (
                    <p className="mt-2 text-[13px] text-red-600">{approvedPropertiesError}</p>
                  ) : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-text-primary">Sort order</span>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.sortOrder}
                    onChange={(event) =>
                      setItemForm((current) => ({ ...current, sortOrder: event.target.value }))
                    }
                    placeholder="1"
                    className={inputClassName}
                  />
                </label>

                <label className="flex items-center gap-3 rounded-[20px] border border-border-light bg-surface px-4 py-4">
                  <input
                    type="checkbox"
                    checked={itemForm.isActive}
                    onChange={(event) =>
                      setItemForm((current) => ({ ...current, isActive: event.target.checked }))
                    }
                    className="h-4 w-4 rounded border-border text-text-primary focus:ring-primary"
                  />
                  <span className="text-[14px] font-semibold text-text-primary">Keep this item active</span>
                </label>

                {itemErrors.form ? (
                  <div className="rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
                    {itemErrors.form}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isAddingItem}
                  className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
                >
                  {isAddingItem ? "Adding property..." : "Add property to section"}
                </button>
              </form>
            </div>

            <div className="surface-card overflow-hidden rounded-[28px]">
              <div className="border-b border-border-light px-5 py-5 sm:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                  Curated Items
                </p>
                <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                  Manage section items
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-surface">
                    <tr className="text-left">
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                        Property
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                        Sort order
                      </th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                        Active
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {section.items.length > 0 ? (
                      section.items.map((item) => {
                        const editValues = itemEditForms[item.propertyId] ?? {
                          sortOrder: item.sortOrder?.toString() ?? "",
                          isActive: item.isActive,
                        };

                        return (
                          <tr key={item.propertyId} className="border-t border-border-light">
                            <td className="px-4 py-4 align-top text-[13px] font-semibold text-text-primary">
                              {approvedPropertyNameById[item.propertyId] || item.propertyId}
                            </td>
                            <td className="px-4 py-4 align-top">
                              <input
                                type="number"
                                min="0"
                                value={editValues.sortOrder}
                                onChange={(event) =>
                                  handleItemFormChange(item.propertyId, "sortOrder", event.target.value)
                                }
                                className={`${inputClassName} min-w-[120px] px-3 py-2`}
                              />
                            </td>
                            <td className="px-4 py-4 align-top">
                              <label className="inline-flex items-center gap-2 rounded-[14px] border border-border-light bg-surface px-3 py-2">
                                <input
                                  type="checkbox"
                                  checked={editValues.isActive}
                                  onChange={(event) =>
                                    handleItemFormChange(item.propertyId, "isActive", event.target.checked)
                                  }
                                  className="h-4 w-4 rounded border-border text-text-primary focus:ring-primary"
                                />
                                <span className="text-[12px] font-semibold text-text-primary">Active</span>
                              </label>
                            </td>
                            <td className="px-4 py-4 align-top">
                              <div className="flex flex-wrap justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => void handleUpdateItem(item)}
                                  disabled={itemActionKey === `save-${item.propertyId}`}
                                  className="inline-flex items-center justify-center rounded-[14px] bg-primary px-3 py-2 text-[12px] font-semibold text-text-primary shadow-glow disabled:opacity-70"
                                >
                                  {itemActionKey === `save-${item.propertyId}` ? "Saving..." : "Save"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteItem(item.propertyId)}
                                  disabled={itemActionKey === `delete-${item.propertyId}`}
                                  className="inline-flex items-center justify-center rounded-[14px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700 disabled:opacity-70"
                                >
                                  {itemActionKey === `delete-${item.propertyId}` ? "Removing..." : "Remove"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-[14px] text-text-secondary">
                          No curated properties have been added to this section yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </AdminShell>
  );
};
