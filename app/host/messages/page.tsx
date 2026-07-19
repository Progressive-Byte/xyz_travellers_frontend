import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostMessagesPage } from "@/components/host/operations/messages/HostMessagesPage";

export default function HostMessagesRoute() {
  return (
    <HostRouteGate mode="portal">
      <HostMessagesPage />
    </HostRouteGate>
  );
}
