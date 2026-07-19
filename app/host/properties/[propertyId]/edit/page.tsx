import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostPropertyEditorPage } from "@/components/host/properties/HostPropertyEditorPage";

type HostPropertyEditorRouteProps = {
  params: Promise<{
    propertyId: string;
  }>;
};

export default async function HostPropertyEditorRoute({ params }: HostPropertyEditorRouteProps) {
  const { propertyId } = await params;

  return (
    <HostRouteGate mode="portal">
      <HostPropertyEditorPage propertyId={propertyId} />
    </HostRouteGate>
  );
}
