import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostOnboardingPage } from "@/components/host/onboarding/HostOnboardingPage";

export default function HostOnboardingRoute() {
  return (
    <HostRouteGate mode="onboarding">
      <HostOnboardingPage />
    </HostRouteGate>
  );
}
