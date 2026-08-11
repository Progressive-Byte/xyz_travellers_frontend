export type AdminLocationSummary = {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  heroImage: string | null;
  isActive: boolean;
  sortOrder: number;
  description: string | null;
  transportSectionTitle: string;
  transportSectionSubtitle: string;
  foodSectionTitle: string;
  foodSectionSubtitle: string;
  transportHeroImage: string | null;
  foodHeroImage: string | null;
  transportServicesCount: number;
  foodRestaurantsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminTransportItem = {
  id: string;
  companyName: string;
  contactNumber: string;
  description: string;
  heroImage: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminFoodItem = {
  id: string;
  restaurantName: string;
  phoneNumber: string;
  location: string;
  description: string;
  heroImage: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminLocationDetail = AdminLocationSummary & {
  transportItems: AdminTransportItem[];
  foodItems: AdminFoodItem[];
};

export type UpsertAdminLocationPayload = {
  name?: string;
  slug?: string;
  city?: string;
  country?: string;
  description?: string | null;
  heroImage?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  transportSectionTitle?: string;
  transportSectionSubtitle?: string;
  foodSectionTitle?: string;
  foodSectionSubtitle?: string;
  transportHeroImage?: string | null;
  foodHeroImage?: string | null;
};

export type UpsertAdminTransportPayload = {
  companyName?: string;
  contactNumber?: string;
  description?: string;
  heroImage?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpsertAdminFoodPayload = {
  restaurantName?: string;
  phoneNumber?: string;
  location?: string;
  description?: string;
  heroImage?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function generateId(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

type StoreState = {
  summaries: AdminLocationSummary[];
  transportMap: Record<string, AdminTransportItem[]>;
  foodMap: Record<string, AdminFoodItem[]>;
};

function readStore(): StoreState {
  return { summaries: [], transportMap: {}, foodMap: {} };
}

function writeStore(state: StoreState): void {
  void state;
}

function notifyUpdate(): void {}

function sortSummaries(list: AdminLocationSummary[]): AdminLocationSummary[] {
  return [...list].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function sortTransportItems(list: AdminTransportItem[]): AdminTransportItem[] {
  return [...list].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function sortFoodItems(list: AdminFoodItem[]): AdminFoodItem[] {
  return [...list].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getAdminLocations(params: { isActive?: boolean } = {}): AdminLocationSummary[] {
  void params;
  return [];
}

export function getAdminLocation(locationId: string): AdminLocationDetail | null {
  void locationId;
  return null;
}

export function getPublicPills() {
  return [];
}

export function getPublicDestination(slug: string): AdminLocationDetail | null {
  void slug;
  return null;
}

export function upsertAdminLocation(
  id: string | null | undefined,
  payload: UpsertAdminLocationPayload,
): AdminLocationSummary {
  const now = new Date().toISOString();

  if (id) {
    const existing = readStore().summaries.find((loc) => loc.id === id);
    if (existing) {
      return { ...existing, ...payload, updatedAt: now };
    }
    const slugCandidate = payload.slug ? slugify(payload.slug) : slugify(payload.name || "destination");
    return {
      id,
      name: payload.name || "",
      slug: slugCandidate,
      city: payload.city || "",
      country: payload.country || "",
      description: payload.description ?? null,
      heroImage: payload.heroImage ?? null,
      isActive: payload.isActive ?? true,
      sortOrder: payload.sortOrder ?? 0,
      transportSectionTitle: payload.transportSectionTitle || "Transportation Services",
      transportSectionSubtitle: payload.transportSectionSubtitle || "Local transport companies and contact details",
      foodSectionTitle: payload.foodSectionTitle || "Food & Restaurants",
      foodSectionSubtitle: payload.foodSectionSubtitle || "Recommended restaurants near this location",
      transportHeroImage: payload.transportHeroImage ?? null,
      foodHeroImage: payload.foodHeroImage ?? null,
      transportServicesCount: 0,
      foodRestaurantsCount: 0,
      createdAt: now,
      updatedAt: now,
    };
  }

  let slug = payload.slug ? slugify(payload.slug) : slugify(payload.name || "destination");
  const newId = generateId("loc");
  return {
    id: newId,
    name: payload.name || "",
    slug,
    city: payload.city || "",
    country: payload.country || "",
    description: payload.description ?? null,
    heroImage: payload.heroImage ?? null,
    isActive: payload.isActive ?? true,
    sortOrder: payload.sortOrder ?? 0,
    transportSectionTitle: payload.transportSectionTitle || "Transportation Services",
    transportSectionSubtitle: payload.transportSectionSubtitle || "Local transport companies and contact details",
    foodSectionTitle: payload.foodSectionTitle || "Food & Restaurants",
    foodSectionSubtitle: payload.foodSectionSubtitle || "Recommended restaurants near this location",
    transportHeroImage: payload.transportHeroImage ?? null,
    foodHeroImage: payload.foodHeroImage ?? null,
    transportServicesCount: 0,
    foodRestaurantsCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function deleteAdminLocation(id: string): void {
  void id;
  writeStore(readStore());
  notifyUpdate();
}

export function upsertTransport(
  locationId: string,
  id: string | null | undefined,
  payload: UpsertAdminTransportPayload,
): AdminTransportItem {
  void locationId;
  const now = new Date().toISOString();
  if (id) {
    const state = readStore();
    const existing = state.transportMap[locationId]?.find((t) => t.id === id);
    if (existing) return { ...existing, ...payload, updatedAt: now };
  }
  return {
    id: id || generateId("tr"),
    companyName: payload.companyName || "",
    contactNumber: payload.contactNumber || "",
    description: payload.description || "",
    heroImage: payload.heroImage ?? null,
    sortOrder: payload.sortOrder ?? 0,
    isActive: payload.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };
}

export function deleteTransport(locationId: string, id: string): void {
  void locationId;
  void id;
  writeStore(readStore());
  notifyUpdate();
}

export function upsertFood(
  locationId: string,
  id: string | null | undefined,
  payload: UpsertAdminFoodPayload,
): AdminFoodItem {
  void locationId;
  const now = new Date().toISOString();
  if (id) {
    const state = readStore();
    const existing = state.foodMap[locationId]?.find((f) => f.id === id);
    if (existing) return { ...existing, ...payload, updatedAt: now };
  }
  return {
    id: id || generateId("fd"),
    restaurantName: payload.restaurantName || "",
    phoneNumber: payload.phoneNumber || "",
    location: payload.location || "",
    description: payload.description || "",
    heroImage: payload.heroImage ?? null,
    sortOrder: payload.sortOrder ?? 0,
    isActive: payload.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };
}

export function deleteFood(locationId: string, id: string): void {
  void locationId;
  void id;
  writeStore(readStore());
  notifyUpdate();
}

export function subscribe(callback: () => void): () => void {
  void callback;
  return () => {};
}
