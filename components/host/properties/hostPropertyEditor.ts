export type HostPropertyEditorStepState = "active" | "available" | "upcoming";

export type HostPropertyEditorStep = {
  key: string;
  label: string;
  description: string;
  state: HostPropertyEditorStepState;
};

export const hostPropertyEditorSteps: HostPropertyEditorStep[] = [
  {
    key: "basics",
    label: "Basics",
    description: "Name, type, ownership, and amenities.",
    state: "active",
  },
  {
    key: "location",
    label: "Location",
    description: "Address, city, country, map points, and house rules.",
    state: "available",
  },
  {
    key: "media",
    label: "Media",
    description: "Gallery, cover photo, and video links.",
    state: "upcoming",
  },
  {
    key: "units",
    label: "Units",
    description: "Units, capacity, and room details.",
    state: "upcoming",
  },
  {
    key: "pricing",
    label: "Pricing",
    description: "Pricing, availability, and rules.",
    state: "upcoming",
  },
  {
    key: "verification",
    label: "Verification",
    description: "Ownership documents and final review.",
    state: "upcoming",
  },
];
