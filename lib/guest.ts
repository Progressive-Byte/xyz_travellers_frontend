import { apiRequest } from "@/lib/api";
import { getFrontPropertyDetails } from "@/lib/front";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};
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

const buildQueryString = (params: Record<string, string | number | boolean | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    const normalized = typeof value === "string" ? value.trim() : String(value);

    if (!normalized) {
      return;
    }

    searchParams.set(key, normalized);
  });

  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : "";
};

export type GuestBookingStatus =
  | "pending"
  | "host_confirmed"
  | "confirmed"
  | "paid"
  | "rejected"
  | "cancelled"
  | "completed";

export type GuestDashboardUpcomingBooking = {
  id: string;
  propertyId: string;
  unitId: string;
  checkInDate: string;
  checkOutDate: string;
  adultGuests: number;
  childGuests: number;
  status: GuestBookingStatus;
};

export type GuestTransaction = {
  id: string;
  reservationId: string;
  propertyId: string;
  unitId: string;
  transactionType: string;
  status: string;
  currency: string;
  grossAmount: number | null;
  netAmount: number | null;
  createdAt: string | null;
  processedAt: string | null;
};

export type GuestPaymentCheckout = {
  checkoutId: string;
  bookingId: string;
  currency: string;
  subtotal: number | null;
  discountAmount: number | null;
  totalPayable: number | null;
};

export type GuestPaymentConfirmResult = {
  transactionId: string;
  bookingId: string;
  status: string;
};

export type GuestDashboardData = {
  bookings: {
    total: number;
    upcomingCount: number;
    upcoming: GuestDashboardUpcomingBooking[];
  };
  messages: {
    unreadThreads: number;
    unreadMessages: number;
  };
  wishlist: {
    total: number;
  };
  payments: {
    recentTransactions: GuestTransaction[];
  };
};

export type GuestBooking = {
  id: string;
  status: GuestBookingStatus;
  propertyId: string;
  unitId: string;
  checkInDate: string;
  checkOutDate: string;
  adultGuests: number;
  childGuests: number;
  createdAt: string | null;
  hostConfirmedAt: string | null;
  confirmedAt: string | null;
  paidAt: string | null;
  guestId: string;
  respondedAt: string | null;
  responseReason: string;
  cancelledAt: string | null;
  completedAt: string | null;
  statusReason: string;
  specialRequests: string;
  couponCode: string;
  pricing: {
    currency: string;
    pricePerNightApplied: number | null;
    nights: number | null;
    subtotal: number | null;
  };
  pricingSnapshot: {
    currency: string;
    basePrice: number | null;
    discountedPrice: number | null;
    pricePerNightApplied: number | null;
    nights: number | null;
    subtotal: number | null;
  };
};

export type GuestBookingFilters = {
  status?: GuestBookingStatus;
  fromDate?: string;
  toDate?: string;
};

export type CreateGuestBookingPayload = {
  propertyId: string;
  unitId: string;
  checkInDate: string;
  checkOutDate: string;
  adultGuests: number;
  childGuests: number;
  specialRequests?: string;
  couponCode?: string;
};

export type GuestBookingRouteParams = {
  propertyId: string;
  unitId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number | string | null;
};

export type GuestMessage = {
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

export type GuestMessageThreadSummary = {
  id: string;
  reservationId: string;
  propertyId: string;
  unitId: string;
  guestId: string;
  lastMessagePreview: string;
  lastMessageAt: string | null;
  guestUnreadCount: number;
};

export type GuestMessageThreadDetail = GuestMessageThreadSummary & {
  hostUnreadCount: number;
  messages: GuestMessage[];
};

export type GuestMessageThreadFilters = {
  reservationId?: string;
  propertyId?: string;
  unitId?: string;
  hasUnread?: boolean;
};

export type GuestProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  roles: string[];
  profilePhoto: string;
  preferredLanguage: string;
  preferredCurrency: string;
  dateOfBirth: string;
  nationality: string;
  bio: string;
};

