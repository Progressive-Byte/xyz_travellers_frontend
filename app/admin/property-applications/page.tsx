import { AdminPropertyApplicationsPage } from "@/components/admin/property-applications/AdminPropertyApplicationsPage";
import { AdminRouteGate } from "@/components/admin/AdminRouteGate";

export default function AdminPropertyApplicationsRoute() {
  return (
    <AdminRouteGate>
      <AdminPropertyApplicationsPage />
    </AdminRouteGate>
  );
}
