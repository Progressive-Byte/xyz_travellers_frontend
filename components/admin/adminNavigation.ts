export type AdminNavIcon = "dashboard" | "applications" | "homepage";
export type AdminNavGroupKey = "Main";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: AdminNavIcon;
  group: AdminNavGroupKey;
  description: string;
};

export const adminNavigationItems: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "dashboard",
    group: "Main",
    description: "Review admin priorities and jump into moderation or homepage curation.",
  },
  {
    label: "Host Applications",
    href: "/admin/host-applications",
    icon: "applications",
    group: "Main",
    description: "Approve or reject host applications using the documented admin review endpoint.",
  },
  {
    label: "Homepage Curation",
    href: "/admin/homepage-sections",
    icon: "homepage",
    group: "Main",
    description: "Manage homepage sections and curate approved properties into them.",
  },
];

export const adminNavigationGroups: AdminNavGroupKey[] = ["Main"];

export const isAdminNavItemActive = (pathname: string, href: string) => {
  if (href === "/admin") {
    return pathname === "/admin" || pathname === "/admin/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export const getAdminPageMeta = (pathname: string) => {
  const activeItem = adminNavigationItems.find((item) => isAdminNavItemActive(pathname, item.href));

  if (!activeItem) {
    return {
      title: "Admin Portal",
      subtitle: "Moderate host access and curate homepage sections from one compact workspace.",
    };
  }

  return {
    title: activeItem.label,
    subtitle: activeItem.description,
  };
};
