import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostMessageThreadPage } from "@/components/host/operations/messages/HostMessageThreadPage";

type HostMessageThreadRouteProps = {
  params: Promise<{
    threadId: string;
  }>;
};

export default async function HostMessageThreadRoute({ params }: HostMessageThreadRouteProps) {
  const { threadId } = await params;

  return (
    <HostRouteGate mode="portal">
      <HostMessageThreadPage threadId={threadId} />
    </HostRouteGate>
  );
}