export type UpdateGuestProfilePayload = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  profilePhoto: string;
  preferredLanguage: string;
  preferredCurrency: string;
  dateOfBirth: string;
  nationality: string;
  bio: string;
};

export type GuestWishlistItem = {
  propertyId: string;
  savedAt: string | null;
};

export type GuestPropertyReviewRatings = {
  cleanliness: number;
  accuracy: number;
  communication: number;
  checkIn: number;
  value: number;
  overall: number;
};

export type GuestPropertyReview = {
  id: string;
  reviewType: string;
  reservationId: string;
  propertyId: string;
  unitId: string;
  hostId: string;
  guestId: string;
  reviewerId: string;
  reviewerRole: string;
  targetUserId: string;
  rating: number | null;
  ratings: GuestPropertyReviewRatings;
  title: string;
  comment: string;
  createdAt: string | null;
};

export type CreateGuestPropertyReviewPayload = {
  bookingId: string;
  ratings: GuestPropertyReviewRatings;
  comment: string;
};

export type GuestSafetyReport = {
  id: string;
  reportType: string;
  reporterId: string;
  targetUserId: string;
  propertyId: string;
  reservationId: string;
  reasonCode: string;
  details: string;
  createdAt: string | null;
};

export type ReportGuestListingPayload = {
  propertyId: string;
  reservationId: string;
  reasonCode: string;
  details: string;
};

export type ReportGuestUserPayload = {
  userId: string;
  reservationId: string;
  reasonCode: string;
  details: string;
};

export type GuestPropertyLookup = {
  propertyId: string;
  propertyTitle: string;
  locationLabel: string;
  coverImageUrl: string;
  unitNamesById: Record<string, string>;
};

const createAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

const normalizeGuestBookingStatus = (value: unknown): GuestBookingStatus => {
  const normalized = asString(value).trim().toLowerCase();

  switch (normalized) {
    case "host_confirmed":
    case "confirmed":
    case "paid":
    case "rejected":
    case "cancelled":
    case "completed":
      return normalized;
    case "accepted":
      return "confirmed";
    default:
      return "pending";
  }
};

const normalizeGuestTransaction = (payload: unknown): GuestTransaction => {
  const source = asRecord(payload);

  return {
    id: asString(source.id),
    reservationId: asString(source.reservationId ?? source.bookingId),
    propertyId: asString(source.propertyId),
    unitId: asString(source.unitId),
    transactionType: asString(source.transactionType),
    status: asString(source.status),
    currency: asString(source.currency) || "BDT",
    grossAmount: asNumber(source.grossAmount ?? source.totalPayable ?? source.subtotal),
    netAmount: asNumber(source.netAmount),
    createdAt: asOptionalString(source.createdAt),
    processedAt: asOptionalString(source.processedAt),
  };
};

const normalizeGuestPaymentCheckout = (payload: unknown): GuestPaymentCheckout => {
  const source = asRecord(payload);

  return {
    checkoutId: asString(source.checkoutId),
    bookingId: asString(source.bookingId),
    currency: asString(source.currency) || "BDT",
    subtotal: asNumber(source.subtotal),
    discountAmount: asNumber(source.discountAmount),
    totalPayable: asNumber(source.totalPayable),
  };
};

const normalizeGuestPaymentConfirmResult = (payload: unknown): GuestPaymentConfirmResult => {
  const source = asRecord(payload);

  return {
    transactionId: asString(source.transactionId),
    bookingId: asString(source.bookingId),
    status: asString(source.status),
  };
};

const normalizeGuestMessage = (payload: unknown): GuestMessage => {
  const source = asRecord(payload);

  return {
    id: asString(source.id),
    threadId: asString(source.threadId ?? source.thread_id),
    reservationId: asString(source.reservationId ?? source.reservation_id),
    senderId: asString(source.senderId ?? source.sender_id),
    senderRole: asString(source.senderRole ?? source.sender_role),
    body: asString(source.body),
    readByHostAt: asOptionalString(source.readByHostAt ?? source.read_by_host_at),
    readByGuestAt: asOptionalString(source.readByGuestAt ?? source.read_by_guest_at),
    createdAt: asOptionalString(source.createdAt ?? source.created_at),
  };
};

