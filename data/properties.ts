export type PropertyRail = "new-arrivals" | "bangladesh-getaways";

export type PropertyImage = {
  src: string;
  alt: string;
};

export type PropertyHost = {
  name: string;
  initials: string;
  tagline: string;
  languages: string[];
  note: string;
  isVerified: boolean;
};

export type PropertyReview = {
  id: string;
  author: string;
  date: string;
  rating: number;
  comment: string;
};

export type PropertyMapInfo = {
  area: string;
  city: string;
  summary: string;
  landmarks: string[];
};

export type Property = {
  id: number;
  slug: string;
  rail: PropertyRail;
  title: string;
  location: string;
  shortLocation: string;
  pricePerNight: number;
  rating?: number;
  reviewCount: number;
  isNew?: boolean;
  featuredBadge?: string;
  category: string;
  propertyType: string;
  bedroomCount: number;
  bathroomCount: number;
  guestCount: number;
  summary: string;
  description: string[];
  highlights: string[];
  facilities: string[];
  houseRules: string[];
  host: PropertyHost;
  gallery: PropertyImage[];
  map: PropertyMapInfo;
  reviews: PropertyReview[];
};

const buildPropertyImage = (prompt: string, imageSize: string) =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${encodeURIComponent(imageSize)}`;

const createGallery = (title: string, prompts: string[]): PropertyImage[] =>
  prompts.map((prompt, index) => ({
    src: buildPropertyImage(prompt, index === 0 ? "landscape_16_9" : "landscape_4_3"),
    alt: `${title} photo ${index + 1}`,
  }));

export const properties: Property[] = [
  {
    id: 1,
    slug: "cozy-apartment-bashundhara",
    rail: "new-arrivals",
    title: "Cozy Apartment",
    location: "Bashundhara, Dhaka",
    shortLocation: "Bashundhara",
    pricePerNight: 4999,
    rating: 4.8,
    reviewCount: 18,
    isNew: true,
    featuredBadge: "Fresh pick",
    category: "Apartment",
    propertyType: "Entire apartment",
    bedroomCount: 2,
    bathroomCount: 2,
    guestCount: 4,
    summary:
      "A bright, quiet apartment with warm finishes and a practical layout for short city stays.",
    description: [
      "This apartment is designed for guests who want an easy, polished stay close to the everyday convenience of Bashundhara. The living area feels open and calm, with soft daylight, clean furnishings, and enough room to work or unwind comfortably.",
      "Bedrooms are simple and restful, while the kitchen and dining setup make longer stays feel manageable. It works well for couples, small families, and professionals who want a tidy base without the feel of a generic hotel room.",
    ],
    highlights: [
      "Walkable access to daily essentials, cafes, and neighborhood services",
      "Balanced layout with a comfortable lounge, dining corner, and private bedrooms",
      "Good fit for short city breaks, relocation stays, or light business travel",
    ],
    facilities: [
      "Fast Wi-Fi",
      "Air conditioning",
      "Hot water",
      "Kitchen",
      "Dining area",
      "Dedicated workspace",
      "Smart TV",
      "Elevator access",
    ],
    houseRules: [
      "Check-in after 2:00 PM",
      "Check-out before 11:00 AM",
      "No smoking indoors",
      "Quiet hours after 10:00 PM",
    ],
    host: {
      name: "Nafisa Rahman",
      initials: "NR",
      tagline: "Local host in Dhaka",
      languages: ["Bangla", "English"],
      note:
        "I focus on creating calm, reliable stays for guests who value clean spaces, quick help, and clear communication before arrival.",
      isVerified: true,
    },
    gallery: createGallery("Cozy Apartment", [
      "bright modern apartment interior in dhaka, cream walls, cozy sofa, wood coffee table, warm daylight, realistic photo",
      "cozy living room corner with lounge chair, framed art, apartment interior, realistic photo",
      "minimal bedroom with soft textures, neutral bedding, sunlight through curtains, realistic photo",
      "clean apartment dining area with wood table and soft pendant light, realistic photo",
      "modern apartment kitchen with warm white palette and tidy shelves, realistic photo",
    ]),
    map: {
      area: "Bashundhara",
      city: "Dhaka",
      summary:
        "Set inside a calm residential pocket with reliable access to grocery stores, cafes, and major roads.",
      landmarks: ["Jamuna Future Park", "North South University", "Airport road access"],
    },
    reviews: [
      {
        id: "cozy-apartment-review-1",
        author: "Shihab A.",
        date: "May 2026",
        rating: 5,
        comment:
          "Everything felt exactly as shown. The apartment was bright, clean, and very easy to settle into for a week-long stay.",
      },
      {
        id: "cozy-apartment-review-2",
        author: "Maliha T.",
        date: "April 2026",
        rating: 4.6,
        comment:
          "The host was responsive and the place felt comfortable for both work and rest. The location was convenient without being noisy.",
      },
    ],
  },
  {
    id: 2,
    slug: "modern-stay-uttara-sector-9",
    rail: "new-arrivals",
    title: "Modern Stay",
    location: "Uttara | Sector 9, Dhaka",
    shortLocation: "Uttara",
    pricePerNight: 6999,
    rating: 4.9,
    reviewCount: 24,
    isNew: true,
    featuredBadge: "Guest favorite",
    category: "Apartment",
    propertyType: "Entire serviced stay",
    bedroomCount: 3,
    bathroomCount: 2,
    guestCount: 5,
    summary:
      "A more spacious city stay with refined interiors, strong natural light, and an easy layout for families or small groups.",
    description: [
      "This Uttara property is built around a brighter, more open living experience. The main lounge feels polished but relaxed, and the overall layout gives guests enough room to spread out without losing the sense of warmth.",
      "It works especially well for family stays, returning travelers, or visiting teams who want a more premium environment with a neighborhood feel. The finishes are contemporary, while the overall tone stays calm and practical.",
    ],
    highlights: [
      "Spacious living zone with a stronger premium finish than a standard rental",
      "Three-bedroom setup that works well for family or team stays",
      "Well-connected Uttara location with easy airport-side access",
    ],
    facilities: [
      "Fast Wi-Fi",
      "Air conditioning",
      "Washer",
      "Kitchen",
      "Balcony",
      "Dining area",
      "Smart TV",
      "On-call support",
    ],
    houseRules: [
      "Check-in after 1:00 PM",
      "Check-out before 11:30 AM",
      "No parties or events",
      "Please share guest count before arrival",
    ],
    host: {
      name: "Ahmed Kabir",
      initials: "AK",
      tagline: "Verified city host",
      languages: ["Bangla", "English", "Hindi"],
      note:
        "I host guests who want a polished city stay with clear communication and fast support if anything comes up.",
      isVerified: true,
    },
    gallery: createGallery("Modern Stay", [
      "premium serviced apartment interior in uttara dhaka, elegant sofa, warm wood accents, airy daylight, realistic photo",
      "refined dining and lounge area inside modern apartment, neutral palette, realistic photo",
      "stylish master bedroom interior with layered bedding and soft light, realistic photo",
      "contemporary bathroom with clean tile, mirror lighting, realistic photo",
      "apartment balcony with city light and seating nook, realistic photo",
    ]),
    map: {
      area: "Sector 9, Uttara",
      city: "Dhaka",
      summary:
        "Positioned in a well-known Uttara neighborhood with access to transport links, food options, and airport-side movement.",
      landmarks: ["Hazrat Shahjalal Airport access", "Rajlaxmi area", "Neighborhood cafes"],
    },
    reviews: [
      {
        id: "modern-stay-review-1",
        author: "Tahmid R.",
        date: "June 2026",
        rating: 5,
        comment:
          "A very smooth stay from check-in to checkout. The space felt premium, especially the main living area and bedrooms.",
      },
      {
        id: "modern-stay-review-2",
        author: "Sadia N.",
        date: "May 2026",
        rating: 4.8,
        comment:
          "Well located for Uttara, easy to reach, and nicely maintained. It felt more curated than most short-stay apartments.",
      },
    ],
  },
  {
    id: 3,
    slug: "diplomatic-zone-baridhara",
    rail: "new-arrivals",
    title: "Diplomatic Zone",
    location: "Baridhara | Diplomatic Zone, Dhaka",
    shortLocation: "Baridhara",
    pricePerNight: 12959,
    rating: 5,
    reviewCount: 11,
    isNew: true,
    featuredBadge: "Top rated",
    category: "Luxury stay",
    propertyType: "Executive residence",
    bedroomCount: 3,
    bathroomCount: 3,
    guestCount: 6,
    summary:
      "A high-comfort residence with quieter surroundings, premium textures, and a more elevated hosting experience.",
    description: [
      "This stay is designed for guests who want a quieter, more premium setting with a refined interior language. The materials and lighting feel warmer and more intentional, while the layout still stays practical for longer bookings.",
      "The property is especially well suited for executive travel, embassy-adjacent visits, or guests who want a dependable higher-end option in a calm part of the city.",
    ],
    highlights: [
      "Premium finish level with a calmer, more private atmosphere",
      "Strong fit for executive stays and longer, higher-comfort visits",
      "Well-positioned for Baridhara and the diplomatic zone surroundings",
    ],
    facilities: [
      "High-speed Wi-Fi",
      "Air conditioning",
      "Premium linens",
      "Workspace",
      "Dining space",
      "Driver assistance on request",
      "Backup power",
      "Housekeeping support",
    ],
    houseRules: [
      "Check-in after 2:00 PM",
      "Check-out before 12:00 PM",
      "No pets",
      "ID required before check-in",
    ],
    host: {
      name: "Farzana Iqbal",
      initials: "FI",
      tagline: "Executive stay host",
      languages: ["Bangla", "English"],
      note:
        "My focus is comfort, privacy, and a smoother arrival experience for guests booking higher-end city stays.",
      isVerified: true,
    },
    gallery: createGallery("Diplomatic Zone", [
      "luxury executive bedroom interior in dhaka, premium textures, layered lighting, realistic photo",
      "elegant sitting area with warm wood and stone accents, realistic photo",
      "premium dining space with clean modern table styling, realistic photo",
      "refined bathroom with upscale finishes and soft lighting, realistic photo",
      "quiet residence balcony with green city outlook, realistic photo",
    ]),
    map: {
      area: "Diplomatic Zone",
      city: "Dhaka",
      summary:
        "Located in one of the quieter, more established parts of the city, with convenient access to diplomatic and business zones.",
      landmarks: ["Baridhara DOHS access", "Embassy area", "Gulshan link roads"],
    },
    reviews: [
      {
        id: "diplomatic-zone-review-1",
        author: "Reza C.",
        date: "June 2026",
        rating: 5,
        comment:
          "This was one of the most polished stays I have booked locally. The place felt calm, private, and professionally managed.",
      },
      {
        id: "diplomatic-zone-review-2",
        author: "Anika S.",
        date: "March 2026",
        rating: 5,
        comment:
          "Excellent comfort level and the host handled the arrival details very well. I would book again for a work trip.",
      },
    ],
  },
  {
    id: 11,
    slug: "triplex-apartment-bashundhara",
    rail: "bangladesh-getaways",
    title: "Triplex Apartment",
    location: "Triplex Apartment, Bashundhara",
    shortLocation: "Bashundhara",
    pricePerNight: 18500,
    rating: 5,
    reviewCount: 9,
    featuredBadge: "Large group stay",
    category: "Family stay",
    propertyType: "Triplex home",
    bedroomCount: 4,
    bathroomCount: 4,
    guestCount: 8,
    summary:
      "A larger-format stay with multiple living zones, suitable for family bookings and longer group visits.",
    description: [
      "This triplex property is designed for guests who need more room than a standard apartment can offer. Multiple levels create separation between rest, dining, and shared time, which helps larger groups stay comfortable.",
      "The overall atmosphere remains warm and modern rather than formal, making it a strong option for family occasions, holiday visits, or longer city stays where space really matters.",
    ],
    highlights: [
      "Multi-level home with better separation for groups and families",
      "Large common areas that make longer stays easier to manage",
      "Premium residential feel without losing everyday practicality",
    ],
    facilities: [
      "Fast Wi-Fi",
      "Air conditioning",
      "Large kitchen",
      "Family dining space",
      "Private balconies",
      "Laundry area",
      "TV lounge",
      "Car parking",
    ],
    houseRules: [
      "Check-in after 2:00 PM",
      "Check-out before 11:00 AM",
      "No loud gatherings after 10:00 PM",
      "Please coordinate parking before arrival",
    ],
    host: {
      name: "Samiha Karim",
      initials: "SK",
      tagline: "Family stay host",
      languages: ["Bangla", "English"],
      note:
        "I host many family and reunion stays, so I try to make arrival, room setup, and communication as straightforward as possible.",
      isVerified: true,
    },
    gallery: createGallery("Triplex Apartment", [
      "large triplex home interior, family lounge with warm lighting and premium finishes, realistic photo",
      "wide dining room inside modern family home, realistic photo",
      "bright bedroom with layered textures and city-home aesthetic, realistic photo",
      "spacious staircase and hallway inside premium triplex apartment, realistic photo",
      "comfortable family tv room with sectional sofa, realistic photo",
    ]),
    map: {
      area: "Bashundhara",
      city: "Dhaka",
      summary:
        "Located in a residential part of Bashundhara with enough quiet for family stays while staying close to everyday conveniences.",
      landmarks: ["Residential parks", "Local cafes", "Shopping access"],
    },
    reviews: [
      {
        id: "triplex-review-1",
        author: "Jannat H.",
        date: "February 2026",
        rating: 5,
        comment:
          "Very comfortable for a larger family. The extra space made a big difference and the house felt well maintained.",
      },
      {
        id: "triplex-review-2",
        author: "Nabil M.",
        date: "January 2026",
        rating: 5,
        comment:
          "A strong option for group travel. We appreciated the clean setup and the fact that the common areas never felt cramped.",
      },
    ],
  },
  {
    id: 12,
    slug: "premium-stay-dhanmondi",
    rail: "bangladesh-getaways",
    title: "Premium Stay",
    location: "Dhanmondi, Dhaka",
    shortLocation: "Dhanmondi",
    pricePerNight: 7500,
    rating: 5,
    reviewCount: 31,
    featuredBadge: "Most booked",
    category: "City stay",
    propertyType: "Entire apartment",
    bedroomCount: 3,
    bathroomCount: 3,
    guestCount: 6,
    summary:
      "A warm, balanced Dhanmondi stay that combines polished interiors with a neighborhood location guests already know and trust.",
    description: [
      "This property is built for guests who want a more composed apartment stay in one of Dhaka's most familiar neighborhoods. The interior has a modern cream-and-wood palette with enough softness to feel relaxed rather than overly styled.",
      "It suits both family and business stays, especially for travelers who want easy access to Dhanmondi's dining, retail, and daily movement without sacrificing comfort inside the home.",
    ],
    highlights: [
      "Popular Dhanmondi location with a strong balance of access and comfort",
      "Three-bedroom setup with polished but approachable interiors",
      "Well suited for both families and professional guests",
    ],
    facilities: [
      "Fast Wi-Fi",
      "Air conditioning",
      "Kitchen",
      "Dining table",
      "Filtered water",
      "Lift access",
      "Smart TV",
      "Housekeeping on request",
    ],
    houseRules: [
      "Check-in after 1:30 PM",
      "Check-out before 11:00 AM",
      "No smoking indoors",
      "Registered guests only",
    ],
    host: {
      name: "Afsana Noor",
      initials: "AN",
      tagline: "Trusted Dhanmondi host",
      languages: ["Bangla", "English"],
      note:
        "I focus on clean presentation, responsive support, and a calm hosting experience that works for both short and longer bookings.",
      isVerified: true,
    },
    gallery: createGallery("Premium Stay", [
      "bright airy premium apartment interior in dhanmondi, cream and wood palette, realistic photo",
      "refined lounge area with soft daylight and layered textures, realistic photo",
      "minimal yet warm bedroom interior with modern styling, realistic photo",
      "dining corner in elegant city apartment, realistic photo",
      "clean and bright kitchen with warm cabinetry, realistic photo",
    ]),
    map: {
      area: "Dhanmondi",
      city: "Dhaka",
      summary:
        "Set in a central city neighborhood with strong access to restaurants, medical facilities, and daily essentials.",
      landmarks: ["Dhanmondi Lake area", "City dining options", "Hospital access"],
    },
    reviews: [
      {
        id: "premium-stay-review-1",
        author: "Sabbir U.",
        date: "June 2026",
        rating: 5,
        comment:
          "Clean, polished, and exactly what we needed for a family visit. The area is familiar and very convenient.",
      },
      {
        id: "premium-stay-review-2",
        author: "Mehnaz P.",
        date: "April 2026",
        rating: 4.9,
        comment:
          "The space felt premium without being overdone. Great overall comfort level and easy communication with the host.",
      },
    ],
  },
  {
    id: 14,
    slug: "family-apartment-banasree",
    rail: "bangladesh-getaways",
    title: "Family Apartment",
    location: "Banasree, Dhaka",
    shortLocation: "Banasree",
    pricePerNight: 7000,
    rating: 4.9,
    reviewCount: 16,
    category: "Family stay",
    propertyType: "Entire apartment",
    bedroomCount: 3,
    bathroomCount: 2,
    guestCount: 5,
    summary:
      "A practical and comfortable family apartment with a welcoming layout and a reliable everyday neighborhood feel.",
    description: [
      "This apartment is arranged around family comfort: generous shared seating, a useful dining setup, and bedrooms that support both short and medium-length stays. It feels lived-in and comfortable without sacrificing a clean, organized presentation.",
      "Guests who want a calmer residential part of the city tend to appreciate the balance here. It is especially helpful for family visits, relocation stays, or hosting relatives in a better setup than a hotel room.",
    ],
    highlights: [
      "Family-friendly layout with strong day-to-day usability",
      "Clean, comfortable interiors with a softer residential feel",
      "A practical option for medium-length Dhaka stays",
    ],
    facilities: [
      "Fast Wi-Fi",
      "Air conditioning",
      "Kitchen",
      "Dining room",
      "Hot water",
      "Laundry support",
      "TV",
      "Family seating area",
    ],
    houseRules: [
      "Check-in after 2:00 PM",
      "Check-out before 11:30 AM",
      "No pets",
      "Please respect building quiet hours",
    ],
    host: {
      name: "Helal Uddin",
      initials: "HU",
      tagline: "Neighborhood family host",
      languages: ["Bangla", "English"],
      note:
        "I try to make family stays feel simple, especially for guests arriving with children or staying for several days.",
      isVerified: true,
    },
    gallery: createGallery("Family Apartment", [
      "comfortable family apartment living room in dhaka with sofa and television, warm evening light, realistic photo",
      "family dining room with simple modern styling, realistic photo",
      "bright secondary bedroom with clean linens, realistic photo",
      "compact but tidy kitchen in family apartment, realistic photo",
      "relaxed master bedroom with warm neutral decor, realistic photo",
    ]),
    map: {
      area: "Banasree",
      city: "Dhaka",
      summary:
        "Located in a residential area favored for longer local stays, with daily essentials and transport access nearby.",
      landmarks: ["Residential market", "Main road access", "Nearby food spots"],
    },
    reviews: [
      {
        id: "family-apartment-review-1",
        author: "Raisa K.",
        date: "May 2026",
        rating: 5,
        comment:
          "The layout was very convenient for our family and the apartment felt clean and easy to live in for several days.",
      },
      {
        id: "family-apartment-review-2",
        author: "Fahim A.",
        date: "March 2026",
        rating: 4.8,
        comment:
          "A solid choice for a residential-style stay. The host was helpful and the place felt exactly as described.",
      },
    ],
  },
];

export const getPropertiesByRail = (rail: PropertyRail): Property[] =>
  properties.filter((property) => property.rail === rail);

export const getPropertyBySlug = (slug: string): Property | undefined =>
  properties.find((property) => property.slug === slug);

export const getRelatedProperties = (property: Property, limit = 3): Property[] =>
  properties
    .filter((candidate) => candidate.slug !== property.slug)
    .sort((a, b) => {
      const aScore =
        Number(a.category === property.category) +
        Number(a.shortLocation === property.shortLocation) +
        Number(a.propertyType === property.propertyType);
      const bScore =
        Number(b.category === property.category) +
        Number(b.shortLocation === property.shortLocation) +
        Number(b.propertyType === property.propertyType);

      return bScore - aScore;
    })
    .slice(0, limit);
