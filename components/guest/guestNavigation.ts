export type GuestNavIcon =
  | "dashboard"
  | "bookings"
  | "messages"
  | "payments"
  | "wishlist"
  | "profile"
  | "reviews"
  | "safety";

export type GuestNavGroupKey = "Main" | "Account";

export type GuestNavItem = {
  label: string;
  href: string;
  icon: GuestNavIcon;
  group: GuestNavGroupKey;
  isLive: boolean;
  description: string;
};

export const guestNavigationItems: GuestNavItem[] = [
  {
    label: "Dashboard",
    href: "/guest/dashboard",
    icon: "dashboard",
    group: "Main",
    isLive: true,
    description: "Overview of your stays, messages, wishlist, and recent activity.",
  },
  {
    label: "Bookings",
    href: "/guest/bookings",
    icon: "bookings",
    group: "Main",
    isLive: true,
    description: "Review booking requests, confirmed stays, cancellations, and booking details.",
  },
  {
    label: "Messages",
    href: "/guest/messages",
    icon: "messages",
    group: "Main",
    isLive: true,
    description: "Read and manage host conversations connected to your bookings.",
  },
  {
    label: "Payments",
    href: "/guest/payments",
    icon: "payments",
    group: "Main",
    isLive: true,
    description: "Track payment summaries, completed transactions, and refunds.",
  },
  {
    label: "Profile",
    href: "/guest/profile",
    icon: "profile",
    group: "Account",
    isLive: true,
    description: "Update your guest profile details and guest-facing account preferences.",
  },
  {
    label: "Wishlist",
    href: "/guest/wishlist",
    icon: "wishlist",
    group: "Account",
    isLive: true,
    description: "Keep track of saved properties you want to revisit later.",
  },
  {
    label: "Reviews",
    href: "/guest/reviews",
    icon: "reviews",
    group: "Account",
    isLive: true,
    description: "View and manage the reviews you have submitted after completed stays.",
  },
  {
    label: "Safety",
    href: "/guest/safety",
    icon: "safety",
    group: "Account",
    isLive: true,
    description: "Handle reports, blocked users, and guest safety actions.",
  },
];

export const guestNavigationGroups: GuestNavGroupKey[] = ["Main", "Account"];

export const isGuestNavItemActive = (pathname: string, href: string) => {
  if (href === "/guest/bookings") {
    return pathname === href || pathname === "/guest/bookings/new" || pathname.startsWith("/guest/bookings/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export const getGuestPageMeta = (pathname: string) => {
  const activeItem = guestNavigationItems.find((item) => isGuestNavItemActive(pathname, item.href));

  if (!activeItem) {
    return {
      title: "Guest portal",
      subtitle: "Manage bookings, messages, payments, and saved stays in one place.",
    };
  }

  return {
    title: activeItem.label,
    subtitle: activeItem.description,
  };
};
