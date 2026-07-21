import { GuestBookingCreatePage } from "@/components/guest/bookings/GuestBookingCreatePage";
import { GuestRouteGate } from "@/components/guest/GuestRouteGate";

type SearchParams = Promise<{
  propertyId?: string;
  unitId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
}>;

type GuestBookingCreateRouteProps = {
  searchParams: SearchParams;
};

export default async function GuestBookingCreateRoute({
  searchParams,
}: GuestBookingCreateRouteProps) {
  const params = await searchParams;
  const guestsValue = typeof params.guests === "string" ? Number(params.guests) : NaN;
  const initialGuests = Number.isFinite(guestsValue) && guestsValue > 0 ? Math.floor(guestsValue) : null;

  return (
    <GuestRouteGate>
      <GuestBookingCreatePage
        propertyId={params.propertyId}
        unitId={params.unitId}
        initialCheckIn={params.checkIn}
        initialCheckOut={params.checkOut}
        initialGuests={initialGuests}
      />
    </GuestRouteGate>
  );
}
