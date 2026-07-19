import { apiRequest, apiRequestOptional, ApiError } from "@/lib/api";

export type HostReservationPreview = {
  id: string;
  propertyId: string;
  unitId: string;
  checkInDate: string;
  checkOutDate: string;
  adultGuests: number;
  childGuests: number;
};

export type HostDashboardData = {
  properties: {
    total: number;
    approved: number;
    submitted: number;
    draft: number;
    rejected: number;
  };
  units: {
    total: number;
    active: number;
  };
  reservations: {
    upcomingCount: number;
    upcoming: HostReservationPreview[];
  };
  messages: {
    unreadThreads: number;
    unreadMessages: number;
  };
  earnings: {
    grossRevenue: number;
    commissionTotal: number;
    refundTotal: number;
    netEarnings: number;
    currency: string;
  };
  payouts: {
    pendingPayout: number;
    paidOut: number;
    currency: string;
  };
};

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord => (value && typeof value === "object" ? (value as UnknownRecord) : {});
const asString = (value: unknown) => (typeof value === "string" ? value : "");
const asOptionalString = (value: unknown) => (typeof value === "string" ? value : null);
const asArray = (value: unknown) => (Array.isArray(value) ? value : []);
const asNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const parsed = Number(trimmed);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};
const asBoolean = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }

  return false;
};

export type HostProfile = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  profilePhoto: string;
  bio: string;
};

export type UpdateHostProfilePayload = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  profilePhoto: string;
  bio: string;
};

export type HostPayoutMethod = "bank_transfer" | "mobile_wallet" | "";

export type HostPayoutProfile = {
  accountHolderName: string;
  payoutMethod: HostPayoutMethod;
  billingAddress: string;
  country: string;
  currency: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  walletProvider: string;
  walletNumber: string;
};

export type UpdateHostPayoutProfilePayload = HostPayoutProfile;

export type HostSetupStatus = {
  isComplete: boolean;
  missingFields: string[];
};

export type HostPropertyStatus = "draft" | "submitted" | "approved" | "rejected";

export type HostPropertySummary = {
  id: string;
  name: string;
  status: HostPropertyStatus;
  rawStatus: string | null;
  propertyType: string;
  ownershipType: string;
  address: string;
  city: string;
  country: string;
  updatedAt: string | null;
  createdAt: string | null;
};

export type HostPropertyDetail = HostPropertySummary & {
  description: string;
  amenities: string[];
  lat: string;
  lng: string;
  houseRules: string;
};

export type HostPropertyMediaType = "image" | "video";

