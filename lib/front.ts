import { apiRequest, resolveEmbeddableApiUrl } from "@/lib/api";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};
const asString = (value: unknown) => (typeof value === "string" ? value : "");
const asOptionalString = (value: unknown) => (typeof value === "string" ? value : null);
const asArray = (value: unknown) => (Array.isArray(value) ? value : []);
const asNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const parsed = Number(trimmed);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const formatAmount = (amount: number, currency: string, period = "") =>
  `${currency} ${amount.toLocaleString()}${period ? ` per ${period}` : ""}`;

const normalizeTabKey = (value: unknown): FrontHomepageTabKey => {
  const key = asString(value).trim().toLowerCase();

  if (key === "rooms" || key === "hotels") {
    return key;
  }

  return "apartments";
};

const buildQueryString = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    const normalized = typeof value === "string" ? value.trim() : String(value);

    if (!normalized) {
      return;
    }

    searchParams.set(key, normalized);
  });

  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : "";
};

export const defaultFrontHomepageTabs = [
  { key: "apartments", label: "Apartments" },
  { key: "rooms", label: "Rooms" },
  { key: "hotels", label: "Hotels" },
] as const;

export type FrontHomepageTabKey = (typeof defaultFrontHomepageTabs)[number]["key"];

export type FrontHomepageTab = {
  key: FrontHomepageTabKey;
  label: string;
};

export type FrontListingPrice = {
  amount: number | null;
  currency: string;
  period: string;
  displayLabel: string;
};

export type FrontListingRating = {
  average: number | null;
  count: number;
  displayLabel: string;
};

export type FrontListingCard = {
  propertyId: string;
  title: string;
  locationLabel: string;
  city: string;
  country: string;
  coverImageUrl: string;
  price: FrontListingPrice;
  rating: FrontListingRating | null;
  badge: string | null;
  href: string;
};

export type FrontHomepageSection = {
  key: string;
  title: string;
  slug: string;
  source: string;
  sectionId: string;
  items: FrontListingCard[];
};

export type FrontHomepageFeed = {
  activeTab: FrontHomepageTabKey;
  tabs: FrontHomepageTab[];
  sections: FrontHomepageSection[];
};

export type FrontSearchFilters = {
  q?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number | null;
  page?: number;
  limit?: number;
};

export type FrontSearchResults = {
  items: FrontListingCard[];
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
};

export type FrontPropertyGalleryImage = {
  id: string;
  src: string;
  alt: string;
  mediaType: string;
  caption: string;
  sortOrder: number;
  isCover: boolean;
};

export type FrontPropertyUnit = {
  id: string;
  unitName: string;
  unitNumber: string;
  unitType: string;
  capacity: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  beds: number | null;
  amenityIds: string[];
  stayRules: {
    minimumStay: number | null;
    maximumStay: number | null;
  };
  pricing: {
    nightlyAmount: number | null;
    currency: string;
    nightlyLabel: string;
    nights: number | null;
    stayTotal: number | null;
    stayTotalLabel: string;
  };
};

export type FrontPropertyAmenity = {
  id: string;
  name: string;
  slug: string;
};

export type FrontPropertyReview = {
  id: string;
  rating: number | null;
  title: string;
  comment: string;
  createdAt: string | null;
  reviewer: {
    id: string;
    displayName: string;
    profilePhoto: string;
  };
};

export type FrontPropertyDetail = {
  property: {
    id: string;
    title: string;
    propertyName: string;
    description: string;
    propertyTypeName: string;
    propertyTypeSlug: string;
    propertyTypeId: string;
    ownershipType: string;
    houseRules: string;
  };
  gallery: {
    coverImageUrl: string;
    items: FrontPropertyGalleryImage[];
  };
  pricing: {
    currency: string;
    minNightlyAmount: number | null;
    minNightlyLabel: string;
    nights: number | null;
    minStayTotal: number | null;
    minStayTotalLabel: string;
  };
  availability: {
    checkIn: string | null;
    checkOut: string | null;
    guests: number | null;
    availableUnitsCount: number | null;
  };
  units: FrontPropertyUnit[];
  amenities: FrontPropertyAmenity[];
  host: {
    id: string;
    displayName: string;
    profilePhoto: string;
    bio: string;
  };
  location: {
    address: string;
    city: string;
    country: string;
    locationLabel: string;
    lat: number | null;
    lng: number | null;
  };
  reviews: {
    summary: FrontListingRating | null;
    items: FrontPropertyReview[];
  };
  similar: FrontListingCard[];
};

