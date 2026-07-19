import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostPropertyCalendarPage } from "@/components/host/properties/calendar/HostPropertyCalendarPage";

type HostPropertyCalendarRouteProps = {
  params: Promise<{
    propertyId: string;
  }>;
};

export default async function HostPropertyCalendarRoute({ params }: HostPropertyCalendarRouteProps) {
  const { propertyId } = await params;

  return (
    <HostRouteGate mode="portal">
      <HostPropertyCalendarPage propertyId={propertyId} />
    </HostRouteGate>
  );
}
