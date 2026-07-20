import { AdminRouteGate } from "@/components/admin/AdminRouteGate";
import { AdminHostApplicationsPage } from "@/components/admin/host-applications/AdminHostApplicationsPage";

export default function AdminHostApplicationsRoute() {
  return (
    <AdminRouteGate>
      <AdminHostApplicationsPage />
    </AdminRouteGate>
  );
}
