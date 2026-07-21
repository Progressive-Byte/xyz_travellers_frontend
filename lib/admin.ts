import { apiRequest, resolveApiUrl } from "@/lib/api";
import type { AuthSuccessData } from "@/lib/auth";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord => (value && typeof value === "object" ? (value as UnknownRecord) : {});
const asString = (value: unknown) => (typeof value === "string" ? value : "");
const asOptionalString = (value: unknown) => (typeof value === "string" ? value : null);
const asArray = (value: unknown) => (Array.isArray(value) ? value : []);
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

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export type AdminLoginPayload = {
  email: string;
  password: string;
};

export async function loginAdmin(payload: AdminLoginPayload): Promise<AuthSuccessData> {
  return apiRequest<AuthSuccessData>("/api/v1/auth/admin/login", {
    method: "POST",
    body: {
      email: payload.email.toLowerCase().trim(),
      password: payload.password,
    },
  });
}

export type AdminCommissionConfig = {
  defaultCommissionPercent: number | null;
  notes: string;
};

export type UpdateAdminCommissionPayload = {
  defaultCommissionPercent: number;
  notes?: string;
};

const normalizeAdminCommissionConfig = (payload: unknown): AdminCommissionConfig => {
  const source = asRecord(payload);

  return {
    defaultCommissionPercent: asNumber(source.defaultCommissionPercent ?? source.default_commission_percent),
    notes: asString(source.notes),
  };
};

export async function getAdminCommission(token: string): Promise<AdminCommissionConfig> {
  const data = await apiRequest<unknown>("/api/v1/admin/commission", {
    method: "GET",
    headers: authHeaders(token),
    cache: "no-store",
  });

  return normalizeAdminCommissionConfig(data);
}

export async function updateAdminCommission(
  token: string,
  payload: UpdateAdminCommissionPayload,
): Promise<AdminCommissionConfig> {
  const data = await apiRequest<unknown>("/api/v1/admin/commission", {
    method: "PUT",
    headers: authHeaders(token),
    body: {
      defaultCommissionPercent: payload.defaultCommissionPercent,
      notes: payload.notes?.trim() || undefined,
    },
  });

  return normalizeAdminCommissionConfig(data);
}

export type AdminHostApplicationReviewAction = "approve" | "reject";

export type ReviewAdminHostApplicationPayload = {
  action: AdminHostApplicationReviewAction;
  rejectionReason?: string;
};

export type AdminHostApplicationDocument = {
  documentType: string;
  documentFront: string;
  documentBack: string;
};

export type AdminHostApplicationVerification = {
  id: string;
  userId: string;
  documents: AdminHostApplicationDocument[];
  status: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string;
  rejectionReason: string;
};

export type AdminReviewedUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  isActive: boolean;
};

export type AdminHostApplicationReviewResult = {
  verification: AdminHostApplicationVerification;
  user: AdminReviewedUser;
};

export type AdminHostApplicationQueueItem = AdminHostApplicationReviewResult;

const normalizeAdminHostApplicationDocument = (payload: unknown): AdminHostApplicationDocument => {
  const source = asRecord(payload);

  return {
    documentType: asString(source.documentType ?? source.type),
    documentFront: resolveApiUrl(asString(source.documentFront ?? source.front)),
    documentBack: resolveApiUrl(asString(source.documentBack ?? source.back)),
  };
};

const normalizeAdminHostApplicationVerification = (payload: unknown): AdminHostApplicationVerification => {
  const source = asRecord(payload);

  return {
    id: asString(source.id),
    userId: asString(source.userId ?? source.user_id),
    documents: asArray(source.documents).map(normalizeAdminHostApplicationDocument),
    status: asString(source.status),
    submittedAt: asOptionalString(source.submittedAt ?? source.submitted_at),
    reviewedAt: asOptionalString(source.reviewedAt ?? source.reviewed_at),
    reviewedBy: asString(source.reviewedBy ?? source.reviewed_by),
    rejectionReason: asString(source.rejectionReason ?? source.rejection_reason),
  };
};

const normalizeAdminReviewedUser = (payload: unknown): AdminReviewedUser => {
  const source = asRecord(payload);

  return {
    id: asString(source.id),
    firstName: asString(source.firstName ?? source.first_name),
    lastName: asString(source.lastName ?? source.last_name),
    email: asString(source.email),
    roles: asArray(source.roles).map((item) => asString(item)).filter(Boolean),
    isActive: asBoolean(source.isActive ?? source.is_active ?? true),
  };
};

