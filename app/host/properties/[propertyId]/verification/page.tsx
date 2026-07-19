import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostPropertyVerificationPage } from "@/components/host/properties/verification/HostPropertyVerificationPage";

type HostPropertyVerificationRouteProps = {
  params: Promise<{
    propertyId: string;
  }>;
};

export default async function HostPropertyVerificationRoute({
  params,
}: HostPropertyVerificationRouteProps) {
  const { propertyId } = await params;

  return (
    <HostRouteGate mode="portal">
      <HostPropertyVerificationPage propertyId={propertyId} />
    </HostRouteGate>
  );
}