export type FrontParsedStayFilters = {
  checkIn: string;
  checkOut: string;
  guests: number | null;
  error: string;
};

export const buildFrontPropertyHref = (propertyId: string) =>
  propertyId ? `/properties/${propertyId}` : "/properties";

const normalizeFrontListingPrice = (payload: unknown): FrontListingPrice => {
  const source = asRecord(payload);
  const amount = asNumber(source.amount);
  const currency = asString(source.currency) || "BDT";
  const period = asString(source.period) || "day";
  const displayLabel =
    asString(source.displayLabel) || (amount !== null ? formatAmount(amount, currency, period) : "");

  return {
    amount,
    currency,
    period,
    displayLabel,
  };
};

const normalizeFrontListingRating = (payload: unknown): FrontListingRating | null => {
  const source = asRecord(payload);
  const average = asNumber(source.average);
  const count = asNumber(source.count) ?? 0;

  if (average === null && count === 0 && !asString(source.displayLabel)) {
    return null;
  }

  return {
    average,
    count,
    displayLabel:
      asString(source.displayLabel) ||
      (average !== null ? average.toFixed(2) : count > 0 ? `${count}` : ""),
  };
};

export const normalizeFrontListingCard = (payload: unknown): FrontListingCard => {
  const source = asRecord(payload);
  const propertyId = asString(source.propertyId ?? source.id);
  const title = asString(source.title) || "Untitled property";
  const city = asString(source.city);
  const country = asString(source.country);
  const locationLabel =
    asString(source.locationLabel) || [city, country].filter(Boolean).join(", ") || "Location unavailable";

  return {
    propertyId,
    title,
    locationLabel,
    city,
    country,
    coverImageUrl: resolveEmbeddableApiUrl(asString(source.coverImageUrl)),
    price: normalizeFrontListingPrice(source.price),
    rating: normalizeFrontListingRating(source.rating),
    badge: asOptionalString(source.badge),
    href: buildFrontPropertyHref(propertyId),
  };
};

const normalizeFrontHomepageTab = (payload: unknown): FrontHomepageTab => {
  const source = asRecord(payload);
  const key = normalizeTabKey(source.key);

  return {
    key,
    label: asString(source.label) || defaultFrontHomepageTabs.find((tab) => tab.key === key)?.label || key,
  };
};

const normalizeFrontHomepageSection = (payload: unknown): FrontHomepageSection => {
  const source = asRecord(payload);

  return {
    key: asString(source.key),
    title: asString(source.title) || "Featured stays",
    slug: asString(source.slug),
    source: asString(source.source),
    sectionId: asString(source.sectionId),
    items: asArray(source.items).map(normalizeFrontListingCard),
  };
};

const normalizeFrontPropertyGalleryImage = (
  payload: unknown,
  propertyTitle: string,
): FrontPropertyGalleryImage => {
  const source = asRecord(payload);
  const caption = asString(source.caption);

  return {
    id: asString(source.id),
    src: resolveEmbeddableApiUrl(asString(source.mediaUrl)),
    alt: caption || `${propertyTitle} gallery image`,
    mediaType: asString(source.mediaType),
    caption,
    sortOrder: asNumber(source.sortOrder) ?? 0,
    isCover: Boolean(source.isCover),
  };
};

