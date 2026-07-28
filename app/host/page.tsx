import type { Metadata } from "next";
import { HostPublicLandingPage } from "@/components/host/public/HostPublicLandingPage";

export const metadata: Metadata = {
  title: "Host With XYZ Travellers",
  description:
    "Start hosting apartments, rooms, and hotels with XYZ Travellers through a clearer onboarding and property setup journey.",
  openGraph: {
    title: "Host With XYZ Travellers",
    description:
      "Turn your property into a stronger short-stay business with the XYZ Travellers host journey.",
  },
  twitter: {
    card: "summary",
    title: "Host With XYZ Travellers",
    description:
      "Turn your property into a stronger short-stay business with the XYZ Travellers host journey.",
  },
};

export default function HostPublicLandingRoute() {
  return <HostPublicLandingPage />;
}
