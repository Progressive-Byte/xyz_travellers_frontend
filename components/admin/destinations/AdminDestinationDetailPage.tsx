"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  deleteAdminLocation,
  deleteFood,
  deleteTransport,
  getAdminCities,
  getAdminCountries,
  getAdminLocation,
  subscribeLocations,
  upsertAdminLocation,
  upsertFood,
  upsertTransport,
  type AdminFoodItem,
  type AdminGeoOption,
  type AdminLocationDetail,
  type AdminTransportItem,
  type UpsertAdminFoodPayload,
  type UpsertAdminLocationPayload,
  type UpsertAdminTransportPayload,
} from "@/lib/admin";

const inputClassName =
  "w-full rounded-[20px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium";

type LocationErrors = Partial<Record<keyof UpsertAdminLocationPayload | "form", string>>;
type TransportErrors = Partial<Record<keyof UpsertAdminTransportPayload | "form", string>>;
type FoodErrors = Partial<Record<keyof UpsertAdminFoodPayload | "form", string>>;

type TabKey = "info" | "transport" | "food";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createEmptyLocationForm(): UpsertAdminLocationPayload {
  return {
    name: "",
    slug: "",
    city: "",
    country: "",
    description: "",
    heroImage: "",
    isActive: true,
    sortOrder: 0,
    transportSectionTitle: "",
    transportSectionSubtitle: "",
    foodSectionTitle: "",
    foodSectionSubtitle: "",
    transportHeroImage: "",
    foodHeroImage: "",
  };
}

function createEmptyTransportForm(): UpsertAdminTransportPayload {
  return {
    companyName: "",
    contactNumber: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  };
}

function createEmptyFoodForm(): UpsertAdminFoodPayload {
  return {
    restaurantName: "",
    phoneNumber: "",
    location: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  };
}

function mapDetailToLocationForm(location: AdminLocationDetail): UpsertAdminLocationPayload {
  return {
    name: location.name,
    slug: location.slug,
    city: location.city,
    country: location.country,
    description: location.description ?? "",
    heroImage: location.heroImage ?? "",
    isActive: location.isActive,
    sortOrder: location.sortOrder,
    transportSectionTitle: location.transportSectionTitle,
    transportSectionSubtitle: location.transportSectionSubtitle,
    foodSectionTitle: location.foodSectionTitle,
    foodSectionSubtitle: location.foodSectionSubtitle,
    transportHeroImage: location.transportHeroImage ?? "",
    foodHeroImage: location.foodHeroImage ?? "",
  };
}

function mapTransportItemToForm(item: AdminTransportItem): UpsertAdminTransportPayload {
  return {
    companyName: item.companyName,
    contactNumber: item.contactNumber,
    description: item.description,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
  };
}

function mapFoodItemToForm(item: AdminFoodItem): UpsertAdminFoodPayload {
  return {
    restaurantName: item.restaurantName,
    phoneNumber: item.phoneNumber,
    location: item.location,
    description: item.description,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
  };
}

type AdminDestinationDetailPageProps = {
  locationId: string;
};