const normalizeAdminHostApplicationReviewResult = (payload: unknown): AdminHostApplicationReviewResult => {
  const source = asRecord(payload);

  return {
    verification: normalizeAdminHostApplicationVerification(source.verification),
    user: normalizeAdminReviewedUser(source.user),
  };
};

export async function reviewAdminHostApplication(
  token: string,
  userId: string,
  payload: ReviewAdminHostApplicationPayload,
): Promise<AdminHostApplicationReviewResult> {
  const data = await apiRequest<unknown>(`/api/v1/admin/host-applications/${userId}/review`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: {
      action: payload.action,
      rejectionReason:
        payload.action === "reject" ? payload.rejectionReason?.trim() || undefined : undefined,
    },
  });

  return normalizeAdminHostApplicationReviewResult(data);
}

export async function getAdminHostApplications(token: string): Promise<AdminHostApplicationQueueItem[]> {
  const data = await apiRequest<unknown[]>("/api/v1/admin/host-applications", {
    method: "GET",
    headers: authHeaders(token),
  });

  return data.map(normalizeAdminHostApplicationReviewResult);
}

export type AdminPropertyApplicationReviewAction = "approve" | "reject";

export type ReviewAdminPropertyApplicationPayload = {
  action: AdminPropertyApplicationReviewAction;
  rejectionReason?: string;
};

export type AdminPropertyApplicationHost = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  isActive: boolean;
};

export type AdminPropertyApplicationSummary = {
  id: string;
  propertyName: string;
  propertyTypeId: string;
  ownershipType: string;
  status: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string;
  city: string;
  country: string;
  host: AdminPropertyApplicationHost;
  unitsCount: number | null;
  hasVerificationDocuments: boolean;
  hasCoverMedia: boolean;
};

