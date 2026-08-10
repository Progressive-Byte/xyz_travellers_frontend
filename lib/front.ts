import { apiRequest, ApiError, resolveEmbeddableApiUrl } from "@/lib/api";
import {
  getPublicPills as storeGetPublicPills,
  getPublicDestination as storeGetPublicDestination,
  type AdminLocationDetail,
  type AdminTransportItem,
  type AdminFoodItem,
} from "@/lib/locations-store";

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

export type FrontLocationPill = {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  heroImage: string | null;
  heroImageUrl: string | null;
  sortOrder: number;
  href: string;
};

export type FrontPaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type FrontDestinationLocation = {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  description: string;
  heroImage: string | null;
  heroImageUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type FrontDestinationListingsSection = {
  title: string;
  subtitle: string;
  items: FrontListingCard[];
  pagination: FrontPaginationMeta;
};

export type FrontTransportItem = {
  id: string;
  companyName: string;
  contactNumber: string;
  description: string;
  heroImage: string | null;
  heroImageUrl: string | null;
};

export type FrontFoodItem = {
  id: string;
  restaurantName: string;
  phoneNumber: string;
  location: string;
  description: string;
  heroImage: string | null;
  heroImageUrl: string | null;
};

export type FrontDestinationStaticSection<TItem> = {
  title: string;
  subtitle: string;
  heroImage: string | null;
  heroImageUrl: string | null;
  items: TItem[];
  pagination: FrontPaginationMeta;
};

export type FrontDestinationPage = {
  location: FrontDestinationLocation;
  listingsSection: FrontDestinationListingsSection;
  transportSection: FrontDestinationStaticSection<FrontTransportItem>;
  foodSection: FrontDestinationStaticSection<FrontFoodItem>;
};

const normalizeFrontLocationPill = (payload: unknown): FrontLocationPill => {
  const source = asRecord(payload);
  const slug = asString(source.slug);
  const heroImage = asOptionalString(source.heroImage);

  return {
    id: asString(source.id),
    name: asString(source.name) || "Destination",
    slug,
    city: asString(source.city),
    country: asString(source.country),
    heroImage,
    heroImageUrl: heroImage ? resolveEmbeddableApiUrl(heroImage) : null,
    sortOrder: asNumber(source.sortOrder) ?? 0,
    href: buildFrontDestinationHref(slug),
  };
};

const normalizeFrontPaginationMeta = (payload: unknown): FrontPaginationMeta => {
  const source = asRecord(payload);
  const page = asNumber(source.page) ?? 1;
  const pageSize = asNumber(source.pageSize ?? source.limit) ?? 12;
  const total = asNumber(source.total) ?? 0;
  const totalPages =
    asNumber(source.totalPages) ?? Math.max(1, pageSize > 0 ? Math.ceil(total / pageSize) : 1);

  return {
    page,
    pageSize,
    total,
    totalPages,
  };
};

export const buildFrontDestinationHref = (
  slug: string,
  params: {
    listingsPage?: number;
    transportPage?: number;
    foodPage?: number;
  } = {},
) => {
  if (!slug) {
    return "/";
  }

  const query = new URLSearchParams();

  if (params.listingsPage && params.listingsPage > 1) {
    query.set("listingsPage", String(params.listingsPage));
  }

  if (params.transportPage && params.transportPage > 1) {
    query.set("transportPage", String(params.transportPage));
  }

  if (params.foodPage && params.foodPage > 1) {
    query.set("foodPage", String(params.foodPage));
  }

  const search = query.toString();
  return `/destinations/${slug}${search ? `?${search}` : ""}`;
};

const normalizeFrontDestinationListingsSection = (
  payload: unknown,
): FrontDestinationListingsSection => {
  const source = asRecord(payload);

  return {
    title: asString(source.title) || "Stays in this destination",
    subtitle: asString(source.subtitle) || "",
    items: asArray(source.items).map(normalizeFrontListingCard),
    pagination: normalizeFrontPaginationMeta(source.pagination),
  };
};

const normalizeFrontTransportItem = (payload: unknown): FrontTransportItem => {
  const source = asRecord(payload);
  const heroImage = asOptionalString(source.heroImage);

  return {
    id: asString(source.id),
    companyName: asString(source.companyName) || "Transport service",
    contactNumber: asString(source.contactNumber),
    description: asString(source.description),
    heroImage,
    heroImageUrl: heroImage ? resolveEmbeddableApiUrl(heroImage) : null,
  };
};

const normalizeFrontFoodItem = (payload: unknown): FrontFoodItem => {
  const source = asRecord(payload);
  const heroImage = asOptionalString(source.heroImage);

  return {
    id: asString(source.id),
    restaurantName: asString(source.restaurantName) || "Restaurant",
    phoneNumber: asString(source.phoneNumber),
    location: asString(source.location),
    description: asString(source.description),
    heroImage,
    heroImageUrl: heroImage ? resolveEmbeddableApiUrl(heroImage) : null,
  };
};

const normalizeFrontDestinationStaticSection = <TItem,>(
  payload: unknown,
  normalizeItem: (item: unknown) => TItem,
  fallbackTitle: string,
  fallbackSubtitle: string,
): FrontDestinationStaticSection<TItem> => {
  const source = asRecord(payload);
  const heroImage = asOptionalString(source.heroImage);

  return {
    title: asString(source.title) || fallbackTitle,
    subtitle: asString(source.subtitle) || fallbackSubtitle,
    heroImage,
    heroImageUrl: heroImage ? resolveEmbeddableApiUrl(heroImage) : null,
    items: asArray(source.items).map(normalizeItem),
    pagination: normalizeFrontPaginationMeta(source.pagination),
  };
};

const normalizeFrontDestinationPage = (payload: unknown): FrontDestinationPage => {
  const source = asRecord(payload);
  const locationSource = asRecord(source.location);
  const locationHeroImage = asOptionalString(locationSource.heroImage);

  return {
    location: {
      id: asString(locationSource.id),
      name: asString(locationSource.name) || "Destination",
      slug: asString(locationSource.slug),
      city: asString(locationSource.city),
      country: asString(locationSource.country),
      description: asString(locationSource.description),
      heroImage: locationHeroImage,
      heroImageUrl: locationHeroImage ? resolveEmbeddableApiUrl(locationHeroImage) : null,
      createdAt: asOptionalString(locationSource.createdAt),
      updatedAt: asOptionalString(locationSource.updatedAt),
    },
    listingsSection: normalizeFrontDestinationListingsSection(source.listingsSection),
    transportSection: normalizeFrontDestinationStaticSection(
      source.transportSection,
      normalizeFrontTransportItem,
      "Transportation Services",
      "Local transport companies and contact details",
    ),
    foodSection: normalizeFrontDestinationStaticSection(
      source.foodSection,
      normalizeFrontFoodItem,
      "Food & Restaurant",
      "Recommended restaurants near this location",
    ),
  };
};

type MockLocation = {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  description: string;
  heroImage: string | null;
  sortOrder: number;
  isActive: boolean;
  transportTitle: string;
  transportSubtitle: string;
  transportHero: string | null;
  foodTitle: string;
  foodSubtitle: string;
  foodHero: string | null;
};

const MOCK_LOCATIONS: MockLocation[] = [
  {
    id: "loc-dhaka",
    name: "Dhaka",
    slug: "dhaka",
    city: "Dhaka",
    country: "Bangladesh",
    description:
      "Dhaka is the energetic capital of Bangladesh, a bustling megacity of rickshaws, riverside scenes, historic neighbourhoods, and a vibrant food scene. Stay close to Gulshan, Banani, or Dhanmondi for easy access to business and dining.",
    heroImage:
      "https://images.unsplash.com/photo-1603813507816-f66c1d4b9737?auto=format&fit=crop&w=1600&q=80",
    sortOrder: 1,
    isActive: true,
    transportTitle: "Getting Around Dhaka",
    transportSubtitle: "Trusted car rentals, ride-hailing contacts, and airport transfer companies near the city.",
    transportHero:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80",
    foodTitle: "Taste of Dhaka",
    foodSubtitle: "Chef-curated restaurants and favourite biryani, kacchi, and street-food houses.",
    foodHero:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "loc-sylhet",
    name: "Sylhet",
    slug: "sylhet",
    city: "Sylhet",
    country: "Bangladesh",
    description:
      "Surrounded by tea gardens and rivers, Sylhet blends spiritual heritage, hill views, and weekend getaways. Perfect for short stays near Ratargul, Jaflong, or Srimangal.",
    heroImage:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=80",
    sortOrder: 2,
    isActive: true,
    transportTitle: "Transport around Sylhet",
    transportSubtitle: "Private car hire, drivers, and river taxi contacts for Jaflong and Tanguar Haor trips.",
    transportHero:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80",
    foodTitle: "Eat & drink in Sylhet",
    foodSubtitle: "Local pitha, tea garden cafes, and traditional Sylheti dining. Recommendations near the stays.",
    foodHero:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "loc-coxs-bazar",
    name: "Cox's Bazar",
    slug: "coxs-bazar",
    city: "Cox's Bazar",
    country: "Bangladesh",
    description:
      "Home to the world's longest natural sea beach. Cox's Bazar is the go-to beach escape, with beachfront stays, seafood, day trips to Saint Martin's Island and Inani.",
    heroImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    sortOrder: 3,
    isActive: true,
    transportTitle: "Cox's Bazar Transport",
    transportSubtitle: "Car rentals from Chittagong/Dhaka, beach jeeps, and speedboat contacts for Saint Martin's.",
    transportHero:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
    foodTitle: "Seafood & more in Cox's Bazar",
    foodSubtitle: "Beachfront grills, fresh catches and local tea stalls with a sunset view.",
    foodHero:
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "loc-chittagong",
    name: "Chittagong",
    slug: "chittagong",
    city: "Chittagong",
    country: "Bangladesh",
    description:
      "Bangladesh's port city — a working city of hills, markets, and short trips to Rangamati, Bandarban, and Cox's Bazar. Good for multi-day stopovers with car hires.",
    heroImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
    sortOrder: 4,
    isActive: true,
    transportTitle: "Chittagong Transfers",
    transportSubtitle: "Pickup and drops for the port, bus terminal, and hill tract departures.",
    transportHero:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
    foodTitle: "Chittagong Food",
    foodSubtitle: "Mezban, spicy dry fish, and coastal Bengali cooking at favourite city spots.",
    foodHero:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "loc-sundarbans",
    name: "Sundarbans",
    slug: "sundarbans",
    city: "Khulna",
    country: "Bangladesh",
    description:
      "The UNESCO-listed mangrove forest, a wildlife haven for Bengal tigers and riverside safari boats. Stay near Satkhira or Mongla with organised tour operators.",
    heroImage:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
    sortOrder: 5,
    isActive: true,
    transportTitle: "Sundarbans Safari Transfers",
    transportSubtitle: "Boat operators, guides, and Khulna/Mongla road transfers for forest departures.",
    transportHero:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
    foodTitle: "Riverside Dining",
    foodSubtitle: "Boat-camp dining and local seafood on safari routes — handpicked partners.",
    foodHero:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "loc-rangamati",
    name: "Rangamati",
    slug: "rangamati",
    city: "Rangamati",
    country: "Bangladesh",
    description:
      "Lake-side hills in the Chittagong Hill Tracts, Rangamati is a slow-travel favourite with boat rides, hanging bridges, and tribal craft markets.",
    heroImage:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80",
    sortOrder: 6,
    isActive: true,
    transportTitle: "Rangamati Boats & Cars",
    transportSubtitle: "Lake cruising boat contacts and Chittagong↔Rangamati private car hires.",
    transportHero:
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80",
    foodTitle: "Hill & Lake Food",
    foodSubtitle: "Traditional hill cuisine, bamboo-cooked meals, and lake-view cafes.",
    foodHero:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
  },
];

const MOCK_TRANSPORT: Record<string, Array<Omit<FrontTransportItem, "heroImageUrl"> & { heroImageRaw: string | null }>> = {
  dhaka: [
    { id: "dh-tr-1", companyName: "Dhaka Ride Rentals", contactNumber: "+880 1700-111111", description: "Air-conditioned sedans and microbuses for Dhaka and intercity trips.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80" },
    { id: "dh-tr-2", companyName: "Shahjalal Airport Taxi", contactNumber: "+880 1900-222222", description: "Dedicated airport pickups with fixed-rate pricing 24/7.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80" },
    { id: "dh-tr-3", companyName: "Green Line AC Coach Desk", contactNumber: "+880 (2) 933-2222", description: "Intercity premium coaches to Chittagong, Sylhet, Cox's Bazar.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80" },
    { id: "dh-tr-4", companyName: "Banani Car Hire", contactNumber: "+880 1700-333333", description: "Hourly rentals for Gulshan, Banani, and Uttara meetings.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80" },
    { id: "dh-tr-5", companyName: "Safe Drivers BD", contactNumber: "+880 1800-444444", description: "Professional driver-on-demand for long or short Dhaka days.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80" },
    { id: "dh-tr-6", companyName: "Tourist Police Helpdesk", contactNumber: "1012", description: "For emergencies and trusted vendor referrals. Free line.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1515041219749-89347f83291a?auto=format&fit=crop&w=800&q=80" },
    { id: "dh-tr-7", companyName: "Hazrat Shahjalal Poribohon", contactNumber: "+880 1700-555555", description: "Reliable microbus and family van rental with English-speaking drivers.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80" },
  ],
  sylhet: [
    { id: "sy-tr-1", companyName: "Sylhet Hill Rides", contactNumber: "+880 1700-610000", description: "Comfortable SUVs for Jaflong, Bichanakandi, Srimangal day tours.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80" },
    { id: "sy-tr-2", companyName: "Ratargul Boat Service", contactNumber: "+880 1700-620000", description: "Licensed engine-boat operators for Ratargul swamp forest.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80" },
    { id: "sy-tr-3", companyName: "Osmani Airport Taxi", contactNumber: "+880 1900-630000", description: "Fixed price airport↔city and Hazrat Shahjalal shrine transfers.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80" },
    { id: "sy-tr-4", companyName: "Tea Garden Private Car", contactNumber: "+880 1800-640000", description: "Srimangal and Lawachara forest safaris in air-conditioned cars.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80" },
    { id: "sy-tr-5", companyName: "Tanguar Haor Boats", contactNumber: "+880 1700-650000", description: "Multi-person boats with local guide for seasonal haor journeys.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" },
    { id: "sy-tr-6", companyName: "Shohag Travels Sylhet", contactNumber: "+880 (821) 710-000", description: "AC bus and Hanif Paribahan booking assistance from Sylhet counter.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80" },
  ],
  "coxs-bazar": [
    { id: "cb-tr-1", companyName: "Cox's Beach Jeeps", contactNumber: "+880 1700-710000", description: "Open-roof beach jeeps for Sugandha, Kolatoli and Inani sunset drives.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80" },
    { id: "cb-tr-2", companyName: "Saint Martin Speedboats", contactNumber: "+880 1700-720000", description: "Authorised speedboat and trawler operators for the island crossing.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80" },
    { id: "cb-tr-3", companyName: "Chittagong Express Cars", contactNumber: "+880 1800-730000", description: "Direct Cox's Bazar ↔ Chittagong cars with experienced drivers.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80" },
    { id: "cb-tr-4", companyName: "Himchari Tours", contactNumber: "+880 1700-740000", description: "Air-conditioned microbus for Himchari, Inani and Teknaf day trips.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80" },
    { id: "cb-tr-5", companyName: "Cox Marine Desk", contactNumber: "+880 1900-750000", description: "Boat and marine tour bookings, including protected-area permits.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80" },
  ],
  chittagong: [
    { id: "ct-tr-1", companyName: "Port City Cars", contactNumber: "+880 1700-810000", description: "Port and industrial area transfers with cargo-capable cars.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80" },
    { id: "ct-tr-2", companyName: "Pahartoli Transfers", contactNumber: "+880 1800-820000", description: "Airport, railway, and Pahartoli meeting transfers.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1485081669829-bacb8c7bb1f3?auto=format&fit=crop&w=800&q=80" },
    { id: "ct-tr-3", companyName: "Bandarban Jeep Company", contactNumber: "+880 1700-830000", description: "Chandranath and Bandarban hill trips with 4x4.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80" },
    { id: "ct-tr-4", companyName: "Shohag Paribahan CTG", contactNumber: "+880 (31) 651000", description: "Dhaka premium coach booking counter contact.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80" },
    { id: "ct-tr-5", companyName: "Patenga Beach Taxis", contactNumber: "+880 1900-840000", description: "Beach and Naval Academy area pickups and drops.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" },
  ],
  sundarbans: [
    { id: "su-tr-1", companyName: "Forest Base Camp Khulna", contactNumber: "+880 1700-910000", description: "Forest permit, boat and guide package coordination.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80" },
    { id: "su-tr-2", companyName: "Sundarbans Boat Safari", contactNumber: "+880 1800-920000", description: "Multi-day river cruise boats with kitchen and guide.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1566847438217-76e82d383f84?auto=format&fit=crop&w=800&q=80" },
    { id: "su-tr-3", companyName: "Mongla Road Transfers", contactNumber: "+880 1700-930000", description: "Khulna↔Mongla launch ghat private transport.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80" },
    { id: "su-tr-4", companyName: "Karimul & Sons Safari", contactNumber: "+880 1900-940000", description: "Experienced family-run tour company operating since 1994.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80" },
  ],
  rangamati: [
    { id: "rg-tr-1", companyName: "Kaptai Lake Boats", contactNumber: "+880 1700-980000", description: "Shikarpur to Rangamati lake cruises with local guide.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=800&q=80" },
    { id: "rg-tr-2", companyName: "Chittagong↔Rangamati Cars", contactNumber: "+880 1800-981000", description: "5–6 hour scenic route private car with AC.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80" },
    { id: "rg-tr-3", companyName: "Hanging Bridge Tours", contactNumber: "+880 1700-982000", description: "Half-day shuttle between Rangamati highlights.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1506260408121-e353d10b87c7?auto=format&fit=crop&w=800&q=80" },
    { id: "rg-tr-4", companyName: "Shuvolong Jeep Service", contactNumber: "+880 1900-983000", description: "Rough-road jeeps to Shuvolong waterfall area.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80" },
    { id: "rg-tr-5", companyName: "Tribal Craft Shuttle", contactNumber: "+880 1700-984000", description: "Shuttle to weaving villages and tribal markets.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80" },
  ],
};

const MOCK_FOOD: Record<string, Array<Omit<FrontFoodItem, "heroImageUrl"> & { heroImageRaw: string | null }>> = {
  dhaka: [
    { id: "dh-fd-1", restaurantName: "Old Dhaka Kacchi", phoneNumber: "+880 1700-111222", location: "Old Dhaka · 6.4 km", description: "Legendary kacchi biryani, mutton tehari, and borhani since the 70s.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80" },
    { id: "dh-fd-2", restaurantName: "Gulshan Tea Room", phoneNumber: "+880 1800-222333", location: "Gulshan 2 · Lakeside", description: "Live bakery, all-day brunch, and rooftop tea service.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=80" },
    { id: "dh-fd-3", restaurantName: "Dhaka Tandoori House", phoneNumber: "+880 (2) 9999-444", location: "Dhanmondi 27", description: "North Indian classics, tandoor breads and slow-cooked curries.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80" },
    { id: "dh-fd-4", restaurantName: "Cafe Aromatic", phoneNumber: "+880 1900-333444", location: "Banani 11", description: "Specialty coffee, fusion breakfast and quiet workspace tables.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80" },
    { id: "dh-fd-5", restaurantName: "Street 66 Fuchka", phoneNumber: "", location: "Uttara 6", description: "Evening street carts, fuchka, chotpoti and jhalmuri. Cash only.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80" },
    { id: "dh-fd-6", restaurantName: "Mokarram's Family Dine", phoneNumber: "+880 1700-444555", location: "Mirpur DOHS", description: "Family-friendly Bengali restaurant with fish curries and bhortas.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80" },
    { id: "dh-fd-7", restaurantName: "7th Floor Sky Lounge", phoneNumber: "+880 1700-555666", location: "Gulshan Avenue", description: "Modern Bengali fusion with panoramic Dhaka sunset views.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" },
    { id: "dh-fd-8", restaurantName: "Riverside Grill", phoneNumber: "+880 1800-666777", location: "Ashulia Lake", description: "Weekend brunch, river breezes and weekend specials.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=80" },
    { id: "dh-fd-9", restaurantName: "Bengali Sweet Center", phoneNumber: "+880 (2) 865-0000", location: "Motijheel", description: "Roshogolla, mishti doi, and gift boxes for traditional events.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80" },
  ],
  sylhet: [
    { id: "sy-fd-1", restaurantName: "Sylhet Tea Garden Cafe", phoneNumber: "+880 1700-610100", location: "Srimangal", description: "Pitha, seven-layer tea, and garden-view breakfast tables.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80" },
    { id: "sy-fd-2", restaurantName: "Panshi Restaurant", phoneNumber: "+880 (821) 711-000", location: "Sylhet City", description: "Pitha, doi-fuchka, and classic Sylheti fish curries.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80" },
    { id: "sy-fd-3", restaurantName: "Jaflong Riverside Dhaba", phoneNumber: "+880 1700-620200", location: "Jaflong", description: "Fresh river fish grilled in banana leaves with signature rice.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" },
    { id: "sy-fd-4", restaurantName: "Ratargul Camp Kitchen", phoneNumber: "", location: "Ratargul", description: "Boat-side snacks and hot tea during swamp-forest tours.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=80" },
    { id: "sy-fd-5", restaurantName: "Shahi Morog Polao", phoneNumber: "+880 1800-630300", location: "Zindabazar", description: "Slow-cooked chicken polao with almond paste and saffron.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80" },
    { id: "sy-fd-6", restaurantName: "Lawachara Forest Cafe", phoneNumber: "+880 1900-640400", location: "Lawachara", description: "Eco-cafe with local produce and a quiet forest edge.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" },
  ],
  "coxs-bazar": [
    { id: "cb-fd-1", restaurantName: "Beachfront Grill", phoneNumber: "+880 1700-710100", location: "Kolatoli Point", description: "Grilled lobster, shrimp, and fresh catch of the day. Ocean view.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" },
    { id: "cb-fd-2", restaurantName: "Sugandha Point Tea Stalls", phoneNumber: "", location: "Sugandha Beach", description: "Early morning tea with samosas by the beach. Cash vendors.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80" },
    { id: "cb-fd-3", restaurantName: "Salt & Sea Restaurant", phoneNumber: "+880 1700-720200", location: "Himchari", description: "Modern seafood dining with local crab and prawn specialties.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80" },
    { id: "cb-fd-4", restaurantName: "Teknaf Fish Camp", phoneNumber: "+880 1800-730300", location: "Teknaf", description: "Fried fish platters and salted dry-fish bhortas.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=80" },
    { id: "cb-fd-5", restaurantName: "Saint Martin's Coconut Bar", phoneNumber: "+880 1900-740400", location: "Saint Martin's", description: "Coconut drinks, sea-food BBQ and bonfire nights on the beach.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=80" },
    { id: "cb-fd-6", restaurantName: "Inani Sunrise Cafe", phoneNumber: "+880 1700-750500", location: "Inani Beach", description: "Sunrise breakfasts, eggs and fresh lassis.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" },
    { id: "cb-fd-7", restaurantName: "Cox Local Bhorta House", phoneNumber: "+880 1700-760600", location: "Cox's Bazar City", description: "Bangladeshi home-style meal with 10+ kinds of bhorta.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80" },
  ],
  chittagong: [
    { id: "ct-fd-1", restaurantName: "Mezban House", phoneNumber: "+880 1700-810100", location: "GEC Circle", description: "Authentic Chittagonian Mezban beef and kacchi.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80" },
    { id: "ct-fd-2", restaurantName: "Dry Fish & Co.", phoneNumber: "+880 1800-820200", location: "Khatunganj", description: "Famous shutki and coastal Bengali plates.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" },
    { id: "ct-fd-3", restaurantName: "DC Hill Breakfast", phoneNumber: "", location: "DC Hill Park", description: "Morning street snacks with tea, fuchka and shingara.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80" },
    { id: "ct-fd-4", restaurantName: "Harbor View Rooftop", phoneNumber: "+880 1700-830300", location: "Agrabad", description: "Overlooks the port with modern Bengali fusion menu.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80" },
    { id: "ct-fd-5", restaurantName: "Kohinoor Bakery", phoneNumber: "+880 (31) 651-234", location: "Chawkbazar", description: "Bakery, pastries and the famous patties from Chittagong.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1558980394-0cde46cab122?auto=format&fit=crop&w=800&q=80" },
  ],
  sundarbans: [
    { id: "su-fd-1", restaurantName: "Boat Camp Dining", phoneNumber: "+880 1700-910100", location: "Sundarbans Cruise", description: "Fresh catch cooked mangrove-style on your boat deck.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" },
    { id: "su-fd-2", restaurantName: "Karimul's Forest Kitchen", phoneNumber: "+880 1800-920200", location: "Mongla Ghat", description: "Multi-camp meals and packed lunch for safari days.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80" },
    { id: "su-fd-3", restaurantName: "Mongla Fish Market", phoneNumber: "", location: "Mongla", description: "Street food vendors and river-side tea stalls.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80" },
    { id: "su-fd-4", restaurantName: "Satkhira Riverside", phoneNumber: "+880 1700-930300", location: "Satkhira", description: "Country food with river panta-ilish breakfast.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80" },
  ],
  rangamati: [
    { id: "rg-fd-1", restaurantName: "Lakeview Tribal Kitchen", phoneNumber: "+880 1700-980100", location: "Rangamati Town", description: "Bamboo-cooked pork, bamboo chicken and local rice.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80" },
    { id: "rg-fd-2", restaurantName: "Shuvolong Hill Lunch", phoneNumber: "+880 1800-981200", location: "Shuvolong", description: "View restaurant near Shuvolong waterfall.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80" },
    { id: "rg-fd-3", restaurantName: "Kaptai Tea & Snacks", phoneNumber: "", location: "Kaptai Lake", description: "Tea stalls with pitha around the lake promenade.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80" },
    { id: "rg-fd-4", restaurantName: "Hanging Bridge Cafe", phoneNumber: "+880 1700-982300", location: "Hanging Bridge", description: "Rooftop cafe with lake-facing terrace seating.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=80" },
    { id: "rg-fd-5", restaurantName: "Tribal Bazaar Food", phoneNumber: "+880 1900-983400", location: "Bana Rashobari", description: "Hand-milled rice and local curries at tribal eateries.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" },
    { id: "rg-fd-6", restaurantName: "Rangamati Sweet House", phoneNumber: "+880 1700-984500", location: "Rangamati Central", description: "Traditional Bangladeshi sweets and gift boxes.", heroImage: null, heroImageRaw: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80" },
  ],
};

const MOCK_LISTING_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753086-00f18fe6ba69?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=1200&q=80",
];

const MOCK_LISTING_TITLES: Record<string, string[]> = {
  dhaka: [
    "Lakeview 2BR — Gulshan 2",
    "Banani Quiet Studio Apartment",
    "Rooftop 3BR Family House, Dhanmondi",
    "Uttara Modern Apt Near Airport",
    "Bashundhara 4BR Luxury Flat",
    "Old Dhaka Heritage Terrace Suite",
    "Gulshan 1 Co-Living Private Room",
    "Mirpur DOHS 3BR with Balcony",
    "Baridhara Diplomatic 2BR Suite",
    "Mohakhali Lakeside Studio",
    "Jatrabari Budget 1BR Flat",
    "Niketon Serene 2BR Apartment",
    "Rampura Smart Home (2BR)",
    "Paltan Business Studio",
    "Tejgaon Industrial Guest House (4BR)",
  ],
  sylhet: [
    "Tea Garden Cottage (2BR)",
    "Sylhet Hills 3BR Bungalow",
    "Ambarkhana Downtown Suite",
    "Zindabazar Family 3BR",
    "Shahjalal Upashahor Modern Flat",
    "Jaflong View Campsite Suite",
    "Srimangal Eco Lodge (4BR)",
    "Ratargul River Cabin",
    "Kumar Para 2BR Apartment",
    "Bondor Bazar Private Rooms",
    "Noyabazar Heritage 3BR",
    "Mirer Bazar 2BR with Terrace",
    "Tularam Lakeside 4BR",
    "Mira Bazaar Compact Studio",
    "Hazrat Shahjalal Guest Rooms",
  ],
  "coxs-bazar": [
    "Beachfront 3BR Villa, Kolatoli",
    "Sugandha Sea-View Apartment",
    "Inani Beach Loft Studio",
    "Cox's Bazar Town 2BR Family",
    "Himchari Clifftop Cottage (2BR)",
    "Teknaf Beach Cottage",
    "Marine Drive 4BR Penthouse",
    "Saint Martin's Eco Hut",
    "Dolphin Mouk Beach Rooms",
    "Laboni Point 3BR Suite",
    "Cox's Bazar Airport Studio",
    "Bakkhali River View 3BR",
    "Marina Drive 2BR Apartment",
    "Chakaria 4BR Guest House",
    "Moheshkhali Island 3BR Cottage",
  ],
  chittagong: [
    "Agrabad 3BR Business Apartment",
    "GEC Circle 2BR City Suite",
    "Pahartoli Lakeview 4BR",
    "Nasirabad Hilly 3BR Bungalow",
    "Khulshi Modern 2BR",
    "Chawkbazar Heritage Suite",
    "Muradpur Downtown Rooms",
    "Baily View Apartment (2BR)",
    "DC Hill 4BR Family House",
    "Khatunganj Business Studio",
    "Bakalia 2BR Quiet Flat",
    "Double Mooring 3BR with Balcony",
    "Halishahar 2BR Apartment",
    "Sadarghat Port Studio",
    "Port Connect 4BR Guest House",
  ],
  sundarbans: [
    "Mongla Riverside 3BR",
    "Khulna Forest Camp 2BR",
    "Satkhira Village Guest House",
    "Sundarbans Boat Suite (2 beds)",
    "Bagerhat UNESCO 2BR Cottage",
    "Sharankhola Eco Lodge (3BR)",
    "Dublar Char Fisherman House",
    "Mongla Ghat 2BR Apartment",
    "Rupsha Riverview 4BR",
    "Bagerhat Heritage 3BR",
  ],
  rangamati: [
    "Lake View 2BR — Rangamati",
    "Hanging Bridge 3BR Suite",
    "Kaptai Lakeside Cottage (4BR)",
    "Shuvolong 2BR Mountain View",
    "Rangamati Central Private Rooms",
    "Bana Rashobari 3BR Tribal House",
    "Jumma Eco Cottage (2BR)",
    "Rangamati Hill Bungalow (4BR)",
    "Rangamati Lake Studio Apartment",
    "Tabalchari 3BR Guest House",
    "Rajasthali 2BR Riverside House",
    "Kaptai Dam View Rooms",
  ],
};

const pickInRange = <T,>(arr: T[], index: number): T | null => {
  if (arr.length === 0) {
    return null;
  }

  return arr[index % arr.length] ?? null;
};

const paginateMock = <T,>(items: T[], page: number, pageSize: number) => {
  const safePage = Math.max(1, Math.trunc(page) || 1);
  const safeSize = Math.max(1, Math.trunc(pageSize) || 1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safeSize));
  const clampedPage = Math.min(safePage, totalPages);
  const start = (clampedPage - 1) * safeSize;
  const slice = items.slice(start, start + safeSize);

  return {
    items: slice,
    pagination: {
      page: clampedPage,
      pageSize: safeSize,
      total,
      totalPages,
    },
  } as const;
};

