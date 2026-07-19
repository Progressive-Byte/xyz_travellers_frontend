import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostPropertyStartPage } from "@/components/host/properties/HostPropertyStartPage";

export default function HostPropertyStartRoute() {
  return (
    <HostRouteGate mode="portal">
      <HostPropertyStartPage />
    </HostRouteGate>
  );
}
