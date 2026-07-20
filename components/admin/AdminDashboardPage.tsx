"use client";

import Link from "next/link";
import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";

const dashboardCards = [
  {
    label: "Host Applications",
    title: "Direct review workspace",
    description:
      "Open the admin review action workspace, enter a host user ID, and approve or reject the application using the documented review endpoint.",
    href: "/admin/host-applications",
    cta: "Open host applications",
  },
  {
    label: "Homepage Curation",
    title: "Manage homepage sections",
    description:
      "Create homepage sections, edit section metadata, and manage approved property IDs inside each section.",
    href: "/admin/homepage-sections",
    cta: "Open homepage curation",
  },
];

export const AdminDashboardPage: React.FC = () => {
  return (
    <AdminShell
      badge="Admin Portal"
      title="Dashboard"
      subtitle="Start from the operational workspace you need right now."
    >
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-card rounded-[28px] p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
            Current Scope
          </p>
          <h2 className="mt-4 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            Moderation and homepage control
          </h2>
          <p className="mt-3 max-w-3xl text-[14px] leading-6 text-text-secondary">
            This first admin release is intentionally focused. It covers dedicated admin login, direct
            host application review actions, and homepage section curation with property-level section
            item management.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-border-light bg-surface px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                Auth
              </p>
              <p className="mt-3 text-[14px] font-semibold text-text-primary">Dedicated admin login</p>
            </div>
            <div className="rounded-[22px] border border-border-light bg-surface px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                Review
              </p>
              <p className="mt-3 text-[14px] font-semibold text-text-primary">Approve or reject by user ID</p>
            </div>
            <div className="rounded-[22px] border border-border-light bg-surface px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                Curation
              </p>
              <p className="mt-3 text-[14px] font-semibold text-text-primary">Sections and items</p>
            </div>
          </div>
        </section>

        <section className="surface-card rounded-[28px] p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
            Quick Notes
          </p>
          <div className="mt-4 space-y-3 text-[14px] leading-6 text-text-secondary">
            <p>
              Host application review currently uses the documented direct review endpoint. Because the
              scoped API set does not include a list endpoint, the first workspace lets admins review by
              target user ID.
            </p>
            <p>
              Homepage curation supports both section metadata and section item operations, including
              item sort order and active state.
            </p>
          </div>
        </section>
      </div>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
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