const normalizeFrontPropertyUnit = (payload: unknown): FrontPropertyUnit => {
  const source = asRecord(payload);
  const pricingSource = asRecord(source.pricing);
  const stayRulesSource = asRecord(source.stayRules);
  const nightlyAmount = asNumber(pricingSource.nightlyAmount);
  const currency = asString(pricingSource.currency) || "BDT";
  const nights = asNumber(pricingSource.nights);
  const stayTotal = asNumber(pricingSource.stayTotal);

  return {
    id: asString(source.id),
    unitName: asString(source.unitName) || "Unit",
    unitNumber: asString(source.unitNumber),
    unitType: asString(source.unitType),
    capacity: asNumber(source.capacity),
    bedrooms: asNumber(source.bedrooms),
    bathrooms: asNumber(source.bathrooms),
    beds: asNumber(source.beds),
    amenityIds: asArray(source.amenityIds).map((item) => asString(item)).filter(Boolean),
    stayRules: {
      minimumStay: asNumber(stayRulesSource.minimumStay),
      maximumStay: asNumber(stayRulesSource.maximumStay),
    },
    pricing: {
      nightlyAmount,
      currency,
      nightlyLabel:
        asString(pricingSource.nightlyLabel) ||
        (nightlyAmount !== null ? formatAmount(nightlyAmount, currency, "day") : ""),
      nights,
      stayTotal,
      stayTotalLabel:
        asString(pricingSource.stayTotalLabel) ||
        (stayTotal !== null ? formatAmount(stayTotal, currency) : ""),
    },
  };
};

const normalizeFrontPropertyAmenity = (payload: unknown): FrontPropertyAmenity => {
  const source = asRecord(payload);

  return {
    id: asString(source.id),
    name: asString(source.name),
    slug: asString(source.slug),
  };
};

const normalizeFrontPropertyReview = (payload: unknown): FrontPropertyReview => {
  const source = asRecord(payload);
  const reviewer = asRecord(source.reviewer);

  return {
    id: asString(source.id),
    rating: asNumber(source.rating),
    title: asString(source.title),
    comment: asString(source.comment),
    createdAt: asOptionalString(source.createdAt),
    reviewer: {
      id: asString(reviewer.id),
      displayName: asString(reviewer.displayName) || "Guest",
      profilePhoto: resolveEmbeddableApiUrl(asString(reviewer.profilePhoto)),
    },
  };
};

const normalizeFrontPropertyDetail = (payload: unknown): FrontPropertyDetail => {
  const source = asRecord(payload);
  const propertySource = asRecord(source.property);
  const propertyTypeSource = asRecord(propertySource.propertyType);
  const locationSource = asRecord(source.location);
  const propertyTitle =
    asString(propertySource.title) || asString(propertySource.propertyName) || "Untitled property";
  const gallerySource = asRecord(source.gallery);
  const pricingSource = asRecord(source.pricing);
  const reviewSource = asRecord(source.reviews);
  const reviewSummary = normalizeFrontListingRating(asRecord(reviewSource.summary));
  const minNightlyAmount = asNumber(pricingSource.minNightlyAmount);
  const minStayTotal = asNumber(pricingSource.minStayTotal);
  const currency = asString(pricingSource.currency) || "BDT";

  return {
    property: {
      id: asString(propertySource.id),
      title: propertyTitle,
      propertyName: asString(propertySource.propertyName) || propertyTitle,
      description: asString(propertySource.description),
      propertyTypeName: asString(propertyTypeSource.name),
      propertyTypeSlug: asString(propertyTypeSource.slug),
      propertyTypeId: asString(propertySource.propertyTypeId),
      ownershipType: asString(propertySource.ownershipType),
      houseRules: asString(propertySource.houseRules),
    },
    gallery: {
      coverImageUrl: resolveEmbeddableApiUrl(asString(gallerySource.coverImageUrl)),
      items: asArray(gallerySource.items).map((item) =>
        normalizeFrontPropertyGalleryImage(item, propertyTitle),
      ),
    },
    pricing: {
      currency,
      minNightlyAmount,
      minNightlyLabel:
        asString(pricingSource.minNightlyLabel) ||
        (minNightlyAmount !== null ? formatAmount(minNightlyAmount, currency, "day") : ""),
      nights: asNumber(pricingSource.nights),
      minStayTotal,
      minStayTotalLabel:
        asString(pricingSource.minStayTotalLabel) ||
        (minStayTotal !== null ? formatAmount(minStayTotal, currency) : ""),
    },
    availability: {
      checkIn: asOptionalString(asRecord(source.availability).checkIn),
      checkOut: asOptionalString(asRecord(source.availability).checkOut),
      guests: asNumber(asRecord(source.availability).guests),
      availableUnitsCount: asNumber(asRecord(source.availability).availableUnitsCount),
    },
    units: asArray(source.units).map(normalizeFrontPropertyUnit),
    amenities: asArray(source.amenities).map(normalizeFrontPropertyAmenity),
    host: {
      id: asString(asRecord(source.host).id),
      displayName: asString(asRecord(source.host).displayName) || "Host",
      profilePhoto: resolveEmbeddableApiUrl(asString(asRecord(source.host).profilePhoto)),
      bio: asString(asRecord(source.host).bio),
    },
    location: {
      address: asString(locationSource.address),
      city: asString(locationSource.city),
      country: asString(locationSource.country),
      locationLabel:
        asString(locationSource.locationLabel) ||
        [asString(locationSource.city), asString(locationSource.country)].filter(Boolean).join(", "),
      lat: asNumber(locationSource.lat),
      lng: asNumber(locationSource.lng),
    },
    reviews: {
      summary: reviewSummary,
      items: asArray(reviewSource.items).map(normalizeFrontPropertyReview),
    },
    similar: asArray(source.similar).map(normalizeFrontListingCard),
  };
};

