import { GuestMessagesPage } from "@/components/guest/messages/GuestMessagesPage";
import { GuestRouteGate } from "@/components/guest/GuestRouteGate";

export default function GuestMessagesRoute() {
  return (
    <GuestRouteGate>
      <GuestMessagesPage />
    </GuestRouteGate>
  );
}
