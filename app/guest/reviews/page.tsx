import { GuestReviewsPage } from "@/components/guest/reviews/GuestReviewsPage";
import { GuestRouteGate } from "@/components/guest/GuestRouteGate";

export default function GuestReviewsRoute() {
  return (
    <GuestRouteGate>
      <GuestReviewsPage />
    </GuestRouteGate>
  );
}
