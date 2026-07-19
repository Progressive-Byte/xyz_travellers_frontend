import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostPropertyPricingPage } from "@/components/host/properties/pricing/HostPropertyPricingPage";

type HostPropertyPricingRouteProps = {
  params: Promise<{
    propertyId: string;
  }>;
};

export default async function HostPropertyPricingRoute({ params }: HostPropertyPricingRouteProps) {
  const { propertyId } = await params;

  return (
    <HostRouteGate mode="portal">
      <HostPropertyPricingPage propertyId={propertyId} />
    </HostRouteGate>
  );
}
