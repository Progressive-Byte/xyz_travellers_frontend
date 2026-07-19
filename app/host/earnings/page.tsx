import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostEarningsPage } from "@/components/host/operations/earnings/HostEarningsPage";

export default function HostEarningsRoute() {
  return (
    <HostRouteGate mode="portal">
      <HostEarningsPage />
    </HostRouteGate>
  );
}
