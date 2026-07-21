import { GuestBookingsPage } from "@/components/guest/bookings/GuestBookingsPage";
import { GuestRouteGate } from "@/components/guest/GuestRouteGate";

export default function GuestBookingsRoute() {
  return (
    <GuestRouteGate>
      <GuestBookingsPage />
    </GuestRouteGate>
  );
}