const normalizeGuestMessageThreadSummary = (payload: unknown): GuestMessageThreadSummary => {
  const source = asRecord(payload);

  return {
    id: asString(source.id),
    reservationId: asString(source.reservationId ?? source.reservation_id),
    propertyId: asString(source.propertyId ?? source.property_id),
    unitId: asString(source.unitId ?? source.unit_id),
    guestId: asString(source.guestId ?? source.guest_id),
    lastMessagePreview: asString(source.lastMessagePreview ?? source.last_message_preview),
    lastMessageAt: asOptionalString(source.lastMessageAt ?? source.last_message_at),
    guestUnreadCount: asNumber(source.guestUnreadCount ?? source.guest_unread_count) ?? 0,
  };
};

const normalizeGuestMessageThreadDetail = (payload: unknown): GuestMessageThreadDetail => {
  const source = asRecord(payload);
  const summary = normalizeGuestMessageThreadSummary(source);

  return {
    ...summary,
    hostUnreadCount: asNumber(source.hostUnreadCount ?? source.host_unread_count) ?? 0,
    messages: asArray(source.messages).map(normalizeGuestMessage),
  };
};

const normalizeGuestProfile = (payload: unknown): GuestProfile => {
  const source = asRecord(payload);

  return {
    id: asString(source.id),
    firstName: asString(source.firstName ?? source.first_name),
    lastName: asString(source.lastName ?? source.last_name),
    email: asString(source.email),
    phone: asString(source.phone),
    address: asString(source.address),
    roles: asArray(source.roles).map((item) => asString(item)).filter(Boolean),
    profilePhoto: asString(source.profilePhoto ?? source.profile_photo),
    preferredLanguage: asString(source.preferredLanguage ?? source.preferred_language),
    preferredCurrency: asString(source.preferredCurrency ?? source.preferred_currency),
    dateOfBirth: asString(source.dateOfBirth ?? source.date_of_birth),
    nationality: asString(source.nationality),
    bio: asString(source.bio),
  };
};

const normalizeGuestWishlistItem = (payload: unknown): GuestWishlistItem => {
  const source = asRecord(payload);

  return {
    propertyId: asString(source.propertyId ?? source.property_id),
    savedAt: asOptionalString(source.savedAt ?? source.saved_at),
  };
};

const normalizeGuestPropertyReviewRatings = (payload: unknown): GuestPropertyReviewRatings => {
  const source = asRecord(payload);

  return {
    cleanliness: asNumber(source.cleanliness) ?? 0,
    accuracy: asNumber(source.accuracy) ?? 0,
    communication: asNumber(source.communication) ?? 0,
    checkIn: asNumber(source.checkIn ?? source.check_in) ?? 0,
    value: asNumber(source.value) ?? 0,
    overall: asNumber(source.overall) ?? 0,
  };
};

const normalizeGuestPropertyReview = (payload: unknown): GuestPropertyReview => {
  const source = asRecord(payload);

  return {
    id: asString(source.id),
    reviewType: asString(source.reviewType ?? source.review_type),
    reservationId: asString(source.reservationId ?? source.reservation_id),
    propertyId: asString(source.propertyId ?? source.property_id),
    unitId: asString(source.unitId ?? source.unit_id),
    hostId: asString(source.hostId ?? source.host_id),
    guestId: asString(source.guestId ?? source.guest_id),
    reviewerId: asString(source.reviewerId ?? source.reviewer_id),
    reviewerRole: asString(source.reviewerRole ?? source.reviewer_role),
    targetUserId: asString(source.targetUserId ?? source.target_user_id),
    rating: asNumber(source.rating),
    ratings: normalizeGuestPropertyReviewRatings(source.ratings),
    title: asString(source.title),
    comment: asString(source.comment),
    createdAt: asOptionalString(source.createdAt ?? source.created_at),
  };
};

