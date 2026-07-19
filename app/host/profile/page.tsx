import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostProfilePage } from "@/components/host/profile/HostProfilePage";

export default function HostProfileRoute() {
  return (
    <HostRouteGate mode="portal">
      <HostProfilePage />
    </HostRouteGate>
  );
}
