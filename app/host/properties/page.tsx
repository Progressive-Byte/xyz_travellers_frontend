import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostPropertiesPage } from "@/components/host/properties/HostPropertiesPage";

export default function HostPropertiesRoute() {
  return (
    <HostRouteGate mode="portal">
      <HostPropertiesPage />
    </HostRouteGate>
  );
}