const normalizeGuestSafetyReport = (payload: unknown): GuestSafetyReport => {
  const source = asRecord(payload);

  return {
    id: asString(source.id),
    reportType: asString(source.reportType ?? source.report_type),
    reporterId: asString(source.reporterId ?? source.reporter_id),
    targetUserId: asString(source.targetUserId ?? source.target_user_id),
    propertyId: asString(source.propertyId ?? source.property_id),
    reservationId: asString(source.reservationId ?? source.reservation_id),
    reasonCode: asString(source.reasonCode ?? source.reason_code),
    details: asString(source.details),
    createdAt: asOptionalString(source.createdAt ?? source.created_at),
  };
};

const normalizeGuestDashboardUpcomingBooking = (
  payload: unknown,
): GuestDashboardUpcomingBooking => {
  const source = asRecord(payload);

  return {
    id: asString(source.id),
    propertyId: asString(source.propertyId),
    unitId: asString(source.unitId),
    checkInDate: asString(source.checkInDate),
    checkOutDate: asString(source.checkOutDate),
    adultGuests: asNumber(source.adultGuests) ?? 0,
    childGuests: asNumber(source.childGuests) ?? 0,
    status: normalizeGuestBookingStatus(source.status),
  };
};

const normalizeGuestBooking = (payload: unknown): GuestBooking => {
  const source = asRecord(payload);
  const pricingSource = asRecord(source.pricing);
  const pricingSnapshotSource = asRecord(source.pricingSnapshot);

  return {
    id: asString(source.id),
    status: normalizeGuestBookingStatus(source.status),
    propertyId: asString(source.propertyId),
    unitId: asString(source.unitId),
    checkInDate: asString(source.checkInDate),
    checkOutDate: asString(source.checkOutDate),
    adultGuests: asNumber(source.adultGuests) ?? 0,
    childGuests: asNumber(source.childGuests) ?? 0,
    createdAt: asOptionalString(source.createdAt),
    hostConfirmedAt: asOptionalString(source.hostConfirmedAt ?? source.host_confirmed_at),
    confirmedAt: asOptionalString(source.confirmedAt ?? source.confirmed_at),
    paidAt: asOptionalString(source.paidAt ?? source.paid_at),
    guestId: asString(source.guestId),
    respondedAt: asOptionalString(source.respondedAt),
    responseReason: asString(source.responseReason),
    cancelledAt: asOptionalString(source.cancelledAt),
    completedAt: asOptionalString(source.completedAt),
    statusReason: asString(source.statusReason),
    specialRequests: asString(source.specialRequests),
    couponCode: asString(source.couponCode),
    pricing: {
      currency: asString(pricingSource.currency) || "BDT",
      pricePerNightApplied: asNumber(pricingSource.pricePerNightApplied),
      nights: asNumber(pricingSource.nights),
      subtotal: asNumber(pricingSource.subtotal),
    },
    pricingSnapshot: {
      currency: asString(pricingSnapshotSource.currency) || "BDT",
      basePrice: asNumber(pricingSnapshotSource.basePrice),
      discountedPrice: asNumber(pricingSnapshotSource.discountedPrice),
      pricePerNightApplied: asNumber(pricingSnapshotSource.pricePerNightApplied),
      nights: asNumber(pricingSnapshotSource.nights),
      subtotal: asNumber(pricingSnapshotSource.subtotal),
    },
  };
};

export const buildGuestBookingCreateHref = ({
  propertyId,
  unitId,
  checkIn,
  checkOut,
  guests,
}: GuestBookingRouteParams) =>
  `/guest/bookings/new${buildQueryString({
    propertyId,
    unitId,
    checkIn,
    checkOut,
    guests:
      typeof guests === "number"
        ? guests > 0
          ? guests
          : undefined
        : typeof guests === "string"
          ? guests
          : undefined,
  })}`;

