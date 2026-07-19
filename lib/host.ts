import { apiRequest, ApiError } from "@/lib/api";

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

export const createEmptyHostProfile = emptyHostProfile;
export const createEmptyHostPayoutProfile = emptyHostPayoutProfile;
