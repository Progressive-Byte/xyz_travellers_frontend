import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  const footerGroups = [
    {
      title: "Explore",
      links: [
        { label: "Apartments", href: "/apartments" },
        { label: "Rooms", href: "/rooms" },
        { label: "Hotels", href: "/hotels" },
        { label: "Resorts", href: "/resorts" },
      ],
    },
    {
      title: "Hosting",
      links: [
        { label: "Earn by Hosting", href: "/host" },
        { label: "Host Resources", href: "/host/resources" },
        { label: "Responsible Hosting", href: "/host/guidelines" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "Contact Us", href: "/contact" },
        { label: "Cancellation Options", href: "/help/cancellations" },
      ],
    },
  ];

  return (
    <footer className="section-shell mt-6 bg-footer-bg text-footer-text">
      <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="rounded-[32px] border border-footer-border bg-white/5 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.22)] backdrop-blur-sm md:p-8">
          <div className="flex flex-col gap-8 border-b border-footer-border pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-footer-border bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                Stay Better With XYZ Travellers
              </div>
              <h2 className="mt-4 font-sora text-3xl font-bold leading-tight text-footer-text md:text-[42px]">
                Find the right stay faster, book with confidence, and travel lighter.
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-footer-text-muted">
                From short city breaks to longer stays, XYZ Travellers helps guests discover
                verified spaces across Bangladesh with a cleaner booking experience.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5 text-[12px] font-medium text-footer-text">
                <span className="rounded-full border border-footer-border bg-white/7 px-3 py-2">
                  Verified properties
                </span>
                <span className="rounded-full border border-footer-border bg-white/7 px-3 py-2">
                  Flexible stays
                </span>
                <span className="rounded-full border border-footer-border bg-white/7 px-3 py-2">
                  24/7 support
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/apartments"
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary transition-all duration-200 hover:bg-primary-hover"
              >
                Browse stays
              </Link>
              <Link
                href="/host"
                className="inline-flex items-center justify-center rounded-full border border-footer-border px-5 py-3 text-[14px] font-semibold text-footer-text transition-all duration-200 hover:bg-white/8"
              >
                Become a host
              </Link>
            </div>
          </div>

          <div className="grid gap-10 pt-8 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
            <div>
              <Link href="/" className="inline-flex items-center gap-2">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--color-primary)" />
                      <stop offset="100%" stopColor="var(--color-primary-hover)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"
                    fill="url(#footerLogoGradient)"
                  />
                  <path d="M10 14H14V17H10V14Z" fill="white" />
                </svg>
                <span className="font-sora text-[28px] font-bold tracking-tight text-footer-text">
                  XYZ Travellers
                </span>
              </Link>

              <p className="mt-4 max-w-sm text-[14px] leading-7 text-footer-text-muted">
                Book rooms, apartments, hotels, resorts, and villas with a travel
                experience that feels modern, reliable, and easy to trust.
              </p>

              <div className="mt-6 space-y-3 text-[14px] text-footer-text-muted">
                <a
                  href="mailto:hello@xyztravellers.com"
                  className="flex items-center gap-3 rounded-2xl border border-footer-border bg-white/5 px-4 py-3 transition-colors duration-200 hover:bg-white/8"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-primary">
                    @
                  </span>
                  hello@xyztravellers.com
                </a>
                <a
                  href="tel:+8801700000000"
                  className="flex items-center gap-3 rounded-2xl border border-footer-border bg-white/5 px-4 py-3 transition-colors duration-200 hover:bg-white/8"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-primary">
                    +
                  </span>
                  +880 1700-000000
                </a>
              </div>
            </div>

            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="font-sora text-[17px] font-semibold text-footer-text">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[14px] text-footer-text-muted transition-colors duration-200 hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-footer-border pt-6 text-[13px] text-footer-text-muted md:flex-row md:items-center md:justify-between">
            <p>© 2026 XYZ Travellers. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-5">
              <Link href="/privacy" className="transition-colors duration-200 hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition-colors duration-200 hover:text-primary">
                Terms of Service
              </Link>
              <Link href="/contact" className="transition-colors duration-200 hover:text-primary">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
