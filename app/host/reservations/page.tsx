import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostReservationsPage } from "@/components/host/operations/reservations/HostReservationsPage";

export default function HostReservationsRoute() {
  return (
    <HostRouteGate mode="portal">
      <HostReservationsPage />
    </HostRouteGate>
  );
}