export async function getGuestDashboard(token: string): Promise<GuestDashboardData> {
  const response = await apiRequest<unknown>("/api/v1/guest/dashboard", {
    method: "GET",
    headers: createAuthHeaders(token),
    cache: "no-store",
  });
  const source = asRecord(response);
  const bookingsSource = asRecord(source.bookings);
  const messagesSource = asRecord(source.messages);
  const wishlistSource = asRecord(source.wishlist);
  const paymentsSource = asRecord(source.payments);

  return {
    bookings: {
      total: asNumber(bookingsSource.total) ?? 0,
      upcomingCount: asNumber(bookingsSource.upcomingCount) ?? 0,
      upcoming: asArray(bookingsSource.upcoming).map(normalizeGuestDashboardUpcomingBooking),
    },
    messages: {
      unreadThreads: asNumber(messagesSource.unreadThreads) ?? 0,
      unreadMessages: asNumber(messagesSource.unreadMessages) ?? 0,
    },
    wishlist: {
      total: asNumber(wishlistSource.total) ?? 0,
    },
    payments: {
      recentTransactions: asArray(paymentsSource.recentTransactions).map(normalizeGuestTransaction),
    },
  };
}

export async function getGuestBookings(
  token: string,
  filters: GuestBookingFilters = {},
): Promise<GuestBooking[]> {
  const response = await apiRequest<unknown>(
    `/api/v1/bookings${buildQueryString({
      status: filters.status,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    })}`,
    {
      method: "GET",
      headers: createAuthHeaders(token),
      cache: "no-store",
    },
  );

  return asArray(response).map(normalizeGuestBooking);
}

export async function getGuestBooking(token: string, bookingId: string): Promise<GuestBooking> {
  const response = await apiRequest<unknown>(`/api/v1/bookings/${bookingId}`, {
    method: "GET",
    headers: createAuthHeaders(token),
    cache: "no-store",
  });

  return normalizeGuestBooking(response);
}

export async function createGuestBooking(
  token: string,
  payload: CreateGuestBookingPayload,
): Promise<GuestBooking> {
  const response = await apiRequest<unknown>("/api/v1/bookings", {
    method: "POST",
    headers: createAuthHeaders(token),
    body: {
      propertyId: payload.propertyId,
      unitId: payload.unitId,
      checkInDate: payload.checkInDate,
      checkOutDate: payload.checkOutDate,
      adultGuests: payload.adultGuests,
      childGuests: payload.childGuests,
      specialRequests: payload.specialRequests?.trim() || undefined,
      couponCode: payload.couponCode?.trim() || undefined,
    },
  });

  return normalizeGuestBooking(response);
}

export async function cancelGuestBooking(
  token: string,
  bookingId: string,
  reason: string,
): Promise<GuestBooking> {
  const response = await apiRequest<unknown>(`/api/v1/bookings/${bookingId}/cancel`, {
    method: "POST",
    headers: createAuthHeaders(token),
    body: {
      reason: reason.trim(),
    },
  });

  return normalizeGuestBooking(response);
}

export async function createGuestPaymentCheckout(
  token: string,
  bookingId: string,
): Promise<GuestPaymentCheckout> {
  const response = await apiRequest<unknown>("/api/v1/payments/checkout", {
    method: "POST",
    headers: createAuthHeaders(token),
    body: {
      bookingId,
    },
  });

  return normalizeGuestPaymentCheckout(response);
}

export async function confirmGuestPayment(
  token: string,
  bookingId: string,
  paymentReference: string,
): Promise<GuestPaymentConfirmResult> {
  const response = await apiRequest<unknown>("/api/v1/payments/confirm", {
    method: "POST",
    headers: createAuthHeaders(token),
    body: {
      bookingId,
      paymentReference: paymentReference.trim(),
    },
  });

  return normalizeGuestPaymentConfirmResult(response);
}

