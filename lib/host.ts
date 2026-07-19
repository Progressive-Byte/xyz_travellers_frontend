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

export type HostReservationStatus =
  | ""
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

export type HostReservationPricingSnapshot = {
  currency: string;
  basePrice: number | null;
  discountedPrice: number | null;
  pricePerNightApplied: number | null;
  nights: number | null;
  subtotal: number | null;
};

export type HostReservation = {
  id: string;
  status: HostReservationStatus;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitName: string;
  guestId: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  adultGuests: number;
  childGuests: number;
  createdAt: string | null;
  respondedAt: string | null;
  responseReason: string;
  cancelledAt: string | null;
  completedAt: string | null;
  statusReason: string;
  pricingSnapshot: HostReservationPricingSnapshot;
};

export type HostReservationFilters = {
  status?: HostReservationStatus;
  propertyId?: string;
  unitId?: string;
  fromDate?: string;
  toDate?: string;
};

export type RespondHostReservationPayload = {
  action: "accept" | "reject";
  reason: string;
};

export type UpdateHostReservationStatusPayload = {
  status: "cancelled" | "completed";
  reason: string;
};

export type HostMessage = {
  id: string;
  threadId: string;
  reservationId: string;
  senderId: string;
  senderRole: string;
  body: string;
  readByHostAt: string | null;
  readByGuestAt: string | null;
  createdAt: string | null;
};

export type HostMessageThreadSummary = {
  id: string;
  reservationId: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitName: string;
  guestId: string;
  guestName: string;
  lastMessagePreview: string;
  lastMessageAt: string | null;
  hostUnreadCount: number;
  guestUnreadCount: number;
};

export type HostMessageThreadDetail = HostMessageThreadSummary & {
  messages: HostMessage[];
};

export type HostMessageThreadFilters = {
  reservationId?: string;
  propertyId?: string;
  unitId?: string;
  hasUnread?: boolean;
};

export type SendHostMessagePayload = {
  body: string;
};

export type HostReview = {
  id: string;
  reviewType: string;
  reservationId: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitName: string;
  hostId: string;
  guestId: string;
  guestName: string;
  reviewerId: string;
  reviewerRole: string;
  targetUserId: string;
  rating: number | null;
  title: string;
  comment: string;
  createdAt: string | null;
};

export type HostPropertyReviewsFilters = {
  propertyId?: string;
  unitId?: string;
  reservationId?: string;
  rating?: string;
};

export type HostGuestReviewsFilters = {
  guestId?: string;
  reservationId?: string;
  rating?: string;
};

export type CreateHostGuestReviewPayload = {
  reservationId: string;
  rating: string;
  title: string;
  comment: string;
};

export type HostEarningsSummary = {
  grossRevenue: number;
  commissionTotal: number;
  refundTotal: number;
  netEarnings: number;
  pendingPayout: number;
  paidOut: number;
  currency: string;
};

export type HostEarningsTransaction = {
  id: string;
  reservationId: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitName: string;
  transactionType: string;
  status: string;
  currency: string;
  grossAmount: number | null;
  commissionAmount: number | null;
  refundAmount: number | null;
  netAmount: number | null;
  processedAt: string | null;
  createdAt: string | null;
};

export type HostEarningsTransactionFilters = {
  status?: string;
  transactionType?: string;
  reservationId?: string;
  propertyId?: string;
  fromDate?: string;
  toDate?: string;
};

export type HostPayoutHistoryItem = {
  id: string;
  currency: string;
  grossAmount: number | null;
  commissionAmount: number | null;
  refundAmount: number | null;
  netAmount: number | null;
  status: string;
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
  createdAt: string | null;
  payoutProfileId: string;
  reference: string;
  notes: string;
};

export type HostPayoutHistoryFilters = {
  status?: string;
  fromDate?: string;
  toDate?: string;
};

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord => (value && typeof value === "object" ? (value as UnknownRecord) : {});
const asString = (value: unknown) => (typeof value === "string" ? value : "");
const asOptionalString = (value: unknown) => (typeof value === "string" ? value : null);
const asArray = (value: unknown) => (Array.isArray(value) ? value : []);
const asTextValue = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return asString(value);
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

