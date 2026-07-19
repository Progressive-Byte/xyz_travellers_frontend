import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostVerificationStatusPage } from "@/components/host/verification/HostVerificationStatusPage";

export default function HostVerificationRoute() {
  return (
    <HostRouteGate mode="portal">
      <HostVerificationStatusPage />
    </HostRouteGate>
  );
}
