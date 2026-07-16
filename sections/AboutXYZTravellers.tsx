'use client';

import React, { useState } from "react";
import Image from "next/image";

const aboutImage = "/images/find_you_perfect_accommodation.jpg";

const featurePoints = [
  "Verified properties across major cities and travel destinations",
  "Flexible short stays for business, family, exams, events, and leisure travel",
  "Protected booking experience with easier host and guest coordination",
  "Reliable support for both travelers and property owners",
];

const extraSections = [
  {
    title: "Built for real travel needs in Bangladesh",
    text:
      "XYZ Travellers connects guests with furnished rooms, apartments, hotels, resorts, and villas across all eight divisions. Whether the stay is for work, family visits, hospital support, events, or short holidays, the platform is designed to make discovery and booking feel faster and less stressful.",
  },
  {
    title: "A better path for hosts, too",
    text:
      "Property owners can turn furnished spaces into dependable income with less operational friction. XYZ Travellers helps hosts present their listings more clearly, attract the right guests, and manage short-term demand with greater confidence.",
  },
];

export const AboutXYZTravellers: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="bg-card py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-badge">About XYZ Travellers</span>
          <h2 className="section-heading mt-6">
            Bangladesh&apos;s short stay platform for guests who want more clarity and comfort
          </h2>
          <p className="section-subtitle mx-auto mt-5">
            XYZ Travellers helps people find furnished short term accommodation with a
            cleaner, more reliable booking experience built around trust.
          </p>
          <div className="section-divider mx-auto mt-6" />
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="surface-card-strong rounded-panel p-6 md:p-8">
            <p className="text-[16px] leading-8 text-text-primary">
              XYZ Travellers is a Bangladesh-focused accommodation platform connecting guests
              with verified furnished rooms, apartments, hotels, resorts, and villas.
              It is designed for people who need short stays that feel easier to search,
              easier to trust, and easier to book.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {featurePoints.map((point) => (
                <div key={point} className="rounded-[22px] bg-surface px-4 py-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <p className="text-[14px] leading-7 text-text-primary">{point}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsExpanded((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover"
              >
                <span>{isExpanded ? "See Less" : "See More"}</span>
                <span aria-hidden="true">{isExpanded ? "↑" : "↓"}</span>
              </button>
              <div className="inline-flex items-center rounded-full border border-border bg-card px-4 py-3 text-[14px] font-medium text-text-secondary">
                Ideal for city stays, business trips, and family travel
              </div>
            </div>
          </div>

          <div className="surface-card-strong overflow-hidden rounded-panel">
            <div className="relative h-full min-h-[420px]">
              <Image
                src={aboutImage}
                alt="XYZ Travellers short term accommodation room"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1B12]/78 via-[#1A1B12]/18 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                <div className="inline-flex rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary">
                  Stay better
                </div>
                <h3 className="mt-4 max-w-sm font-sora text-[28px] font-bold leading-tight">
                  Wherever you go, there should always be a place that feels ready for you.
                </h3>
                <p className="mt-3 max-w-md text-[14px] leading-7 text-white/82">
                  Better presentation, stronger trust, and a booking flow that feels lighter from the first search.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isExpanded ? "mt-8 max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="surface-card rounded-panel p-6 md:p-8">
            <div className="grid gap-6 lg:grid-cols-2">
              {extraSections.map((section) => (
                <div key={section.title} className="rounded-[24px] bg-card p-5 shadow-soft">
                  <h3 className="text-[20px] font-semibold leading-8 text-text-primary">
                    {section.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-8 text-text-secondary">
                    {section.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] bg-surface px-5 py-5">
              <h3 className="text-[18px] font-semibold text-text-primary">
                Book your next stay or start hosting today
              </h3>
              <p className="mt-3 max-w-4xl text-[15px] leading-8 text-text-secondary">
                XYZ Travellers is built to make short term accommodation feel simpler for both
                sides of the marketplace, helping guests find quality stays while helping
                hosts present their spaces with more confidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
