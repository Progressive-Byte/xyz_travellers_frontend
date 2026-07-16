'use client';

import React from "react";

const features = [
  {
    id: "01",
    title: "Verified stays with clearer trust signals",
    description:
      "Each listing is presented with cleaner details, stronger visuals, and a more confident booking experience built around quality and reliability.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M12 21s-6-4.35-6-10a6 6 0 1112 0c0 5.65-6 10-6 10z" />
        <circle cx="12" cy="11" r="2.5" />
      </svg>
    ),
  },
  {
    id: "02",
    title: "Support that feels human and immediate",
    description:
      "Guests and hosts can move faster with responsive help, thoughtful onboarding, and support that feels local instead of transactional.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M16 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
        <circle cx="9.5" cy="7" r="3" />
        <path d="M22 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 4.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    id: "03",
    title: "Search, book, and host in one smoother flow",
    description:
      "XYZ Travellers simplifies the full journey with a lighter interface, better filtering, and clearer calls to action for both booking and hosting.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    id: "04",
    title: "Better value without extra booking stress",
    description:
      "Guests discover competitive rates while hosts benefit from stronger presentation, easier discovery, and a platform built for repeat trust.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M12 1v22" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7H14.5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
];

const trustPoints = ["Premium presentation", "24/7 support", "Flexible short stays"];

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="section-shell bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-badge">Why XYZ Travellers</span>
          <h2 className="section-heading mt-6">A booking experience designed to feel calmer and more trustworthy</h2>
          <p className="section-subtitle mx-auto mt-5">
            We focus on the details that make short stays feel easier: verified
            spaces, cleaner booking flows, and support that is ready when you need it.
          </p>
          <div className="section-divider mx-auto mt-6" />
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.id}
              className="surface-card-strong hover-lift rounded-panel p-6"
            >
              <div className="flex items-center justify-between">
                <span className="icon-chip">{feature.icon}</span>
                <span className="font-sora text-[22px] font-bold tracking-[-0.05em] text-border">
                  {feature.id}
                </span>
              </div>

              <h3 className="mt-6 text-[19px] font-semibold leading-8 text-text-primary">
                {feature.title}
              </h3>
              <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                {feature.description}
              </p>
            </article>
          ))}
        </div>

        <div className="surface-card mt-10 rounded-panel px-6 py-5 text-center">
          <p className="text-[15px] font-medium text-text-secondary">
            Join a growing network of guests and hosts who want travel to feel cleaner,
            easier, and more dependable.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
            {trustPoints.map((point) => (
              <span key={point} className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {point}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