const buildMockListingsForLocation = (location: MockLocation): FrontListingCard[] => {
  const titles = MOCK_LISTING_TITLES[location.slug] ?? MOCK_LISTING_TITLES.dhaka;

  return titles.map((title, index) => {
    const basePrice = 2200 + (index % 8) * 1400;
    const ratingAverage = 4.3 + (index % 7) * 0.1;
    const reviewCount = 18 + (index * 13) % 360;
    const image = pickInRange(MOCK_LISTING_IMAGES, index) ?? MOCK_LISTING_IMAGES[0]!;
    const locationLabel = [location.city, location.country].filter(Boolean).join(", ");
    const priceLabel = `৳${basePrice.toLocaleString("en-BD")} / night`;
    const ratingLabel = `${ratingAverage.toFixed(1)} (${reviewCount} reviews)`;

    return {
      propertyId: `prop-${location.slug}-${index + 1}`,
      title,
      locationLabel,
      city: location.city,
      country: location.country,
      coverImageUrl: resolveEmbeddableApiUrl(image),
      price: {
        amount: basePrice,
        currency: "BDT",
        period: "night",
        displayLabel: priceLabel,
      },
      rating: {
        average: Number(ratingAverage.toFixed(1)),
        count: reviewCount,
        displayLabel: ratingLabel,
      },
      badge:
        index % 4 === 0
          ? "Host favourite"
          : index % 4 === 1
          ? "Self check-in"
          : index % 4 === 2
          ? "River view"
          : null,
      href: `/properties/prop-${location.slug}-${index + 1}`,
    };
  });
};