export type HostPropertyMediaItem = {
  id: string;
  propertyId: string;
  type: HostPropertyMediaType;
  url: string;
  thumbnailUrl: string;
  caption: string;
  sortOrder: number | null;
  isCover: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type HostPropertyReferenceOption = {
  id: string;
  value: string;
  label: string;
};

export type HostPropertyCommissionInfo = {
  rate: string;
  note: string;
};

export type UpdateHostPropertyPayload = {
  name: string;
  description: string;
  propertyType: string;
  ownershipType: string;
  amenities: string[];
  address: string;
  city: string;
  country: string;
  lat: string;
  lng: string;
  houseRules: string;
};

export type UpdateHostPropertyMediaPayload = {
  caption: string;
  sortOrder: string;
  isCover?: boolean;
};

const emptyHostProfile = (): HostProfile => ({
  id: undefined,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  profilePhoto: "",
  bio: "",
});

const emptyHostPayoutProfile = (): HostPayoutProfile => ({
  accountHolderName: "",
  payoutMethod: "",
  billingAddress: "",
  country: "",
  currency: "",
  bankName: "",
  branchName: "",
  accountNumber: "",
  routingNumber: "",
  swiftCode: "",
  walletProvider: "",
  walletNumber: "",
});

const emptyHostPropertyDetail = (): HostPropertyDetail => ({
  id: "",
  name: "",
  status: "draft",
  rawStatus: "draft",
  propertyType: "",
  ownershipType: "",
  address: "",
  city: "",
  country: "",
  updatedAt: null,
  createdAt: null,
  description: "",
  amenities: [],
  lat: "",
  lng: "",
  houseRules: "",
});

const normalizeHostProfile = (payload: unknown): HostProfile => {
  const source = asRecord(payload);

  return {
    id: asString(source.id) || undefined,
    firstName: asString(source.firstName ?? source.first_name),
    lastName: asString(source.lastName ?? source.last_name),
    email: asString(source.email),
    phone: asString(source.phone),
    address: asString(source.address),
    profilePhoto: asString(source.profilePhoto ?? source.profile_photo ?? source.photoUrl ?? source.photo_url),
    bio: asString(source.bio),
  };
};

const normalizePayoutMethod = (value: unknown): HostPayoutMethod => {
  const normalized = asString(value).trim().toLowerCase();

  if (!normalized) {
    return "";
  }

  if (normalized === "bank" || normalized === "bank_transfer" || normalized === "bank-transfer") {
    return "bank_transfer";
  }

  if (
    normalized === "wallet" ||
    normalized === "mobile_wallet" ||
    normalized === "mobile-wallet" ||
    normalized === "mobile wallet"
  ) {
    return "mobile_wallet";
  }

  return "";
};

const normalizeHostPropertyStatus = (value: unknown): HostPropertyStatus => {
  const normalized = asString(value).trim().toLowerCase();

  if (normalized.includes("reject")) {
    return "rejected";
  }

  if (
    normalized.includes("submit") ||
    normalized.includes("pending") ||
    normalized.includes("review") ||
    normalized.includes("waiting")
  ) {
    return "submitted";
  }

  if (normalized.includes("approve") || normalized.includes("active") || normalized === "live") {
    return "approved";
  }

  return "draft";
};

const normalizeHostPropertyAmenities = (value: unknown): string[] =>
  asArray(value)
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      const source = asRecord(item);

      return (
        asString(source.value) ||
        asString(source.label) ||
        asString(source.name) ||
        asString(source.title) ||
        asString(source.id)
      );
    })
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeHostPropertySummary = (payload: unknown): HostPropertySummary => {
  const source = asRecord(payload);
  const addressSource = asRecord(source.location ?? source.addressInfo ?? source.address_info);
  const propertyTypeSource = asRecord(source.propertyType ?? source.property_type);
  const ownershipTypeSource = asRecord(source.ownershipType ?? source.ownership_type);
  const rawStatus =
    asOptionalString(source.status) ??
    asOptionalString(source.propertyStatus) ??
    asOptionalString(source.property_status);

  return {
    id: asString(source.id) || asString(source.propertyId ?? source.property_id),
    name:
      asString(source.name) ||
      asString(source.propertyName ?? source.property_name) ||
      asString(source.title),
    status: normalizeHostPropertyStatus(rawStatus),
    rawStatus,
    propertyType:
      asString(source.propertyTypeName ?? source.property_type_name) ||
      asString(propertyTypeSource.name ?? propertyTypeSource.label ?? propertyTypeSource.value) ||
      asString(source.propertyType ?? source.property_type),
    ownershipType:
      asString(source.ownershipTypeName ?? source.ownership_type_name) ||
      asString(ownershipTypeSource.name ?? ownershipTypeSource.label ?? ownershipTypeSource.value) ||
      asString(source.ownershipType ?? source.ownership_type),
    address: asString(source.address ?? addressSource.address ?? addressSource.line1 ?? addressSource.line_1),
    city: asString(source.city ?? addressSource.city),
    country: asString(source.country ?? addressSource.country),
    updatedAt: asOptionalString(source.updatedAt ?? source.updated_at),
    createdAt: asOptionalString(source.createdAt ?? source.created_at),
  };
};

const normalizeHostPropertyDetail = (payload: unknown): HostPropertyDetail => {
  const source = asRecord(payload);
  const summary = normalizeHostPropertySummary(payload);
  const locationSource = asRecord(source.location ?? source.addressInfo ?? source.address_info);

  return {
    ...summary,
    description: asString(source.description),
    amenities: normalizeHostPropertyAmenities(source.amenities ?? source.amenityIds ?? source.amenity_ids),
    lat: asString(source.lat ?? source.latitude ?? locationSource.lat ?? locationSource.latitude),
    lng: asString(source.lng ?? source.longitude ?? locationSource.lng ?? locationSource.longitude),
    houseRules: asString(source.houseRules ?? source.house_rules ?? source.rules),
  };
};

