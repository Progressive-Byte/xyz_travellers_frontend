"use client";

import type { GuestBookingStatus } from "@/lib/guest";

const statusClassNameMap: Record<GuestBookingStatus, string> = {
  pending: "border-[rgba(214,167,44,0.24)] bg-[rgba(214,167,44,0.12)] text-[var(--color-warning,#8a6116)]",
  host_confirmed:
    "border-[rgba(214,167,44,0.24)] bg-[rgba(214,167,44,0.12)] text-[var(--color-warning,#8a6116)]",
  confirmed: "border-[rgba(57,115,230,0.24)] bg-[rgba(57,115,230,0.1)] text-[rgba(44,79,152,1)]",
  paid: "border-[rgba(35,181,128,0.24)] bg-[rgba(35,181,128,0.12)] text-[var(--color-success,#18794e)]",
  rejected: "border-[rgba(180,35,24,0.22)] bg-[rgba(180,35,24,0.1)] text-[var(--color-danger,#b42318)]",
  cancelled: "border-border bg-surface text-text-secondary",
  completed: "border-[rgba(57,115,230,0.24)] bg-[rgba(57,115,230,0.1)] text-[rgba(44,79,152,1)]",
};

export const getGuestBookingStatusLabel = (status: GuestBookingStatus) => {
  switch (status) {
    case "pending":
    case "host_confirmed":
      return "Under Review";
    case "confirmed":
      return "Payment Pending";
    case "paid":
      return "Paid";
    case "rejected":
      return "Declined";
    case "cancelled":
      return "Cancelled";
    case "completed":
      return "Completed";
    default:
      return "Status";
  }
};

export const GuestBookingStatusPill: React.FC<{ status: GuestBookingStatus }> = ({ status }) => (
  <span
    className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusClassNameMap[status]}`}
  >
    {getGuestBookingStatusLabel(status)}
  </span>
);
