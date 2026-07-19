import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";

export default function HostDashboardPage() {
  return (
    <HostRouteGate mode="portal">
      <HostDashboardShell />
    </HostRouteGate>
  );
}
