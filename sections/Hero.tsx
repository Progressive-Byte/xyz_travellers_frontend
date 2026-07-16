'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const categories = [
  {
    label: "Apartments",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Rooms",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 4v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4" />
        <path d="M2 14h20" />
        <circle cx="7" cy="10" r="2" />
        <path d="M17 10h4" />
      </svg>
    ),
  },
  {
    label: "Hotels",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 19V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14" />
        <path d="M12 19h7a2 2 0 0 0 2-2v-2H5v2a2 2 0 0 0 2 2h5" />
        <path d="M8 7h8" />
        <path d="M8 11h8" />
        <path d="M8 15h8" />
      </svg>
    ),
  },
];

const stats = [
  { value: "15k+", label: "verified stays" },
  { value: "24/7", label: "guest support" },
  { value: "8 divisions", label: "nationwide coverage" },
];

type GuestType = {
  key: "adults" | "children" | "infants";
  label: string;
  caption: string;
  count: number;
  min: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

export const Hero: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("Apartments");
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const guestDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (guestDropdownRef.current && !guestDropdownRef.current.contains(event.target as Node)) {
        setShowGuestDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalGuests = adults + children;

  const guestTypes = useMemo<GuestType[]>(
    () => [
      {
        key: "adults",
        label: "Adults",
        caption: "Ages 13 or above",
        count: adults,
        min: 1,
        onDecrease: () => setAdults((value) => Math.max(1, value - 1)),
        onIncrease: () => setAdults((value) => value + 1),
      },
      {
        key: "children",
        label: "Children",
        caption: "Ages 2-12",
        count: children,
        min: 0,
        onDecrease: () => setChildren((value) => Math.max(0, value - 1)),
        onIncrease: () => setChildren((value) => value + 1),
      },
      {
        key: "infants",
        label: "Infants",
        caption: "Under 2",
        count: infants,
        min: 0,
        onDecrease: () => setInfants((value) => Math.max(0, value - 1)),
        onIncrease: () => setInfants((value) => value + 1),
      },
    ],
    [adults, children, infants],
  );

  return (
    <section className="section-shell overflow-hidden bg-background pb-14 pt-8 md:pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-4xl text-center">
          <span className="section-badge">Short Term Accommodation</span>
          <h1 className="section-heading mx-auto mt-6 max-w-4xl">
            Find beautifully hosted stays across Bangladesh without the usual booking friction.
          </h1>
          <p className="section-subtitle mx-auto mt-5">
            Search premium short stays, furnished apartments, rooms, and hotels with
            a cleaner booking flow built for modern travelers.
          </p>

          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-3 text-[13px] font-semibold text-text-secondary">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="surface-card flex items-center gap-3 rounded-full px-4 py-2.5"
              >
                <span className="text-[14px] font-bold text-text-primary">{stat.value}</span>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 flex w-full max-w-[980px] justify-center">
          <div className="surface-card-strong w-full rounded-[30px] p-3 md:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
              <div className="flex-1 rounded-[24px] px-5 py-4 transition-colors duration-200 hover:bg-surface">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-text-secondary">
                  Where
                </p>
                <p className="mt-2 text-[16px] font-semibold text-text-primary">
                  Search destinations
                </p>
                <p className="mt-1 text-[13px] text-text-secondary">
                  Dhaka, Cox&apos;s Bazar, Sylhet and more
                </p>
              </div>

              <div className="hidden h-auto w-px bg-border lg:block" />

              <div className="flex-1 rounded-[24px] px-5 py-4 transition-colors duration-200 hover:bg-surface">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-text-secondary">
                  Check in
                </p>
                <DatePicker
                  selected={checkInDate}
                  onChange={(date: Date | null) => setCheckInDate(date)}
                  selectsStart
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  minDate={new Date()}
                  placeholderText="Add dates"
                  className="hidden"
                  customInput={
                    <button type="button" className="mt-2 text-left">
                      <span className="block text-[16px] font-semibold text-text-primary">
                        {checkInDate
                          ? checkInDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "Add dates"}
                      </span>
                      <span className="mt-1 block text-[13px] text-text-secondary">
                        Choose your arrival date
                      </span>
                    </button>
                  }
                />
              </div>

              <div className="hidden h-auto w-px bg-border lg:block" />

              <div className="flex-1 rounded-[24px] px-5 py-4 transition-colors duration-200 hover:bg-surface">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-text-secondary">
                  Check out
                </p>
                <DatePicker
                  selected={checkOutDate}
                  onChange={(date: Date | null) => setCheckOutDate(date)}
                  selectsEnd
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  minDate={checkInDate || new Date()}
                  placeholderText="Add dates"
                  className="hidden"
                  customInput={
                    <button type="button" className="mt-2 text-left">
                      <span className="block text-[16px] font-semibold text-text-primary">
                        {checkOutDate
                          ? checkOutDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "Add dates"}
                      </span>
                      <span className="mt-1 block text-[13px] text-text-secondary">
                        Select your departure
                      </span>
                    </button>
                  }
                />
              </div>

              <div className="hidden h-auto w-px bg-border lg:block" />

              <div className="relative flex-1" ref={guestDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowGuestDropdown((open) => !open)}
                  className="flex w-full items-center justify-between rounded-[24px] px-5 py-4 text-left transition-colors duration-200 hover:bg-surface"
                >
                  <span>
                    <span className="block text-[11px] font-bold uppercase tracking-[0.22em] text-text-secondary">
                      Who
                    </span>
                    <span className="mt-2 block text-[16px] font-semibold text-text-primary">
                      {totalGuests} {totalGuests === 1 ? "guest" : "guests"}
                      {infants > 0 ? `, ${infants} infant${infants > 1 ? "s" : ""}` : ""}
                    </span>
                    <span className="mt-1 block text-[13px] text-text-secondary">
                      Adjust travelers and family size
                    </span>
                  </span>
                  <span className="rounded-full bg-surface px-3 py-1 text-[12px] font-semibold text-text-secondary">
                    Edit
                  </span>
                </button>

                <div
                  className={`absolute right-0 top-full z-50 mt-3 w-full min-w-[300px] rounded-panel border border-border bg-[rgba(255,255,255,0.97)] p-5 shadow-strong backdrop-blur-xl transition-all duration-250 lg:w-[360px] ${
                    showGuestDropdown
                      ? "pointer-events-auto translate-y-0 opacity-100"
                      : "pointer-events-none -translate-y-2 opacity-0"
                  }`}
                >
                  <div className="space-y-4">
                    {guestTypes.map((guestType, index) => (
                      <div key={guestType.key}>
                        <div className="flex items-center justify-between gap-5">
                          <div>
                            <p className="text-[15px] font-semibold text-text-primary">
                              {guestType.label}
                            </p>
                            <p className="mt-1 text-[13px] text-text-secondary">
                              {guestType.caption}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                guestType.onDecrease();
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-text-primary transition-all duration-200 hover:bg-surface"
                              disabled={guestType.count <= guestType.min}
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-[15px] font-semibold text-text-primary">
                              {guestType.count}
                            </span>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                guestType.onIncrease();
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-text-primary transition-all duration-200 hover:bg-surface"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {index < guestTypes.length - 1 ? (
                          <div className="mt-4 h-px bg-border-light" />
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAdults(2);
                      setChildren(0);
                      setInfants(0);
                    }}
                    className="mt-5 text-[13px] font-semibold text-text-secondary transition-colors duration-200 hover:text-text-primary"
                  >
                    Reset guests
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-[22px] bg-primary px-6 py-4 text-[15px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover lg:min-w-[132px]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-7 flex w-full max-w-[980px] flex-wrap items-center justify-center gap-3">
          {categories.map((category) => {
            const active = category.label === activeCategory;

            return (
              <Link
                key={category.label}
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  setActiveCategory(category.label);
                }}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-[14px] font-semibold transition-all duration-200 ${
                  active
                    ? "bg-text-primary text-white shadow-medium"
                    : "surface-card text-text-secondary hover:-translate-y-0.5 hover:text-text-primary"
                }`}
              >
                <span className={active ? "text-primary" : "text-text-secondary"}>{category.icon}</span>
                <span>{category.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