const normalizeHostPropertyMediaType = (value: unknown): HostPropertyMediaType => {
  const normalized = asString(value).trim().toLowerCase();

  if (normalized.includes("video")) {
    return "video";
  }

  return "image";
};

const normalizeHostPropertyMediaItem = (payload: unknown): HostPropertyMediaItem => {
  const source = asRecord(payload);
  const rawType =
    source.mediaType ??
    source.media_type ??
    source.type ??
    source.kind ??
    (source.videoUrl ?? source.video_url ? "video" : "image");
  const url =
    asString(source.url) ||
    asString(source.fileUrl ?? source.file_url) ||
    asString(source.mediaUrl ?? source.media_url) ||
    asString(source.src) ||
    asString(source.path) ||
    asString(source.videoUrl ?? source.video_url);

  return {
    id: asString(source.id) || asString(source.mediaId ?? source.media_id),
    propertyId: asString(source.propertyId ?? source.property_id),
    type: normalizeHostPropertyMediaType(rawType),
    url,
    thumbnailUrl:
      asString(source.thumbnailUrl ?? source.thumbnail_url) ||
      asString(source.previewUrl ?? source.preview_url) ||
      url,
    caption: asString(source.caption ?? source.altText ?? source.alt_text ?? source.title),
    sortOrder: asNumber(source.sortOrder ?? source.sort_order ?? source.order ?? source.position ?? source.index),
    isCover: asBoolean(
      source.isCover ??
        source.is_cover ??
        source.cover ??
        source.isPrimary ??
        source.is_primary ??
        source.isFeatured ??
        source.is_featured,
    ),
    createdAt: asOptionalString(source.createdAt ?? source.created_at),
    updatedAt: asOptionalString(source.updatedAt ?? source.updated_at),
  };
};

const extractHostPropertyMediaArray = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  const source = asRecord(payload);

  if (Array.isArray(source.items)) {
    return source.items;
  }

  if (Array.isArray(source.results)) {
    return source.results;
  }

  if (Array.isArray(source.media)) {
    return source.media;
  }

  if (Array.isArray(source.gallery)) {
    return source.gallery;
  }

  if (Array.isArray(source.images)) {
    return source.images;
  }

  return [];
};

const extractReferenceArray = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  const source = asRecord(payload);

  if (Array.isArray(source.items)) {
    return source.items;
  }

  if (Array.isArray(source.results)) {
    return source.results;
  }

  if (Array.isArray(source.data)) {
    return source.data;
  }

  if (Array.isArray(source.propertyTypes)) {
    return source.propertyTypes;
  }

  if (Array.isArray(source.property_types)) {
    return source.property_types;
  }

  if (Array.isArray(source.amenities)) {
    return source.amenities;
  }

  if (Array.isArray(source.properties)) {
    return source.properties;
  }

  return [];
};

const normalizeReferenceOption = (payload: unknown): HostPropertyReferenceOption => {
  if (typeof payload === "string") {
    return {
      id: payload,
      value: payload,
      label: payload,
    };
  }

  const source = asRecord(payload);
  const label =
    asString(source.label) ||
    asString(source.name) ||
    asString(source.title) ||
    asString(source.value) ||
    asString(source.id);
  const value = asString(source.value) || asString(source.slug) || asString(source.code) || label;

  return {
    id: asString(source.id) || value || label,
    value: value || label,
    label: label || value,
  };
};

const normalizeCommissionInfo = (payload: unknown): HostPropertyCommissionInfo => {
  const source = asRecord(payload);

  return {
    rate:
      asString(source.rate) ||
      asString(source.commissionRate ?? source.commission_rate) ||
      asString(source.value),
    note: asString(source.note) || asString(source.description) || asString(source.summary),
  };
};

