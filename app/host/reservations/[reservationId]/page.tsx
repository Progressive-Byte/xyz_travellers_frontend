import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostReservationDetailPage } from "@/components/host/operations/reservations/HostReservationDetailPage";

type HostReservationDetailRouteProps = {
  params: Promise<{
    reservationId: string;
  }>;
};

export default async function HostReservationDetailRoute({
  params,
}: HostReservationDetailRouteProps) {
  const { reservationId } = await params;

  return (
    <HostRouteGate mode="portal">
      <HostReservationDetailPage reservationId={reservationId} />
    </HostRouteGate>
  );
}
