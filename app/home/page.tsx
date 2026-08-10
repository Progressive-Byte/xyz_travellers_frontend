import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "XYZ Travellers",
  description: "Short-term stays, services, and travel experiences.",
};

export default function HomeAliasPage() {
  redirect("/");
}