const normalizeHostPayoutProfile = (payload: unknown): HostPayoutProfile => {
  const source = asRecord(payload);
  const bankDetails = asRecord(source.bankDetails ?? source.bank_details);
  const walletDetails = asRecord(source.walletDetails ?? source.wallet_details);

  return {
    accountHolderName: asString(source.accountHolderName ?? source.account_holder_name),
    payoutMethod: normalizePayoutMethod(source.payoutMethod ?? source.payout_method ?? source.method),
    billingAddress: asString(source.billingAddress ?? source.billing_address),
    country: asString(source.country),
    currency: asString(source.currency),
    bankName: asString(source.bankName ?? source.bank_name ?? bankDetails.bankName ?? bankDetails.bank_name),
    branchName: asString(source.branchName ?? source.branch_name ?? bankDetails.branchName ?? bankDetails.branch_name),
    accountNumber: asString(
      source.accountNumber ?? source.account_number ?? bankDetails.accountNumber ?? bankDetails.account_number,
    ),
    routingNumber: asString(
      source.routingNumber ?? source.routing_number ?? bankDetails.routingNumber ?? bankDetails.routing_number,
    ),
    swiftCode: asString(source.swiftCode ?? source.swift_code ?? bankDetails.swiftCode ?? bankDetails.swift_code),
    walletProvider: asString(
      source.walletProvider ?? source.wallet_provider ?? walletDetails.walletProvider ?? walletDetails.wallet_provider,
    ),
    walletNumber: asString(
      source.walletNumber ?? source.wallet_number ?? walletDetails.walletNumber ?? walletDetails.wallet_number,
    ),
  };
};

export const getHostProfileSetupStatus = (profile: HostProfile | null): HostSetupStatus => {
  if (!profile) {
    return {
      isComplete: false,
      missingFields: ["first name", "last name", "phone", "address", "bio"],
    };
  }

  const missingFields: string[] = [];

  if (!profile.firstName.trim()) {
    missingFields.push("first name");
  }

  if (!profile.lastName.trim()) {
    missingFields.push("last name");
  }

  if (!profile.phone.trim()) {
    missingFields.push("phone");
  }

  if (!profile.address.trim()) {
    missingFields.push("address");
  }

  if (!profile.bio.trim()) {
    missingFields.push("bio");
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
};

export const getHostPayoutSetupStatus = (profile: HostPayoutProfile | null): HostSetupStatus => {
  if (!profile) {
    return {
      isComplete: false,
      missingFields: ["account holder name", "payout method", "billing address", "country", "currency"],
    };
  }

  const missingFields: string[] = [];

  if (!profile.accountHolderName.trim()) {
    missingFields.push("account holder name");
  }

  if (!profile.payoutMethod) {
    missingFields.push("payout method");
  }

  if (!profile.billingAddress.trim()) {
    missingFields.push("billing address");
  }

  if (!profile.country.trim()) {
    missingFields.push("country");
  }

  if (!profile.currency.trim()) {
    missingFields.push("currency");
  }

  if (profile.payoutMethod === "bank_transfer") {
    if (!profile.bankName.trim()) {
      missingFields.push("bank name");
    }

    if (!profile.accountNumber.trim()) {
      missingFields.push("account number");
    }
  }

  if (profile.payoutMethod === "mobile_wallet") {
    if (!profile.walletProvider.trim()) {
      missingFields.push("wallet provider");
    }

    if (!profile.walletNumber.trim()) {
      missingFields.push("wallet number");
    }
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
};

type HostIdentityVerificationApiData = {
  id?: string;
  status?: string;
  state?: string;
  applicationStatus?: string;
  verificationStatus?: string;
  reviewStatus?: string;
  rejectionReason?: string | null;
  rejectedReason?: string | null;
  reason?: string | null;
  note?: string | null;
  submittedAt?: string | null;
  updatedAt?: string | null;
};

export type HostIdentityVerificationStatus = {
  id?: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  rawStatus: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  updatedAt: string | null;
};

const getNormalizedVerificationStatus = (value: string | null | undefined) => {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return "draft" as const;
  }

  if (normalized.includes("reject")) {
    return "rejected" as const;
  }

  if (
    normalized.includes("submit") ||
    normalized.includes("pending") ||
    normalized.includes("review") ||
    normalized.includes("wait")
  ) {
    return "submitted" as const;
  }

  if (normalized.includes("approve") || normalized.includes("active") || normalized === "enabled") {
    return "approved" as const;
  }

  return "draft" as const;
};

const normalizeHostIdentityVerificationStatus = (
  payload: HostIdentityVerificationApiData,
): HostIdentityVerificationStatus => {
  const rawStatus =
    payload.status ??
    payload.state ??
    payload.applicationStatus ??
    payload.verificationStatus ??
    payload.reviewStatus ??
    null;

  return {
    id: payload.id,
    status: getNormalizedVerificationStatus(rawStatus),
    rawStatus,
    rejectionReason:
      payload.rejectionReason ?? payload.rejectedReason ?? payload.reason ?? payload.note ?? null,
    submittedAt: payload.submittedAt ?? null,
    updatedAt: payload.updatedAt ?? null,
  };
};

export async function getHostDashboard(token: string): Promise<HostDashboardData> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  return apiRequest<HostDashboardData>("/api/v1/host/dashboard", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
}

export async function getHostIdentityVerificationStatus(
  token: string,
): Promise<HostIdentityVerificationStatus | null> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  try {
    const response = await apiRequest<HostIdentityVerificationApiData>(
      "/api/v1/host/verifications/identity",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    return normalizeHostIdentityVerificationStatus(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getHostProfile(token: string): Promise<HostProfile> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  try {
    const response = await apiRequest<unknown>("/api/v1/host/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return normalizeHostProfile(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      const fallback = await apiRequest<unknown>("/api/v1/host/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      return normalizeHostProfile(fallback);
    }

    throw error;
  }
}

export async function updateHostProfile(
  token: string,
  payload: UpdateHostProfilePayload,
): Promise<HostProfile> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>("/api/v1/host/profile", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      phone: payload.phone.trim() || undefined,
      address: payload.address.trim() || undefined,
      profilePhoto: payload.profilePhoto.trim() || undefined,
      bio: payload.bio.trim() || undefined,
    },
    cache: "no-store",
  });

  return normalizeHostProfile(response);
}

