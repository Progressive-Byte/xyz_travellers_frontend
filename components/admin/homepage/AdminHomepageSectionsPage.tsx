"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  createAdminHomepageSection,
  createEmptyAdminHomepageSectionForm,
  deleteAdminHomepageSection,
  getAdminHomepageSections,
  type AdminHomepageSectionSummary,
  type UpsertAdminHomepageSectionPayload,
} from "@/lib/admin";

const inputClassName =
  "w-full rounded-[20px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium";

type FormErrors = Partial<Record<keyof UpsertAdminHomepageSectionPayload | "form", string>>;

export const AdminHomepageSectionsPage: React.FC = () => {
  const { token } = useAuth();
  const [sections, setSections] = useState<AdminHomepageSectionSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formValues, setFormValues] = useState<UpsertAdminHomepageSectionPayload>(
    createEmptyAdminHomepageSectionForm(),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingSectionId, setDeletingSectionId] = useState("");

  const loadSections = async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setPageError("");

    try {
      const data = await getAdminHomepageSections(token);
      setSections(data);
    } catch (error) {
      if (error instanceof ApiError) {
        setPageError(error.message);
      } else {
        setPageError("Unable to load homepage sections.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSections();
  }, [token]);

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return sections;
    }

    return sections.filter((section) =>
      [section.title, section.slug, section.description].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [searchQuery, sections]);

  const handleFormChange = (field: keyof UpsertAdminHomepageSectionPayload, value: string | boolean) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!formValues.title.trim()) {
      nextErrors.title = "Title is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const created = await createAdminHomepageSection(token, formValues);

      setSections((current) => [
        {
          id: created.id,
          title: created.title,
          slug: created.slug,
          description: created.description,
          isActive: created.isActive,
          sortOrder: created.sortOrder,
          itemsCount: created.items.length,
        },
        ...current,
      ]);
      setFormValues(createEmptyAdminHomepageSectionForm());
      setSuccessMessage("Homepage section created successfully.");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({ form: error.message });
      } else {
        setErrors({ form: "Unable to create homepage section." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (sectionId: string) => {
    if (!token) {
      return;
    }

    setDeletingSectionId(sectionId);
    setPageError("");
    setSuccessMessage("");

    try {
      await deleteAdminHomepageSection(token, sectionId);
      setSections((current) => current.filter((section) => section.id !== sectionId));
      setSuccessMessage("Homepage section deleted successfully.");
    } catch (error) {
      if (error instanceof ApiError) {
        setPageError(error.message);
      } else {
        setPageError("Unable to delete homepage section.");
      }
    } finally {
      setDeletingSectionId("");
    }
  };

  return (
    <AdminShell
      badge="Admin Curation"
      title="Homepage Curation"
      subtitle="Create and manage homepage sections, then open each section to curate approved property IDs."
    >
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="surface-card rounded-[28px] p-5 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                Sections
              </p>
              <h2 className="mt-4 font-sora text-[26px] font-bold tracking-[-0.04em] text-text-primary">
                Existing homepage sections
              </h2>
            </div>

            <button
              type="button"
              onClick={() => void loadSections()}
              className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-3.5 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Refresh
            </button>
          </div>

          <div className="mt-5">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search sections by title, slug, or description"
              className={inputClassName}
            />
          </div>

          {pageError ? (
            <div className="mt-4 rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
              {pageError}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-4 rounded-[22px] border border-primary/35 bg-primary-light/80 px-4 py-4 text-[14px] leading-6 text-text-primary">
              {successMessage}
            </div>
          ) : null}

          <div className="mt-5 overflow-hidden rounded-[24px] border border-border-light">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-surface">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                      Section
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                      Status
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                      Sort
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                      Items
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[14px] text-text-secondary">
                        Loading homepage sections...
                      </td>
                    </tr>
                  ) : filteredSections.length > 0 ? (
                    filteredSections.map((section) => (
                      <tr key={section.id} className="border-t border-border-light">
                        <td className="px-4 py-4 align-top">
                          <p className="text-[14px] font-semibold text-text-primary">{section.title}</p>
                          <p className="mt-1 text-[12px] text-text-secondary">{section.slug || "No slug"}</p>
                          <p className="mt-2 max-w-[28rem] text-[13px] leading-6 text-text-secondary">
                            {section.description || "No description provided."}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                              section.isActive
                                ? "bg-primary-light text-text-primary"
                                : "bg-surface text-text-secondary"
                            }`}
                          >
                            {section.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top text-[13px] font-semibold text-text-primary">
                          {section.sortOrder ?? "Not set"}
                        </td>
                        <td className="px-4 py-4 align-top text-[13px] font-semibold text-text-primary">
                          {section.itemsCount ?? 0}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Link
                              href={`/admin/homepage-sections/${section.id}`}
                              className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-3 py-2 text-[12px] font-semibold text-text-primary shadow-soft"
                            >
                              Open
                            </Link>
                            <button
                              type="button"
                              onClick={() => void handleDelete(section.id)}
                              disabled={deletingSectionId === section.id}
                              className="inline-flex items-center justify-center rounded-[14px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700 disabled:opacity-70"
                            >
                              {deletingSectionId === section.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[14px] text-text-secondary">
                        No homepage sections match the current search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="surface-card rounded-[28px] p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
            Create Section
          </p>
          <h2 className="mt-4 font-sora text-[26px] font-bold tracking-[-0.04em] text-text-primary">
            New homepage section
          </h2>
          <form className="mt-6 space-y-4" onSubmit={handleCreate}>
            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold text-text-primary">Title</span>
              <input
                type="text"
                value={formValues.title}
                onChange={(event) => handleFormChange("title", event.target.value)}
                placeholder="Signature Apartments"
                className={inputClassName}
              />
              {errors.title ? <p className="mt-2 text-[13px] text-red-600">{errors.title}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold text-text-primary">Slug</span>
              <input
                type="text"
                value={formValues.slug}
                onChange={(event) => handleFormChange("slug", event.target.value)}
                placeholder="signature-apartments"
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold text-text-primary">Description</span>
              <textarea
                rows={4}
                value={formValues.description}
                onChange={(event) => handleFormChange("description", event.target.value)}
                placeholder="Editor-picked apartment stays"
                className={`${inputClassName} min-h-[120px] resize-y`}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold text-text-primary">Sort order</span>
              <input
                type="number"
                min="0"
                value={formValues.sortOrder}
                onChange={(event) => handleFormChange("sortOrder", event.target.value)}
                placeholder="1"
                className={inputClassName}
              />
            </label>

            <label className="flex items-center gap-3 rounded-[20px] border border-border-light bg-surface px-4 py-4">
              <input
                type="checkbox"
                checked={formValues.isActive}
                onChange={(event) => handleFormChange("isActive", event.target.checked)}
                className="h-4 w-4 rounded border-border text-text-primary focus:ring-primary"
              />
              <span className="text-[14px] font-semibold text-text-primary">Keep this section active</span>
            </label>

            {errors.form ? (
              <div className="rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
                {errors.form}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
            >
              {isSubmitting ? "Creating section..." : "Create section"}
            </button>
          </form>
        </section>
      </div>
    </AdminShell>
  );
};