export async function getGuestTransactions(token: string): Promise<GuestTransaction[]> {
  const response = await apiRequest<unknown>("/api/v1/payments/my-transactions", {
    method: "GET",
    headers: createAuthHeaders(token),
    cache: "no-store",
  });

  return asArray(response).map(normalizeGuestTransaction);
}

export async function getGuestMessageThreads(
  token: string,
  filters: GuestMessageThreadFilters = {},
): Promise<GuestMessageThreadSummary[]> {
  const response = await apiRequest<unknown>(
    `/api/v1/messages/threads${buildQueryString({
      reservationId: filters.reservationId,
      propertyId: filters.propertyId,
      unitId: filters.unitId,
      hasUnread: filters.hasUnread,
    })}`,
    {
      method: "GET",
      headers: createAuthHeaders(token),
      cache: "no-store",
    },
  );

  return asArray(response).map(normalizeGuestMessageThreadSummary);
}

export async function getGuestMessageThread(
  token: string,
  threadId: string,
): Promise<GuestMessageThreadDetail> {
  const response = await apiRequest<unknown>(`/api/v1/messages/threads/${threadId}`, {
    method: "GET",
    headers: createAuthHeaders(token),
    cache: "no-store",
  });

  return normalizeGuestMessageThreadDetail(response);
}

export async function sendGuestMessage(
  token: string,
  threadId: string,
  body: string,
): Promise<GuestMessageThreadDetail> {
  const response = await apiRequest<unknown>(`/api/v1/messages/threads/${threadId}/messages`, {
    method: "POST",
    headers: createAuthHeaders(token),
    body: {
      body: body.trim(),
    },
  });

  return normalizeGuestMessageThreadDetail(response);
}

export async function markGuestMessageThreadRead(
  token: string,
  threadId: string,
): Promise<GuestMessageThreadDetail> {
  const response = await apiRequest<unknown>(`/api/v1/messages/threads/${threadId}/read`, {
    method: "PATCH",
    headers: createAuthHeaders(token),
    body: {},
  });

  return normalizeGuestMessageThreadDetail(response);
}

export async function getGuestProfile(token: string): Promise<GuestProfile> {
  const response = await apiRequest<unknown>("/api/v1/users/me", {
    method: "GET",
    headers: createAuthHeaders(token),
    cache: "no-store",
  });

  return normalizeGuestProfile(response);
}

export async function updateGuestProfile(
  token: string,
  payload: UpdateGuestProfilePayload,
): Promise<GuestProfile> {
  const response = await apiRequest<unknown>("/api/v1/users/me", {
    method: "PATCH",
    headers: createAuthHeaders(token),
    body: {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      phone: payload.phone.trim(),
      address: payload.address.trim(),
      profilePhoto: payload.profilePhoto.trim(),
      preferredLanguage: payload.preferredLanguage.trim(),
      preferredCurrency: payload.preferredCurrency.trim(),
      dateOfBirth: payload.dateOfBirth.trim(),
      nationality: payload.nationality.trim(),
      bio: payload.bio.trim(),
    },
  });

  return normalizeGuestProfile(response);
}

export async function getGuestWishlist(token: string): Promise<GuestWishlistItem[]> {
  const response = await apiRequest<unknown>("/api/v1/users/me/wishlist", {
    method: "GET",
    headers: createAuthHeaders(token),
    cache: "no-store",
  });

  return asArray(response).map(normalizeGuestWishlistItem);
}

export async function addGuestWishlistProperty(
  token: string,
  propertyId: string,
): Promise<GuestWishlistItem> {
  const response = await apiRequest<unknown>("/api/v1/users/me/wishlist", {
    method: "POST",
    headers: createAuthHeaders(token),
    body: {
      propertyId: propertyId.trim(),
    },
  });

  return normalizeGuestWishlistItem(response);
}

