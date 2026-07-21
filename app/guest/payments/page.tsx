import { GuestPaymentsPage } from "@/components/guest/payments/GuestPaymentsPage";
import { GuestRouteGate } from "@/components/guest/GuestRouteGate";

export default function GuestPaymentsRoute() {
  return (
    <GuestRouteGate>
      <GuestPaymentsPage />
    </GuestRouteGate>
  );
}