const buildMockTransportForLocation = (location: MockLocation): FrontTransportItem[] => {
  const items = MOCK_TRANSPORT[location.slug] ?? [];
  return items.map((item) => ({
    id: item.id,
    companyName: item.companyName,
    contactNumber: item.contactNumber,
    description: item.description,
    heroImage: item.heroImage,
    heroImageUrl: item.heroImageRaw ? resolveEmbeddableApiUrl(item.heroImageRaw) : null,
  }));
};

const buildMockFoodForLocation = (location: MockLocation): FrontFoodItem[] => {
  const items = MOCK_FOOD[location.slug] ?? [];
  return items.map((item) => ({
    id: item.id,
    restaurantName: item.restaurantName,
    phoneNumber: item.phoneNumber,
    location: item.location,
    description: item.description,
    heroImage: item.heroImage,
    heroImageUrl: item.heroImageRaw ? resolveEmbeddableApiUrl(item.heroImageRaw) : null,
  }));
};

const convertStoreTransportItems = (items: AdminTransportItem[]): FrontTransportItem[] =>
  items.map((item) => ({
    id: item.id,
    companyName: item.companyName,
    contactNumber: item.contactNumber,
    description: item.description ?? "",
    heroImage: item.heroImage,
    heroImageUrl: item.heroImage ? resolveEmbeddableApiUrl(item.heroImage) : null,
  }));