export async function getHostPayoutProfile(token: string): Promise<HostPayoutProfile | null> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  try {
    const response = await apiRequest<unknown>("/api/v1/host/payout-profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return normalizeHostPayoutProfile(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function updateHostPayoutProfile(
  token: string,
  payload: UpdateHostPayoutProfilePayload,
): Promise<HostPayoutProfile> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>("/api/v1/host/payout-profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      accountHolderName: payload.accountHolderName.trim(),
      payoutMethod: payload.payoutMethod,
      billingAddress: payload.billingAddress.trim() || undefined,
      country: payload.country.trim() || undefined,
      currency: payload.currency.trim() || undefined,
      bankName: payload.payoutMethod === "bank_transfer" ? payload.bankName.trim() || undefined : undefined,
      branchName: payload.payoutMethod === "bank_transfer" ? payload.branchName.trim() || undefined : undefined,
      accountNumber:
        payload.payoutMethod === "bank_transfer" ? payload.accountNumber.trim() || undefined : undefined,
      routingNumber:
        payload.payoutMethod === "bank_transfer" ? payload.routingNumber.trim() || undefined : undefined,
      swiftCode: payload.payoutMethod === "bank_transfer" ? payload.swiftCode.trim() || undefined : undefined,
      walletProvider:
        payload.payoutMethod === "mobile_wallet" ? payload.walletProvider.trim() || undefined : undefined,
      walletNumber:
        payload.payoutMethod === "mobile_wallet" ? payload.walletNumber.trim() || undefined : undefined,
    },
    cache: "no-store",
  });

  return normalizeHostPayoutProfile(response);
}

export const isHostPropertyEditable = (status: HostPropertyStatus) =>
  status === "draft" || status === "rejected";

export async function getHostProperties(token: string): Promise<HostPropertySummary[]> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>("/api/v1/host/properties", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return extractReferenceArray(response)
    .map((item) => normalizeHostPropertySummary(item))
    .filter((item) => item.id);
}

