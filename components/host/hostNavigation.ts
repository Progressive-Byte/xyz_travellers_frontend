export type HostNavIcon =
  | "dashboard"
  | "add-property"
  | "properties"
  | "reservations"
  | "messages"
  | "earnings"
  | "profile"
  | "payouts";

export type HostNavGroupKey = "Main" | "Setup";

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
    label: "Properties",
    href: "/host/properties",
    icon: "properties",
    group: "Main",
    isLive: false,
    description: "Manage all listings and availability in one place.",
  },
  {
    label: "Reservations",
    href: "/host/reservations",
    icon: "reservations",
    group: "Main",
    isLive: false,
    description: "Review upcoming stays, guest details, and calendar activity.",
  },
  {
    label: "Messages",
    href: "/host/messages",
    icon: "messages",
    group: "Main",
    isLive: false,
    description: "Keep guest conversations and replies organized.",
  },
  {
    label: "Earnings",
    href: "/host/earnings",
    icon: "earnings",
    group: "Main",
    isLive: false,
    description: "Track revenue, commissions, and payout history.",
  },
  {
    label: "Add Property",
    href: "/host/properties/new",
    icon: "add-property",
    group: "Setup",
    isLive: false,
    description: "Start a new listing setup flow when onboarding tools land.",
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
    label: "Payout Setup",
    href: "/host/payouts",
    icon: "payouts",
    group: "Setup",
    isLive: true,
    description: "Manage payout method, billing details, and readiness for future payouts.",
  },
];

export const hostNavigationGroups: HostNavGroupKey[] = ["Main", "Setup"];

export const isHostNavItemActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

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
