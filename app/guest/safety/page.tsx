import { GuestRouteGate } from "@/components/guest/GuestRouteGate";
import { GuestSafetyPage } from "@/components/guest/safety/GuestSafetyPage";

type GuestSafetyRouteProps = {
  searchParams: Promise<{
    threadId?: string;
    userId?: string;
    reservationId?: string;
  }>;
};

export default async function GuestSafetyRoute({
  searchParams,
}: GuestSafetyRouteProps) {
  const params = await searchParams;

  return (
    <GuestRouteGate>
      <GuestSafetyPage
        initialThreadId={params.threadId}
        initialUserId={params.userId}
        initialReservationId={params.reservationId}
      />
    </GuestRouteGate>
  );
}
