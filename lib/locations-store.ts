export type AdminLocationSummary = {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  heroImage: string | null;
  isActive: boolean;
  sortOrder: number;
  description: string | null;
  transportSectionTitle: string;
  transportSectionSubtitle: string;
  foodSectionTitle: string;
  foodSectionSubtitle: string;
  transportHeroImage: string | null;
  foodHeroImage: string | null;
  transportServicesCount: number;
  foodRestaurantsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminTransportItem = {
  id: string;
  companyName: string;
  contactNumber: string;
  description: string;
  heroImage: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminFoodItem = {
  id: string;
  restaurantName: string;
  phoneNumber: string;
  location: string;
  description: string;
  heroImage: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminLocationDetail = AdminLocationSummary & {
  transportItems: AdminTransportItem[];
  foodItems: AdminFoodItem[];
};

export type UpsertAdminLocationPayload = {
  name?: string;
  slug?: string;
  city?: string;
  country?: string;
  description?: string | null;
  heroImage?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  transportSectionTitle?: string;
  transportSectionSubtitle?: string;
  foodSectionTitle?: string;
  foodSectionSubtitle?: string;
  transportHeroImage?: string | null;
  foodHeroImage?: string | null;
};

export type UpsertAdminTransportPayload = {
  companyName?: string;
  contactNumber?: string;
  description?: string;
  heroImage?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpsertAdminFoodPayload = {
  restaurantName?: string;
  phoneNumber?: string;
  location?: string;
  description?: string;
  heroImage?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

const STORAGE_KEY = "xyz_travellers:destinations:v1";
const UPDATE_EVENT = "xyz:destinations:update";
const isBrowser = typeof window !== "undefined";
const SEED_TIMESTAMP = new Date("2026-04-01T00:00:00.000Z").toISOString();

function cloneDeep<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function generateId(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const seedLocations: AdminLocationSummary[] = [
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
    isActive: true,
    sortOrder: 1,
    transportSectionTitle: "Getting Around Dhaka",
    transportSectionSubtitle:
      "Trusted car rentals, ride-hailing contacts, and airport transfer companies near the city.",
    foodSectionTitle: "Taste of Dhaka",
    foodSectionSubtitle:
      "Chef-curated restaurants and favourite biryani, kacchi, and street-food houses.",
    transportHeroImage:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80",
    foodHeroImage:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    transportServicesCount: 7,
    foodRestaurantsCount: 9,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
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
    isActive: true,
    sortOrder: 2,
    transportSectionTitle: "Transport around Sylhet",
    transportSectionSubtitle:
      "Private car hire, drivers, and river taxi contacts for Jaflong and Tanguar Haor trips.",
    foodSectionTitle: "Eat & drink in Sylhet",
    foodSectionSubtitle:
      "Local pitha, tea garden cafes, and traditional Sylheti dining. Recommendations near the stays.",
    transportHeroImage:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80",
    foodHeroImage:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    transportServicesCount: 6,
    foodRestaurantsCount: 6,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
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
    isActive: true,
    sortOrder: 3,
    transportSectionTitle: "Cox's Bazar Transport",
    transportSectionSubtitle:
      "Car rentals from Chittagong/Dhaka, beach jeeps, and speedboat contacts for Saint Martin's.",
    foodSectionTitle: "Seafood & more in Cox's Bazar",
    foodSectionSubtitle: "Beachfront grills, fresh catches and local tea stalls with a sunset view.",
    transportHeroImage:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
    foodHeroImage:
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1200&q=80",
    transportServicesCount: 5,
    foodRestaurantsCount: 7,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
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
    isActive: true,
    sortOrder: 4,
    transportSectionTitle: "Chittagong Transfers",
    transportSectionSubtitle:
      "Pickup and drops for the port, bus terminal, and hill tract departures.",
    foodSectionTitle: "Chittagong Food",
    foodSectionSubtitle: "Mezban, spicy dry fish, and coastal Bengali cooking at favourite city spots.",
    transportHeroImage:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
    foodHeroImage:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
    transportServicesCount: 5,
    foodRestaurantsCount: 5,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
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
    isActive: true,
    sortOrder: 5,
    transportSectionTitle: "Sundarbans Safari Transfers",
    transportSectionSubtitle:
      "Boat operators, guides, and Khulna/Mongla road transfers for forest departures.",
    foodSectionTitle: "Riverside Dining",
    foodSectionSubtitle: "Boat-camp dining and local seafood on safari routes — handpicked partners.",
    transportHeroImage:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
    foodHeroImage:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    transportServicesCount: 4,
    foodRestaurantsCount: 4,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
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
    isActive: true,
    sortOrder: 6,
    transportSectionTitle: "Rangamati Boats & Cars",
    transportSectionSubtitle: "Lake cruising boat contacts and Chittagong↔Rangamati private car hires.",
    foodSectionTitle: "Hill & Lake Food",
    foodSectionSubtitle: "Traditional hill cuisine, bamboo-cooked meals, and lake-view cafes.",
    transportHeroImage:
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80",
    foodHeroImage:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    transportServicesCount: 5,
    foodRestaurantsCount: 6,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
];

const seedTransportMap: Record<string, AdminTransportItem[]> = {
  "loc-dhaka": [
    { id: "dh-tr-1", companyName: "Dhaka Ride Rentals", contactNumber: "+880 1700-111111", description: "Air-conditioned sedans and microbuses for Dhaka and intercity trips.", heroImage: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80", sortOrder: 1, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "dh-tr-2", companyName: "Shahjalal Airport Taxi", contactNumber: "+880 1900-222222", description: "Dedicated airport pickups with fixed-rate pricing 24/7.", heroImage: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80", sortOrder: 2, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "dh-tr-3", companyName: "Green Line AC Coach Desk", contactNumber: "+880 (2) 933-2222", description: "Intercity premium coaches to Chittagong, Sylhet, Cox's Bazar.", heroImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80", sortOrder: 3, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "dh-tr-4", companyName: "Banani Car Hire", contactNumber: "+880 1700-333333", description: "Hourly rentals for Gulshan, Banani, and Uttara meetings.", heroImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80", sortOrder: 4, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "dh-tr-5", companyName: "Safe Drivers BD", contactNumber: "+880 1800-444444", description: "Professional driver-on-demand for long or short Dhaka days.", heroImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80", sortOrder: 5, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "dh-tr-6", companyName: "Tourist Police Helpdesk", contactNumber: "1012", description: "For emergencies and trusted vendor referrals. Free line.", heroImage: "https://images.unsplash.com/photo-1515041219749-89347f83291a?auto=format&fit=crop&w=800&q=80", sortOrder: 6, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "dh-tr-7", companyName: "Hazrat Shahjalal Poribohon", contactNumber: "+880 1700-555555", description: "Reliable microbus and family van rental with English-speaking drivers.", heroImage: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80", sortOrder: 7, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
  ],
  "loc-sylhet": [
    { id: "sy-tr-1", companyName: "Sylhet Hill Rides", contactNumber: "+880 1700-610000", description: "Comfortable SUVs for Jaflong, Bichanakandi, Srimangal day tours.", heroImage: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80", sortOrder: 1, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "sy-tr-2", companyName: "Ratargul Boat Service", contactNumber: "+880 1700-620000", description: "Licensed engine-boat operators for Ratargul swamp forest.", heroImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80", sortOrder: 2, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "sy-tr-3", companyName: "Osmani Airport Taxi", contactNumber: "+880 1900-630000", description: "Fixed price airport↔city and Hazrat Shahjalal shrine transfers.", heroImage: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80", sortOrder: 3, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "sy-tr-4", companyName: "Tea Garden Private Car", contactNumber: "+880 1800-640000", description: "Srimangal and Lawachara forest safaris in air-conditioned cars.", heroImage: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80", sortOrder: 4, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "sy-tr-5", companyName: "Tanguar Haor Boats", contactNumber: "+880 1700-650000", description: "Multi-person boats with local guide for seasonal haor journeys.", heroImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", sortOrder: 5, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "sy-tr-6", companyName: "Shohag Travels Sylhet", contactNumber: "+880 (821) 710-000", description: "AC bus and Hanif Paribahan booking assistance from Sylhet counter.", heroImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80", sortOrder: 6, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
  ],
  "loc-coxs-bazar": [
    { id: "cb-tr-1", companyName: "Cox's Beach Jeeps", contactNumber: "+880 1700-710000", description: "Open-roof beach jeeps for Sugandha, Kolatoli and Inani sunset drives.", heroImage: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80", sortOrder: 1, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "cb-tr-2", companyName: "Saint Martin Speedboats", contactNumber: "+880 1700-720000", description: "Authorised speedboat and trawler operators for the island crossing.", heroImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80", sortOrder: 2, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "cb-tr-3", companyName: "Chittagong Express Cars", contactNumber: "+880 1800-730000", description: "Direct Cox's Bazar ↔ Chittagong cars with experienced drivers.", heroImage: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80", sortOrder: 3, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "cb-tr-4", companyName: "Himchari Tours", contactNumber: "+880 1700-740000", description: "Air-conditioned microbus for Himchari, Inani and Teknaf day trips.", heroImage: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80", sortOrder: 4, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "cb-tr-5", companyName: "Cox Marine Desk", contactNumber: "+880 1900-750000", description: "Boat and marine tour bookings, including protected-area permits.", heroImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80", sortOrder: 5, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
  ],
  "loc-chittagong": [
    { id: "ct-tr-1", companyName: "Port City Cars", contactNumber: "+880 1700-810000", description: "Port and industrial area transfers with cargo-capable cars.", heroImage: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80", sortOrder: 1, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "ct-tr-2", companyName: "Pahartoli Transfers", contactNumber: "+880 1800-820000", description: "Airport, railway, and Pahartoli meeting transfers.", heroImage: "https://images.unsplash.com/photo-1485081669829-bacb8c7bb1f3?auto=format&fit=crop&w=800&q=80", sortOrder: 2, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "ct-tr-3", companyName: "Bandarban Jeep Company", contactNumber: "+880 1700-830000", description: "Chandranath and Bandarban hill trips with 4x4.", heroImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80", sortOrder: 3, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "ct-tr-4", companyName: "Shohag Paribahan CTG", contactNumber: "+880 (31) 651000", description: "Dhaka premium coach booking counter contact.", heroImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80", sortOrder: 4, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "ct-tr-5", companyName: "Patenga Beach Taxis", contactNumber: "+880 1900-840000", description: "Beach and Naval Academy area pickups and drops.", heroImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", sortOrder: 5, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
  ],
  "loc-sundarbans": [
    { id: "su-tr-1", companyName: "Forest Base Camp Khulna", contactNumber: "+880 1700-910000", description: "Forest permit, boat and guide package coordination.", heroImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80", sortOrder: 1, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "su-tr-2", companyName: "Sundarbans Boat Safari", contactNumber: "+880 1800-920000", description: "Multi-day river cruise boats with kitchen and guide.", heroImage: "https://images.unsplash.com/photo-1566847438217-76e82d383f84?auto=format&fit=crop&w=800&q=80", sortOrder: 2, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "su-tr-3", companyName: "Mongla Road Transfers", contactNumber: "+880 1700-930000", description: "Khulna↔Mongla launch ghat private transport.", heroImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80", sortOrder: 3, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "su-tr-4", companyName: "Karimul & Sons Safari", contactNumber: "+880 1900-940000", description: "Experienced family-run tour company operating since 1994.", heroImage: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80", sortOrder: 4, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
  ],
  "loc-rangamati": [
    { id: "rg-tr-1", companyName: "Kaptai Lake Boats", contactNumber: "+880 1700-980000", description: "Shikarpur to Rangamati lake cruises with local guide.", heroImage: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=800&q=80", sortOrder: 1, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "rg-tr-2", companyName: "Chittagong↔Rangamati Cars", contactNumber: "+880 1800-981000", description: "5–6 hour scenic route private car with AC.", heroImage: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80", sortOrder: 2, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "rg-tr-3", companyName: "Hanging Bridge Tours", contactNumber: "+880 1700-982000", description: "Half-day shuttle between Rangamati highlights.", heroImage: "https://images.unsplash.com/photo-1506260408121-e353d10b87c7?auto=format&fit=crop&w=800&q=80", sortOrder: 3, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "rg-tr-4", companyName: "Shuvolong Jeep Service", contactNumber: "+880 1900-983000", description: "Rough-road jeeps to Shuvolong waterfall area.", heroImage: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80", sortOrder: 4, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "rg-tr-5", companyName: "Tribal Craft Shuttle", contactNumber: "+880 1700-984000", description: "Shuttle to weaving villages and tribal markets.", heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80", sortOrder: 5, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
  ],
};

const seedFoodMap: Record<string, AdminFoodItem[]> = {
  "loc-dhaka": [
    { id: "dh-fd-1", restaurantName: "Old Dhaka Kacchi", phoneNumber: "+880 1700-111222", location: "Old Dhaka · 6.4 km", description: "Legendary kacchi biryani, mutton tehari, and borhani since the 70s.", heroImage: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80", sortOrder: 1, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "dh-fd-2", restaurantName: "Gulshan Tea Room", phoneNumber: "+880 1800-222333", location: "Gulshan 2 · Lakeside", description: "Live bakery, all-day brunch, and rooftop tea service.", heroImage: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=80", sortOrder: 2, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "dh-fd-3", restaurantName: "Dhaka Tandoori House", phoneNumber: "+880 (2) 9999-444", location: "Dhanmondi 27", description: "North Indian classics, tandoor breads and slow-cooked curries.", heroImage: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80", sortOrder: 3, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "dh-fd-4", restaurantName: "Cafe Aromatic", phoneNumber: "+880 1900-333444", location: "Banani 11", description: "Specialty coffee, fusion breakfast and quiet workspace tables.", heroImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80", sortOrder: 4, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "dh-fd-5", restaurantName: "Street 66 Fuchka", phoneNumber: "", location: "Uttara 6", description: "Evening street carts, fuchka, chotpoti and jhalmuri. Cash only.", heroImage: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80", sortOrder: 5, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "dh-fd-6", restaurantName: "Mokarram's Family Dine", phoneNumber: "+880 1700-444555", location: "Mirpur DOHS", description: "Family-friendly Bengali restaurant with fish curries and bhortas.", heroImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80", sortOrder: 6, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "dh-fd-7", restaurantName: "7th Floor Sky Lounge", phoneNumber: "+880 1700-555666", location: "Gulshan Avenue", description: "Modern Bengali fusion with panoramic Dhaka sunset views.", heroImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80", sortOrder: 7, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "dh-fd-8", restaurantName: "Riverside Grill", phoneNumber: "+880 1800-666777", location: "Ashulia Lake", description: "Weekend brunch, river breezes and weekend specials.", heroImage: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=80", sortOrder: 8, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "dh-fd-9", restaurantName: "Bengali Sweet Center", phoneNumber: "+880 (2) 865-0000", location: "Motijheel", description: "Roshogolla, mishti doi, and gift boxes for traditional events.", heroImage: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80", sortOrder: 9, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
  ],
  "loc-sylhet": [
    { id: "sy-fd-1", restaurantName: "Sylhet Tea Garden Cafe", phoneNumber: "+880 1700-610100", location: "Srimangal", description: "Pitha, seven-layer tea, and garden-view breakfast tables.", heroImage: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80", sortOrder: 1, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "sy-fd-2", restaurantName: "Panshi Restaurant", phoneNumber: "+880 (821) 711-000", location: "Sylhet City", description: "Pitha, doi-fuchka, and classic Sylheti fish curries.", heroImage: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80", sortOrder: 2, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "sy-fd-3", restaurantName: "Jaflong Riverside Dhaba", phoneNumber: "+880 1700-620200", location: "Jaflong", description: "Fresh river fish grilled in banana leaves with signature rice.", heroImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80", sortOrder: 3, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "sy-fd-4", restaurantName: "Ratargul Camp Kitchen", phoneNumber: "", location: "Ratargul", description: "Boat-side snacks and hot tea during swamp-forest tours.", heroImage: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=80", sortOrder: 4, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "sy-fd-5", restaurantName: "Shahi Morog Polao", phoneNumber: "+880 1800-630300", location: "Zindabazar", description: "Slow-cooked chicken polao with almond paste and saffron.", heroImage: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80", sortOrder: 5, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "sy-fd-6", restaurantName: "Lawachara Forest Cafe", phoneNumber: "+880 1900-640400", location: "Lawachara", description: "Eco-cafe with local produce and a quiet forest edge.", heroImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80", sortOrder: 6, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
  ],
  "loc-coxs-bazar": [
    { id: "cb-fd-1", restaurantName: "Beachfront Grill", phoneNumber: "+880 1700-710100", location: "Kolatoli Point", description: "Grilled lobster, shrimp, and fresh catch of the day. Ocean view.", heroImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80", sortOrder: 1, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "cb-fd-2", restaurantName: "Sugandha Point Tea Stalls", phoneNumber: "", location: "Sugandha Beach", description: "Early morning tea with samosas by the beach. Cash vendors.", heroImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80", sortOrder: 2, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "cb-fd-3", restaurantName: "Salt & Sea Restaurant", phoneNumber: "+880 1700-720200", location: "Himchari", description: "Modern seafood dining with local crab and prawn specialties.", heroImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80", sortOrder: 3, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "cb-fd-4", restaurantName: "Teknaf Fish Camp", phoneNumber: "+880 1800-730300", location: "Teknaf", description: "Fried fish platters and salted dry-fish bhortas.", heroImage: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=80", sortOrder: 4, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "cb-fd-5", restaurantName: "Saint Martin's Coconut Bar", phoneNumber: "+880 1900-740400", location: "Saint Martin's", description: "Coconut drinks, sea-food BBQ and bonfire nights on the beach.", heroImage: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=80", sortOrder: 5, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "cb-fd-6", restaurantName: "Inani Sunrise Cafe", phoneNumber: "+880 1700-750500", location: "Inani Beach", description: "Sunrise breakfasts, eggs and fresh lassis.", heroImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80", sortOrder: 6, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "cb-fd-7", restaurantName: "Cox Local Bhorta House", phoneNumber: "+880 1700-760600", location: "Cox's Bazar City", description: "Bangladeshi home-style meal with 10+ kinds of bhorta.", heroImage: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80", sortOrder: 7, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
  ],
  "loc-chittagong": [
    { id: "ct-fd-1", restaurantName: "Mezban House", phoneNumber: "+880 1700-810100", location: "GEC Circle", description: "Authentic Chittagonian Mezban beef and kacchi.", heroImage: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80", sortOrder: 1, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "ct-fd-2", restaurantName: "Dry Fish & Co.", phoneNumber: "+880 1800-820200", location: "Khatunganj", description: "Famous shutki and coastal Bengali plates.", heroImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80", sortOrder: 2, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "ct-fd-3", restaurantName: "DC Hill Breakfast", phoneNumber: "", location: "DC Hill Park", description: "Morning street snacks with tea, fuchka and shingara.", heroImage: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80", sortOrder: 3, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "ct-fd-4", restaurantName: "Harbor View Rooftop", phoneNumber: "+880 1700-830300", location: "Agrabad", description: "Overlooks the port with modern Bengali fusion menu.", heroImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80", sortOrder: 4, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "ct-fd-5", restaurantName: "Kohinoor Bakery", phoneNumber: "+880 (31) 651-234", location: "Chawkbazar", description: "Bakery, pastries and the famous patties from Chittagong.", heroImage: "https://images.unsplash.com/photo-1558980394-0cde46cab122?auto=format&fit=crop&w=800&q=80", sortOrder: 5, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
  ],
  "loc-sundarbans": [
    { id: "su-fd-1", restaurantName: "Boat Camp Dining", phoneNumber: "+880 1700-910100", location: "Sundarbans Cruise", description: "Fresh catch cooked mangrove-style on your boat deck.", heroImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80", sortOrder: 1, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "su-fd-2", restaurantName: "Karimul's Forest Kitchen", phoneNumber: "+880 1800-920200", location: "Mongla Ghat", description: "Multi-camp meals and packed lunch for safari days.", heroImage: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80", sortOrder: 2, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "su-fd-3", restaurantName: "Mongla Fish Market", phoneNumber: "", location: "Mongla", description: "Street food vendors and river-side tea stalls.", heroImage: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80", sortOrder: 3, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "su-fd-4", restaurantName: "Satkhira Riverside", phoneNumber: "+880 1700-930300", location: "Satkhira", description: "Country food with river panta-ilish breakfast.", heroImage: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80", sortOrder: 4, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
  ],
  "loc-rangamati": [
    { id: "rg-fd-1", restaurantName: "Lakeview Tribal Kitchen", phoneNumber: "+880 1700-980100", location: "Rangamati Town", description: "Bamboo-cooked pork, bamboo chicken and local rice.", heroImage: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80", sortOrder: 1, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "rg-fd-2", restaurantName: "Shuvolong Hill Lunch", phoneNumber: "+880 1800-981200", location: "Shuvolong", description: "View restaurant near Shuvolong waterfall.", heroImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80", sortOrder: 2, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "rg-fd-3", restaurantName: "Kaptai Tea & Snacks", phoneNumber: "", location: "Kaptai Lake", description: "Tea stalls with pitha around the lake promenade.", heroImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80", sortOrder: 3, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "rg-fd-4", restaurantName: "Hanging Bridge Cafe", phoneNumber: "+880 1700-982300", location: "Hanging Bridge", description: "Rooftop cafe with lake-facing terrace seating.", heroImage: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=80", sortOrder: 4, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "rg-fd-5", restaurantName: "Tribal Bazaar Food", phoneNumber: "+880 1900-983400", location: "Bana Rashobari", description: "Hand-milled rice and local curries at tribal eateries.", heroImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80", sortOrder: 5, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
    { id: "rg-fd-6", restaurantName: "Rangamati Sweet House", phoneNumber: "+880 1700-984500", location: "Rangamati Central", description: "Traditional Bangladeshi sweets and gift boxes.", heroImage: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80", sortOrder: 6, isActive: true, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP },
  ],
};

type StoreState = {
  summaries: AdminLocationSummary[];
  transportMap: Record<string, AdminTransportItem[]>;
  foodMap: Record<string, AdminFoodItem[]>;
};

let memoryLocations: AdminLocationSummary[] = cloneDeep(seedLocations);
let memoryTransportMap: Record<string, AdminTransportItem[]> = cloneDeep(seedTransportMap);
let memoryFoodMap: Record<string, AdminFoodItem[]> = cloneDeep(seedFoodMap);

function getSeedState(): StoreState {
  return {
    summaries: cloneDeep(seedLocations),
    transportMap: cloneDeep(seedTransportMap),
    foodMap: cloneDeep(seedFoodMap),
  };
}

function readStore(): StoreState {
  if (isBrowser) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoreState;
        if (parsed && Array.isArray(parsed.summaries) && parsed.transportMap && parsed.foodMap) {
          return parsed;
        }
      }
    } catch (err) {
    }
    const seed = getSeedState();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    } catch (err) {
    }
    return seed;
  }
  return {
    summaries: cloneDeep(memoryLocations),
    transportMap: cloneDeep(memoryTransportMap),
    foodMap: cloneDeep(memoryFoodMap),
  };
}

function writeStore(state: StoreState): void {
  if (isBrowser) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
    }
  } else {
    memoryLocations = cloneDeep(state.summaries);
    memoryTransportMap = cloneDeep(state.transportMap);
    memoryFoodMap = cloneDeep(state.foodMap);
  }
}

function notifyUpdate(): void {
  if (isBrowser) {
    try {
      window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
    } catch (err) {
    }
  }
}

function sortSummaries(list: AdminLocationSummary[]): AdminLocationSummary[] {
  return [...list].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function sortTransportItems(list: AdminTransportItem[]): AdminTransportItem[] {
  return [...list].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function sortFoodItems(list: AdminFoodItem[]): AdminFoodItem[] {
  return [...list].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getAdminLocations(params: { isActive?: boolean } = {}): AdminLocationSummary[] {
  const state = readStore();
  let results = state.summaries;

  if (typeof params.isActive === "boolean") {
    results = results.filter((loc) => loc.isActive === params.isActive);
  }

  const withCounts = results.map((loc) => {
    const transportCount = (state.transportMap[loc.id] || []).length;
    const foodCount = (state.foodMap[loc.id] || []).length;
    return { ...loc, transportServicesCount: transportCount, foodRestaurantsCount: foodCount };
  });

  return sortSummaries(withCounts);
}

export function getAdminLocation(locationId: string): AdminLocationDetail | null {
  const state = readStore();
  const summary = state.summaries.find((loc) => loc.id === locationId);
  if (!summary) return null;

  const transportItems = sortTransportItems(state.transportMap[locationId] || []);
  const foodItems = sortFoodItems(state.foodMap[locationId] || []);

  return {
    ...summary,
    transportServicesCount: transportItems.length,
    foodRestaurantsCount: foodItems.length,
    transportItems,
    foodItems,
  };
}

export function getPublicPills() {
  const active = getAdminLocations({ isActive: true });
  return active.map((loc) => ({
    id: loc.id,
    name: loc.name,
    slug: loc.slug,
    city: loc.city,
    country: loc.country,
    heroImage: loc.heroImage,
    sortOrder: loc.sortOrder,
  }));
}

export function getPublicDestination(slug: string): AdminLocationDetail | null {
  const state = readStore();
  const summary = state.summaries.find((loc) => loc.slug === slug && loc.isActive);
  if (!summary) return null;

  const transportItems = sortTransportItems(
    (state.transportMap[summary.id] || []).filter((t) => t.isActive),
  );
  const foodItems = sortFoodItems(
    (state.foodMap[summary.id] || []).filter((f) => f.isActive),
  );

  return {
    ...summary,
    transportServicesCount: transportItems.length,
    foodRestaurantsCount: foodItems.length,
    transportItems,
    foodItems,
  };
}

export function upsertAdminLocation(
  id: string | null | undefined,
  payload: UpsertAdminLocationPayload,
): AdminLocationSummary {
  const state = readStore();
  const now = new Date().toISOString();

  let target: AdminLocationSummary;

  if (id) {
    const existing = state.summaries.find((loc) => loc.id === id);
    if (!existing) {
      throw new Error(`Location not found: ${id}`);
    }
    target = { ...existing, ...payload, updatedAt: now };
    state.summaries = state.summaries.map((loc) => (loc.id === id ? target : loc));
  } else {
    let slug = payload.slug ? slugify(payload.slug) : slugify(payload.name || "destination");
    let slugCandidate = slug;
    let collisionCounter = 2;
    while (state.summaries.some((loc) => loc.slug === slugCandidate)) {
      slugCandidate = `${slug}-${collisionCounter}`;
      collisionCounter++;
    }

    const newId = generateId("loc");
    target = {
      id: newId,
      name: payload.name || "",
      slug: slugCandidate,
      city: payload.city || "",
      country: payload.country || "",
      description: payload.description ?? null,
      heroImage: payload.heroImage ?? null,
      isActive: payload.isActive ?? true,
      sortOrder: payload.sortOrder ?? state.summaries.length + 1,
      transportSectionTitle: payload.transportSectionTitle || "Transportation Services",
      transportSectionSubtitle:
        payload.transportSectionSubtitle || "Local transport companies and contact details",
      foodSectionTitle: payload.foodSectionTitle || "Food & Restaurants",
      foodSectionSubtitle:
        payload.foodSectionSubtitle || "Recommended restaurants near this location",
      transportHeroImage: payload.transportHeroImage ?? null,
      foodHeroImage: payload.foodHeroImage ?? null,
      transportServicesCount: 0,
      foodRestaurantsCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    state.summaries = [...state.summaries, target];
    state.transportMap[newId] = [];
    state.foodMap[newId] = [];
  }

  writeStore(state);
  notifyUpdate();
  return { ...target };
}

export function deleteAdminLocation(id: string): void {
  const state = readStore();
  state.summaries = state.summaries.filter((loc) => loc.id !== id);
  delete state.transportMap[id];
  delete state.foodMap[id];
  writeStore(state);
  notifyUpdate();
}

export function upsertTransport(
  locationId: string,
  id: string | null | undefined,
  payload: UpsertAdminTransportPayload,
): AdminTransportItem {
  const state = readStore();
  const location = state.summaries.find((loc) => loc.id === locationId);
  if (!location) {
    throw new Error(`Location not found: ${locationId}`);
  }
  if (!state.transportMap[locationId]) {
    state.transportMap[locationId] = [];
  }

  const now = new Date().toISOString();
  let target: AdminTransportItem;

  if (id) {
    const existing = state.transportMap[locationId].find((t) => t.id === id);
    if (!existing) {
      throw new Error(`Transport item not found: ${id}`);
    }
    target = { ...existing, ...payload, updatedAt: now };
    state.transportMap[locationId] = state.transportMap[locationId].map((t) =>
      t.id === id ? target : t,
    );
  } else {
    const items = state.transportMap[locationId];
    target = {
      id: generateId("tr"),
      companyName: payload.companyName || "",
      contactNumber: payload.contactNumber || "",
      description: payload.description || "",
      heroImage: payload.heroImage ?? null,
      sortOrder: payload.sortOrder ?? items.length + 1,
      isActive: payload.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    state.transportMap[locationId] = [...items, target];
  }

  writeStore(state);
  notifyUpdate();
  return { ...target };
}

export function deleteTransport(locationId: string, id: string): void {
  const state = readStore();
  if (state.transportMap[locationId]) {
    state.transportMap[locationId] = state.transportMap[locationId].filter((t) => t.id !== id);
  }
  writeStore(state);
  notifyUpdate();
}

export function upsertFood(
  locationId: string,
  id: string | null | undefined,
  payload: UpsertAdminFoodPayload,
): AdminFoodItem {
  const state = readStore();
  const location = state.summaries.find((loc) => loc.id === locationId);
  if (!location) {
    throw new Error(`Location not found: ${locationId}`);
  }
  if (!state.foodMap[locationId]) {
    state.foodMap[locationId] = [];
  }

  const now = new Date().toISOString();
  let target: AdminFoodItem;

  if (id) {
    const existing = state.foodMap[locationId].find((f) => f.id === id);
    if (!existing) {
      throw new Error(`Food item not found: ${id}`);
    }
    target = { ...existing, ...payload, updatedAt: now };
    state.foodMap[locationId] = state.foodMap[locationId].map((f) => (f.id === id ? target : f));
  } else {
    const items = state.foodMap[locationId];
    target = {
      id: generateId("fd"),
      restaurantName: payload.restaurantName || "",
      phoneNumber: payload.phoneNumber || "",
      location: payload.location || "",
      description: payload.description || "",
      heroImage: payload.heroImage ?? null,
      sortOrder: payload.sortOrder ?? items.length + 1,
      isActive: payload.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    state.foodMap[locationId] = [...items, target];
  }

  writeStore(state);
  notifyUpdate();
  return { ...target };
}

export function deleteFood(locationId: string, id: string): void {
  const state = readStore();
  if (state.foodMap[locationId]) {
    state.foodMap[locationId] = state.foodMap[locationId].filter((f) => f.id !== id);
  }
  writeStore(state);
  notifyUpdate();
}

export function subscribe(callback: () => void): () => void {
  if (!isBrowser) {
    return () => {};
  }
  const handler = () => callback();
  window.addEventListener(UPDATE_EVENT, handler);
  return () => {
    window.removeEventListener(UPDATE_EVENT, handler);
  };
}
