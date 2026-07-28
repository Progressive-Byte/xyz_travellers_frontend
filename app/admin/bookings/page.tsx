import { AdminRouteGate } from "@/components/admin/AdminRouteGate";
import { AdminBookingsPage } from "@/components/admin/bookings/AdminBookingsPage";

export default function AdminBookingsRoute() {
  return (
    <AdminRouteGate>
      <AdminBookingsPage />
    </AdminRouteGate>
  );
}
