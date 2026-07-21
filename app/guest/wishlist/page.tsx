import { GuestWishlistPage } from "@/components/guest/wishlist/GuestWishlistPage";
import { GuestRouteGate } from "@/components/guest/GuestRouteGate";

export default function GuestWishlistRoute() {
  return (
    <GuestRouteGate>
      <GuestWishlistPage />
    </GuestRouteGate>
  );
}