export async function removeGuestWishlistProperty(
  token: string,
  propertyId: string,
): Promise<GuestWishlistItem> {
  const response = await apiRequest<unknown>(`/api/v1/users/me/wishlist/${propertyId}`, {
    method: "DELETE",
    headers: createAuthHeaders(token),
  });

  return normalizeGuestWishlistItem(response);
}

export async function getGuestReviews(token: string): Promise<GuestPropertyReview[]> {
  const response = await apiRequest<unknown>("/api/v1/reviews/mine", {
    method: "GET",
    headers: createAuthHeaders(token),
    cache: "no-store",
  });

  return asArray(response).map(normalizeGuestPropertyReview);
}

export async function createGuestPropertyReview(
  token: string,
  payload: CreateGuestPropertyReviewPayload,
): Promise<GuestPropertyReview> {
  const response = await apiRequest<unknown>("/api/v1/reviews/property", {
    method: "POST",
    headers: createAuthHeaders(token),
    body: {
      bookingId: payload.bookingId,
      ratings: payload.ratings,
      comment: payload.comment.trim(),
    },
  });

  return normalizeGuestPropertyReview(response);
}

export async function reportGuestListing(
  token: string,
  payload: ReportGuestListingPayload,
): Promise<GuestSafetyReport> {
  const response = await apiRequest<unknown>("/api/v1/trust/report-listing", {
    method: "POST",
    headers: createAuthHeaders(token),
    body: {
      propertyId: payload.propertyId.trim(),
      reservationId: payload.reservationId.trim(),
      reasonCode: payload.reasonCode.trim(),
      details: payload.details.trim(),
    },
  });

  return normalizeGuestSafetyReport(response);
}

export async function reportGuestUser(
  token: string,
  payload: ReportGuestUserPayload,
): Promise<GuestSafetyReport> {
  const response = await apiRequest<unknown>("/api/v1/trust/report-user", {
    method: "POST",
    headers: createAuthHeaders(token),
    body: {
      userId: payload.userId.trim(),
      reservationId: payload.reservationId.trim(),
      reasonCode: payload.reasonCode.trim(),
      details: payload.details.trim(),
    },
  });

  return normalizeGuestSafetyReport(response);
}

export async function blockGuestUser(token: string, userId: string): Promise<{ userId: string }> {
  const response = await apiRequest<unknown>("/api/v1/trust/block-user", {
    method: "POST",
    headers: createAuthHeaders(token),
    body: {
      userId: userId.trim(),
    },
  });

  return { userId: asString(asRecord(response).userId ?? asRecord(response).user_id) };
}

export async function unblockGuestUser(
  token: string,
  userId: string,
): Promise<{ userId: string }> {
  const response = await apiRequest<unknown>(`/api/v1/trust/block-user/${userId}`, {
    method: "DELETE",
    headers: createAuthHeaders(token),
  });

  return { userId: asString(asRecord(response).userId ?? asRecord(response).user_id) };
}

export async function getGuestPropertyLookups(
  propertyIds: string[],
): Promise<Record<string, GuestPropertyLookup>> {
  const uniqueIds = Array.from(new Set(propertyIds.map((item) => item.trim()).filter(Boolean)));

  if (uniqueIds.length === 0) {
    return {};
  }

  const results = await Promise.all(
    uniqueIds.map(async (propertyId) => {
      try {
        const detail = await getFrontPropertyDetails(propertyId);

        return {
          propertyId,
          value: {
            propertyId,
            propertyTitle: detail.property.title,
            locationLabel: detail.location.locationLabel,
            coverImageUrl: detail.gallery.coverImageUrl,
            unitNamesById: detail.units.reduce<Record<string, string>>((accumulator, unit) => {
              accumulator[unit.id] = unit.unitName;
              return accumulator;
            }, {}),
          },
        };
      } catch {
        return null;
      }
    }),
  );

  return results.reduce<Record<string, GuestPropertyLookup>>((accumulator, item) => {
    if (!item) {
      return accumulator;
    }

    accumulator[item.propertyId] = item.value;
    return accumulator;
  }, {});
}
