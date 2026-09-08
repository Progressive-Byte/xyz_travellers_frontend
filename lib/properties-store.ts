import type { FrontListingCard } from "@/lib/front";
import type { AdminPropertyApplicationSummary } from "@/lib/admin";

export type StoredProperty = Omit<FrontListingCard, "href" | "rating"> & {
  slug: string;
  locationSlug: string;
  cityTag: string;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  amenities: string[];
  ratingAverage: number;
  ratingCount: number;
  createdAt: number;
  hostId: string;
  hostFirstName: string;
  hostLastName: string;
  hostEmail: string;
  applicationStatus: "approved" | "submitted" | "draft" | "rejected";
  submittedAt: string | null;
  reviewedAt: string | null;
  ownershipType: string;
  propertyTypeId: string;
  unitsCount: number;
  hasVerificationDocuments: boolean;
  hasCoverMedia: boolean;
  rejectionReason: string;
};

export const getAllProperties = (): StoredProperty[] => {
  return [];
};

const APPROVED = "approved";

export const getPropertiesByLocation = (
  locationSlug: string,
  fallbackCityName?: string,
  onlyApproved = true,
): StoredProperty[] => {
  void locationSlug;
  void fallbackCityName;
  void onlyApproved;
  return [];
};

export const searchProperties = (filters: {
  q?: string;
  page?: number;
  limit?: number;
  checkIn?: string;
  checkOut?: string;
  guests?: number | null;
  onlyApproved?: boolean;
}): { items: StoredProperty[]; page: number; limit: number; total: number; hasNextPage: boolean } => {
  void filters;
  const page = 1;
  const limit = 20;
  return { items: [], page, limit, total: 0, hasNextPage: false };
};

export const getFeaturedHomepageProperties = (sectionKey?: string): StoredProperty[] => {
  void sectionKey;
  return [];
};

export const getPropertyById = (propertyId: string): StoredProperty | null => {
  void propertyId;
  return null;
};

export const subscribe = (callback: () => void): (() => void) => {
  void callback;
  return () => {};
};

export const toAdminPropertyApplicationSummary = (
  p: StoredProperty,
): AdminPropertyApplicationSummary => ({
  id: p.propertyId,
  propertyName: p.title,
  propertyTypeId: p.propertyTypeId,
  ownershipType: p.ownershipType,
  status: p.applicationStatus,
  submittedAt: p.submittedAt,
  reviewedAt: p.reviewedAt,
  rejectionReason: p.rejectionReason,
  city: p.city,
  country: p.country,
  host: {
    id: p.hostId,
    firstName: p.hostFirstName,
    lastName: p.hostLastName,
    email: p.hostEmail,
    roles: ["host"],
    isActive: true,
  },
  unitsCount: p.unitsCount,
  hasVerificationDocuments: p.hasVerificationDocuments,
  hasCoverMedia: p.hasCoverMedia,
  hasBeenApproved: false,
});

export const getAdminPropertyApplications = (filters?: {
  status?: string;
  hostId?: string;
}): AdminPropertyApplicationSummary[] => {
  void filters;
  return [];
};

export const getAdminPropertyApplicationDetail = (propertyId: string): unknown | null => {
  void propertyId;
  return null;
};

export const reviewAdminPropertyApplication = (
  propertyId: string,
  payload: { action: "approve" | "reject"; rejectionReason?: string },
): { propertyId: string; status: string; reviewedAt: string } => {
  void payload;
  const reviewedAt = new Date().toISOString();
  return {
    propertyId,
    status: payload.action === "approve" ? "approved" : "rejected",
    reviewedAt,
  };
};

export const toListingCard = (p: StoredProperty): FrontListingCard => ({
  propertyId: p.propertyId,
  title: p.title,
  locationLabel: p.locationLabel,
  city: p.city,
  country: p.country,
  coverImageUrl: p.coverImageUrl,
  price: p.price,
  rating: {
    average: p.ratingAverage,
    count: p.ratingCount,
    displayLabel: `${p.ratingAverage.toFixed(1)} (${p.ratingCount} reviews)`,
  },
  badge: p.badge,
  href: `/properties/${p.propertyId}`,
});
