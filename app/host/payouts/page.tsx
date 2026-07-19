import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostPayoutPage } from "@/components/host/payouts/HostPayoutPage";

export default function HostPayoutsRoute() {
  return (
    <HostRouteGate mode="portal">
      <HostPayoutPage />
    </HostRouteGate>
  );
}