const convertStoreFoodItems = (items: AdminFoodItem[]): FrontFoodItem[] =>
  items.map((item) => ({
    id: item.id,
    restaurantName: item.restaurantName,
    phoneNumber: item.phoneNumber,
    location: item.location,
    description: item.description ?? "",
    heroImage: item.heroImage,
    heroImageUrl: item.heroImage ? resolveEmbeddableApiUrl(item.heroImage) : null,
  }));

const resolveStoreMockLocation = (detail: AdminLocationDetail): MockLocation => ({
  id: detail.id,
  name: detail.name,
  slug: detail.slug,
  city: detail.city,
  country: detail.country,
  description: detail.description ?? "",
  heroImage: detail.heroImage,
  sortOrder: detail.sortOrder,
  isActive: detail.isActive,
  transportTitle: detail.transportSectionTitle ?? "",
  transportSubtitle: detail.transportSectionSubtitle ?? "",
  transportHero: detail.transportHeroImage ?? null,
  foodTitle: detail.foodSectionTitle ?? "",
  foodSubtitle: detail.foodSectionSubtitle ?? "",
  foodHero: detail.foodHeroImage ?? null,
});

const USE_DESTINATION_MOCKS = true;

export async function getFrontLocationPills(): Promise<FrontLocationPill[]> {
  if (USE_DESTINATION_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const storePills = storeGetPublicPills();

    return storePills
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((loc) => ({
        id: loc.id,
        name: loc.name,
        slug: loc.slug,
        city: loc.city,
        country: loc.country,
        heroImage: loc.heroImage,
        heroImageUrl: loc.heroImage ? resolveEmbeddableApiUrl(loc.heroImage) : null,
        sortOrder: loc.sortOrder,
        href: buildFrontDestinationHref(loc.slug),
      }));
  }

  const data = await apiRequest<unknown>("/api/v1/front/locations/pills", {
    method: "GET",
    cache: "no-store",
  });

  return asArray(data).map(normalizeFrontLocationPill);
}

