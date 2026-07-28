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
      "Move from account creation to onboarding, property setup, and review with a cleaner path built around the current host workflow.",
  },
  {
    title: "Support that stays practical",
    description:
      "Get help with listing structure, pricing setup, property submission, and the operational pieces that make hosting easier to sustain.",
  },
  {
    title: "Built for trusted short stays",
    description:
      "Present your space through a calmer, more credible booking experience designed for apartments, rooms, hotels, and premium city stays.",
  },
  {
    title: "Better visibility for your space",
    description:
      "Bring your property into a platform that already connects discovery, booking, hosting, transport, and travel services in one system.",
  },
  {
    title: "Clearer host operations",
    description:
      "Keep reservations, guest coordination, reviews, payouts, and profile setup inside one host workspace after approval.",
  },
  {
    title: "A workflow that grows with you",
    description:
      "Start with one listing, then expand into units, pricing, business documents, and multi-step property management as needed.",
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
    value: "Identity verification, draft recovery, submitted status, and next-step clarity.",
  },
  {
    label: "Property readiness",
    value: "Help structure listing basics, media, units, calendar rules, pricing, and verification before submission.",
  },
  {
    label: "Operational continuity",
    value: "Move from onboarding into reservations, messages, payouts, earnings, reviews, and verification status with less friction.",
  },
];

const processSteps = [
  {
    title: "Create your host account",
    description:
      "Start with registration or sign in if you already have an account and want to continue toward hosting access.",
  },
  {
    title: "Complete host onboarding",
    description:
      "Submit identity verification and keep track of draft, submitted, rejected, or approved status from the onboarding journey.",
  },
  {
    title: "Add and prepare your property",
    description:
      "Set up details, photos, units, pricing, business support where needed, and verification before submission.",
  },
  {
    title: "Go live and manage hosting",
    description:
      "After approval, operate from the host portal with reservations, messages, payouts, reviews, and listing management.",
  },
];

const quickStats = [
  { label: "Host-ready categories", value: `${homeCategories.length}+` },
  { label: "Portal stages covered", value: "Onboarding to payouts" },
  { label: "Support style", value: "Practical and local" },
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

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {quickStats.map((stat) => (
                    <div key={stat.label} className="surface-card rounded-[24px] px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-[15px] font-semibold text-text-primary">{stat.value}</p>
                    </div>
                  ))}
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

                  <div className="mt-4 rounded-[28px] bg-[linear-gradient(135deg,rgba(26,27,18,0.96),rgba(26,27,18,0.84))] px-5 py-5 text-white shadow-strong">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                      Hosting made simpler
                    </p>
                    <div className="mt-4 space-y-3">
                      {[
                        "Create your account and submit onboarding",
                        "Prepare your property details, media, units, and pricing",
                        "Get approved and manage reservations from the host portal",
                      ].map((item, index) => (
                        <div
                          key={item}
                          className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/6 px-4 py-3"
                        >
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-text-primary">
                            {index + 1}
                          </span>
                          <p className="text-[14px] leading-6 text-white/84">{item}</p>
                        </div>
                      ))}
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

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                  Begin with account setup, move through onboarding, and open the full host portal
                  once your approval and property flow are ready.
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

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/auth?mode=register&intent=host"
                    className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover"
                  >
                    Start hosting
                  </Link>
                  <Link
                    href="/auth?mode=login&intent=host"
                    className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:bg-surface"
                  >
                    Host sign in
                  </Link>
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
                <Link
                  href="/auth?mode=login&intent=host"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3.5 text-[15px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:bg-surface"
                >
                  Host sign in
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
