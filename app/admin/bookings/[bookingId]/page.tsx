import { AdminRouteGate } from "@/components/admin/AdminRouteGate";
import { AdminBookingDetailPage } from "@/components/admin/bookings/AdminBookingDetailPage";

type AdminBookingDetailRouteProps = {
  params: Promise<{
    bookingId: string;
  }>;
};

export default async function AdminBookingDetailRoute({
  params,
}: AdminBookingDetailRouteProps) {
  const { bookingId } = await params;

  return (
    <AdminRouteGate>
      <AdminBookingDetailPage bookingId={bookingId} />
    </AdminRouteGate>
  );
}
