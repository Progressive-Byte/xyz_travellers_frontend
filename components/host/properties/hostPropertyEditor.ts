export type HostPropertyEditorStepState = "active" | "available" | "upcoming";
export type HostPropertyEditorStepKey =
  | "basics"
  | "location"
  | "media"
  | "units"
  | "pricing"
  | "verification";

export type HostPropertyEditorStep = {
  key: HostPropertyEditorStepKey;
  label: string;
  description: string;
  state: HostPropertyEditorStepState;
  href?: string;
};

const hostPropertyEditorStepDefinitions: Array<Omit<HostPropertyEditorStep, "state" | "href">> = [
  {
    key: "basics",
    label: "Basics",
    description: "Name, type, ownership, and amenities.",
  },
  {
    key: "location",
    label: "Location",
    description: "Address, city, country, map points, and house rules.",
  },
  {
    key: "media",
    label: "Media",
    description: "Gallery, cover photo, and video links.",
  },
  {
    key: "units",
    label: "Units",
    description: "Units, capacity, and room details.",
  },
  {
    key: "pricing",
    label: "Pricing",
    description: "Pricing, availability, and rules.",
  },
  {
    key: "verification",
    label: "Verification",
    description: "Ownership documents and final review.",
  },
];

const stepRouteKeys: HostPropertyEditorStepKey[] = ["basics", "location", "media"];

const getEditorStepHref = (propertyId: string, key: HostPropertyEditorStepKey) => {
  if (key === "basics" || key === "location") {
    return `/host/properties/${propertyId}/edit`;
  }

  if (key === "media") {
    return `/host/properties/${propertyId}/media`;
  }

  return undefined;
};

export const getHostPropertyEditorSteps = (
  propertyId: string,
  currentStep: HostPropertyEditorStepKey,
): HostPropertyEditorStep[] => {
  const currentIndex = hostPropertyEditorStepDefinitions.findIndex((step) => step.key === currentStep);

  return hostPropertyEditorStepDefinitions.map((step, index) => {
    let state: HostPropertyEditorStepState = "upcoming";

    if (index === currentIndex) {
      state = "active";
    } else if (index < currentIndex) {
      state = "available";
    } else if (index === currentIndex + 1 && stepRouteKeys.includes(step.key)) {
      state = "available";
    }

    return {
      ...step,
      state,
      href: state === "upcoming" ? undefined : getEditorStepHref(propertyId, step.key),
    };
  });
};
