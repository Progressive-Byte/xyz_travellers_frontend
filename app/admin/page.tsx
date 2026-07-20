import { AdminDashboardPage } from "@/components/admin/AdminDashboardPage";
import { AdminRouteGate } from "@/components/admin/AdminRouteGate";

export default function AdminDashboardRoute() {
  return (
    <AdminRouteGate>
      <AdminDashboardPage />
    </AdminRouteGate>
  );
}
