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
