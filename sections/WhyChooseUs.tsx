'use client';

import React from "react";

const features = [
  {
    id: "01",
    title: "Reliable Stays Across Bangladesh",
    description:
      "From cozy rooms to furnished apartments, find fit for short-term stays in Dhaka, Chattogram, Cox's Bazar, Sylhet, and more, with real-time support and verified listings.",
  },
  {
    id: "02",
    title: "Strong Community Support System",
    description:
      "Whether you're a host or a guest, our local team is just a call or message away - 24 hours x 7 days a week. Real help, real people, every time.",
  },
  {
    id: "03",
    title: "Easy to Use App for Booking & Hosting",
    description:
      "Search, book, list, or manage - all through one simple app. Travela makes travel and hosting seamless for everyone.",
  },
  {
    id: "04",
    title: "Earn or Save More, Without Extra Hassle",
    description:
      "Guests get quality stays at competitive rates. Hosts enjoy personalized support and faster bookings - no need to chase or guess.",
  },
];

const trustPoints = ["Premium Service", "24/7 Support", "Verified Listings"];

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="bg-card py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-primary-light px-4 py-1.5 text-[11px] font-semibold text-text-primary shadow-sm">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Why Choose Us
          </span>

          <h2 className="mt-5 font-sora text-[22px] font-bold leading-tight text-text-primary md:text-[44px]">
            Why Travela is Your{" "}
            <span className="inline-block rounded-md bg-primary px-2 text-text-primary">
              Best Choice?
            </span>
          </h2>

          <div className="mt-4 h-[4px] w-14 rounded-full bg-primary" />
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <article
              key={feature.id}
              className="group rounded-[22px] border border-border bg-card px-6 py-7 shadow-[0_0_0_1px_rgba(0,0,0,0.01)] transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:shadow-[0_20px_45px_rgba(26,27,18,0.08)]"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-text-primary transition-all duration-300 group-hover:bg-primary">
                  {index === 0 ? (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <path d="M12 21s-6-4.35-6-10a6 6 0 1112 0c0 5.65-6 10-6 10z" />
                      <circle cx="12" cy="11" r="2.5" />
                    </svg>
                  ) : null}
                  {index === 1 ? (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <path d="M16 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
                      <circle cx="9.5" cy="7" r="3" />
                      <path d="M22 21v-2a4 4 0 00-3-3.87" />
                      <path d="M16 4.13a4 4 0 010 7.75" />
                    </svg>
                  ) : null}
                  {index === 2 ? (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <rect x="3" y="4" width="18" height="17" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  ) : null}
                  {index === 3 ? (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <path d="M12 1v22" />
                      <path d="M17 5H9.5a3.5 3.5 0 000 7H14.5a3.5 3.5 0 010 7H6" />
                    </svg>
                  ) : null}
                </span>
                <span className="font-sora text-[52px] font-bold leading-none text-border transition-colors duration-300 group-hover:text-primary-light">
                  {feature.id}
                </span>
              </div>

              <h3 className="mt-5 max-w-[180px] text-[16px] font-semibold leading-7 text-text-primary transition-colors duration-300 group-hover:text-text-primary">
                {feature.title}
              </h3>

              <p className="mt-4 text-[13px] leading-7 text-text-secondary">
                {feature.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-[14px] font-medium text-text-secondary">
            Join thousands of satisfied travelers and hosts across Bangladesh
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12px] font-semibold text-text-secondary">
            {trustPoints.map((point) => (
              <span key={point} className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {point}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
