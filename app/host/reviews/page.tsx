import { HostRouteGate } from "@/components/host/HostRouteGate";
import { HostReviewsPage } from "@/components/host/operations/reviews/HostReviewsPage";

export default function HostReviewsRoute() {
  return (
    <HostRouteGate mode="portal">
      <HostReviewsPage />
    </HostRouteGate>
  );
}
