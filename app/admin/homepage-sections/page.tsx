import { AdminRouteGate } from "@/components/admin/AdminRouteGate";
import { AdminHomepageSectionsPage } from "@/components/admin/homepage/AdminHomepageSectionsPage";

export default function AdminHomepageSectionsRoute() {
  return (
    <AdminRouteGate>
      <AdminHomepageSectionsPage />
    </AdminRouteGate>
  );
}
