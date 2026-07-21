import { GuestProfilePage } from "@/components/guest/profile/GuestProfilePage";
import { GuestRouteGate } from "@/components/guest/GuestRouteGate";

export default function GuestProfileRoute() {
  return (
    <GuestRouteGate>
      <GuestProfilePage />
    </GuestRouteGate>
  );
}