export const AdminDestinationDetailPage: React.FC<AdminDestinationDetailPageProps> = ({ locationId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();

  const [location, setLocation] = useState<AdminLocationDetail | null>(null);
  const [locationForm, setLocationForm] = useState<UpsertAdminLocationPayload>(createEmptyLocationForm());
  const [transportForm, setTransportForm] = useState<UpsertAdminTransportPayload>(createEmptyTransportForm());
  const [foodForm, setFoodForm] = useState<UpsertAdminFoodPayload>(createEmptyFoodForm());

  const [locationErrors, setLocationErrors] = useState<LocationErrors>({});
  const [transportErrors, setTransportErrors] = useState<TransportErrors>({});
  const [foodErrors, setFoodErrors] = useState<FoodErrors>({});

  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [isSavingTransport, setIsSavingTransport] = useState(false);
  const [isSavingFood, setIsSavingFood] = useState(false);
  const [isDeletingLocation, setIsDeletingLocation] = useState(false);

  const [editingTransportId, setEditingTransportId] = useState<string | null>(null);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [deletingTransportId, setDeletingTransportId] = useState<string>("");
  const [deletingFoodId, setDeletingFoodId] = useState<string>("");

  const [activeTab, setActiveTab] = useState<TabKey>("info");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "transport" || tabParam === "food" || tabParam === "info") {
      setActiveTab(tabParam);
    } else {
      setActiveTab("info");
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const loadLocation = async () => {
    if (!token) return;
    setIsLoading(true);
    setPageError("");

    try {
      const data = await getAdminLocation(token, locationId);
      setLocation(data);
      if (data) {
        setLocationForm(mapDetailToLocationForm(data));
      }
    } catch (error) {
      setPageError("Unable to load quick location details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadLocation();
  }, [locationId, token]);

  useEffect(() => {
    return subscribeLocations(() => {
      void loadLocation();
    });
  }, [locationId, token]);

  const syncLocationState = (next: AdminLocationDetail) => {
    setLocation(next);
    setLocationForm(mapDetailToLocationForm(next));
  };

  const validateLocationForm = () => {
    const nextErrors: LocationErrors = {};
    if (!locationForm.name?.trim()) nextErrors.name = "Name is required.";
    if (!locationForm.city?.trim()) nextErrors.city = "City is required.";
    if (!locationForm.country?.trim()) nextErrors.country = "Country is required.";
    setLocationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateTransportForm = () => {
    const nextErrors: TransportErrors = {};
    if (!transportForm.companyName?.trim()) nextErrors.companyName = "Company name is required.";
    if (!transportForm.contactNumber?.trim()) nextErrors.contactNumber = "Contact number is required.";
    setTransportErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateFoodForm = () => {
    const nextErrors: FoodErrors = {};
    if (!foodForm.restaurantName?.trim()) nextErrors.restaurantName = "Restaurant name is required.";
    if (!foodForm.phoneNumber?.trim()) nextErrors.phoneNumber = "Phone number is required.";
    if (!foodForm.location?.trim()) nextErrors.location = "Location is required.";
    setFoodErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveLocation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateLocationForm()) return;

    setIsSavingLocation(true);
    setLocationErrors({});
    setSuccessMessage("");
    setPageError("");

    try {
      if (!token) throw new Error("Admin authentication required.");
      const payload: UpsertAdminLocationPayload = { ...locationForm };
      if (!payload.slug || !payload.slug.trim()) {
        payload.slug = slugify(payload.name || "");
      }
      if (typeof payload.sortOrder === "string") {
        payload.sortOrder = parseInt(payload.sortOrder, 10) || 0;
      }
      await upsertAdminLocation(token, locationId, payload);
      const refreshed = await getAdminLocation(token, locationId);
      if (refreshed) syncLocationState(refreshed);
      setSuccessMessage("Quick location information updated successfully.");
    } catch (error) {
      setLocationErrors({ form: error instanceof Error ? error.message : "Unable to save quick location." });
    } finally {
      setIsSavingLocation(false);
    }
  };

  const handleDeleteLocation = async () => {
    if (!confirm("Are you sure you want to delete this quick location? This action cannot be undone.")) {
      return;
    }

    setIsDeletingLocation(true);
    setPageError("");

    try {
      if (!token) throw new Error("Admin authentication required.");
      await deleteAdminLocation(token, locationId);
      router.replace("/admin/locations");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Unable to delete quick location.");
      setIsDeletingLocation(false);
    }
  };

  const handleSaveTransport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateTransportForm()) return;

    setIsSavingTransport(true);
    setTransportErrors({});
    setSuccessMessage("");
    setPageError("");

    try {
      if (!token) throw new Error("Admin authentication required.");
      const payload: UpsertAdminTransportPayload = { ...transportForm };
      if (typeof payload.sortOrder === "string") {
        payload.sortOrder = parseInt(payload.sortOrder, 10) || 0;
      }
      await upsertTransport(token, locationId, editingTransportId, payload);
      const refreshed = await getAdminLocation(token, locationId);
      if (refreshed) syncLocationState(refreshed);
      setTransportForm(createEmptyTransportForm());
      setEditingTransportId(null);
      setSuccessMessage(editingTransportId ? "Transport service updated successfully." : "Transport service added successfully.");
    } catch (error) {
      setTransportErrors({ form: error instanceof Error ? error.message : "Unable to save transport service." });
    } finally {
      setIsSavingTransport(false);
    }
  };

  const handleEditTransport = (item: AdminTransportItem) => {
    setEditingTransportId(item.id);
    setTransportForm(mapTransportItemToForm(item));
    setTransportErrors({});
  };

  const handleCancelEditTransport = () => {
    setEditingTransportId(null);
    setTransportForm(createEmptyTransportForm());
    setTransportErrors({});
  };

  const handleDeleteTransport = async (id: string) => {
    if (!confirm("Delete this transport service?")) return;

    setDeletingTransportId(id);
    setPageError("");
    setSuccessMessage("");

    try {
      if (!token) throw new Error("Admin authentication required.");
      await deleteTransport(token, locationId, id);
      const refreshed = await getAdminLocation(token, locationId);
      if (refreshed) syncLocationState(refreshed);
      if (editingTransportId === id) {
        handleCancelEditTransport();
      }
      setSuccessMessage("Transport service deleted successfully.");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Unable to delete transport service.");
    } finally {
      setDeletingTransportId("");
    }
  };

  const handleSaveFood = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateFoodForm()) return;

    setIsSavingFood(true);
    setFoodErrors({});
    setSuccessMessage("");
    setPageError("");

    try {
      if (!token) throw new Error("Admin authentication required.");
      const payload: UpsertAdminFoodPayload = { ...foodForm };
      if (typeof payload.sortOrder === "string") {
        payload.sortOrder = parseInt(payload.sortOrder, 10) || 0;
      }
      await upsertFood(token, locationId, editingFoodId, payload);
      const refreshed = await getAdminLocation(token, locationId);
      if (refreshed) syncLocationState(refreshed);
      setFoodForm(createEmptyFoodForm());
      setEditingFoodId(null);
      setSuccessMessage(editingFoodId ? "Food spot updated successfully." : "Food spot added successfully.");
    } catch (error) {
      setFoodErrors({ form: error instanceof Error ? error.message : "Unable to save food spot." });
    } finally {
      setIsSavingFood(false);
    }
  };

  const handleEditFood = (item: AdminFoodItem) => {
    setEditingFoodId(item.id);
    setFoodForm(mapFoodItemToForm(item));
    setFoodErrors({});
  };

  const handleCancelEditFood = () => {
    setEditingFoodId(null);
    setFoodForm(createEmptyFoodForm());
    setFoodErrors({});
  };

  const handleDeleteFood = async (id: string) => {
    if (!confirm("Delete this food spot?")) return;

    setDeletingFoodId(id);
    setPageError("");
    setSuccessMessage("");

    try {
      if (!token) throw new Error("Admin authentication required.");
      await deleteFood(token, locationId, id);
      const refreshed = await getAdminLocation(token, locationId);
      if (refreshed) syncLocationState(refreshed);
      if (editingFoodId === id) {
        handleCancelEditFood();
      }
      setSuccessMessage("Food spot deleted successfully.");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Unable to delete food spot.");
    } finally {
      setDeletingFoodId("");
    }
  };

  const transportItems = location?.transportItems ?? [];
  const foodItems = location?.foodItems ?? [];

  const tabDefinitions = useMemo(
    () => [
      { value: "info" as const, label: "Info" },
      { value: "transport" as const, label: "Transport" },
      { value: "food" as const, label: "Food" },
    ],
    [],
  );

  const SkeletonRow = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse rounded-[20px] bg-border-light/60 ${className}`} />
  );

  return (
    <AdminShell
      badge="Admin Operations"
      title={isLoading ? "Loading quick location..." : location ? location.name : "Quick Location Detail"}
      subtitle="Manage the destination information, transport services, and local food spots."
      topbarAction={
        <Link
          href="/admin/locations"
          className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-3 py-2 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
        >
          Back to quick locations
        </Link>
      }
    >
      <div className="space-y-6">
        {location && !isLoading ? (
          <section className="surface-card rounded-[28px] p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Quick location
                </p>
                <h1 className="mt-2 font-sora text-[30px] font-bold tracking-[-0.05em] text-text-primary">
                  {location.name}
                </h1>
                <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                  {location.city}
                  {location.country ? `, ${location.country}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-border-light bg-surface px-3 py-1 text-[12px] font-semibold text-text-secondary">
                  {location.city}
                </span>
                <span className="inline-flex items-center rounded-full border border-border-light bg-surface px-3 py-1 text-[12px] font-semibold text-text-secondary">
                  {location.country}
                </span>
              </div>
            </div>
          </section>
        ) : null}

        <section className="surface-card rounded-[28px] p-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            {tabDefinitions.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleTabChange(tab.value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 ${
                    isActive
                      ? "border-primary/45 bg-primary-light text-text-primary shadow-soft"
                      : "border-border-light bg-white text-text-secondary hover:border-border hover:text-text-primary"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {pageError ? (
          <div className="rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
            {pageError}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-[22px] border border-primary/35 bg-primary-light/80 px-4 py-4 text-[14px] leading-6 text-text-primary">
            {successMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
            <div className="surface-card rounded-[28px] p-5 sm:p-6">
              <SkeletonRow className="mb-4 h-4 w-32" />
              <SkeletonRow className="mb-6 h-8 w-56" />
              <div className="space-y-4">
                <SkeletonRow className="h-[52px]" />
                <SkeletonRow className="h-[52px]" />
                <SkeletonRow className="h-[52px]" />
                <SkeletonRow className="h-[120px]" />
                <SkeletonRow className="h-[52px]" />
                <SkeletonRow className="h-[52px]" />
              </div>
            </div>
            <div className="space-y-6">
              <SkeletonRow className="h-[240px] rounded-[28px]" />
              <SkeletonRow className="h-[180px] rounded-[28px]" />
            </div>
          </div>
        ) : !location ? (
          <div className="surface-card rounded-[28px] p-8 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
              Not Found
            </p>
            <h2 className="mt-4 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              Destination not found
            </h2>
            <p className="mt-3 text-[14px] leading-6 text-text-secondary">
              The quick location you are looking for may have been removed or does not exist.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/locations"
                className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-4 py-2 text-[13px] font-semibold text-text-primary shadow-soft"
              >
                Back
              </Link>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "info" ? (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
                <section className="surface-card rounded-[28px] p-5 sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                    Quick location details
                  </p>
                  <h2 className="mt-4 font-sora text-[26px] font-bold tracking-[-0.04em] text-text-primary">
                    Edit information
                  </h2>

                <form className="mt-6 space-y-4" onSubmit={handleSaveLocation}>
                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-text-primary">Name *</span>
                    <input
                      type="text"
                      value={locationForm.name ?? ""}
                      onChange={(e) => setLocationForm((c) => ({ ...c, name: e.target.value }))}
                      className={inputClassName}
                    />
                    {locationErrors.name ? (
                      <p className="mt-2 text-[13px] text-red-600">{locationErrors.name}</p>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-text-primary">Slug</span>
                    <input
                      type="text"
                      value={locationForm.slug ?? ""}
                      onChange={(e) => setLocationForm((c) => ({ ...c, slug: e.target.value }))}
                      className={inputClassName}
                      placeholder="Auto-generated if empty"
                    />
                    <p className="mt-1.5 text-[12px] text-text-secondary">
                      Auto-generated if empty
                    </p>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-[13px] font-semibold text-text-primary">City *</span>
                      <input
                        type="text"
                        value={locationForm.city ?? ""}
                        onChange={(e) => setLocationForm((c) => ({ ...c, city: e.target.value }))}
                        className={inputClassName}
                      />
                      {locationErrors.city ? (
                        <p className="mt-2 text-[13px] text-red-600">{locationErrors.city}</p>
                      ) : null}
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[13px] font-semibold text-text-primary">Country *</span>
                      <input
                        type="text"
                        value={locationForm.country ?? ""}
                        onChange={(e) => setLocationForm((c) => ({ ...c, country: e.target.value }))}
                        className={inputClassName}
                      />
                      {locationErrors.country ? (
                        <p className="mt-2 text-[13px] text-red-600">{locationErrors.country}</p>
                      ) : null}
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-text-primary">Description</span>
                    <textarea
                      rows={5}
                      value={locationForm.description ?? ""}
                      onChange={(e) => setLocationForm((c) => ({ ...c, description: e.target.value }))}
                      className={`${inputClassName} min-h-[120px] resize-y`}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-text-primary">Sort order</span>
                    <input
                      type="number"
                      min="0"
                      value={locationForm.sortOrder ?? ""}
                      onChange={(e) => setLocationForm((c) => ({ ...c, sortOrder: e.target.value as unknown as number }))}
                      className={inputClassName}
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-[20px] border border-border-light bg-surface px-4 py-4">
                    <input
                      type="checkbox"
                      checked={!!locationForm.isActive}
                      onChange={(e) => setLocationForm((c) => ({ ...c, isActive: e.target.checked }))}
                      className="h-4 w-4 rounded border-border text-text-primary focus:ring-primary"
                    />
                    <span className="text-[14px] font-semibold text-text-primary">Keep this quick location active</span>
                  </label>

                  <div className="rounded-[24px] border border-border-light p-4 sm:p-5">
                    <p className="text-[12px] font-semibold text-text-primary">Transport section heading & hero</p>
                    <div className="mt-4 space-y-4">
                      <label className="block">
                        <span className="mb-2 block text-[13px] font-semibold text-text-primary">Title</span>
                        <input
                          type="text"
                          value={locationForm.transportSectionTitle ?? ""}
                          onChange={(e) => setLocationForm((c) => ({ ...c, transportSectionTitle: e.target.value }))}
                          className={inputClassName}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-[13px] font-semibold text-text-primary">Subtitle</span>
                        <input
                          type="text"
                          value={locationForm.transportSectionSubtitle ?? ""}
                          onChange={(e) => setLocationForm((c) => ({ ...c, transportSectionSubtitle: e.target.value }))}
                          className={inputClassName}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-[13px] font-semibold text-text-primary">Hero image URL</span>
                        <input
                          type="text"
                          value={locationForm.transportHeroImage ?? ""}
                          onChange={(e) => setLocationForm((c) => ({ ...c, transportHeroImage: e.target.value }))}
                          className={inputClassName}
                          placeholder="https://..."
                        />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-border-light p-4 sm:p-5">
                    <p className="text-[12px] font-semibold text-text-primary">Food section heading & hero</p>
                    <div className="mt-4 space-y-4">
                      <label className="block">
                        <span className="mb-2 block text-[13px] font-semibold text-text-primary">Title</span>
                        <input
                          type="text"
                          value={locationForm.foodSectionTitle ?? ""}
                          onChange={(e) => setLocationForm((c) => ({ ...c, foodSectionTitle: e.target.value }))}
                          className={inputClassName}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-[13px] font-semibold text-text-primary">Subtitle</span>
                        <input
                          type="text"
                          value={locationForm.foodSectionSubtitle ?? ""}
                          onChange={(e) => setLocationForm((c) => ({ ...c, foodSectionSubtitle: e.target.value }))}
                          className={inputClassName}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-[13px] font-semibold text-text-primary">Hero image URL</span>
                        <input
                          type="text"
                          value={locationForm.foodHeroImage ?? ""}
                          onChange={(e) => setLocationForm((c) => ({ ...c, foodHeroImage: e.target.value }))}
                          className={inputClassName}
                          placeholder="https://..."
                        />
                      </label>
                    </div>
                  </div>

                  {locationErrors.form ? (
                    <div className="rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
                      {locationErrors.form}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSavingLocation}
                    className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
                  >
                    {isSavingLocation ? "Saving changes..." : "Save changes"}
                  </button>
                </form>
              </section>

              <section className="space-y-6">
                <div className="surface-card rounded-[28px] p-5 sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                    Public Link
                  </p>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-text-primary">Public page link</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Link
                        href={`/destinations/${location.slug}`}
                        className="text-sm text-text-primary underline underline-offset-2 hover:text-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        /destinations/{location.slug}
                      </Link>
                      <Link
                        href={`/destinations/${location.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-text-secondary hover:text-text-primary"
                      >
                        Open in new tab
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 17L17 7" />
                          <path d="M7 7h10v10" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="surface-card rounded-[28px] p-5 sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                    Quick counts
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-border-light bg-surface px-3 py-1.5 text-[12px] font-semibold text-text-secondary">
                      Stays listing count: N/A
                    </span>
                    <span className="inline-flex items-center rounded-full border border-border-light bg-surface px-3 py-1.5 text-[12px] font-semibold text-text-secondary">
                      Transport services: {transportItems.length}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-border-light bg-surface px-3 py-1.5 text-[12px] font-semibold text-text-secondary">
                      Food restaurants: {foodItems.length}
                    </span>
                  </div>
                </div>

                <div className="rounded-[28px] border border-red-200 bg-red-50/70 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-red-100 text-red-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[16px] font-bold text-red-800">Delete this quick location</h3>
                      <p className="mt-1.5 text-[13px] leading-6 text-red-700/90">
                        This will permanently remove the quick location and all of its transport services and food spot entries. This action cannot be reversed.
                      </p>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => void handleDeleteLocation()}
                          disabled={isDeletingLocation}
                          className="inline-flex items-center justify-center rounded-[16px] border border-red-300 bg-red-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-soft transition-all hover:bg-red-700 disabled:opacity-70"
                        >
                          {isDeletingLocation ? "Deleting..." : "Delete quick location"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          ) : null}

          {activeTab === "transport" ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              <section className="surface-card rounded-[28px] p-5 sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                  {editingTransportId ? "Edit transport" : "Add transport"}
                </p>
                <h2 className="mt-4 font-sora text-[26px] font-bold tracking-[-0.04em] text-text-primary">
                  {editingTransportId ? "Edit transport service" : "Add transport service"}
                </h2>
                <p className="mt-3 text-[14px] leading-6 text-text-secondary">
                  {editingTransportId
                    ? "Update the existing transport service details below."
                    : "Add a new transport or transfer service for this quick location."}
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSaveTransport}>
                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-text-primary">Company name *</span>
                    <input
                      type="text"
                      value={transportForm.companyName ?? ""}
                      onChange={(e) => setTransportForm((c) => ({ ...c, companyName: e.target.value }))}
                      className={inputClassName}
                    />
                    {transportErrors.companyName ? (
                      <p className="mt-2 text-[13px] text-red-600">{transportErrors.companyName}</p>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-text-primary">Contact number *</span>
                    <input
                      type="text"
                      value={transportForm.contactNumber ?? ""}
                      onChange={(e) => setTransportForm((c) => ({ ...c, contactNumber: e.target.value }))}
                      className={inputClassName}
                    />
                    {transportErrors.contactNumber ? (
                      <p className="mt-2 text-[13px] text-red-600">{transportErrors.contactNumber}</p>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-text-primary">Description</span>
                    <textarea
                      rows={4}
                      value={transportForm.description ?? ""}
                      onChange={(e) => setTransportForm((c) => ({ ...c, description: e.target.value }))}
                      className={`${inputClassName} min-h-[100px] resize-y`}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-text-primary">Sort order</span>
                    <input
                      type="number"
                      min="0"
                      value={transportForm.sortOrder ?? ""}
                      onChange={(e) => setTransportForm((c) => ({ ...c, sortOrder: e.target.value as unknown as number }))}
                      className={inputClassName}
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-[20px] border border-border-light bg-surface px-4 py-4">
                    <input
                      type="checkbox"
                      checked={!!transportForm.isActive}
                      onChange={(e) => setTransportForm((c) => ({ ...c, isActive: e.target.checked }))}
                      className="h-4 w-4 rounded border-border text-text-primary focus:ring-primary"
                    />
                    <span className="text-[14px] font-semibold text-text-primary">Keep this service active</span>
                  </label>

                  {transportErrors.form ? (
                    <div className="rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
                      {transportErrors.form}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={isSavingTransport}
                      className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
                    >
                      {isSavingTransport
                        ? editingTransportId
                          ? "Updating transport service..."
                          : "Adding transport service..."
                        : editingTransportId
                        ? "Update transport service"
                        : "Save transport service"}
                    </button>
                    {editingTransportId ? (
                      <button
                        type="button"
                        onClick={handleCancelEditTransport}
                        className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all hover:bg-surface"
                      >
                        Cancel edit
                      </button>
                    ) : null}
                  </div>
                </form>
              </section>

              <section className="surface-card overflow-hidden rounded-[28px]">
                <div className="border-b border-border-light px-5 py-5 sm:px-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                    Transport inventory
                  </p>
                  <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                    Manage transport services
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-surface">
                      <tr className="text-left">
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                          Company
                        </th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                          Status
                        </th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                          Sort
                        </th>
                        <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className="border-t border-border-light">
                            <td className="px-4 py-4">
                              <SkeletonRow className="h-4 w-32" />
                              <SkeletonRow className="mt-1 h-3 w-24" />
                            </td>
                            <td className="px-4 py-4"><SkeletonRow className="h-6 w-16" /></td>
                            <td className="px-4 py-4"><SkeletonRow className="h-4 w-10" /></td>
                            <td className="px-4 py-4"><SkeletonRow className="ml-auto h-8 w-40" /></td>
                          </tr>
                        ))
                      ) : transportItems.length > 0 ? (
                        transportItems.map((item) => (
                          <tr key={item.id} className="border-t border-border-light">
                            <td className="px-4 py-4 align-top">
                              <p className="text-[14px] font-bold text-text-primary">{item.companyName}</p>
                              <p className="mt-0.5 text-[12px] text-text-secondary">{item.contactNumber}</p>
                              {item.description ? (
                                <p className="mt-1 line-clamp-1 text-[12px] text-text-secondary/80">
                                  {item.description}
                                </p>
                              ) : null}
                            </td>
                            <td className="px-4 py-4 align-top">
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
                                  item.isActive
                                    ? "border-primary/45 bg-primary-light text-text-primary"
                                    : "border-border-light bg-surface text-text-secondary"
                                }`}
                              >
                                {item.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-4 align-top text-[13px] font-semibold text-text-primary">
                              {item.sortOrder}
                            </td>
                            <td className="px-4 py-4 align-top">
                              <div className="flex flex-wrap justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditTransport(item)}
                                  disabled={editingTransportId === item.id}
                                  className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-3 py-2 text-[12px] font-semibold text-text-primary shadow-soft disabled:opacity-70"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteTransport(item.id)}
                                  disabled={deletingTransportId === item.id}
                                  className="inline-flex items-center justify-center rounded-[14px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700 disabled:opacity-70"
                                >
                                  {deletingTransportId === item.id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-[14px] text-text-secondary">
                            No transport services have been added for this quick location yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : null}

          {activeTab === "food" ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              <section className="surface-card rounded-[28px] p-5 sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                  {editingFoodId ? "Edit food spot" : "Add food spot"}
                </p>
                <h2 className="mt-4 font-sora text-[26px] font-bold tracking-[-0.04em] text-text-primary">
                  {editingFoodId ? "Edit restaurant / food spot" : "Add restaurant / food spot"}
                </h2>
                <p className="mt-3 text-[14px] leading-6 text-text-secondary">
                  {editingFoodId
                    ? "Update the existing food spot details below."
                    : "Add a new restaurant or recommended food spot for this quick location."}
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSaveFood}>
                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-text-primary">Restaurant name *</span>
                    <input
                      type="text"
                      value={foodForm.restaurantName ?? ""}
                      onChange={(e) => setFoodForm((c) => ({ ...c, restaurantName: e.target.value }))}
                      className={inputClassName}
                    />
                    {foodErrors.restaurantName ? (
                      <p className="mt-2 text-[13px] text-red-600">{foodErrors.restaurantName}</p>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-text-primary">Phone number *</span>
                    <input
                      type="text"
                      value={foodForm.phoneNumber ?? ""}
                      onChange={(e) => setFoodForm((c) => ({ ...c, phoneNumber: e.target.value }))}
                      className={inputClassName}
                    />
                    {foodErrors.phoneNumber ? (
                      <p className="mt-2 text-[13px] text-red-600">{foodErrors.phoneNumber}</p>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-text-primary">Location *</span>
                    <input
                      type="text"
                      value={foodForm.location ?? ""}
                      onChange={(e) => setFoodForm((c) => ({ ...c, location: e.target.value }))}
                      className={inputClassName}
                      placeholder="e.g. Gulshan 2 · Lakeside"
                    />
                    {foodErrors.location ? (
                      <p className="mt-2 text-[13px] text-red-600">{foodErrors.location}</p>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-text-primary">Description</span>
                    <textarea
                      rows={4}
                      value={foodForm.description ?? ""}
                      onChange={(e) => setFoodForm((c) => ({ ...c, description: e.target.value }))}
                      className={`${inputClassName} min-h-[100px] resize-y`}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-text-primary">Sort order</span>
                    <input
                      type="number"
                      min="0"
                      value={foodForm.sortOrder ?? ""}
                      onChange={(e) => setFoodForm((c) => ({ ...c, sortOrder: e.target.value as unknown as number }))}
                      className={inputClassName}
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-[20px] border border-border-light bg-surface px-4 py-4">
                    <input
                      type="checkbox"
                      checked={!!foodForm.isActive}
                      onChange={(e) => setFoodForm((c) => ({ ...c, isActive: e.target.checked }))}
                      className="h-4 w-4 rounded border-border text-text-primary focus:ring-primary"
                    />
                    <span className="text-[14px] font-semibold text-text-primary">Keep this food spot active</span>
                  </label>

                  {foodErrors.form ? (
                    <div className="rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
                      {foodErrors.form}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={isSavingFood}
                      className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
                    >
                      {isSavingFood
                        ? editingFoodId
                          ? "Updating food spot..."
                          : "Adding food spot..."
                        : editingFoodId
                        ? "Update food spot"
                        : "Save food spot"}
                    </button>
                    {editingFoodId ? (
                      <button
                        type="button"
                        onClick={handleCancelEditFood}
                        className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all hover:bg-surface"
                      >
                        Cancel edit
                      </button>
                    ) : null}
                  </div>
                </form>
              </section>

              <section className="surface-card overflow-hidden rounded-[28px]">
                <div className="border-b border-border-light px-5 py-5 sm:px-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                    Food inventory
                  </p>
                  <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                    Manage restaurants & food
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-surface">
                      <tr className="text-left">
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                          Restaurant
                        </th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                          Phone
                        </th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                          Status
                        </th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                          Sort
                        </th>
                        <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className="border-t border-border-light">
                            <td className="px-4 py-4">
                              <SkeletonRow className="h-4 w-32" />
                              <SkeletonRow className="mt-1 h-3 w-24" />
                            </td>
                            <td className="px-4 py-4"><SkeletonRow className="h-6 w-24" /></td>
                            <td className="px-4 py-4"><SkeletonRow className="h-6 w-16" /></td>
                            <td className="px-4 py-4"><SkeletonRow className="h-4 w-10" /></td>
                            <td className="px-4 py-4"><SkeletonRow className="ml-auto h-8 w-40" /></td>
                          </tr>
                        ))
                      ) : foodItems.length > 0 ? (
                        foodItems.map((item) => (
                          <tr key={item.id} className="border-t border-border-light">
                            <td className="px-4 py-4 align-top">
                              <p className="text-[14px] font-bold text-text-primary">{item.restaurantName}</p>
                              <p className="mt-0.5 text-[12px] text-text-secondary">{item.location}</p>
                              {item.description ? (
                                <p className="mt-1 line-clamp-1 text-[12px] text-text-secondary/80">
                                  {item.description}
                                </p>
                              ) : null}
                            </td>
                            <td className="px-4 py-4 align-top">
                              {item.phoneNumber ? (
                                <span className="inline-flex items-center rounded-full bg-primary-light px-3 py-1 text-[12px] font-semibold text-text-primary">
                                  {item.phoneNumber}
                                </span>
                              ) : (
                                <span className="text-[12px] text-text-secondary">—</span>
                              )}
                            </td>
                            <td className="px-4 py-4 align-top">
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
                                  item.isActive
                                    ? "border-primary/45 bg-primary-light text-text-primary"
                                    : "border-border-light bg-surface text-text-secondary"
                                }`}
                              >
                                {item.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-4 align-top text-[13px] font-semibold text-text-primary">
                              {item.sortOrder}
                            </td>
                            <td className="px-4 py-4 align-top">
                              <div className="flex flex-wrap justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditFood(item)}
                                  disabled={editingFoodId === item.id}
                                  className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-3 py-2 text-[12px] font-semibold text-text-primary shadow-soft disabled:opacity-70"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteFood(item.id)}
                                  disabled={deletingFoodId === item.id}
                                  className="inline-flex items-center justify-center rounded-[14px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700 disabled:opacity-70"
                                >
                                  {deletingFoodId === item.id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-[14px] text-text-secondary">
                            No restaurants or food spots have been added for this quick location yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : null}
        </>
      )}
      </div>
    </AdminShell>
  );
};
