import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostPropertyUnitsPage } from "@/components/host/properties/units/HostPropertyUnitsPage";

type HostPropertyUnitsRouteProps = {
  params: Promise<{
    propertyId: string;
  }>;
};

export default async function HostPropertyUnitsRoute({ params }: HostPropertyUnitsRouteProps) {
  const { propertyId } = await params;

  return (
    <HostRouteGate mode="portal">
      <HostPropertyUnitsPage propertyId={propertyId} />
    </HostRouteGate>
  );
}