export type AdminPropertyApplicationRecord = {
  id: string;
  hostId: string;
  propertyName: string;
  description: string;
  propertyTypeId: string;
  ownershipType: string;
  businessId: string;
  selectedBusinessDocumentIds: string[];
  amenityIds: string[];
  address: string;
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
  houseRules: string;
  status: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminPropertyApplicationBusinessDocument = {
  id: string;
  documentType: string;
  fileUrl: string;
  storedFileName: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number | null;
  label: string;
  notes: string;
  issuedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
};

export type AdminPropertyApplicationBusiness = {
  id: string;
  businessName: string;
  registrationNumber: string;
  taxVatNumber: string;
  businessAddress: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
  selectedDocumentIds: string[];
  selectedDocuments: AdminPropertyApplicationBusinessDocument[];
};

export type AdminPropertyApplicationVerificationDocument = {
  documentType: string;
  fileUrl: string;
  storedFileName: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number | null;
};

export type AdminPropertyApplicationVerification = {
  id: string;
  propertyId: string;
  hostId: string;
  notes: string;
  documents: AdminPropertyApplicationVerificationDocument[];
};

export type AdminPropertyApplicationMediaItem = {
  id: string;
  mediaType: string;
  mediaUrl: string;
  storedFileName: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number | null;
  caption: string;
  sortOrder: number | null;
  isCover: boolean;
};

export type AdminPropertyApplicationUnit = {
  id: string;
  unitName: string;
  unitNumber: string;
  unitType: string;
  capacity: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  beds: number | null;
  amenityIds: string[];
  isActive: boolean;
};

export type AdminPropertyApplicationDetail = {
  property: AdminPropertyApplicationRecord;
  host: AdminPropertyApplicationHost;
  business: AdminPropertyApplicationBusiness | null;
  verification: AdminPropertyApplicationVerification | null;
  media: AdminPropertyApplicationMediaItem[];
  units: AdminPropertyApplicationUnit[];
};

export type AdminPropertyApplicationReviewResult = {
  propertyId: string;
  status: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string;
};

export type GetAdminPropertyApplicationsFilters = {
  status?: string;
  hostId?: string;
};

const normalizeAdminPropertyApplicationHost = (payload: unknown): AdminPropertyApplicationHost => {
  const source = asRecord(payload);

  return {
    id: asString(source.id),
    firstName: asString(source.firstName ?? source.first_name),
    lastName: asString(source.lastName ?? source.last_name),
    email: asString(source.email),
    roles: asArray(source.roles).map((item) => asString(item)).filter(Boolean),
    isActive: asBoolean(source.isActive ?? source.is_active ?? true),
  };
};

const normalizeAdminPropertyApplicationSummary = (payload: unknown): AdminPropertyApplicationSummary => {
  const source = asRecord(payload);

  return {
    id: asString(source.id),
    propertyName: asString(source.propertyName ?? source.name),
    propertyTypeId: asString(source.propertyTypeId ?? source.property_type_id),
    ownershipType: asString(source.ownershipType ?? source.ownership_type),
    status: asString(source.status),
    submittedAt: asOptionalString(source.submittedAt ?? source.submitted_at),
    reviewedAt: asOptionalString(source.reviewedAt ?? source.reviewed_at),
    rejectionReason: asString(source.rejectionReason ?? source.rejection_reason),
    city: asString(source.city),
    country: asString(source.country),
    host: normalizeAdminPropertyApplicationHost(source.host),
    unitsCount: asNumber(source.unitsCount ?? source.units_count),
    hasVerificationDocuments: asBoolean(
      source.hasVerificationDocuments ?? source.has_verification_documents,
    ),
    hasCoverMedia: asBoolean(source.hasCoverMedia ?? source.has_cover_media),
  };
};

const normalizeAdminPropertyApplicationRecord = (payload: unknown): AdminPropertyApplicationRecord => {
  const source = asRecord(payload);

  return {
    id: asString(source.id),
    hostId: asString(source.hostId ?? source.host_id),
    propertyName: asString(source.propertyName ?? source.name),
    description: asString(source.description),
    propertyTypeId: asString(source.propertyTypeId ?? source.property_type_id),
    ownershipType: asString(source.ownershipType ?? source.ownership_type),
    businessId: asString(source.businessId ?? source.business_id),
    selectedBusinessDocumentIds: asArray(
      source.selectedBusinessDocumentIds ?? source.selected_business_document_ids,
    )
      .map((item) => asString(item))
      .filter(Boolean),
    amenityIds: asArray(source.amenityIds ?? source.amenity_ids)
      .map((item) => asString(item))
      .filter(Boolean),
    address: asString(source.address),
    city: asString(source.city),
    country: asString(source.country),
    lat: asNumber(source.lat),
    lng: asNumber(source.lng),
    houseRules: asString(source.houseRules ?? source.house_rules),
    status: asString(source.status),
    submittedAt: asOptionalString(source.submittedAt ?? source.submitted_at),
    reviewedAt: asOptionalString(source.reviewedAt ?? source.reviewed_at),
    reviewedBy: asOptionalString(source.reviewedBy ?? source.reviewed_by),
    rejectionReason: asString(source.rejectionReason ?? source.rejection_reason),
    createdAt: asOptionalString(source.createdAt ?? source.created_at),
    updatedAt: asOptionalString(source.updatedAt ?? source.updated_at),
  };
};

const normalizeAdminPropertyApplicationBusinessDocument = (
  payload: unknown,
): AdminPropertyApplicationBusinessDocument => {
  const source = asRecord(payload);

  return {
    id: asString(source.id),
    documentType: asString(source.documentType ?? source.document_type),
    fileUrl: resolveApiUrl(asString(source.fileUrl ?? source.file_url)),
    storedFileName: asString(source.storedFileName ?? source.stored_file_name),
    originalFileName: asString(source.originalFileName ?? source.original_file_name),
    mimeType: asString(source.mimeType ?? source.mime_type),
    fileSize: asNumber(source.fileSize ?? source.file_size),
    label: asString(source.label),
    notes: asString(source.notes),
    issuedAt: asOptionalString(source.issuedAt ?? source.issued_at),
    expiresAt: asOptionalString(source.expiresAt ?? source.expires_at),
    isActive: asBoolean(source.isActive ?? source.is_active ?? true),
  };
};

const normalizeAdminPropertyApplicationBusiness = (
  payload: unknown,
): AdminPropertyApplicationBusiness | null => {
  const source = asRecord(payload);

  if (!asString(source.id)) {
    return null;
  }

  return {
    id: asString(source.id),
    businessName: asString(source.businessName ?? source.business_name),
    registrationNumber: asString(source.registrationNumber ?? source.registration_number),
    taxVatNumber: asString(source.taxVatNumber ?? source.tax_vat_number),
    businessAddress: asString(source.businessAddress ?? source.business_address),
    contactName: asString(source.contactName ?? source.contact_name),
    contactEmail: asString(source.contactEmail ?? source.contact_email),
    contactPhone: asString(source.contactPhone ?? source.contact_phone),
    isActive: asBoolean(source.isActive ?? source.is_active ?? true),
    selectedDocumentIds: asArray(source.selectedDocumentIds ?? source.selected_document_ids)
      .map((item) => asString(item))
      .filter(Boolean),
    selectedDocuments: asArray(source.selectedDocuments ?? source.selected_documents).map(
      normalizeAdminPropertyApplicationBusinessDocument,
    ),
  };
};

const normalizeAdminPropertyApplicationVerificationDocument = (
  payload: unknown,
): AdminPropertyApplicationVerificationDocument => {
  const source = asRecord(payload);

  return {
    documentType: asString(source.documentType ?? source.document_type),
    fileUrl: resolveApiUrl(asString(source.fileUrl ?? source.file_url)),
    storedFileName: asString(source.storedFileName ?? source.stored_file_name),
    originalFileName: asString(source.originalFileName ?? source.original_file_name),
    mimeType: asString(source.mimeType ?? source.mime_type),
    fileSize: asNumber(source.fileSize ?? source.file_size),
  };
};

const normalizeAdminPropertyApplicationVerification = (
  payload: unknown,
): AdminPropertyApplicationVerification | null => {
  const source = asRecord(payload);

  if (!asString(source.id)) {
    return null;
  }

  return {
    id: asString(source.id),
    propertyId: asString(source.propertyId ?? source.property_id),
    hostId: asString(source.hostId ?? source.host_id),
    notes: asString(source.notes),
    documents: asArray(source.documents).map(normalizeAdminPropertyApplicationVerificationDocument),
  };
};

const normalizeAdminPropertyApplicationMediaItem = (
  payload: unknown,
): AdminPropertyApplicationMediaItem => {
  const source = asRecord(payload);

  return {
    id: asString(source.id),
    mediaType: asString(source.mediaType ?? source.media_type),
    mediaUrl: resolveApiUrl(asString(source.mediaUrl ?? source.media_url)),
    storedFileName: asString(source.storedFileName ?? source.stored_file_name),
    originalFileName: asString(source.originalFileName ?? source.original_file_name),
    mimeType: asString(source.mimeType ?? source.mime_type),
    fileSize: asNumber(source.fileSize ?? source.file_size),
    caption: asString(source.caption),
    sortOrder: asNumber(source.sortOrder ?? source.sort_order),
    isCover: asBoolean(source.isCover ?? source.is_cover),
  };
};

const normalizeAdminPropertyApplicationUnit = (payload: unknown): AdminPropertyApplicationUnit => {
  const source = asRecord(payload);

  return {
    id: asString(source.id),
    unitName: asString(source.unitName ?? source.name ?? source.unit_name),
    unitNumber: asString(source.unitNumber ?? source.unit_number),
    unitType: asString(source.unitType ?? source.unit_type),
    capacity: asNumber(source.capacity),
    bedrooms: asNumber(source.bedrooms),
    bathrooms: asNumber(source.bathrooms),
    beds: asNumber(source.beds),
    amenityIds: asArray(source.amenityIds ?? source.amenity_ids)
      .map((item) => asString(item))
      .filter(Boolean),
    isActive: asBoolean(source.isActive ?? source.is_active ?? true),
  };
};

const normalizeAdminPropertyApplicationDetail = (payload: unknown): AdminPropertyApplicationDetail => {
  const source = asRecord(payload);

  return {
    property: normalizeAdminPropertyApplicationRecord(source.property),
    host: normalizeAdminPropertyApplicationHost(source.host),
    business: normalizeAdminPropertyApplicationBusiness(source.business),
    verification: normalizeAdminPropertyApplicationVerification(source.verification),
    media: asArray(source.media).map(normalizeAdminPropertyApplicationMediaItem),
    units: asArray(source.units).map(normalizeAdminPropertyApplicationUnit),
  };
};

const normalizeAdminPropertyApplicationReviewResult = (
  payload: unknown,
): AdminPropertyApplicationReviewResult => {
  const source = asRecord(payload);

  return {
    propertyId: asString(source.propertyId ?? source.property_id),
    status: asString(source.status),
    submittedAt: asOptionalString(source.submittedAt ?? source.submitted_at),
    reviewedAt: asOptionalString(source.reviewedAt ?? source.reviewed_at),
    reviewedBy: asOptionalString(source.reviewedBy ?? source.reviewed_by),
    rejectionReason: asString(source.rejectionReason ?? source.rejection_reason),
  };
};

export async function getAdminPropertyApplications(
  token: string,
  filters: GetAdminPropertyApplicationsFilters = {},
): Promise<AdminPropertyApplicationSummary[]> {
  const searchParams = new URLSearchParams();

  if (filters.status?.trim()) {
    searchParams.set("status", filters.status.trim());
  }

  if (filters.hostId?.trim()) {
    searchParams.set("hostId", filters.hostId.trim());
  }

  const query = searchParams.toString();
  const data = await apiRequest<unknown[]>(`/api/v1/admin/properties${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: authHeaders(token),
  });

  return data.map(normalizeAdminPropertyApplicationSummary);
}

export async function getAdminPropertyApplication(
  token: string,
  propertyId: string,
): Promise<AdminPropertyApplicationDetail> {
  const data = await apiRequest<unknown>(`/api/v1/admin/properties/${propertyId}`, {
    method: "GET",
    headers: authHeaders(token),
  });

  return normalizeAdminPropertyApplicationDetail(data);
}

export async function reviewAdminPropertyApplication(
  token: string,
  propertyId: string,
  payload: ReviewAdminPropertyApplicationPayload,
): Promise<AdminPropertyApplicationReviewResult> {
  const data = await apiRequest<unknown>(`/api/v1/admin/properties/${propertyId}/review`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: {
      action: payload.action,
      rejectionReason:
        payload.action === "reject" ? payload.rejectionReason?.trim() || undefined : undefined,
    },
  });

  return normalizeAdminPropertyApplicationReviewResult(data);
}

export type AdminHomepageSectionSummary = {
  id: string;
  title: string;
  slug: string;
  description: string;
  isActive: boolean;
  sortOrder: number | null;
  itemsCount: number | null;
};

export type AdminHomepageSectionItem = {
  propertyId: string;
  sortOrder: number | null;
  isActive: boolean;
};

export type AdminHomepageSectionDetail = {
  id: string;
  title: string;
  slug: string;
  description: string;
  isActive: boolean;
  sortOrder: number | null;
  items: AdminHomepageSectionItem[];
};

export type UpsertAdminHomepageSectionPayload = {
  title: string;
  slug: string;
  description: string;
  isActive: boolean;
  sortOrder: string;
};

export type CreateAdminHomepageSectionItemPayload = {
  propertyId: string;
  sortOrder: string;
  isActive: boolean;
};

export type UpdateAdminHomepageSectionItemPayload = {
  sortOrder: string;
  isActive: boolean;
};

const normalizeAdminHomepageSectionSummary = (payload: unknown): AdminHomepageSectionSummary => {
  const source = asRecord(payload);

  return {
    id: asString(source.id),
    title: asString(source.title),
    slug: asString(source.slug),
    description: asString(source.description),
    isActive: asBoolean(source.isActive ?? source.is_active),
    sortOrder: asNumber(source.sortOrder ?? source.sort_order),
    itemsCount: asNumber(source.itemsCount ?? source.items_count),
  };
};

const normalizeAdminHomepageSectionItem = (payload: unknown): AdminHomepageSectionItem => {
  const source = asRecord(payload);

  return {
    propertyId: asString(source.propertyId ?? source.property_id),
    sortOrder: asNumber(source.sortOrder ?? source.sort_order),
    isActive: asBoolean(source.isActive ?? source.is_active),
  };
};

const normalizeAdminHomepageSectionDetail = (payload: unknown): AdminHomepageSectionDetail => {
  const source = asRecord(payload);

  return {
    id: asString(source.id),
    title: asString(source.title),
    slug: asString(source.slug),
    description: asString(source.description),
    isActive: asBoolean(source.isActive ?? source.is_active),
    sortOrder: asNumber(source.sortOrder ?? source.sort_order),
    items: asArray(source.items).map(normalizeAdminHomepageSectionItem),
  };
};

const toOptionalNumber = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export async function getAdminHomepageSections(token: string): Promise<AdminHomepageSectionSummary[]> {
  const data = await apiRequest<unknown[]>("/api/v1/admin/homepage-sections", {
    method: "GET",
    headers: authHeaders(token),
  });

  return data.map(normalizeAdminHomepageSectionSummary);
}

export async function getAdminHomepageSection(
  token: string,
  sectionId: string,
): Promise<AdminHomepageSectionDetail> {
  const data = await apiRequest<unknown>(`/api/v1/admin/homepage-sections/${sectionId}`, {
    method: "GET",
    headers: authHeaders(token),
  });

  return normalizeAdminHomepageSectionDetail(data);
}

export async function createAdminHomepageSection(
  token: string,
  payload: UpsertAdminHomepageSectionPayload,
): Promise<AdminHomepageSectionDetail> {
  const data = await apiRequest<unknown>("/api/v1/admin/homepage-sections", {
    method: "POST",
    headers: authHeaders(token),
    body: {
      title: payload.title.trim(),
      slug: payload.slug.trim() || undefined,
      description: payload.description.trim() || undefined,
      isActive: payload.isActive,
      sortOrder: toOptionalNumber(payload.sortOrder),
    },
  });

  return normalizeAdminHomepageSectionDetail(data);
}

export async function updateAdminHomepageSection(
  token: string,
  sectionId: string,
  payload: UpsertAdminHomepageSectionPayload,
): Promise<AdminHomepageSectionDetail> {
  const data = await apiRequest<unknown>(`/api/v1/admin/homepage-sections/${sectionId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: {
      title: payload.title.trim() || undefined,
      slug: payload.slug.trim() || undefined,
      description: payload.description.trim() || undefined,
      isActive: payload.isActive,
      sortOrder: toOptionalNumber(payload.sortOrder),
    },
  });

  return normalizeAdminHomepageSectionDetail(data);
}

export async function deleteAdminHomepageSection(
  token: string,
  sectionId: string,
): Promise<{ id: string }> {
  const data = await apiRequest<unknown>(`/api/v1/admin/homepage-sections/${sectionId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  const source = asRecord(data);
  return { id: asString(source.id) };
}

export async function createAdminHomepageSectionItem(
  token: string,
  sectionId: string,
  payload: CreateAdminHomepageSectionItemPayload,
): Promise<AdminHomepageSectionDetail> {
  const data = await apiRequest<unknown>(`/api/v1/admin/homepage-sections/${sectionId}/items`, {
    method: "POST",
    headers: authHeaders(token),
    body: {
      propertyId: payload.propertyId.trim(),
      sortOrder: toOptionalNumber(payload.sortOrder),
      isActive: payload.isActive,
    },
  });

  return normalizeAdminHomepageSectionDetail(data);
}

export async function updateAdminHomepageSectionItem(
  token: string,
  sectionId: string,
  propertyId: string,
  payload: UpdateAdminHomepageSectionItemPayload,
): Promise<AdminHomepageSectionDetail> {
  const data = await apiRequest<unknown>(
    `/api/v1/admin/homepage-sections/${sectionId}/items/${propertyId}`,
    {
      method: "PATCH",
      headers: authHeaders(token),
      body: {
        sortOrder: toOptionalNumber(payload.sortOrder),
        isActive: payload.isActive,
      },
    },
  );

  return normalizeAdminHomepageSectionDetail(data);
}

export async function deleteAdminHomepageSectionItem(
  token: string,
  sectionId: string,
  propertyId: string,
): Promise<AdminHomepageSectionDetail> {
  const data = await apiRequest<unknown>(
    `/api/v1/admin/homepage-sections/${sectionId}/items/${propertyId}`,
    {
      method: "DELETE",
      headers: authHeaders(token),
    },
  );

  return normalizeAdminHomepageSectionDetail(data);
}

export const createEmptyAdminHomepageSectionForm = (): UpsertAdminHomepageSectionPayload => ({
  title: "",
  slug: "",
  description: "",
  isActive: true,
  sortOrder: "",
});

export const createEmptyAdminHomepageSectionItemForm = (): CreateAdminHomepageSectionItemPayload => ({
  propertyId: "",
  sortOrder: "",
  isActive: true,
});