type FrontDestinationQuery = {
  listingsPage?: number;
  listingsLimit?: number;
  transportPage?: number;
  foodPage?: number;
};

export async function getFrontDestinationPage(
  locationSlug: string,
  query: FrontDestinationQuery = {},
): Promise<FrontDestinationPage> {
  const slug = locationSlug.trim();

  if (USE_DESTINATION_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const storeDetail = storeGetPublicDestination(slug);

    if (!storeDetail) {
      throw new ApiError(`No destination found for slug "${slug}".`, 404);
    }

    const location = resolveStoreMockLocation(storeDetail);

    const allListings = buildMockListingsForLocation(location);
    const listingsLimit = Math.max(1, Math.trunc(query.listingsLimit ?? 12) || 12);
    const paginatedListings = paginateMock(allListings, query.listingsPage ?? 1, listingsLimit);

    const allTransport = convertStoreTransportItems(storeDetail.transportItems);
    const paginatedTransport = paginateMock(allTransport, query.transportPage ?? 1, 5);

    const allFood = convertStoreFoodItems(storeDetail.foodItems);
    const paginatedFood = paginateMock(allFood, query.foodPage ?? 1, 5);

    return {
      location: {
        id: location.id,
        name: location.name,
        slug: location.slug,
        city: location.city,
        country: location.country,
        description: location.description,
        heroImage: location.heroImage,
        heroImageUrl: location.heroImage ? resolveEmbeddableApiUrl(location.heroImage) : null,
        createdAt: storeDetail.createdAt ?? null,
        updatedAt: storeDetail.updatedAt ?? null,
      },
      listingsSection: {
        title: `Stays in ${location.name}`,
        subtitle: `Handpicked properties near ${location.city}.`,
        items: paginatedListings.items,
        pagination: paginatedListings.pagination,
      },
      transportSection: {
        title: location.transportTitle || "Transportation Services",
        subtitle:
          location.transportSubtitle ||
          "Local transport companies and contact details for this destination.",
        heroImage: location.transportHero,
        heroImageUrl: location.transportHero ? resolveEmbeddableApiUrl(location.transportHero) : null,
        items: paginatedTransport.items,
        pagination: paginatedTransport.pagination,
      },
      foodSection: {
        title: location.foodTitle || "Food & Restaurant",
        subtitle:
          location.foodSubtitle ||
          "Recommended restaurants and dining spots near this location.",
        heroImage: location.foodHero,
        heroImageUrl: location.foodHero ? resolveEmbeddableApiUrl(location.foodHero) : null,
        items: paginatedFood.items,
        pagination: paginatedFood.pagination,
      },
    };
  }

  const data = await apiRequest<unknown>(
    `/api/v1/front/locations/${encodeURIComponent(slug)}${buildQueryString({
      listingsPage: query.listingsPage ?? undefined,
      listingsLimit: query.listingsLimit ?? undefined,
      transportPage: query.transportPage ?? undefined,
      foodPage: query.foodPage ?? undefined,
    })}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return normalizeFrontDestinationPage(data);
}
