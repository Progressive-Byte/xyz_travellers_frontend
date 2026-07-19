export type HostNavIcon =
  | "dashboard"
  | "add-property"
  | "properties"
  | "reservations"
  | "messages"
  | "reviews"
  | "earnings"
  | "businesses"
  | "profile"
  | "payouts";

export type HostNavGroupKey = "Main" | "Operations" | "Setup";

export type HostNavItem = {
  label: string;
  href: string;
  icon: HostNavIcon;
  group: HostNavGroupKey;
  isLive: boolean;
  description: string;
};

export const hostNavigationItems: HostNavItem[] = [
  {
    label: "Dashboard",
    href: "/host/dashboard",
    icon: "dashboard",
    group: "Main",
    isLive: true,
    description: "Overview of hosting performance and current activity.",
  },
  {
    label: "Add Property",
    href: "/host/properties/new",
    icon: "add-property",
    group: "Main",
    isLive: true,
    description: "Start a new listing draft and continue through the add-property workflow.",
  },
  {
    label: "Properties",
    href: "/host/properties",
    icon: "properties",
    group: "Main",
    isLive: true,
    description: "Manage listing drafts, statuses, and existing properties in one place.",
  },
  {
    label: "Reservations",
    href: "/host/reservations",
    icon: "reservations",
    group: "Main",
    isLive: true,
    description: "Review upcoming stays, guest details, and calendar activity.",
  },
  {
    label: "Messages",
    href: "/host/messages",
    icon: "messages",
    group: "Main",
    isLive: true,
    description: "Keep guest conversations and replies organized.",
  },
  {
    label: "Reviews",
    href: "/host/reviews",
    icon: "reviews",
    group: "Operations",
    isLive: true,
    description: "Track property feedback and guest-review history from completed stays.",
  },
  {
    label: "Earnings",
    href: "/host/earnings",
    icon: "earnings",
    group: "Operations",
    isLive: true,
    description: "Track revenue, commissions, and payout history.",
  },
  {
    label: "Host Profile",
    href: "/host/profile",
    icon: "profile",
    group: "Setup",
    isLive: true,
    description: "Update your host identity, contact details, photo, and bio.",
  },
  {
    label: "Businesses",
    href: "/host/businesses",
    icon: "businesses",
    group: "Setup",
    isLive: true,
    description: "Manage reusable business profiles and business documents for commercial properties.",
  },
  {
    label: "Payouts",
    href: "/host/payouts",
    icon: "payouts",
    group: "Operations",
    isLive: true,
    description: "Manage payout setup, historical disbursements, and payout readiness.",
  },
];

export const hostNavigationGroups: HostNavGroupKey[] = ["Main", "Operations", "Setup"];

export const isHostNavItemActive = (pathname: string, href: string) => {
  if (href === "/host/properties") {
    return pathname === href;
  }

  if (href === "/host/properties/new") {
    return pathname === href || /^\/host\/properties\/[^/]+\/(edit|media|units|pricing|calendar|verification)$/.test(pathname);
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export const getHostPageMeta = (pathname: string) => {
  const activeItem = hostNavigationItems.find((item) => isHostNavItemActive(pathname, item.href));

  if (!activeItem) {
    return {
      title: "Host portal",
      subtitle: "Manage listings, reservations, guest communication, and payouts.",
    };
  }

  return {
    title: activeItem.label,
    subtitle: activeItem.description,
  };
};
