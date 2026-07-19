import { type HostIdentityVerificationStatus } from "@/lib/host";

export type HostOnboardingViewState =
  | "noDraft"
  | "draft"
  | "submitted"
  | "rejected"
  | "approvedRecovery";

export const getHostOnboardingViewState = (
  status: HostIdentityVerificationStatus | null,
): HostOnboardingViewState => {
  if (!status) {
    return "noDraft";
  }

  if (status.status === "approved") {
    return "approvedRecovery";
  }

  if (status.status === "rejected") {
    return "rejected";
  }

  if (status.status === "submitted") {
    return "submitted";
  }

  return "draft";
};
