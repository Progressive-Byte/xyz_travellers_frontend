"use client";

import type {
  HostReservationStatus,
  HostReview,
} from "@/lib/host";

const dateFormatter = new Intl.DateTimeFormat("en-BD", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-BD", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export const formatHostDate = (value: string | null) => {
  if (!value) {
    return "Not available";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return dateFormatter.format(parsed);
};

export const formatHostDateTime = (value: string | null) => {
  if (!value) {
    return "Not available";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return dateTimeFormatter.format(parsed);
};

export const formatHostCurrency = (value: number | null, currency = "BDT") => {
  const safeValue = value ?? 0;

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: currency || "BDT",
    maximumFractionDigits: 0,
  }).format(safeValue);
};

export const getGuestCountLabel = (adults: number, children: number) => {
  const totalGuests = adults + children;

  if (totalGuests <= 0) {
    return "Guest count unavailable";
  }

  return `${totalGuests} guest${totalGuests === 1 ? "" : "s"}`;
};

export const getReservationStatusLabel = (status: HostReservationStatus) => {
  switch (status) {
    case "pending":
      return "Under review";
    case "host_confirmed":
      return "Host confirmed";
    case "confirmed":
      return "Confirmed";
    case "paid":
      return "Paid";
    case "rejected":
      return "Rejected";
    case "cancelled":
      return "Cancelled";
    case "completed":
      return "Completed";
    default:
      return "Status unavailable";
  }
};

export const getReservationStatusClasses = (status: HostReservationStatus) => {
  switch (status) {
    case "pending":
      return "bg-primary-light text-text-primary";
    case "host_confirmed":
      return "bg-[rgba(214,167,44,0.12)] text-[rgb(120,91,41)]";
    case "confirmed":
      return "bg-[rgba(54,96,150,0.14)] text-[rgb(44,78,123)]";
    case "paid":
      return "bg-[rgba(64,145,108,0.14)] text-[rgb(35,92,69)]";
    case "rejected":
      return "bg-[rgba(184,82,82,0.12)] text-[rgb(140,50,50)]";
    case "cancelled":
      return "bg-[rgba(154,126,72,0.13)] text-[rgb(120,91,41)]";
    case "completed":
      return "bg-[rgba(54,96,150,0.14)] text-[rgb(44,78,123)]";
    default:
      return "bg-white text-text-secondary";
  }
};

export const getFinanceStatusClasses = (status: string) => {
  const normalized = status.trim().toLowerCase();

  if (normalized === "paid" || normalized === "settled") {
    return "bg-[rgba(64,145,108,0.14)] text-[rgb(35,92,69)]";
  }

  if (normalized === "pending" || normalized === "processing") {
    return "bg-primary-light text-text-primary";
  }

  if (normalized === "failed" || normalized === "reversed") {
    return "bg-[rgba(184,82,82,0.12)] text-[rgb(140,50,50)]";
  }

  return "bg-white text-text-secondary";
};

export const getMessageSenderLabel = (role: string) => {
  const normalized = role.trim().toLowerCase();

  if (normalized === "host") {
    return "You";
  }

  if (normalized === "guest") {
    return "Guest";
  }

  return role.trim() || "Unknown";
};

export const formatReviewTypeLabel = (reviewType: string) => {
  const normalized = reviewType.trim().toLowerCase();

  if (normalized === "property_review") {
    return "Property review";
  }

  if (normalized === "guest_review") {
    return "Guest review";
  }

  return reviewType.trim() || "Review";
};

export const getAverageRating = (reviews: HostReview[]) => {
  const ratings = reviews
    .map((review) => review.rating)
    .filter((rating): rating is number => typeof rating === "number" && Number.isFinite(rating));

  if (ratings.length === 0) {
    return null;
  }

  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
};

export const formatRatingValue = (rating: number | null) => {
  if (rating === null || Number.isNaN(rating)) {
    return "No rating";
  }

  return `${rating.toFixed(1)} / 5`;
};
