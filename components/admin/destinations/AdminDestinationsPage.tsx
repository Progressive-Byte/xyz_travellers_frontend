"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/context/AuthContext";
import {
  deleteAdminLocation,
  getAdminCities,
  getAdminCountries,
  getAdminLocations,
  subscribeLocations,
  upsertAdminLocation,
  type AdminGeoOption,
  type AdminLocationSummary,
  type UpsertAdminLocationPayload,
} from "@/lib/admin";

const inputClassName =
  "w-full rounded-[20px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium";

type FormErrors = Partial<Record<keyof UpsertAdminLocationPayload | "form", string>>;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createEmptyForm(sortOrder: number): UpsertAdminLocationPayload {
  return {
    name: "",
    slug: "",
    city: "",
    country: "",
    description: "",
    heroImage: "",
    isActive: true,
    sortOrder,
    transportSectionTitle: "",
    transportSectionSubtitle: "",
    foodSectionTitle: "",
    foodSectionSubtitle: "",
    transportHeroImage: "",
    foodHeroImage: "",
  };
}

export const AdminDestinationsPage: React.FC = () => {
  const { token } = useAuth();
  const [locations, setLocations] = useState<AdminLocationSummary[]>([]);
  const [cities, setCities] = useState<AdminGeoOption[]>([]);
  const [countries, setCountries] = useState<AdminGeoOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formValues, setFormValues] = useState<UpsertAdminLocationPayload>(createEmptyForm(1));
  const [errors, setErrors] = useState<FormErrors>({});
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingLocationId, setDeletingLocationId] = useState("");

  const loadLocations = async () => {
    if (!token) return;
    setIsLoading(true);
    setPageError("");

    try {
      const data = await getAdminLocations(token);
      setLocations(data);
    } catch (error) {
      setPageError("Unable to load quick locations.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadGeoOptions = async () => {
    if (!token) return;

    try {
      const [cityOptions, countryOptions] = await Promise.all([
        getAdminCities(token),
        getAdminCountries(token),
      ]);
      setCities(cityOptions);
      setCountries(countryOptions);
    } catch (error) {
      // Non-fatal: the city/country fields still accept free text via the datalist fallback.
    }
  };

  useEffect(() => {
    void loadLocations();
    void loadGeoOptions();

    const unsubscribe = subscribeLocations(() => {
      void loadLocations();
    });

    return unsubscribe;
  }, [token]);

  const filteredLocations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return locations;
    }

    return locations.filter((location) =>
      [location.name, location.city, location.country, location.slug].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [searchQuery, locations]);

  const handleFormChange = (field: keyof UpsertAdminLocationPayload, value: string | boolean | number) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSlugBlur = () => {
    if (!formValues.slug && formValues.name) {
      setFormValues((current) => ({
        ...current,
        slug: slugify(current.name || ""),
      }));
    }
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!formValues.name || formValues.name.trim().length < 2) {
      nextErrors.name = "Name is required (min 2 chars).";
    }
    if (!formValues.city || !formValues.city.trim()) {
      nextErrors.city = "City is required.";
    }
    if (!formValues.country || !formValues.country.trim()) {
      nextErrors.country = "Country is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    try {
      if (!token) throw new Error("Admin authentication required.");
      await upsertAdminLocation(token, null, formValues);

      const updated = await getAdminLocations(token);
      setLocations(updated);
      setFormValues(createEmptyForm(updated.length + 1));
      setSuccessMessage("Quick location created successfully.");
      void loadGeoOptions();
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ form: error.message });
      } else {
        setErrors({ form: "Unable to create quick location." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (locationId: string) => {
    setDeletingLocationId(locationId);
    setPageError("");
    setSuccessMessage("");

    try {
      if (!token) throw new Error("Admin authentication required.");
      await deleteAdminLocation(token, locationId);
      const updated = await getAdminLocations(token);
      setLocations(updated);
      setSuccessMessage("Quick location deleted successfully.");
    } catch (error) {
      if (error instanceof Error) {
        setPageError(error.message);
      } else {
        setPageError("Unable to delete quick location.");
      }
    } finally {
      setDeletingLocationId("");
    }
  };

  return (
    <AdminShell
      badge="Admin Curation"
      title="Quick Locations"
      subtitle="Create and manage quick-location cards, then open each to curate transport services and food recommendations for the homepage shortcut pills."
    >
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="surface-card rounded-[28px] p-5 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                Quick Locations
              </p>
              <h2 className="mt-4 font-sora text-[26px] font-bold tracking-[-0.04em] text-text-primary">
                Existing quick locations
              </h2>
            </div>

            <button
              type="button"
              onClick={() => void loadLocations()}
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
              placeholder="Search quick locations by name, city, country, or slug"
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
                      Location
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                      Status
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                      Sort
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                      Counts
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {isLoading ? (
                    <>
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <tr key={idx} className="border-t border-border-light">
                          <td colSpan={5} className="px-4 py-5">
                            <div className="animate-pulse flex gap-3">
                              <div className="h-12 w-12 rounded-2xl bg-border-light" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 w-40 rounded bg-border-light" />
                                <div className="h-3 w-24 rounded bg-border-light" />
                                <div className="h-3 w-64 rounded bg-border-light" />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  ) : filteredLocations.length > 0 ? (
                    filteredLocations.map((location) => (
                      <tr key={location.id} className="border-t border-border-light">
                        <td className="px-4 py-4 align-top">
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-semibold text-text-primary">{location.name}</p>
                            <p className="mt-1 text-[12px] text-text-secondary">
                              {location.slug || "No slug"}
                            </p>
                            <p className="mt-2 max-w-[28rem] text-[13px] leading-6 text-text-secondary">
                              {location.description || "No description provided."}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                              location.isActive
                                ? "bg-primary-light text-text-primary"
                                : "bg-surface text-text-secondary"
                            }`}
                          >
                            {location.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top text-[13px] font-semibold text-text-primary">
                          {location.sortOrder ?? "Not set"}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="text-[12px] font-semibold text-text-primary">
                            {location.transportServicesCount ?? 0}{" "}
                            <span className="font-normal text-text-secondary">transport</span>
                          </p>
                          <p className="text-[12px] font-semibold text-text-primary mt-0.5">
                            {location.foodRestaurantsCount ?? 0}{" "}
                            <span className="font-normal text-text-secondary">food</span>
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Link
                              href={`/admin/locations/${location.id}`}
                              className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-3 py-2 text-[12px] font-semibold text-text-primary shadow-soft"
                            >
                              Open
                            </Link>
                            <button
                              type="button"
                              onClick={() => void handleDelete(location.id)}
                              disabled={deletingLocationId === location.id}
                              className="inline-flex items-center justify-center rounded-[14px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700 disabled:opacity-70"
                            >
                              {deletingLocationId === location.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[14px] text-text-secondary">
                        No quick locations match the current search.
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
            Create Quick Location
          </p>
          <h2 className="mt-4 font-sora text-[26px] font-bold tracking-[-0.04em] text-text-primary">
            Create quick location
          </h2>
          <form className="mt-6 space-y-4" onSubmit={handleCreate}>
            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold text-text-primary">Name *</span>
              <input
                type="text"
                value={formValues.name || ""}
                onChange={(event) => handleFormChange("name", event.target.value)}
                placeholder="Cox's Bazar"
                className={inputClassName}
              />
              {errors.name ? <p className="mt-2 text-[13px] text-red-600">{errors.name}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold text-text-primary">Slug</span>
              <input
                type="text"
                value={formValues.slug || ""}
                onChange={(event) => handleFormChange("slug", event.target.value)}
                onBlur={handleSlugBlur}
                placeholder="coxs-bazar"
                className={inputClassName}
              />
              <p className="mt-2 text-[12px] text-text-secondary">Auto-generated if empty</p>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-text-primary">City *</span>
                <input
                  type="text"
                  list="admin-city-options"
                  value={formValues.city || ""}
                  onChange={(event) => handleFormChange("city", event.target.value)}
                  placeholder="Cox's Bazar"
                  className={inputClassName}
                />
                <datalist id="admin-city-options">
                  {cities.map((city) => (
                    <option key={city.id} value={city.name} />
                  ))}
                </datalist>
                <p className="mt-2 text-[12px] text-text-secondary">
                  Pick an existing city or type a new one to add it.
                </p>
                {errors.city ? <p className="mt-2 text-[13px] text-red-600">{errors.city}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-text-primary">Country *</span>
                <input
                  type="text"
                  list="admin-country-options"
                  value={formValues.country || ""}
                  onChange={(event) => handleFormChange("country", event.target.value)}
                  placeholder="Bangladesh"
                  className={inputClassName}
                />
                <datalist id="admin-country-options">
                  {countries.map((country) => (
                    <option key={country.id} value={country.name} />
                  ))}
                </datalist>
                <p className="mt-2 text-[12px] text-text-secondary">
                  Pick an existing country or type a new one to add it.
                </p>
                {errors.country ? <p className="mt-2 text-[13px] text-red-600">{errors.country}</p> : null}
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold text-text-primary">Description</span>
              <textarea
                rows={4}
                value={formValues.description || ""}
                onChange={(event) => handleFormChange("description", event.target.value)}
                placeholder="Beachfront stays, fresh seafood, and day trips to Saint Martin's Island."
                className={`${inputClassName} min-h-[120px] resize-y`}
              />
            </label>

            <div className="rounded-[22px] border border-border-light bg-surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary mb-3">
                Heading &amp; hero for Transport section
              </p>
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-text-primary">Title</span>
                  <input
                    type="text"
                    value={formValues.transportSectionTitle || ""}
                    onChange={(event) => handleFormChange("transportSectionTitle", event.target.value)}
                    placeholder="Getting Around Dhaka"
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-text-primary">Subtitle</span>
                  <input
                    type="text"
                    value={formValues.transportSectionSubtitle || ""}
                    onChange={(event) => handleFormChange("transportSectionSubtitle", event.target.value)}
                    placeholder="Trusted car rentals and airport transfer contacts."
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-text-primary">Hero image URL</span>
                  <input
                    type="text"
                    value={formValues.transportHeroImage || ""}
                    onChange={(event) => handleFormChange("transportHeroImage", event.target.value)}
                    placeholder="https://..."
                    className={inputClassName}
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[22px] border border-border-light bg-surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary mb-3">
                Heading &amp; hero for Food section
              </p>
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-text-primary">Title</span>
                  <input
                    type="text"
                    value={formValues.foodSectionTitle || ""}
                    onChange={(event) => handleFormChange("foodSectionTitle", event.target.value)}
                    placeholder="Taste of Dhaka"
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-text-primary">Subtitle</span>
                  <input
                    type="text"
                    value={formValues.foodSectionSubtitle || ""}
                    onChange={(event) => handleFormChange("foodSectionSubtitle", event.target.value)}
                    placeholder="Chef-curated restaurants and favourite biryani houses."
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-text-primary">Hero image URL</span>
                  <input
                    type="text"
                    value={formValues.foodHeroImage || ""}
                    onChange={(event) => handleFormChange("foodHeroImage", event.target.value)}
                    placeholder="https://..."
                    className={inputClassName}
                  />
                </label>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold text-text-primary">Sort order</span>
              <input
                type="number"
                min="0"
                value={formValues.sortOrder ?? ""}
                onChange={(event) => handleFormChange("sortOrder", event.target.value ? Number(event.target.value) : 0)}
                placeholder={String(locations.length + 1)}
                className={inputClassName}
              />
            </label>

            <label className="flex items-center gap-3 rounded-[20px] border border-border-light bg-surface px-4 py-4">
              <input
                type="checkbox"
                checked={formValues.isActive ?? true}
                onChange={(event) => handleFormChange("isActive", event.target.checked)}
                className="h-4 w-4 rounded border-border text-text-primary focus:ring-primary"
              />
              <span className="text-[14px] font-semibold text-text-primary">Keep this quick location active</span>
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
              {isSubmitting ? "Creating quick location..." : "Create quick location"}
            </button>
          </form>
        </section>
      </div>
    </AdminShell>
  );
};
