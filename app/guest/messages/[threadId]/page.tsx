import { GuestMessageThreadPage } from "@/components/guest/messages/GuestMessageThreadPage";
import { GuestRouteGate } from "@/components/guest/GuestRouteGate";

type GuestMessageThreadRouteProps = {
  params: Promise<{
    threadId: string;
  }>;
};

export default async function GuestMessageThreadRoute({
  params,
}: GuestMessageThreadRouteProps) {
  const { threadId } = await params;

  return (
    <GuestRouteGate>
      <GuestMessageThreadPage threadId={threadId} />
    </GuestRouteGate>
  );
}
