import { AdminCommissionPage } from "@/components/admin/commission/AdminCommissionPage";
import { AdminRouteGate } from "@/components/admin/AdminRouteGate";

export default function AdminCommissionRoute() {
  return (
    <AdminRouteGate>
      <AdminCommissionPage />
    </AdminRouteGate>
  );
}
