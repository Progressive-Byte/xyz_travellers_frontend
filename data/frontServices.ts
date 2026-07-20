export type FrontService = {
  slug: string;
  homeTitle: string;
  homeDescription: string;
  detailTitle: string;
  detailDescription: string;
  homeButtonLabel: string;
  detailButtonLabel: string;
  accent: string;
};

export const frontServices: FrontService[] = [
  {
    slug: "tanguar-haor-sundarbans-tour",
    homeTitle: "Tour to Tanguar Haor & Sundarbans",
    homeDescription:
      "Discover unforgettable journeys to Tanguar Haor and the Sundarbans with carefully planned tours, experienced guides, and hassle-free travel arrangements.",
    detailTitle: "Explore Bangladesh's Natural Wonders",
    detailDescription:
      "Discover unforgettable journeys to Tanguar Haor and the Sundarbans with carefully planned tours, experienced guides, and hassle-free travel arrangements.",
    homeButtonLabel: "Learn More",
    detailButtonLabel: "Book Your Tour",
    accent: "from-[#D4EA43]/24 via-[#D4EA43]/10 to-transparent",
  },
  {
    slug: "event-management-programs",
    homeTitle: "Event Management for Your Programs",
    homeDescription:
      "From corporate events and educational tours to cultural programs and conferences, we handle every detail so you can focus on your guests.",
    detailTitle: "Professional Event Management",
    detailDescription:
      "From corporate events and educational tours to cultural programs and conferences, we handle every detail so you can focus on your guests.",
    homeButtonLabel: "Learn More",
    detailButtonLabel: "Plan Your Event",
    accent: "from-[#B7C7F8]/20 via-[#B7C7F8]/8 to-transparent",
  },
  {
    slug: "transport-booking-programs",
    homeTitle: "Transport Booking for Your Programs",
    homeDescription:
      "Book comfortable, safe, and dependable transportation for tours, corporate events, educational trips, and group travel of any size.",
    detailTitle: "Reliable Transport Solutions",
    detailDescription:
      "Book comfortable, safe, and dependable transportation for tours, corporate events, educational trips, and group travel of any size.",
    homeButtonLabel: "Learn More",
    detailButtonLabel: "Book Transportation",
    accent: "from-[#F3D4A5]/24 via-[#F3D4A5]/10 to-transparent",
  },
];

export const getFrontServiceBySlug = (slug: string) =>
  frontServices.find((service) => service.slug === slug);
