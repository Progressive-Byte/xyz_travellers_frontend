"use client";

import Link from "next/link";
import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { homeCategories } from "@/data/homeCategories";
import { useAuth } from "@/context/AuthContext";

const hostBenefits = [
  {
    title: "Faster hosting setup",
    description:
      "A calmer, structured path from account creation to onboarding, listing setup, and review.",
  },
  {
    title: "Support that stays practical",
    description:
      "Guidance for listing setup, pricing readiness, and the steps that matter before you go live.",
  },
  {
    title: "Built for trusted short stays",
    description:
      "Present your property with a booking experience designed to feel clearer and more trustworthy.",
  },
  {
    title: "One portal after approval",
    description:
      "Manage properties, reservations, messages, earnings, and payouts from a single host workspace.",
  },
];

const hostingCategoryDetails: Record<
  (typeof homeCategories)[number],
  {
    description: string;
    stats: string;
  }
> = {
  Apartments: {
    description:
      "Ideal for city stays, business trips, relocation support, and short residential bookings with a premium presentation.",
    stats: "Best for entire-home hosting",
  },
  Rooms: {
    description:
      "A practical option for flexible stays, solo travelers, and hosts who want to start smaller without building a full hotel workflow.",
    stats: "Good for flexible spare-space income",
  },
  Hotels: {
    description:
      "Perfect for established hospitality operators who want stronger digital presentation and a smoother booking experience.",
    stats: "Good for larger inventory and daily operations",
  },
};

const supportHighlights = [
  {
    label: "Onboarding guidance",
    value: "Clear status for draft, submitted, rejected, and approved application states.",
  },
  {
    label: "Property readiness",
    value: "Make the listing ready: details, media, units, pricing, and verification before submit.",
  },
  {
    label: "Operational continuity",
    value: "A consistent workflow from onboarding into day-to-day host operations after approval.",
  },
];

const processSteps = [
  {
    title: "Create your host account",
    description:
      "Register or sign in, then enter the host onboarding flow.",
  },
  {
    title: "Complete host onboarding",
    description:
      "Submit identity verification and track review status without guessing.",
  },
  {
    title: "Add and prepare your property",
    description:
      "Finish listing details, photos, units, and pricing before submission.",
  },
  {
    title: "Go live and manage hosting",
    description:
      "Use the host portal for daily operations after approval.",
  },
];