export const parseFrontStayFilters = (input: {
  checkIn?: string | null;
  checkOut?: string | null;
  guests?: string | number | null;
}): FrontParsedStayFilters => {
  const checkIn = (input.checkIn ?? "").trim();
  const checkOut = (input.checkOut ?? "").trim();
  const guestsValue = typeof input.guests === "number" ? input.guests : asNumber(input.guests);
  const guests = guestsValue !== null && guestsValue > 0 ? Math.floor(guestsValue) : null;

  if ((checkIn && !checkOut) || (!checkIn && checkOut)) {
    return {
      checkIn,
      checkOut,
      guests,
      error: "Check-in and check-out must be provided together.",
    };
  }

  if (checkIn && checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return {
        checkIn,
        checkOut,
        guests,
        error: "Stay dates must be valid calendar dates.",
      };
    }

    if (end <= start) {
      return {
        checkIn,
        checkOut,
        guests,
        error: "Check-out must be later than check-in.",
      };
    }
  }

  return {
    checkIn,
    checkOut,
    guests,
    error: "",
  };
};

export async function getFrontHomepageListings(
  tab?: FrontHomepageTabKey,
): Promise<FrontHomepageFeed> {
  const data = await apiRequest<unknown>(
    `/api/v1/front/homepage/listings${buildQueryString({ tab })}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
  const source = asRecord(data);
  const tabs = asArray(source.tabs).map(normalizeFrontHomepageTab);

  return {
    activeTab: normalizeTabKey(source.activeTab),
    tabs: tabs.length ? tabs : [...defaultFrontHomepageTabs],
    sections: asArray(source.sections).map(normalizeFrontHomepageSection),
  };
}

export async function getFrontSearchResults(
  filters: FrontSearchFilters,
): Promise<FrontSearchResults> {
  const data = await apiRequest<unknown>(
    `/api/v1/front/search/properties${buildQueryString({
      q: filters.q,
      checkIn: filters.checkIn,
      checkOut: filters.checkOut,
      guests: filters.guests ?? undefined,
      page: filters.page,
      limit: filters.limit,
    })}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
  const source = asRecord(data);

  return {
    items: asArray(source.items).map(normalizeFrontListingCard),
    page: asNumber(source.page) ?? 1,
    limit: asNumber(source.limit) ?? 20,
    total: asNumber(source.total) ?? 0,
    hasNextPage: Boolean(source.hasNextPage),
  };
}

export async function getFrontPropertyDetails(
  propertyId: string,
  filters: Pick<FrontSearchFilters, "checkIn" | "checkOut" | "guests"> = {},
): Promise<FrontPropertyDetail> {
  const data = await apiRequest<unknown>(
    `/api/v1/front/properties/${propertyId}${buildQueryString({
      checkIn: filters.checkIn,
      checkOut: filters.checkOut,
      guests: filters.guests ?? undefined,
    })}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return normalizeFrontPropertyDetail(data);
}
