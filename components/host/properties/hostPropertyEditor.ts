import type {
  HostBusiness,
  HostPropertyDetail,
  HostPropertyMediaItem,
  HostPropertyUnit,
  HostPropertyVerification,
  HostUnitCalendarRules,
  HostUnitPricing,
} from "@/lib/host";

export type HostPropertyEditorStepState = "active" | "available" | "upcoming";
export type HostPropertyEditorStepKey =
  | "basics"
  | "location"
  | "media"
  | "units"
  | "pricing"
  | "calendar"
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
    description: "Base rates, discounted rates, and currency.",
  },
  {
    key: "calendar",
    label: "Calendar",
    description: "Stay rules, blocked dates, and availability preview.",
  },
  {
    key: "verification",
    label: "Verification",
    description: "Ownership documents and final review.",
  },
];

const stepRouteKeys: HostPropertyEditorStepKey[] = [
  "basics",
  "location",
  "media",
  "units",
  "pricing",
  "calendar",
  "verification",
];

export type HostPropertyWorkflowSnapshot = {
  property: HostPropertyDetail;
  mediaItems?: HostPropertyMediaItem[];
  units?: HostPropertyUnit[];
  pricings?: HostUnitPricing[];
  calendars?: HostUnitCalendarRules[];
  verification?: HostPropertyVerification | null;
  businesses?: HostBusiness[];
};

export const getHostPropertyEditorStepHref = (
  propertyId: string,
  key: HostPropertyEditorStepKey,
) => {
  if (key === "basics") {
    return `/host/properties/${propertyId}/edit?step=basics`;
  }

  if (key === "location") {
    return `/host/properties/${propertyId}/edit?step=location`;
  }

  if (key === "media") {
    return `/host/properties/${propertyId}/media`;
  }

  if (key === "units") {
    return `/host/properties/${propertyId}/units`;
  }

  if (key === "pricing") {
    return `/host/properties/${propertyId}/pricing`;
  }

  if (key === "calendar") {
    return `/host/properties/${propertyId}/calendar`;
  }

  if (key === "verification") {
    return `/host/properties/${propertyId}/verification`;
  }

  return undefined;
};

const hasPropertyBasics = (
  property: HostPropertyDetail,
  businesses: HostBusiness[] = [],
) => {
  const isCommercial = property.ownershipType.trim().toLowerCase() === "commercial";
  const hasCommercialLinkage =
    !isCommercial ||
    (Boolean(property.businessId.trim()) &&
      businesses.some((business) => business.id === property.businessId));

  return (
    Boolean(property.name.trim()) &&
    Boolean(property.description.trim()) &&
    Boolean(property.propertyType.trim()) &&
    Boolean(property.ownershipType.trim()) &&
    hasCommercialLinkage
  );
};

const hasPropertyLocation = (property: HostPropertyDetail) =>
  Boolean(property.address.trim()) &&
  Boolean(property.city.trim()) &&
  Boolean(property.country.trim());

export const getHostPropertyWorkflowCompletion = ({
  property,
  mediaItems = [],
  units = [],
  pricings = [],
  calendars = [],
  verification = null,
  businesses = [],
}: HostPropertyWorkflowSnapshot): Record<HostPropertyEditorStepKey, boolean> => ({
  basics: hasPropertyBasics(property, businesses),
  location: hasPropertyLocation(property),
  media:
    mediaItems.length > 0 &&
    mediaItems.some((item) => item.type === "image" && item.isCover),
  units: units.length > 0,
  pricing: pricings.some((item) => item.basePrice.trim() && item.currency.trim()),
  calendar: calendars.some(
    (item) =>
      item.minimumStay.trim() ||
      item.maximumStay.trim() ||
      item.blockedDates.length > 0,
  ),
  verification: (verification?.documents.length ?? 0) > 0,
});

export const getNextIncompleteHostPropertyStep = (
  snapshot: HostPropertyWorkflowSnapshot,
): HostPropertyEditorStepKey => {
  const completion = getHostPropertyWorkflowCompletion(snapshot);

  return (
    stepRouteKeys.find((stepKey) => !completion[stepKey]) ??
    stepRouteKeys[stepRouteKeys.length - 1]
  );
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
      href: stepRouteKeys.includes(step.key)
        ? getHostPropertyEditorStepHref(propertyId, step.key)
        : undefined,
    };
  });
};
