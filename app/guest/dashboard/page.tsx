import { GuestDashboardPage } from "@/components/guest/dashboard/GuestDashboardPage";
import { GuestRouteGate } from "@/components/guest/GuestRouteGate";

export default function GuestDashboardRoute() {
  return (
    <GuestRouteGate>
      <GuestDashboardPage />
    </GuestRouteGate>
  );
}
