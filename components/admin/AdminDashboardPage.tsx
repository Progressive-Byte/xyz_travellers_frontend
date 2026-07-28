"use client";

import Link from "next/link";
import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";

const dashboardCards = [
  {
    label: "Host Applications",
    title: "Review host applications",
    description:
      "Moderate pending host requests in a searchable review queue and approve or reject from the selected application panel.",
    href: "/admin/host-applications",
    cta: "Open host applications",
  },
  {
    label: "Property Applications",
    title: "Moderate property inventory",
    description:
      "Review property drafts and submissions, inspect the full moderation snapshot, and approve or reject submitted listings.",
    href: "/admin/property-applications",
    cta: "Open property applications",
  },
  {
    label: "Bookings",
    title: "Coordinate guest bookings",
    description:
      "Review booking requests, open the full guest and host contact context, and move bookings through the admin-managed confirmation flow.",
    href: "/admin/bookings",
    cta: "Open bookings",
  },
  {
    label: "Homepage Curation",
    title: "Manage homepage sections",
    description:
      "Create homepage sections, edit section metadata, and manage approved property IDs inside each section.",
    href: "/admin/homepage-sections",
    cta: "Open homepage curation",
  },
  {
    label: "Commission",
    title: "Set payment commission",
    description:
      "Manage the active default commission configuration used when guest booking payments are confirmed.",
    href: "/admin/commission",
    cta: "Open commission settings",
  },
];

export const AdminDashboardPage: React.FC = () => {
  return (
    <AdminShell
      badge="Admin Portal"
      title="Dashboard"
      subtitle="Start from the moderation or curation workspace you need right now."
    >
      <section className="mt-4 grid gap-4 xl:grid-cols-5">
        {dashboardCards.map((card) => (
          <div key={card.href} className="surface-card rounded-[28px] p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
              {card.label}
            </p>
            <h3 className="mt-4 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              {card.title}
            </h3>
            <p className="mt-3 text-[14px] leading-6 text-text-secondary">{card.description}</p>
            <Link
              href={card.href}
              className="mt-6 inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              {card.cta}
            </Link>
          </div>
        ))}
      </section>
    </AdminShell>
  );
};
