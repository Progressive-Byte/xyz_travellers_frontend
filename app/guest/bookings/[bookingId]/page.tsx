import { GuestBookingDetailPage } from "@/components/guest/bookings/GuestBookingDetailPage";
import { GuestRouteGate } from "@/components/guest/GuestRouteGate";

type GuestBookingDetailRouteProps = {
  params: Promise<{
    bookingId: string;
  }>;
};

export default async function GuestBookingDetailRoute({
  params,
}: GuestBookingDetailRouteProps) {
  const { bookingId } = await params;

  return (
    <GuestRouteGate>
      <GuestBookingDetailPage bookingId={bookingId} />
    </GuestRouteGate>
  );
}
