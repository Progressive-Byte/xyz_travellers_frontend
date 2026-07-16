'use client';

import React, { useState } from "react";
import Image from "next/image";

const aboutImage = "/images/find_you_perfect_accommodation.jpg";

const points = [
  "Verified Properties: All accommodations are verified for quality and safety",
  "Flexible Booking: Daily, weekly, and monthly rental options available",
  "Secure Payments: Protected transactions for both guests and hosts",
  "24/7 Support: Round-the-clock customer service assistance",
  "Best Rates: Competitive pricing across all accommodation types",
  "Easy Management: Simple listing and booking management tools",
];

export const AboutTravela: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="bg-card py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-sora text-[28px] font-bold leading-tight text-text-primary md:text-[46px]">
            Travela: Bangladesh&apos;s Leading Short Term Accommodation Platform
          </h2>
          <p className="mt-4 text-[16px] font-semibold text-text-secondary md:text-[18px]">
            Find Your Perfect Short Term Accommodation in Bangladesh
          </p>
        </div>

        <div
          className={`mt-12 grid overflow-hidden transition-all duration-500 ease-in-out ${
            isExpanded
              ? "grid-rows-[0fr] opacity-0 -translate-y-2"
              : "grid-rows-[1fr] opacity-100 translate-y-0"
          }`}
        >
          <div className="min-h-0">
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
              <div>
                <p className="text-[15px] leading-8 text-text-primary">
                  Travela is Bangladesh&apos;s premier{" "}
                  <strong>short term accommodation platform</strong> connecting
                  guests with quality <strong>furnished apartment rent</strong> and{" "}
                  <strong>furnished room rent</strong> options across the country.
                  Whether you need <strong>rooms</strong>,{" "}
                  <strong>apartments</strong>, <strong>hotels</strong>,{" "}
                  <strong>resorts</strong>, or <strong>villas</strong>, Travela
                  offers verified accommodations in all 8 divisions including Dhaka,
                  Chattogram, Khulna, Rajshahi, Barishal, Sylhet, Rangpur, and
                  Mymensingh, as well as popular districts like Cox&apos;s Bazar,
                  Comilla, Gazipur, Narayanganj, Bogura, Jessore, Moulvibazar, and
                  more. Our platform serves diverse accommodation needs for hospital
                  attendants, wedding events, business and corporate events
                  travelling, public examinations, university exams, and leisure
                  travelers seeking comfortable short-stay solutions. Our platform is
                  designed to make short-term rentals easy, fast, and reliable, all
                  through your smartphone or computer. Simply search, choose and book
                  your ideal accommodation instantly through the Travela App or
                  Website.
                </p>

                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="mt-8 text-[15px] font-semibold text-[#ff6aa2] transition-colors duration-200 hover:text-text-primary"
                >
                  See More
                </button>
              </div>

              <div className="relative overflow-hidden rounded-[28px]">
                <Image
                  src={aboutImage}
                  alt="Travela short term accommodation room"
                  width={720}
                  height={540}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-10 text-center text-white">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#ff2d87] shadow-lg">
                    <span className="h-3 w-3 rounded-full bg-white" />
                  </div>
                  <h3 className="mx-auto mt-4 max-w-xs text-[18px] font-semibold leading-7">
                    Wherever you go, There is always a place for you...
                  </h3>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-white/75">
                    Book your stay
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isExpanded
              ? "mt-12 max-h-[2200px] opacity-100 translate-y-0"
              : "mt-0 max-h-0 opacity-0 translate-y-2"
          }`}
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-[15px] leading-8 text-text-primary">
              Travela is Bangladesh&apos;s premier{" "}
              <strong>short term accommodation platform</strong> connecting
              guests with quality <strong>furnished apartment rent</strong> and{" "}
              <strong>furnished room rent</strong> options across the country.
              Whether you need <strong>rooms</strong>,{" "}
              <strong>apartments</strong>, <strong>hotels</strong>,{" "}
              <strong>resorts</strong>, or <strong>villas</strong>, Travela
              offers verified accommodations in all 8 divisions including Dhaka,
              Chattogram, Khulna, Rajshahi, Barishal, Sylhet, Rangpur, and
              Mymensingh, as well as popular districts like Cox&apos;s Bazar,
              Comilla, Gazipur, Narayanganj, Bogura, Jessore, Moulvibazar, and
              more. Our platform serves diverse accommodation needs for hospital
              attendants, wedding events, business and corporate events
              travelling, public examinations, university exams, and leisure
              travelers seeking comfortable short-stay solutions. Our platform is
              designed to make short-term rentals easy, fast, and reliable, all
              through your smartphone or computer. Simply search, choose and book
              your ideal accommodation instantly through the Travela App or
              Website.
            </p>

            <h3 className="mt-10 text-[20px] font-bold text-text-primary">
              Earn Money as a Host: Your Gateway to Passive Income in Bangladesh
            </h3>
            <p className="mt-5 text-[15px] leading-8 text-text-primary">
              If you&apos;re a property owner, Travela helps you turn your
              furnished room, flat, or holiday home into a source of{" "}
              <strong>passive income</strong>. Become a Travela Host and earn from
              short-term guests without the headache of managing bookings or
              marketing, we take care of that. Whether you live in a major city or
              a tourist destination, this is the easiest way to build a side
              hustle, generate monthly earnings from renting, or explore a
              hassle-free investment opportunity in Bangladesh&apos;s growing
              accommodation market.
            </p>
            <p className="mt-5 text-[15px] leading-8 text-text-primary">
              Travela is redefining how people find stays and how property owners
              earn money, making short term accommodation simpler for both guests
              and hosts.
            </p>

            <h3 className="mt-10 text-[20px] font-bold text-text-primary">
              WhyChooseTravela?
            </h3>
            <ul className="mt-5 space-y-5 text-[15px] leading-8 text-text-primary">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-[11px] h-2 w-2 flex-shrink-0 rounded-full bg-text-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <h3 className="mt-10 text-[20px] font-bold text-text-primary">
              Book Your Next Stay or Start Hosting Today
            </h3>
            <p className="mt-5 text-[15px] leading-8 text-text-primary">
              Experience hassle-free short term accommodation booking across
              Bangladesh or begin your journey as a successful host. Travela makes
              finding quality furnished rentals simple for guests while helping
              hosts maximize their earning potential in Bangladesh&apos;s growing
              accommodation market.
            </p>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="mt-10 text-[15px] font-semibold text-[#ff6aa2] transition-colors duration-200 hover:text-text-primary"
            >
              See Less
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
