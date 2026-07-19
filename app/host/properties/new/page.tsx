import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostPropertyCreatePage } from "@/components/host/properties/HostPropertyCreatePage";

export default function HostPropertyStartRoute() {
  return (
    <HostRouteGate mode="portal">
      <HostPropertyCreatePage />
    </HostRouteGate>
  );
}