export async function createHostPropertyDraft(token: string): Promise<HostPropertyDetail> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>("/api/v1/host/properties", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {},
    cache: "no-store",
  });

  return normalizeHostPropertyDetail(response);
}

export async function getHostProperty(token: string, propertyId: string): Promise<HostPropertyDetail> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>(`/api/v1/host/properties/${propertyId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return normalizeHostPropertyDetail(response);
}

export async function updateHostProperty(
  token: string,
  propertyId: string,
  payload: UpdateHostPropertyPayload,
): Promise<HostPropertyDetail> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>(`/api/v1/host/properties/${propertyId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      name: payload.name.trim() || undefined,
      description: payload.description.trim() || undefined,
      propertyType: payload.propertyType.trim() || undefined,
      ownershipType: payload.ownershipType.trim() || undefined,
      amenities: payload.amenities,
      address: payload.address.trim() || undefined,
      city: payload.city.trim() || undefined,
      country: payload.country.trim() || undefined,
      lat: payload.lat.trim() || undefined,
      lng: payload.lng.trim() || undefined,
      houseRules: payload.houseRules.trim() || undefined,
    },
    cache: "no-store",
  });

  return normalizeHostPropertyDetail(response);
}

export async function getHostPropertyTypes(token: string): Promise<HostPropertyReferenceOption[]> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>("/api/v1/host/reference/property-types", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return extractReferenceArray(response)
    .map((item) => normalizeReferenceOption(item))
    .filter((item) => item.value);
}

export async function getHostAmenities(token: string): Promise<HostPropertyReferenceOption[]> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>("/api/v1/host/reference/amenities", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return extractReferenceArray(response)
    .map((item) => normalizeReferenceOption(item))
    .filter((item) => item.value);
}

export async function getHostCommissionInfo(token: string): Promise<HostPropertyCommissionInfo | null> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  try {
    const response = await apiRequest<unknown>("/api/v1/host/reference/commission", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return normalizeCommissionInfo(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getHostPropertyMedia(
  token: string,
  propertyId: string,
): Promise<HostPropertyMediaItem[]> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>(`/api/v1/host/properties/${propertyId}/media`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return extractHostPropertyMediaArray(response)
    .map((item) => normalizeHostPropertyMediaItem(item))
    .filter((item) => item.id && item.url)
    .sort((left, right) => {
      const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return (left.createdAt ?? "").localeCompare(right.createdAt ?? "");
    });
}

export async function uploadHostPropertyImage(
  token: string,
  propertyId: string,
  file: File,
): Promise<void> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "image");

  await apiRequestOptional<unknown>(`/api/v1/host/properties/${propertyId}/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    cache: "no-store",
  });
}

export async function createHostPropertyVideoUrl(
  token: string,
  propertyId: string,
  videoUrl: string,
): Promise<void> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const normalizedUrl = videoUrl.trim();

  await apiRequestOptional<unknown>(`/api/v1/host/properties/${propertyId}/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      type: "video",
      mediaType: "video",
      videoUrl: normalizedUrl,
      url: normalizedUrl,
    },
    cache: "no-store",
  });
}

export async function updateHostPropertyMedia(
  token: string,
  propertyId: string,
  mediaId: string,
  payload: UpdateHostPropertyMediaPayload,
): Promise<void> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const normalizedSortOrder = payload.sortOrder.trim();

  await apiRequestOptional<unknown>(`/api/v1/host/properties/${propertyId}/media/${mediaId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      caption: payload.caption.trim() || undefined,
      sortOrder: normalizedSortOrder ? Number(normalizedSortOrder) : undefined,
      isCover: payload.isCover,
    },
    cache: "no-store",
  });
}

export async function deleteHostPropertyMedia(
  token: string,
  propertyId: string,
  mediaId: string,
): Promise<void> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  await apiRequestOptional<unknown>(`/api/v1/host/properties/${propertyId}/media/${mediaId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
}

export const createEmptyHostProfile = emptyHostProfile;
export const createEmptyHostPayoutProfile = emptyHostPayoutProfile;
export const createEmptyHostPropertyDetail = emptyHostPropertyDetail;
