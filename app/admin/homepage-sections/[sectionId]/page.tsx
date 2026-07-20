import { AdminRouteGate } from "@/components/admin/AdminRouteGate";
import { AdminHomepageSectionDetailPage } from "@/components/admin/homepage/AdminHomepageSectionDetailPage";

type AdminHomepageSectionDetailRouteProps = {
  params: Promise<{
    sectionId: string;
  }>;
};

export default async function AdminHomepageSectionDetailRoute({
  params,
}: AdminHomepageSectionDetailRouteProps) {
  const { sectionId } = await params;

  return (
    <AdminRouteGate>
      <AdminHomepageSectionDetailPage sectionId={sectionId} />
    </AdminRouteGate>
  );
}
