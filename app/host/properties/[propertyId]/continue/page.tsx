import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostPropertyContinuePage } from "@/components/host/properties/HostPropertyContinuePage";

type HostPropertyContinueRouteProps = {
  params: Promise<{
    propertyId: string;
  }>;
};

export default async function HostPropertyContinueRoute({
  params,
}: HostPropertyContinueRouteProps) {
  const { propertyId } = await params;

  return (
    <HostRouteGate mode="portal">
      <HostPropertyContinuePage propertyId={propertyId} />
    </HostRouteGate>
  );
}
