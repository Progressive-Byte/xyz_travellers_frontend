import { AdminRouteGate } from "@/components/admin/AdminRouteGate";
import { AdminDestinationDetailPage } from "@/components/admin/destinations/AdminDestinationDetailPage";

type AdminDestinationDetailRouteProps = {
  params: Promise<{
    locationId: string;
  }>;
};

export default async function AdminDestinationDetailRoute({
  params,
}: AdminDestinationDetailRouteProps) {
  const { locationId } = await params;

  return (
    <AdminRouteGate>
      <AdminDestinationDetailPage locationId={locationId} />
    </AdminRouteGate>
  );
}
