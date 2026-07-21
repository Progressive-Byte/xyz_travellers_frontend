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

const buildQueryString = (params: Record<string, string | number | undefined>) => {
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
  | "accepted"
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
    case "accepted":
    case "rejected":
    case "cancelled":
    case "completed":
      return normalized;
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
