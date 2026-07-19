import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostBusinessesPage } from "@/components/host/businesses/HostBusinessesPage";

export default function HostBusinessesRoute() {
  return (
    <HostRouteGate mode="portal">
      <HostBusinessesPage />
    </HostRouteGate>
  );
}