export type HostBusiness = {
  id: string;
  name: string;
  registrationNumber: string;
  taxVatNumber: string;
  country: string;
  address: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: string;
  note: string;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type UpsertHostBusinessPayload = {
  businessName: string;
  registrationNumber: string;
  taxVatNumber: string;
  businessAddress: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
};

export type HostBusinessDocument = {
  id: string;
  businessId: string;
  fileUrl: string;
  fileName: string;
  title: string;
  documentType: string;
  note: string;
  issuedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type UploadHostBusinessDocumentsPayload = {
  files: File[];
  title: string;
  documentType: string;
  note: string;
  issuedAt?: string;
  expiresAt?: string;
  isActive?: boolean;
};

export type UpdateHostBusinessDocumentPayload = {
  title: string;
  documentType: string;
  note: string;
  issuedAt?: string;
  expiresAt?: string;
  isActive?: boolean;
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
  businessId: string;
  businessName: string;
  selectedBusinessDocumentIds: string[];
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

export type HostPropertyUnit = {
  id: string;
  propertyId: string;
  name: string;
  capacity: string;
  bedrooms: string;
  bathrooms: string;
  beds: string;
  amenities: string[];
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type UpsertHostPropertyUnitPayload = {
  name: string;
  capacity: string;
  bedrooms: string;
  bathrooms: string;
  beds: string;
  amenities: string[];
  isActive: boolean;
};

export type HostUnitPricing = {
  unitId: string;
  basePrice: string;
  discountedPrice: string;
  currency: string;
  note: string;
};

export type UpdateHostUnitPricingPayload = {
  basePrice: string;
  discountedPrice: string;
  currency: string;
};

export type HostUnitBlockedDate = {
  id: string;
  startDate: string;
  endDate: string;
  note: string;
};

export type HostUnitCalendarRules = {
  unitId: string;
  minimumStay: string;
  maximumStay: string;
  note: string;
  blockedDates: HostUnitBlockedDate[];
};

export type UpdateHostUnitCalendarRulesPayload = {
  minimumStay: string;
  maximumStay: string;
};

export type BlockHostUnitDatesPayload = {
  startDate: string;
  endDate: string;
  note: string;
};

export type HostUnitAvailabilityPreview = {
  unitId: string;
  availableDates: string[];
  blockedDates: string[];
  summary: string;
};

export type HostPropertyVerificationDocument = {
  id: string;
  propertyId: string;
  fileUrl: string;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number | null;
  documentType: string;
  note: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type HostPropertyVerification = {
  propertyId: string;
  note: string;
  documents: HostPropertyVerificationDocument[];
};

export type UpdateHostPropertyVerificationPayload = {
  files: File[];
  documentTypes: string[];
  note: string;
};

export type HostPropertySubmissionStatus = {
  propertyId: string;
  status: HostPropertyStatus;
  rawStatus: string | null;
  rejectionReason: string;
  submittedAt: string | null;
  updatedAt: string | null;
};

export type HostPropertySubmissionChecklistKey =
  | "basics"
  | "location"
  | "business"
  | "cover-image"
  | "media"
  | "units"
  | "pricing"
  | "calendar"
  | "verification";

export type HostPropertySubmissionChecklistItem = {
  key: HostPropertySubmissionChecklistKey;
  label: string;
  description: string;
  isComplete: boolean;
};

export type HostPropertySubmissionChecklist = {
  items: HostPropertySubmissionChecklistItem[];
  isComplete: boolean;
};

export type HostPropertySubmissionChecklistInput = {
  property: HostPropertyDetail;
  mediaItems: HostPropertyMediaItem[];
  units: HostPropertyUnit[];
  pricings: HostUnitPricing[];
  calendars: HostUnitCalendarRules[];
  verification: HostPropertyVerification | null;
  businesses?: HostBusiness[];
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
  businessId: string;
  selectedBusinessDocumentIds: string[];
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

const emptyHostBusiness = (): HostBusiness => ({
  id: "",
  name: "",
  registrationNumber: "",
  taxVatNumber: "",
  country: "",
  address: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  status: "",
  note: "",
  isActive: true,
  createdAt: null,
  updatedAt: null,
});

const emptyHostBusinessDocument = (): HostBusinessDocument => ({
  id: "",
  businessId: "",
  fileUrl: "",
  fileName: "",
  title: "",
  documentType: "",
  note: "",
  issuedAt: null,
  expiresAt: null,
  isActive: true,
  createdAt: null,
  updatedAt: null,
});

const emptyHostReservationPricingSnapshot = (): HostReservationPricingSnapshot => ({
  currency: "",
  basePrice: null,
  discountedPrice: null,
  pricePerNightApplied: null,
  nights: null,
  subtotal: null,
});

const emptyHostReservation = (): HostReservation => ({
  id: "",
  status: "",
  propertyId: "",
  propertyName: "",
  unitId: "",
  unitName: "",
  guestId: "",
  guestName: "",
  checkInDate: "",
  checkOutDate: "",
  adultGuests: 0,
  childGuests: 0,
  createdAt: null,
  respondedAt: null,
  responseReason: "",
  cancelledAt: null,
  completedAt: null,
  statusReason: "",
  pricingSnapshot: emptyHostReservationPricingSnapshot(),
});

const emptyHostMessageThreadDetail = (): HostMessageThreadDetail => ({
  id: "",
  reservationId: "",
  propertyId: "",
  propertyName: "",
  unitId: "",
  unitName: "",
  guestId: "",
  guestName: "",
  lastMessagePreview: "",
  lastMessageAt: null,
  hostUnreadCount: 0,
  guestUnreadCount: 0,
  messages: [],
});

const emptyHostEarningsSummary = (): HostEarningsSummary => ({
  grossRevenue: 0,
  commissionTotal: 0,
  refundTotal: 0,
  netEarnings: 0,
  pendingPayout: 0,
  paidOut: 0,
  currency: "",
});

const emptyHostPayoutHistoryItem = (): HostPayoutHistoryItem => ({
  id: "",
  currency: "",
  grossAmount: null,
  commissionAmount: null,
  refundAmount: null,
  netAmount: null,
  status: "",
  periodStart: "",
  periodEnd: "",
  paidAt: null,
  createdAt: null,
  payoutProfileId: "",
  reference: "",
  notes: "",
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
  businessId: "",
  businessName: "",
  selectedBusinessDocumentIds: [],
  updatedAt: null,
  createdAt: null,
  description: "",
  amenities: [],
  lat: "",
  lng: "",
  houseRules: "",
});

const emptyHostPropertyUnit = (): HostPropertyUnit => ({
  id: "",
  propertyId: "",
  name: "",
  capacity: "",
  bedrooms: "",
  bathrooms: "",
  beds: "",
  amenities: [],
  isActive: true,
  createdAt: null,
  updatedAt: null,
});

const emptyHostUnitPricing = (): HostUnitPricing => ({
  unitId: "",
  basePrice: "",
  discountedPrice: "",
  currency: "",
  note: "",
});

const emptyHostUnitCalendarRules = (): HostUnitCalendarRules => ({
  unitId: "",
  minimumStay: "",
  maximumStay: "",
  note: "",
  blockedDates: [],
});

const emptyHostPropertyVerification = (): HostPropertyVerification => ({
  propertyId: "",
  note: "",
  documents: [],
});

const emptyHostIdentityVerification = (): HostIdentityVerification => ({
  id: "",
  userId: "",
  status: "draft",
  rawStatus: "draft",
  rejectionReason: null,
  submittedAt: null,
  updatedAt: null,
  documents: [],
});

const emptyHostPropertySubmissionStatus = (): HostPropertySubmissionStatus => ({
  propertyId: "",
  status: "draft",
  rawStatus: "draft",
  rejectionReason: "",
  submittedAt: null,
  updatedAt: null,
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

const normalizeHostReservationStatus = (value: unknown): HostReservationStatus => {
  const normalized = asString(value).trim().toLowerCase();

  if (
    normalized === "pending" ||
    normalized === "accepted" ||
    normalized === "rejected" ||
    normalized === "cancelled" ||
    normalized === "completed"
  ) {
    return normalized;
  }

  return "";
};

const normalizeHostReservationPricingSnapshot = (
  payload: unknown,
): HostReservationPricingSnapshot => {
  const source = asRecord(payload);

  return {
    currency: asString(source.currency ?? source.currencyCode ?? source.currency_code),
    basePrice: asNumber(source.basePrice ?? source.base_price),
    discountedPrice: asNumber(source.discountedPrice ?? source.discounted_price),
    pricePerNightApplied: asNumber(source.pricePerNightApplied ?? source.price_per_night_applied),
    nights: asNumber(source.nights),
    subtotal: asNumber(source.subtotal),
  };
};

const normalizeHostReservation = (payload: unknown): HostReservation => {
  const source = asRecord(payload);
  const propertySource = asRecord(source.property);
  const unitSource = asRecord(source.unit);
  const guestSource = asRecord(source.guest);

  return {
    id: asString(source.id) || asString(source.reservationId ?? source.reservation_id),
    status: normalizeHostReservationStatus(source.status),
    propertyId: asString(source.propertyId ?? source.property_id),
    propertyName:
      asString(source.propertyName ?? source.property_name) ||
      asString(propertySource.name ?? propertySource.propertyName ?? propertySource.property_name),
    unitId: asString(source.unitId ?? source.unit_id),
    unitName:
      asString(source.unitName ?? source.unit_name) ||
      asString(unitSource.name ?? unitSource.unitName ?? unitSource.unit_name),
    guestId: asString(source.guestId ?? source.guest_id),
    guestName:
      asString(source.guestName ?? source.guest_name) ||
      asString(guestSource.name ?? guestSource.fullName ?? guestSource.full_name),
    checkInDate: asString(source.checkInDate ?? source.check_in_date),
    checkOutDate: asString(source.checkOutDate ?? source.check_out_date),
    adultGuests: asNumber(source.adultGuests ?? source.adult_guests) ?? 0,
    childGuests: asNumber(source.childGuests ?? source.child_guests) ?? 0,
    createdAt: asOptionalString(source.createdAt ?? source.created_at),
    respondedAt: asOptionalString(source.respondedAt ?? source.responded_at),
    responseReason: asString(source.responseReason ?? source.response_reason),
    cancelledAt: asOptionalString(source.cancelledAt ?? source.cancelled_at),
    completedAt: asOptionalString(source.completedAt ?? source.completed_at),
    statusReason: asString(source.statusReason ?? source.status_reason),
    pricingSnapshot: normalizeHostReservationPricingSnapshot(
      source.pricingSnapshot ?? source.pricing_snapshot,
    ),
  };
};

const normalizeHostMessage = (payload: unknown): HostMessage => {
  const source = asRecord(payload);

  return {
    id: asString(source.id) || asString(source.messageId ?? source.message_id),
    threadId: asString(source.threadId ?? source.thread_id),
    reservationId: asString(source.reservationId ?? source.reservation_id),
    senderId: asString(source.senderId ?? source.sender_id),
    senderRole: asString(source.senderRole ?? source.sender_role),
    body: asString(source.body ?? source.message ?? source.text),
    readByHostAt: asOptionalString(source.readByHostAt ?? source.read_by_host_at),
    readByGuestAt: asOptionalString(source.readByGuestAt ?? source.read_by_guest_at),
    createdAt: asOptionalString(source.createdAt ?? source.created_at),
  };
};

const normalizeHostMessageThreadSummary = (payload: unknown): HostMessageThreadSummary => {
  const source = asRecord(payload);
  const propertySource = asRecord(source.property);
  const unitSource = asRecord(source.unit);
  const guestSource = asRecord(source.guest);

  return {
    id: asString(source.id) || asString(source.threadId ?? source.thread_id),
    reservationId: asString(source.reservationId ?? source.reservation_id),
    propertyId: asString(source.propertyId ?? source.property_id),
    propertyName:
      asString(source.propertyName ?? source.property_name) ||
      asString(propertySource.name ?? propertySource.propertyName ?? propertySource.property_name),
    unitId: asString(source.unitId ?? source.unit_id),
    unitName:
      asString(source.unitName ?? source.unit_name) ||
      asString(unitSource.name ?? unitSource.unitName ?? unitSource.unit_name),
    guestId: asString(source.guestId ?? source.guest_id),
    guestName:
      asString(source.guestName ?? source.guest_name) ||
      asString(guestSource.name ?? guestSource.fullName ?? guestSource.full_name),
    lastMessagePreview: asString(
      source.lastMessagePreview ?? source.last_message_preview ?? source.preview,
    ),
    lastMessageAt: asOptionalString(source.lastMessageAt ?? source.last_message_at),
    hostUnreadCount: asNumber(source.hostUnreadCount ?? source.host_unread_count) ?? 0,
    guestUnreadCount: asNumber(source.guestUnreadCount ?? source.guest_unread_count) ?? 0,
  };
};

const normalizeHostMessageThreadDetail = (payload: unknown): HostMessageThreadDetail => {
  const source = asRecord(payload);

  return {
    ...normalizeHostMessageThreadSummary(payload),
    messages: extractHostMessagesArray(source.messages ?? source.items ?? source.results)
      .map((item) => normalizeHostMessage(item))
      .filter((item) => item.id || item.body),
  };
};

const normalizeHostReview = (payload: unknown): HostReview => {
  const source = asRecord(payload);
  const propertySource = asRecord(source.property);
  const unitSource = asRecord(source.unit);
  const guestSource = asRecord(source.guest);

  return {
    id: asString(source.id) || asString(source.reviewId ?? source.review_id),
    reviewType: asString(source.reviewType ?? source.review_type ?? source.type),
    reservationId: asString(source.reservationId ?? source.reservation_id),
    propertyId: asString(source.propertyId ?? source.property_id),
    propertyName:
      asString(source.propertyName ?? source.property_name) ||
      asString(propertySource.name ?? propertySource.propertyName ?? propertySource.property_name),
    unitId: asString(source.unitId ?? source.unit_id),
    unitName:
      asString(source.unitName ?? source.unit_name) ||
      asString(unitSource.name ?? unitSource.unitName ?? unitSource.unit_name),
    hostId: asString(source.hostId ?? source.host_id),
    guestId: asString(source.guestId ?? source.guest_id),
    guestName:
      asString(source.guestName ?? source.guest_name) ||
      asString(guestSource.name ?? guestSource.fullName ?? guestSource.full_name),
    reviewerId: asString(source.reviewerId ?? source.reviewer_id),
    reviewerRole: asString(source.reviewerRole ?? source.reviewer_role),
    targetUserId: asString(source.targetUserId ?? source.target_user_id),
    rating: asNumber(source.rating),
    title: asString(source.title),
    comment: asString(source.comment ?? source.body),
    createdAt: asOptionalString(source.createdAt ?? source.created_at),
  };
};

const normalizeHostEarningsSummary = (payload: unknown): HostEarningsSummary => {
  const source = asRecord(payload);

  return {
    grossRevenue: asNumber(source.grossRevenue ?? source.gross_revenue) ?? 0,
    commissionTotal: asNumber(source.commissionTotal ?? source.commission_total) ?? 0,
    refundTotal: asNumber(source.refundTotal ?? source.refund_total) ?? 0,
    netEarnings: asNumber(source.netEarnings ?? source.net_earnings) ?? 0,
    pendingPayout: asNumber(source.pendingPayout ?? source.pending_payout) ?? 0,
    paidOut: asNumber(source.paidOut ?? source.paid_out) ?? 0,
    currency: asString(source.currency ?? source.currencyCode ?? source.currency_code),
  };
};

const normalizeHostEarningsTransaction = (payload: unknown): HostEarningsTransaction => {
  const source = asRecord(payload);
  const propertySource = asRecord(source.property);
  const unitSource = asRecord(source.unit);

  return {
    id: asString(source.id) || asString(source.transactionId ?? source.transaction_id),
    reservationId: asString(source.reservationId ?? source.reservation_id),
    propertyId: asString(source.propertyId ?? source.property_id),
    propertyName:
      asString(source.propertyName ?? source.property_name) ||
      asString(propertySource.name ?? propertySource.propertyName ?? propertySource.property_name),
    unitId: asString(source.unitId ?? source.unit_id),
    unitName:
      asString(source.unitName ?? source.unit_name) ||
      asString(unitSource.name ?? unitSource.unitName ?? unitSource.unit_name),
    transactionType: asString(source.transactionType ?? source.transaction_type),
    status: asString(source.status),
    currency: asString(source.currency ?? source.currencyCode ?? source.currency_code),
    grossAmount: asNumber(source.grossAmount ?? source.gross_amount),
    commissionAmount: asNumber(source.commissionAmount ?? source.commission_amount),
    refundAmount: asNumber(source.refundAmount ?? source.refund_amount),
    netAmount: asNumber(source.netAmount ?? source.net_amount),
    processedAt: asOptionalString(source.processedAt ?? source.processed_at),
    createdAt: asOptionalString(source.createdAt ?? source.created_at),
  };
};

const normalizeHostPayoutHistoryItem = (payload: unknown): HostPayoutHistoryItem => {
  const source = asRecord(payload);

  return {
    id: asString(source.id) || asString(source.payoutId ?? source.payout_id),
    currency: asString(source.currency ?? source.currencyCode ?? source.currency_code),
    grossAmount: asNumber(source.grossAmount ?? source.gross_amount),
    commissionAmount: asNumber(source.commissionAmount ?? source.commission_amount),
    refundAmount: asNumber(source.refundAmount ?? source.refund_amount),
    netAmount: asNumber(source.netAmount ?? source.net_amount),
    status: asString(source.status),
    periodStart: asString(source.periodStart ?? source.period_start),
    periodEnd: asString(source.periodEnd ?? source.period_end),
    paidAt: asOptionalString(source.paidAt ?? source.paid_at),
    createdAt: asOptionalString(source.createdAt ?? source.created_at),
    payoutProfileId: asString(source.payoutProfileId ?? source.payout_profile_id),
    reference: asString(source.reference ?? source.code),
    notes: asString(source.notes ?? source.note ?? source.description),
  };
};

const normalizeHostBusiness = (payload: unknown): HostBusiness => {
  const source = asRecord(payload);
  const addressSource = asRecord(source.addressInfo ?? source.address_info ?? source.location);
  const businessAddress =
    asString(source.businessAddress ?? source.business_address) ||
    asString(source.address) ||
    asString(addressSource.address ?? addressSource.line1 ?? addressSource.line_1);
  const country =
    asString(source.country ?? addressSource.country) ||
    businessAddress
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .at(-1) ||
    "";
  const isActive = normalizeHostUnitActive(source.isActive ?? source.is_active ?? true);

  return {
    id: asString(source.id) || asString(source.businessId ?? source.business_id),
    name:
      asString(source.name) ||
      asString(source.businessName ?? source.business_name) ||
      asString(source.title),
    registrationNumber:
      asString(source.registrationNumber ?? source.registration_number) ||
      asString(source.tradeLicenseNumber ?? source.trade_license_number) ||
      asString(source.licenseNumber ?? source.license_number),
    taxVatNumber: asString(source.taxVatNumber ?? source.tax_vat_number ?? source.vatNumber ?? source.vat_number),
    country,
    address: businessAddress,
    contactName: asString(source.contactName ?? source.contact_name),
    contactEmail: asString(source.contactEmail ?? source.contact_email),
    contactPhone: asString(source.contactPhone ?? source.contact_phone),
    status:
      asString(source.status ?? source.state ?? source.businessStatus ?? source.business_status) ||
      (isActive ? "active" : "inactive"),
    note: asString(source.note ?? source.description ?? source.comment),
    isActive,
    createdAt: asOptionalString(source.createdAt ?? source.created_at),
    updatedAt: asOptionalString(source.updatedAt ?? source.updated_at),
  };
};

const normalizeHostBusinessDocument = (payload: unknown): HostBusinessDocument => {
  const source = asRecord(payload);

  return {
    id: asString(source.id) || asString(source.documentId ?? source.document_id),
    businessId: asString(source.businessId ?? source.business_id),
    fileUrl:
      asString(source.fileUrl ?? source.file_url) ||
      asString(source.url) ||
      asString(source.path) ||
      asString(source.src),
    fileName:
      asString(source.fileName ?? source.file_name) ||
      asString(source.name) ||
      asString(source.title) ||
      asString(source.label),
    title:
      asString(source.title) ||
      asString(source.label) ||
      asString(source.name) ||
      asString(source.fileName ?? source.file_name),
    documentType:
      asString(source.documentType ?? source.document_type) ||
      asString(source.type) ||
      asString(source.category),
    note: asString(source.note ?? source.notes ?? source.description ?? source.comment),
    issuedAt: asOptionalString(source.issuedAt ?? source.issued_at),
    expiresAt: asOptionalString(source.expiresAt ?? source.expires_at),
    isActive: normalizeHostUnitActive(source.isActive ?? source.is_active ?? true),
    createdAt: asOptionalString(source.createdAt ?? source.created_at),
    updatedAt: asOptionalString(source.updatedAt ?? source.updated_at),
  };
};

const normalizeSelectedBusinessDocumentIds = (value: unknown): string[] =>
  asArray(value)
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      const source = asRecord(item);

      return (
        asString(source.id) ||
        asString(source.documentId ?? source.document_id) ||
        asString(source.value)
      ).trim();
    })
    .filter(Boolean);

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
  const businessSource = asRecord(
    source.business ??
      source.businessProfile ??
      source.business_profile ??
      source.selectedBusiness ??
      source.selected_business,
  );
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
    businessId:
      asString(source.businessId ?? source.business_id) ||
      asString(source.selectedBusinessId ?? source.selected_business_id) ||
      asString(businessSource.id ?? businessSource.businessId ?? businessSource.business_id),
    businessName:
      asString(source.businessName ?? source.business_name) ||
      asString(businessSource.name ?? businessSource.businessName ?? businessSource.business_name),
    selectedBusinessDocumentIds: normalizeSelectedBusinessDocumentIds(
      source.selectedBusinessDocumentIds ??
        source.selected_business_document_ids ??
        source.businessDocumentIds ??
        source.business_document_ids ??
        source.selectedBusinessDocuments ??
        source.selected_business_documents ??
        businessSource.documents ??
        businessSource.businessDocuments,
    ),
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

const normalizeHostUnitActive = (value: unknown) => {
  const normalized = asString(value).trim().toLowerCase();

  if (!normalized) {
    return asBoolean(value);
  }

  return ["active", "enabled", "true", "1", "yes", "available", "live"].includes(normalized);
};

const normalizeHostPropertyUnit = (payload: unknown): HostPropertyUnit => {
  const source = asRecord(payload);

  return {
    id: asString(source.id) || asString(source.unitId ?? source.unit_id),
    propertyId: asString(source.propertyId ?? source.property_id),
    name:
      asString(source.name) ||
      asString(source.unitName ?? source.unit_name) ||
      asString(source.title) ||
      asString(source.label),
    capacity: asTextValue(source.capacity ?? source.maxGuests ?? source.max_guests ?? source.guests),
    bedrooms: asTextValue(source.bedrooms ?? source.bedroomCount ?? source.bedroom_count),
    bathrooms: asTextValue(source.bathrooms ?? source.bathroomCount ?? source.bathroom_count),
    beds: asTextValue(source.beds ?? source.bedCount ?? source.bed_count),
    amenities: normalizeHostPropertyAmenities(source.amenities ?? source.amenityIds ?? source.amenity_ids),
    isActive: normalizeHostUnitActive(source.isActive ?? source.is_active ?? source.active ?? source.status),
    createdAt: asOptionalString(source.createdAt ?? source.created_at),
    updatedAt: asOptionalString(source.updatedAt ?? source.updated_at),
  };
};

const normalizeHostUnitPricing = (payload: unknown, unitId = ""): HostUnitPricing => {
  const source = asRecord(payload);

  return {
    unitId: asString(source.unitId ?? source.unit_id) || unitId,
    basePrice: asTextValue(source.basePrice ?? source.base_price ?? source.price ?? source.amount),
    discountedPrice: asTextValue(
      source.discountedPrice ?? source.discounted_price ?? source.salePrice ?? source.sale_price,
    ),
    currency: asString(source.currency ?? source.currencyCode ?? source.currency_code),
    note: asString(source.note ?? source.description ?? source.summary),
  };
};

const normalizeHostUnitBlockedDate = (payload: unknown): HostUnitBlockedDate => {
  const source = asRecord(payload);
  const singleDate = asString(source.date);

  return {
    id: asString(source.id) || asString(source.blockId ?? source.block_id) || singleDate,
    startDate: asString(source.startDate ?? source.start_date) || singleDate,
    endDate: asString(source.endDate ?? source.end_date) || singleDate,
    note: asString(source.note ?? source.reason ?? source.description),
  };
};

const normalizeHostUnitCalendarRules = (payload: unknown, unitId = ""): HostUnitCalendarRules => {
  const source = asRecord(payload);

  return {
    unitId: asString(source.unitId ?? source.unit_id) || unitId,
    minimumStay: asTextValue(source.minimumStay ?? source.minimum_stay ?? source.minStay ?? source.min_stay),
    maximumStay: asTextValue(source.maximumStay ?? source.maximum_stay ?? source.maxStay ?? source.max_stay),
    note: asString(source.note ?? source.description ?? source.summary),
    blockedDates: extractHostUnitBlockedDateArray(
      source.blockedDates ?? source.blocked_dates ?? source.blocks ?? source.blocksList,
    )
      .map((item) => normalizeHostUnitBlockedDate(item))
      .filter((item) => item.startDate),
  };
};

const normalizeAvailabilityDates = (value: unknown) =>
  asArray(value)
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      const source = asRecord(item);
      return (
        asString(source.date) ||
        asString(source.startDate ?? source.start_date) ||
        asString(source.availableDate ?? source.available_date)
      );
    })
    .filter(Boolean);

const normalizeHostUnitAvailabilityPreview = (
  payload: unknown,
  unitId = "",
): HostUnitAvailabilityPreview => {
  const source = asRecord(payload);

  return {
    unitId: asString(source.unitId ?? source.unit_id) || unitId,
    availableDates: normalizeAvailabilityDates(source.availableDates ?? source.available_dates ?? source.available),
    blockedDates: normalizeAvailabilityDates(source.blockedDates ?? source.blocked_dates ?? source.blocks),
    summary: asString(source.summary ?? source.note ?? source.description),
  };
};

const normalizeHostPropertyVerificationDocument = (
  payload: unknown,
): HostPropertyVerificationDocument => {
  const source = asRecord(payload);
  const originalFileName =
    asString(source.originalFileName ?? source.original_file_name) ||
    asString(source.fileName ?? source.file_name) ||
    asString(source.name) ||
    asString(source.title) ||
    asString(source.label);

  return {
    id: asString(source.id) || asString(source.documentId ?? source.document_id),
    propertyId: asString(source.propertyId ?? source.property_id),
    fileUrl:
      asString(source.fileUrl ?? source.file_url) ||
      asString(source.url) ||
      asString(source.path) ||
      asString(source.src),
    fileName: originalFileName,
    originalFileName,
    mimeType: asString(source.mimeType ?? source.mime_type),
    fileSize: asNumber(source.fileSize ?? source.file_size),
    documentType:
      asString(source.documentType ?? source.document_type) ||
      asString(source.type) ||
      asString(source.category),
    note: asString(source.note ?? source.description ?? source.comment),
    createdAt: asOptionalString(source.createdAt ?? source.created_at),
    updatedAt: asOptionalString(source.updatedAt ?? source.updated_at),
  };
};

const normalizeHostPropertySubmissionStatus = (
  payload: unknown,
  propertyId = "",
): HostPropertySubmissionStatus => {
  const source = asRecord(payload);
  const rawStatus =
    asOptionalString(source.status) ??
    asOptionalString(source.propertyStatus) ??
    asOptionalString(source.property_status) ??
    "draft";

  return {
    propertyId: asString(source.propertyId ?? source.property_id) || propertyId,
    status: normalizeHostPropertyStatus(rawStatus),
    rawStatus,
    rejectionReason:
      asString(source.rejectionReason ?? source.rejection_reason) ||
      asString(source.rejectedReason ?? source.rejected_reason) ||
      asString(source.reason) ||
      asString(source.note),
    submittedAt: asOptionalString(source.submittedAt ?? source.submitted_at),
    updatedAt: asOptionalString(source.updatedAt ?? source.updated_at),
  };
};

const normalizeHostPropertyVerification = (
  payload: unknown,
  propertyId = "",
): HostPropertyVerification => {
  if (Array.isArray(payload)) {
    const documents = payload
      .map((item) => normalizeHostPropertyVerificationDocument(item))
      .filter((item) => item.fileUrl);

    return {
      propertyId: propertyId || documents[0]?.propertyId || "",
      note: "",
      documents,
    };
  }

  const source = asRecord(payload);
  const documents = extractHostPropertyVerificationDocumentsArray(
    source.documents ??
      source.verifications ??
      source.files ??
      source.attachments ??
      source.items ??
      source.results ??
      source.data,
  )
    .map((item) => normalizeHostPropertyVerificationDocument(item))
    .filter((item) => item.fileUrl);

  return {
    propertyId:
      asString(source.propertyId ?? source.property_id) || propertyId || documents[0]?.propertyId || "",
    note: asString(source.note ?? source.notes ?? source.description ?? source.comment),
    documents,
  };
};

const normalizeHostIdentityVerificationDocument = (
  payload: unknown,
): HostIdentityVerificationDocument => {
  const source = asRecord(payload);

  return {
    documentType:
      asString(source.documentType ?? source.document_type) ||
      asString(source.type) ||
      asString(source.category),
    documentFront:
      asString(source.documentFront ?? source.document_front) ||
      asString(source.front ?? source.frontUrl ?? source.front_url),
    documentBack:
      asString(source.documentBack ?? source.document_back) ||
      asString(source.back ?? source.backUrl ?? source.back_url),
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

const extractHostPropertyUnitArray = (payload: unknown) => {
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

  if (Array.isArray(source.units)) {
    return source.units;
  }

  if (Array.isArray(source.data)) {
    return source.data;
  }

  return [];
};

const extractHostUnitBlockedDateArray = (payload: unknown) => {
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

  if (Array.isArray(source.blockedDates)) {
    return source.blockedDates;
  }

  if (Array.isArray(source.blocked_dates)) {
    return source.blocked_dates;
  }

  if (Array.isArray(source.blocks)) {
    return source.blocks;
  }

  return [];
};

const extractHostPropertyVerificationDocumentsArray = (payload: unknown) => {
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

  if (Array.isArray(source.documents)) {
    return source.documents;
  }

  if (Array.isArray(source.files)) {
    return source.files;
  }

  if (Array.isArray(source.attachments)) {
    return source.attachments;
  }

  return [];
};

const extractHostBusinessDocumentArray = (payload: unknown) => {
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

  if (Array.isArray(source.documents)) {
    return source.documents;
  }

  if (Array.isArray(source.files)) {
    return source.files;
  }

  if (Array.isArray(source.attachments)) {
    return source.attachments;
  }

  if (Array.isArray(source.data)) {
    return source.data;
  }

  return [];
};

const extractHostMessagesArray = (payload: unknown) => {
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

  if (Array.isArray(source.messages)) {
    return source.messages;
  }

  if (Array.isArray(source.data)) {
    return source.data;
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

  if (Array.isArray(source.businesses)) {
    return source.businesses;
  }

  return [];
};

const buildQueryString = (params: Record<string, string | boolean | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "boolean") {
      searchParams.set(key, value ? "true" : "false");
      return;
    }

    const normalized = value?.trim();

    if (normalized) {
      searchParams.set(key, normalized);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
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

export const getHostPropertySubmissionChecklist = ({
  property,
  mediaItems,
  units,
  pricings,
  calendars,
  verification,
  businesses = [],
}: HostPropertySubmissionChecklistInput): HostPropertySubmissionChecklist => {
  const hasBasics =
    Boolean(property.name.trim()) &&
    Boolean(property.description.trim()) &&
    Boolean(property.propertyType.trim()) &&
    Boolean(property.ownershipType.trim());
  const hasLocation =
    Boolean(property.address.trim()) &&
    Boolean(property.city.trim()) &&
    Boolean(property.country.trim());
  const isCommercial = property.ownershipType.trim().toLowerCase() === "commercial";
  const hasBusinessLinkage =
    !isCommercial ||
    (Boolean(property.businessId.trim()) &&
      (property.selectedBusinessDocumentIds.length > 0 ||
        businesses.some((item) => item.id === property.businessId)));
  const hasMedia = mediaItems.length > 0;
  const hasCoverImage = mediaItems.some((item) => item.type === "image" && item.isCover);
  const hasUnits = units.length > 0;
  const hasPricing = pricings.some((item) => item.basePrice.trim() && item.currency.trim());
  const hasCalendar = calendars.some(
    (item) =>
      item.minimumStay.trim() ||
      item.maximumStay.trim() ||
      item.blockedDates.length > 0,
  );
  const hasVerification = (verification?.documents.length ?? 0) > 0;

  const items: HostPropertySubmissionChecklistItem[] = [
    {
      key: "basics",
      label: "Basics complete",
      description: "Property name, description, type, and ownership are all filled in.",
      isComplete: hasBasics,
    },
    {
      key: "location",
      label: "Location complete",
      description: "Address, city, and country are ready for review.",
      isComplete: hasLocation,
    },
    {
      key: "business",
      label: "Commercial business linked",
      description: isCommercial
        ? "Commercial properties should be linked to a business profile and reusable business documents."
        : "Personal properties do not need business linkage for submission readiness.",
      isComplete: hasBusinessLinkage,
    },
    {
      key: "cover-image",
      label: "Cover image selected",
      description: "At least one uploaded image is marked as the listing cover.",
      isComplete: hasCoverImage,
    },
    {
      key: "media",
      label: "Media uploaded",
      description: "The property has guest-facing media attached.",
      isComplete: hasMedia,
    },
    {
      key: "units",
      label: "Units created",
      description: "At least one unit exists for the property.",
      isComplete: hasUnits,
    },
    {
      key: "pricing",
      label: "Pricing configured",
      description: "At least one unit has a base price and currency saved.",
      isComplete: hasPricing,
    },
    {
      key: "calendar",
      label: "Calendar setup added",
      description: "At least one unit has stay rules or blocked dates configured.",
      isComplete: hasCalendar,
    },
    {
      key: "verification",
      label: "Verification proof attached",
      description: "Property verification documents are uploaded for review.",
      isComplete: hasVerification,
    },
  ];

  return {
    items,
    isComplete: items.every((item) => item.isComplete),
  };
};

type HostIdentityVerificationApiData = {
  id?: string;
  userId?: string;
  user_id?: string;
  documents?: unknown;
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

export type HostIdentityVerificationDocument = {
  documentType: string;
  documentFront: string;
  documentBack: string;
};

export type HostIdentityVerification = HostIdentityVerificationStatus & {
  userId: string;
  documents: HostIdentityVerificationDocument[];
};

export type UpsertHostIdentityVerificationPayload = {
  documents: HostIdentityVerificationDocument[];
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

const normalizeHostIdentityVerification = (
  payload: HostIdentityVerificationApiData | unknown,
): HostIdentityVerification => {
  const source = asRecord(payload);
  const rawStatus =
    asOptionalString(source.status) ??
    asOptionalString(source.state) ??
    asOptionalString(source.applicationStatus ?? source.application_status) ??
    asOptionalString(source.verificationStatus ?? source.verification_status) ??
    asOptionalString(source.reviewStatus ?? source.review_status) ??
    null;
  const documents = asArray(source.documents)
    .map((item) => normalizeHostIdentityVerificationDocument(item))
    .filter((item) => item.documentType || item.documentFront || item.documentBack);

  return {
    ...emptyHostIdentityVerification(),
    id: asString(source.id),
    userId: asString(source.userId ?? source.user_id),
    documents,
    status: getNormalizedVerificationStatus(rawStatus),
    rawStatus,
    rejectionReason:
      asOptionalString(source.rejectionReason ?? source.rejection_reason) ??
      asOptionalString(source.rejectedReason ?? source.rejected_reason) ??
      asOptionalString(source.reason) ??
      asOptionalString(source.note),
    submittedAt: asOptionalString(source.submittedAt ?? source.submitted_at),
    updatedAt: asOptionalString(source.updatedAt ?? source.updated_at),
  };
};

const normalizeHostIdentityVerificationStatus = (
  payload: HostIdentityVerificationApiData,
): HostIdentityVerificationStatus => {
  const normalized = normalizeHostIdentityVerification(payload);

  return {
    id: normalized.id,
    status: normalized.status,
    rawStatus: normalized.rawStatus,
    rejectionReason: normalized.rejectionReason,
    submittedAt: normalized.submittedAt,
    updatedAt: normalized.updatedAt,
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

export async function getHostReservations(
  token: string,
  filters: HostReservationFilters = {},
): Promise<HostReservation[]> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const query = buildQueryString({
    status: filters.status,
    propertyId: filters.propertyId,
    unitId: filters.unitId,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
  });

  try {
    const response = await apiRequest<unknown>(`/api/v1/host/reservations${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return extractReferenceArray(response)
      .map((item) => normalizeHostReservation(item))
      .filter((item) => item.id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }

    throw error;
  }
}

export async function getHostReservation(
  token: string,
  reservationId: string,
): Promise<HostReservation> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>(`/api/v1/host/reservations/${reservationId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return normalizeHostReservation(response);
}

export async function respondHostReservation(
  token: string,
  reservationId: string,
  payload: RespondHostReservationPayload,
): Promise<HostReservation> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequestOptional<unknown>(
    `/api/v1/host/reservations/${reservationId}/respond`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        action: payload.action,
        reason: payload.reason.trim() || undefined,
      },
      cache: "no-store",
    },
  );

  if (response) {
    return normalizeHostReservation(response);
  }

  return getHostReservation(token, reservationId);
}

export async function updateHostReservationStatus(
  token: string,
  reservationId: string,
  payload: UpdateHostReservationStatusPayload,
): Promise<HostReservation> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequestOptional<unknown>(
    `/api/v1/host/reservations/${reservationId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        status: payload.status,
        reason: payload.reason.trim() || undefined,
      },
      cache: "no-store",
    },
  );

  if (response) {
    return normalizeHostReservation(response);
  }

  return getHostReservation(token, reservationId);
}

export async function getHostMessageThreads(
  token: string,
  filters: HostMessageThreadFilters = {},
): Promise<HostMessageThreadSummary[]> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const query = buildQueryString({
    reservationId: filters.reservationId,
    propertyId: filters.propertyId,
    unitId: filters.unitId,
    hasUnread: filters.hasUnread,
  });

  try {
    const response = await apiRequest<unknown>(`/api/v1/host/messages/threads${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return extractReferenceArray(response)
      .map((item) => normalizeHostMessageThreadSummary(item))
      .filter((item) => item.id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }

    throw error;
  }
}

export async function getHostMessageThread(
  token: string,
  threadId: string,
): Promise<HostMessageThreadDetail> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>(`/api/v1/host/messages/threads/${threadId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return normalizeHostMessageThreadDetail(response);
}

export async function sendHostMessage(
  token: string,
  threadId: string,
  payload: SendHostMessagePayload,
): Promise<HostMessageThreadDetail> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequestOptional<unknown>(
    `/api/v1/host/messages/threads/${threadId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        body: payload.body.trim(),
      },
      cache: "no-store",
    },
  );

  if (response) {
    return normalizeHostMessageThreadDetail(response);
  }

  return getHostMessageThread(token, threadId);
}

export async function markHostMessageThreadRead(
  token: string,
  threadId: string,
): Promise<HostMessageThreadDetail> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequestOptional<unknown>(
    `/api/v1/host/messages/threads/${threadId}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {},
      cache: "no-store",
    },
  );

  if (response) {
    return normalizeHostMessageThreadDetail(response);
  }

  return getHostMessageThread(token, threadId);
}

export async function getHostPropertyReviews(
  token: string,
  filters: HostPropertyReviewsFilters = {},
): Promise<HostReview[]> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const query = buildQueryString({
    propertyId: filters.propertyId,
    unitId: filters.unitId,
    reservationId: filters.reservationId,
    rating: filters.rating,
  });

  try {
    const response = await apiRequest<unknown>(`/api/v1/host/reviews/property${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return extractReferenceArray(response)
      .map((item) => normalizeHostReview(item))
      .filter((item) => item.id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }

    throw error;
  }
}

export async function getHostPropertyReview(
  token: string,
  reviewId: string,
): Promise<HostReview> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>(`/api/v1/host/reviews/property/${reviewId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return normalizeHostReview(response);
}

export async function getHostGuestReviews(
  token: string,
  filters: HostGuestReviewsFilters = {},
): Promise<HostReview[]> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const query = buildQueryString({
    guestId: filters.guestId,
    reservationId: filters.reservationId,
    rating: filters.rating,
  });

  try {
    const response = await apiRequest<unknown>(`/api/v1/host/reviews/guest${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return extractReferenceArray(response)
      .map((item) => normalizeHostReview(item))
      .filter((item) => item.id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }

    throw error;
  }
}

export async function createHostGuestReview(
  token: string,
  payload: CreateHostGuestReviewPayload,
): Promise<HostReview> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const normalizedRating = payload.rating.trim();

  const response = await apiRequest<unknown>("/api/v1/host/reviews/guest", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      reservationId: payload.reservationId.trim(),
      rating: normalizedRating ? Number(normalizedRating) : undefined,
      title: payload.title.trim() || undefined,
      comment: payload.comment.trim() || undefined,
    },
    cache: "no-store",
  });

  return normalizeHostReview(response);
}

export async function getHostEarningsSummary(token: string): Promise<HostEarningsSummary> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  try {
    const response = await apiRequest<unknown>("/api/v1/host/earnings/summary", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return normalizeHostEarningsSummary(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      const dashboard = await getHostDashboard(token);

      return normalizeHostEarningsSummary({
        ...dashboard.earnings,
        pendingPayout: dashboard.payouts.pendingPayout,
        paidOut: dashboard.payouts.paidOut,
        currency: dashboard.earnings.currency || dashboard.payouts.currency,
      });
    }

    throw error;
  }
}

export async function getHostEarningsTransactions(
  token: string,
  filters: HostEarningsTransactionFilters = {},
): Promise<HostEarningsTransaction[]> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const query = buildQueryString({
    status: filters.status,
    transactionType: filters.transactionType,
    reservationId: filters.reservationId,
    propertyId: filters.propertyId,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
  });

  try {
    const response = await apiRequest<unknown>(`/api/v1/host/earnings/transactions${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return extractReferenceArray(response)
      .map((item) => normalizeHostEarningsTransaction(item))
      .filter((item) => item.id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }

    throw error;
  }
}

export async function getHostPayoutHistory(
  token: string,
  filters: HostPayoutHistoryFilters = {},
): Promise<HostPayoutHistoryItem[]> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const query = buildQueryString({
    status: filters.status,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
  });

  try {
    const response = await apiRequest<unknown>(`/api/v1/host/payouts${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return extractReferenceArray(response)
      .map((item) => normalizeHostPayoutHistoryItem(item))
      .filter((item) => item.id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }

    throw error;
  }
}

export async function getHostPayoutHistoryDetail(
  token: string,
  payoutId: string,
): Promise<HostPayoutHistoryItem> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>(`/api/v1/host/payouts/${payoutId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return normalizeHostPayoutHistoryItem(response);
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

const normalizeIdentityVerificationDocumentsPayload = (
  documents: HostIdentityVerificationDocument[],
) =>
  documents
    .map((document) => ({
      documentType: document.documentType.trim(),
      documentFront: document.documentFront.trim(),
      documentBack: document.documentBack.trim(),
    }))
    .filter((document) => document.documentType && document.documentFront);

export async function getHostIdentityVerification(
  token: string,
): Promise<HostIdentityVerification | null> {
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

    return normalizeHostIdentityVerification(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function createHostIdentityVerificationDraft(
  token: string,
  payload: UpsertHostIdentityVerificationPayload,
): Promise<HostIdentityVerification> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<HostIdentityVerificationApiData>(
    "/api/v1/host/verifications/identity",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        documents: normalizeIdentityVerificationDocumentsPayload(payload.documents),
      },
      cache: "no-store",
    },
  );

  return normalizeHostIdentityVerification(response);
}

export async function updateHostIdentityVerificationDraft(
  token: string,
  payload: UpsertHostIdentityVerificationPayload,
): Promise<HostIdentityVerification> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<HostIdentityVerificationApiData>(
    "/api/v1/host/verifications/identity",
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        documents: normalizeIdentityVerificationDocumentsPayload(payload.documents),
      },
      cache: "no-store",
    },
  );

  return normalizeHostIdentityVerification(response);
}

export async function submitHostEnable(token: string): Promise<HostIdentityVerificationStatus> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequestOptional<HostIdentityVerificationApiData>("/api/v1/host/enable", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {},
    cache: "no-store",
  });

  if (response) {
    return normalizeHostIdentityVerificationStatus(response);
  }

  const verification = await getHostIdentityVerification(token);

  if (!verification) {
    throw new ApiError("We couldn't confirm the host application submission right now.", 500);
  }

  return normalizeHostIdentityVerificationStatus(verification);
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
      businessId: payload.businessId.trim() || undefined,
      selectedBusinessDocumentIds:
        payload.selectedBusinessDocumentIds.length > 0
          ? payload.selectedBusinessDocumentIds
          : undefined,
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

export async function deleteHostProperty(token: string, propertyId: string): Promise<void> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  await apiRequestOptional<unknown>(`/api/v1/host/properties/${propertyId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
}

export async function getHostBusinesses(token: string): Promise<HostBusiness[]> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>("/api/v1/host/businesses", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return extractReferenceArray(response)
    .map((item) => normalizeHostBusiness(item))
    .filter((item) => item.id);
}

export async function getHostBusiness(token: string, businessId: string): Promise<HostBusiness> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>(`/api/v1/host/businesses/${businessId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return normalizeHostBusiness(response);
}

export async function createHostBusiness(
  token: string,
  payload: UpsertHostBusinessPayload,
): Promise<HostBusiness> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>("/api/v1/host/businesses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      businessName: payload.businessName.trim() || undefined,
      registrationNumber: payload.registrationNumber.trim() || undefined,
      taxVatNumber: payload.taxVatNumber.trim() || undefined,
      businessAddress: payload.businessAddress.trim() || undefined,
      contactName: payload.contactName.trim() || undefined,
      contactEmail: payload.contactEmail.trim() || undefined,
      contactPhone: payload.contactPhone.trim() || undefined,
      isActive: payload.isActive,
    },
    cache: "no-store",
  });

  return normalizeHostBusiness(response);
}

export async function updateHostBusiness(
  token: string,
  businessId: string,
  payload: UpsertHostBusinessPayload,
): Promise<HostBusiness> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>(`/api/v1/host/businesses/${businessId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      businessName: payload.businessName.trim() || undefined,
      registrationNumber: payload.registrationNumber.trim() || undefined,
      taxVatNumber: payload.taxVatNumber.trim() || undefined,
      businessAddress: payload.businessAddress.trim() || undefined,
      contactName: payload.contactName.trim() || undefined,
      contactEmail: payload.contactEmail.trim() || undefined,
      contactPhone: payload.contactPhone.trim() || undefined,
      isActive: payload.isActive,
    },
    cache: "no-store",
  });

  return normalizeHostBusiness(response);
}

export async function deleteHostBusiness(token: string, businessId: string): Promise<void> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  await apiRequestOptional<unknown>(`/api/v1/host/businesses/${businessId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
}

export async function getHostBusinessDocuments(
  token: string,
  businessId: string,
): Promise<HostBusinessDocument[]> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  try {
    const response = await apiRequest<unknown>(`/api/v1/host/businesses/${businessId}/documents`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return extractHostBusinessDocumentArray(response)
      .map((item) => normalizeHostBusinessDocument(item))
      .filter((item) => item.id || item.fileUrl);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }

    throw error;
  }
}

export async function uploadHostBusinessDocuments(
  token: string,
  businessId: string,
  payload: UploadHostBusinessDocumentsPayload,
): Promise<HostBusinessDocument[]> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const formData = new FormData();

  payload.files.forEach((file) => {
    formData.append("file", file);
  });

  if (payload.title.trim()) {
    formData.append("label", payload.title.trim());
  }

  if (payload.documentType.trim()) {
    formData.append("documentType", payload.documentType.trim());
  }

  if (payload.note.trim()) {
    formData.append("notes", payload.note.trim());
  }

  formData.append("isActive", String(payload.isActive ?? true));

  if (payload.issuedAt?.trim()) {
    formData.append("issuedAt", payload.issuedAt.trim());
  }

  if (payload.expiresAt?.trim()) {
    formData.append("expiresAt", payload.expiresAt.trim());
  }

  const response = await apiRequestOptional<unknown>(
    `/api/v1/host/businesses/${businessId}/documents`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: "no-store",
    },
  );

  if (response) {
    const documents = extractHostBusinessDocumentArray(response)
      .map((item) => normalizeHostBusinessDocument(item))
      .filter((item) => item.id || item.fileUrl);

    if (documents.length > 0) {
      return documents;
    }
  }

  return getHostBusinessDocuments(token, businessId);
}

export async function updateHostBusinessDocument(
  token: string,
  businessId: string,
  documentId: string,
  payload: UpdateHostBusinessDocumentPayload,
): Promise<HostBusinessDocument> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>(
    `/api/v1/host/businesses/${businessId}/documents/${documentId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        label: payload.title.trim() || undefined,
        documentType: payload.documentType.trim() || undefined,
        notes: payload.note.trim() || undefined,
        issuedAt: payload.issuedAt?.trim() || undefined,
        expiresAt: payload.expiresAt?.trim() || undefined,
        isActive: payload.isActive ?? true,
      },
      cache: "no-store",
    },
  );

  return normalizeHostBusinessDocument(response);
}

export async function deleteHostBusinessDocument(
  token: string,
  businessId: string,
  documentId: string,
): Promise<void> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  await apiRequestOptional<unknown>(`/api/v1/host/businesses/${businessId}/documents/${documentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
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

const toOptionalNumber = (value: string) => {
  const normalized = value.trim();

  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export async function getHostPropertyUnits(
  token: string,
  propertyId: string,
): Promise<HostPropertyUnit[]> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>(`/api/v1/host/properties/${propertyId}/units`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return extractHostPropertyUnitArray(response)
    .map((item) => normalizeHostPropertyUnit(item))
    .filter((item) => item.id);
}

export async function createHostPropertyUnit(
  token: string,
  propertyId: string,
  payload: UpsertHostPropertyUnitPayload,
): Promise<HostPropertyUnit> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>(`/api/v1/host/properties/${propertyId}/units`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      name: payload.name.trim() || undefined,
      capacity: toOptionalNumber(payload.capacity),
      bedrooms: toOptionalNumber(payload.bedrooms),
      bathrooms: toOptionalNumber(payload.bathrooms),
      beds: toOptionalNumber(payload.beds),
      amenities: payload.amenities,
      isActive: payload.isActive,
    },
    cache: "no-store",
  });

  return normalizeHostPropertyUnit(response);
}

export async function updateHostPropertyUnit(
  token: string,
  propertyId: string,
  unitId: string,
  payload: UpsertHostPropertyUnitPayload,
): Promise<HostPropertyUnit> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>(`/api/v1/host/properties/${propertyId}/units/${unitId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      name: payload.name.trim() || undefined,
      capacity: toOptionalNumber(payload.capacity),
      bedrooms: toOptionalNumber(payload.bedrooms),
      bathrooms: toOptionalNumber(payload.bathrooms),
      beds: toOptionalNumber(payload.beds),
      amenities: payload.amenities,
      isActive: payload.isActive,
    },
    cache: "no-store",
  });

  return normalizeHostPropertyUnit(response);
}

export async function deleteHostPropertyUnit(
  token: string,
  propertyId: string,
  unitId: string,
): Promise<void> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  await apiRequestOptional<unknown>(`/api/v1/host/properties/${propertyId}/units/${unitId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
}

export async function getHostUnitPricing(token: string, unitId: string): Promise<HostUnitPricing> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  try {
    const response = await apiRequest<unknown>(`/api/v1/host/units/${unitId}/pricing`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return normalizeHostUnitPricing(response, unitId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        ...emptyHostUnitPricing(),
        unitId,
      };
    }

    throw error;
  }
}

export async function updateHostUnitPricing(
  token: string,
  unitId: string,
  payload: UpdateHostUnitPricingPayload,
): Promise<HostUnitPricing> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>(`/api/v1/host/units/${unitId}/pricing`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      basePrice: toOptionalNumber(payload.basePrice),
      discountedPrice: toOptionalNumber(payload.discountedPrice),
      currency: payload.currency.trim() || undefined,
    },
    cache: "no-store",
  });

  return normalizeHostUnitPricing(response, unitId);
}

export async function getHostUnitCalendar(
  token: string,
  unitId: string,
): Promise<HostUnitCalendarRules> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  try {
    const response = await apiRequest<unknown>(`/api/v1/host/units/${unitId}/calendar`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return normalizeHostUnitCalendarRules(response, unitId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        ...emptyHostUnitCalendarRules(),
        unitId,
      };
    }

    throw error;
  }
}

export async function updateHostUnitCalendarRules(
  token: string,
  unitId: string,
  payload: UpdateHostUnitCalendarRulesPayload,
): Promise<HostUnitCalendarRules> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequest<unknown>(`/api/v1/host/units/${unitId}/calendar/rules`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      minimumStay: toOptionalNumber(payload.minimumStay),
      maximumStay: toOptionalNumber(payload.maximumStay),
    },
    cache: "no-store",
  });

  return normalizeHostUnitCalendarRules(response, unitId);
}

export async function blockHostUnitDates(
  token: string,
  unitId: string,
  payload: BlockHostUnitDatesPayload,
): Promise<void> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  await apiRequestOptional<unknown>(`/api/v1/host/units/${unitId}/calendar/block`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      startDate: payload.startDate,
      endDate: payload.endDate,
      note: payload.note.trim() || undefined,
    },
    cache: "no-store",
  });
}

export async function unblockHostUnitDates(
  token: string,
  unitId: string,
  blockedDate: HostUnitBlockedDate,
): Promise<void> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  await apiRequestOptional<unknown>(`/api/v1/host/units/${unitId}/calendar/unblock`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      blockId: blockedDate.id || undefined,
      id: blockedDate.id || undefined,
      startDate: blockedDate.startDate || undefined,
      endDate: blockedDate.endDate || undefined,
      date: blockedDate.startDate || undefined,
    },
    cache: "no-store",
  });
}

export async function getHostUnitAvailabilityPreview(
  token: string,
  unitId: string,
): Promise<HostUnitAvailabilityPreview | null> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  try {
    const response = await apiRequest<unknown>(`/api/v1/host/units/${unitId}/availability`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return normalizeHostUnitAvailabilityPreview(response, unitId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getHostPropertyVerification(
  token: string,
  propertyId: string,
): Promise<HostPropertyVerification> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  try {
    const response = await apiRequest<unknown>(`/api/v1/host/properties/${propertyId}/verification`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return normalizeHostPropertyVerification(response, propertyId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        ...emptyHostPropertyVerification(),
        propertyId,
      };
    }

    throw error;
  }
}

export async function updateHostPropertyVerification(
  token: string,
  propertyId: string,
  payload: UpdateHostPropertyVerificationPayload,
): Promise<HostPropertyVerification> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const formData = new FormData();

  payload.files.forEach((file) => {
    formData.append("files", file);
  });

  if (payload.files.length > 0) {
    const normalizedDocumentTypes = payload.documentTypes
      .map((documentType) => documentType.trim())
      .filter(Boolean);

    if (normalizedDocumentTypes.length !== payload.files.length) {
      throw new ApiError("Each verification file needs a matching document type.", 400);
    }

    formData.append("documentTypes", JSON.stringify(normalizedDocumentTypes));
  }

  if (payload.note.trim()) {
    formData.append("notes", payload.note.trim());
  }

  const response = await apiRequestOptional<unknown>(`/api/v1/host/properties/${propertyId}/verification`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    cache: "no-store",
  });

  if (response) {
    return normalizeHostPropertyVerification(response, propertyId);
  }

  return getHostPropertyVerification(token, propertyId);
}

export async function getHostPropertySubmissionStatus(
  token: string,
  propertyId: string,
): Promise<HostPropertySubmissionStatus> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  try {
    const response = await apiRequest<unknown>(`/api/v1/host/properties/${propertyId}/status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return normalizeHostPropertySubmissionStatus(response, propertyId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      const property = await getHostProperty(token, propertyId);

      return {
        ...emptyHostPropertySubmissionStatus(),
        propertyId,
        status: property.status,
        rawStatus: property.rawStatus,
        updatedAt: property.updatedAt,
      };
    }

    throw error;
  }
}

export async function submitHostPropertyForReview(
  token: string,
  propertyId: string,
): Promise<HostPropertySubmissionStatus> {
  if (!token) {
    throw new ApiError("Missing access token.", 401);
  }

  const response = await apiRequestOptional<unknown>(`/api/v1/host/properties/${propertyId}/submit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {},
    cache: "no-store",
  });

  if (response) {
    return normalizeHostPropertySubmissionStatus(response, propertyId);
  }

  return getHostPropertySubmissionStatus(token, propertyId);
}

export const createEmptyHostProfile = emptyHostProfile;
export const createEmptyHostPayoutProfile = emptyHostPayoutProfile;
export const createEmptyHostBusiness = (): UpsertHostBusinessPayload => ({
  businessName: "",
  registrationNumber: "",
  taxVatNumber: "",
  businessAddress: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  isActive: true,
});
export const createEmptyHostBusinessDocument = emptyHostBusinessDocument;
export const createEmptyHostPropertyDetail = emptyHostPropertyDetail;
export const createEmptyHostPropertyUnit = emptyHostPropertyUnit;
export const createEmptyHostUnitPricing = emptyHostUnitPricing;
export const createEmptyHostUnitCalendarRules = emptyHostUnitCalendarRules;
export const createEmptyHostIdentityVerification = emptyHostIdentityVerification;
export const createEmptyHostPropertyVerification = emptyHostPropertyVerification;
export const createEmptyHostPropertySubmissionStatus = emptyHostPropertySubmissionStatus;