const LoggedInRedirectState = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="section-shell py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="surface-card mx-auto max-w-2xl rounded-[32px] px-6 py-10 text-center md:px-10">
          <span className="section-badge">Preparing your host access</span>
          <h1 className="section-heading mt-6">Taking you to the right host workspace</h1>
          <p className="section-subtitle mx-auto mt-5">
            We are checking your account status so you land on the correct next step for hosting.
          </p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export const HostPublicLandingPage: React.FC = () => {
  const router = useRouter();
  const { user, isHydrated, isAuthenticated } = useAuth();

  const redirectTarget = useMemo(() => {
    if (!isHydrated || !isAuthenticated || !user) {
      return null;
    }

    return user.roles.includes("host") ? "/host/dashboard" : "/host/onboarding";
  }, [isAuthenticated, isHydrated, user]);

  useEffect(() => {
    if (redirectTarget) {
      router.replace(redirectTarget);
    }
  }, [redirectTarget, router]);

  if (redirectTarget) {
    return <LoggedInRedirectState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="section-shell overflow-hidden bg-background py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:items-center">
              <div className="max-w-3xl">
                <span className="section-badge">Host With XYZ Travellers</span>
                <h1 className="section-heading mt-6 max-w-3xl">
                  Turn your property into a stronger short-stay business
                </h1>
                <p className="section-subtitle mt-5 max-w-2xl">
                  Launch apartments, rooms, hotels, and premium stays with a hosting journey that
                  feels clearer from onboarding to day-to-day operations.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/auth?mode=register&intent=host"
                    className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover"
                  >
                    Start hosting
                  </Link>
                  <Link
                    href="/auth?mode=login&intent=host"
                    className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3.5 text-[15px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:bg-surface"
                  >
                    Host sign in
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-x-[12%] top-8 h-48 rounded-full bg-[radial-gradient(circle,rgba(217,241,75,0.28),transparent_72%)] blur-3xl" />
                <div className="surface-card-strong relative rounded-[34px] p-5 md:p-6">
                  <div className="flex items-center justify-between gap-4 rounded-[24px] border border-border-light bg-white/90 px-4 py-4 shadow-soft">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                        Hosting snapshot
                      </p>
                      <p className="mt-2 text-[18px] font-semibold text-text-primary">
                        Build your listing flow with clarity
                      </p>
                    </div>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] bg-primary text-[15px] font-bold text-text-primary shadow-glow">
                      01
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-border bg-surface px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                        What you can host
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {homeCategories.map((category) => (
                          <span
                            key={category}
                            className="inline-flex rounded-full border border-border bg-white px-3 py-1.5 text-[12px] font-semibold text-text-primary"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-border bg-surface px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                        Support focus
                      </p>
                      <ul className="mt-3 space-y-2">
                        {["Onboarding", "Property setup", "Portal operations"].map((item) => (
                          <li key={item} className="flex items-center gap-2 text-[13px] text-text-primary">
                            <span className="h-2 w-2 rounded-full bg-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell bg-surface py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <span className="section-badge">Why Host Here</span>
              <h2 className="section-heading mt-6">A hosting flow that stays practical from day one</h2>
              <p className="section-subtitle mx-auto mt-5">
                We are building the host journey around the real steps that matter: onboarding,
                listing readiness, review, and steady daily operations after approval.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-2">
              {hostBenefits.map((benefit, index) => (
                <article key={benefit.title} className="surface-card-strong hover-lift rounded-panel p-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="icon-chip">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          d="M5 12.5L9.2 16.7L19 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="font-sora text-[22px] font-bold tracking-[-0.05em] text-border">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-[19px] font-semibold leading-8 text-text-primary">
                    {benefit.title}
                  </h3>
                  <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                    {benefit.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell bg-background py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
              <div>
                <span className="section-badge">What You Can Host</span>
                <h2 className="section-heading mt-6">Built for the stay types already shaping the platform</h2>
                <p className="section-subtitle mt-5">
                  Start from the categories already present in the public experience and expand into a
                  fuller hosting workflow once your onboarding and property setup are complete.
                </p>
              </div>

              <div className="grid gap-4">
                {homeCategories.map((category) => (
                  <article
                    key={category}
                    className="surface-card rounded-[28px] px-5 py-5 md:px-6"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                          {category}
                        </p>
                        <h3 className="mt-2 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                          {category} hosting
                        </h3>
                        <p className="mt-3 text-[14px] leading-7 text-text-secondary">
                          {hostingCategoryDetails[category].description}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full border border-border bg-white px-3 py-1.5 text-[12px] font-semibold text-text-primary">
                        {hostingCategoryDetails[category].stats}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell bg-surface py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="surface-card-strong rounded-[32px] p-6 md:p-8">
                <span className="section-badge">Support And Trust</span>
                <h2 className="section-heading mt-6">A clearer path from onboarding to everyday hosting</h2>
                <div className="mt-8 grid gap-4">
                  {supportHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[24px] border border-border bg-white/88 px-5 py-5 shadow-soft"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                        {item.label}
                      </p>
                      <p className="mt-3 text-[14px] leading-7 text-text-primary">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-card rounded-[32px] p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Contact direction
                </p>
                <h3 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                  Ready to start earning from your space?
                </h3>
                <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                  If you want help before you start, reach out. If you are ready, use the CTA at the top to begin hosting.
                </p>

                <div className="mt-6 space-y-3">
                  <a
                    href="tel:+8801700000000"
                    className="flex items-center justify-between rounded-[22px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/15"
                  >
                    <span>Call support</span>
                    <span className="text-text-secondary">+880 1700-000000</span>
                  </a>
                  <a
                    href="mailto:hello@xyztravellers.com"
                    className="flex items-center justify-between rounded-[22px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/15"
                  >
                    <span>Email support</span>
                    <span className="text-text-secondary">hello@xyztravellers.com</span>
                  </a>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section className="section-shell bg-background py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <span className="section-badge">Hosting Made Simple</span>
              <h2 className="section-heading mt-6">Follow the real host journey in a cleaner order</h2>
              <p className="section-subtitle mx-auto mt-5">
                This page leads into the same onboarding and host portal flow already used in the
                product. Nothing changes about the protected workflow. The entry experience just gets
                clearer.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {processSteps.map((step, index) => (
                <article key={step.title} className="surface-card rounded-panel p-6">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-primary text-[15px] font-bold text-text-primary shadow-glow">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 text-[18px] font-semibold leading-7 text-text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-7 text-text-secondary">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="surface-card-strong mt-10 rounded-[32px] px-6 py-8 text-center md:px-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Final step
              </p>
              <h2 className="mt-3 font-sora text-[30px] font-bold tracking-[-0.05em] text-text-primary">
                Start your hosting journey with the right first step
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-8 text-text-secondary">
                See the platform first, then move into registration or host sign in when you are ready.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  href="/auth?mode=register&intent=host"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover"
                >
                  Start hosting
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
