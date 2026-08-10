import { AdminRouteGate } from "@/components/admin/AdminRouteGate";
import { AdminDestinationsPage } from "@/components/admin/destinations/AdminDestinationsPage";

export default function AdminLocationsRoute() {
  return (
    <AdminRouteGate>
      <AdminDestinationsPage />
    </AdminRouteGate>
  );
}
