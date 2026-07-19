import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostPropertyMediaPage } from "@/components/host/properties/media/HostPropertyMediaPage";

type HostPropertyMediaRouteProps = {
  params: Promise<{
    propertyId: string;
  }>;
};

export default async function HostPropertyMediaRoute({ params }: HostPropertyMediaRouteProps) {
  const { propertyId } = await params;

  return (
    <HostRouteGate mode="portal">
      <HostPropertyMediaPage propertyId={propertyId} />
    </HostRouteGate>
  );
}
