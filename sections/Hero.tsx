'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  defaultFrontHomepageTabs,
  type FrontHomepageTab,
  type FrontHomepageTabKey,
} from "@/lib/front";

const categoryIcons: Record<FrontHomepageTabKey, React.ReactNode> = {
  apartments: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  rooms: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 4v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4" />
      <path d="M2 14h20" />
      <circle cx="7" cy="10" r="2" />
      <path d="M17 10h4" />
    </svg>
  ),
  hotels: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 19V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14" />
      <path d="M12 19h7a2 2 0 0 0 2-2v-2H5v2a2 2 0 0 0 2 2h5" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h8" />
    </svg>
  ),
};

type GuestType = {
  key: "adults" | "children" | "infants";
  label: string;
  caption: string;
  count: number;
  min: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

type DateInputButtonProps = {
  value?: string;
  onClick?: () => void;
  label: string;
};

const DateInputButton = React.forwardRef<HTMLButtonElement, DateInputButtonProps>(
  ({ value, onClick, label }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className="mt-1 w-full text-left outline-none focus:outline-none focus-visible:outline-none"
    >
      <span className="block text-[14px] font-semibold text-text-primary">
        {value || label}
      </span>
    </button>
  ),
);

DateInputButton.displayName = "DateInputButton";

type HeroProps = {
  tabs?: FrontHomepageTab[];
  activeTab: FrontHomepageTabKey;
  onTabChange: (category: FrontHomepageTabKey) => void;
};

const formatDateValue = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const heroDatePickerClassName =
  "z-[60] mt-3 [&_.react-datepicker]:rounded-[24px] [&_.react-datepicker]:border [&_.react-datepicker]:border-border [&_.react-datepicker]:bg-white/95 [&_.react-datepicker]:shadow-strong [&_.react-datepicker]:backdrop-blur-xl [&_.react-datepicker__header]:rounded-t-[24px] [&_.react-datepicker__header]:border-border [&_.react-datepicker__header]:bg-surface [&_.react-datepicker__current-month]:text-[14px] [&_.react-datepicker__current-month]:font-semibold [&_.react-datepicker__day-name]:text-[11px] [&_.react-datepicker__day-name]:font-semibold [&_.react-datepicker__day--selected]:bg-primary [&_.react-datepicker__day--keyboard-selected]:bg-primary/70";

export const Hero: React.FC<HeroProps> = ({
  tabs = [...defaultFrontHomepageTabs],
  activeTab,
  onTabChange,
}) => {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [searchError, setSearchError] = useState("");
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
  const homepageTabs = tabs.length ? tabs : [...defaultFrontHomepageTabs];

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
    <section className="section-shell overflow-visible bg-background pt-6">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative z-30 mx-auto mt-4 flex w-full max-w-[980px] justify-center md:mt-6">
          <div className="surface-card-strong w-full rounded-[26px] p-1.5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
              <div className="flex-1 rounded-[18px] px-4 py-1.5 transition-colors duration-200 hover:bg-surface">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
                  Where
                </p>
                <input
                  type="text"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="Search destinations"
                  className="mt-1 w-full bg-transparent text-[14px] font-semibold text-text-primary outline-none placeholder:font-semibold placeholder:text-text-primary"
                />
              </div>

              <div className="hidden h-auto w-px bg-border lg:block" />

              <div className="flex-1 rounded-[18px] px-4 py-1.5 transition-colors duration-200 hover:bg-surface">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
                  Check in
                </p>
                <DatePicker
                  selected={checkInDate}
                  onChange={(date: Date | null) => setCheckInDate(date)}
                  onCalendarOpen={() => setShowGuestDropdown(false)}
                  selectsStart
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  minDate={new Date()}
                  placeholderText="Add dates"
                  popperPlacement="bottom-start"
                  popperClassName={heroDatePickerClassName}
                  showPopperArrow={false}
                  wrapperClassName="block"
                  customInput={
                    <DateInputButton label="Add dates" />
                  }
                />
              </div>

              <div className="hidden h-auto w-px bg-border lg:block" />

              <div className="flex-1 rounded-[18px] px-4 py-1.5 transition-colors duration-200 hover:bg-surface">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
                  Check out
                </p>
                <DatePicker
                  selected={checkOutDate}
                  onChange={(date: Date | null) => setCheckOutDate(date)}
                  onCalendarOpen={() => setShowGuestDropdown(false)}
                  selectsEnd
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  minDate={checkInDate || new Date()}
                  placeholderText="Add dates"
                  popperPlacement="bottom-start"
                  popperClassName={heroDatePickerClassName}
                  showPopperArrow={false}
                  wrapperClassName="block"
                  customInput={
                    <DateInputButton label="Add dates" />
                  }
                />
              </div>

              <div className="hidden h-auto w-px bg-border lg:block" />

              <div className="relative flex-1" ref={guestDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setSearchError("");
                    setShowGuestDropdown((open) => !open);
                  }}
                  className="flex w-full items-center justify-between rounded-[18px] px-4 py-1.5 text-left outline-none transition-colors duration-200 hover:bg-surface focus:outline-none focus-visible:outline-none"
                >
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
                      Who
                    </span>
                    <span className="mt-1 block text-[13px] font-semibold text-text-primary">
                      {totalGuests} {totalGuests === 1 ? "guest" : "guests"}
                      {infants > 0 ? `, ${infants} infant${infants > 1 ? "s" : ""}` : ""}
                    </span>
                  </span>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
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
                onClick={() => {
                  const query = new URLSearchParams();
                  const trimmedDestination = destination.trim();

                  if ((checkInDate && !checkOutDate) || (!checkInDate && checkOutDate)) {
                    setSearchError("Select both check-in and check-out dates to search by stay.");
                    return;
                  }

                  if (checkInDate && checkOutDate && checkOutDate <= checkInDate) {
                    setSearchError("Check-out must be later than check-in.");
                    return;
                  }

                  setSearchError("");

                  if (trimmedDestination) {
                    query.set("q", trimmedDestination);
                  }

                  if (checkInDate && checkOutDate) {
                    query.set("checkIn", formatDateValue(checkInDate));
                    query.set("checkOut", formatDateValue(checkOutDate));
                  }

                  query.set("guests", String(Math.max(totalGuests, 1)));

                  router.push(`/search?${query.toString()}`);
                }}
                className="flex items-center justify-center gap-2 rounded-[18px] bg-primary px-5 py-1.5 text-[13px] font-semibold text-text-primary shadow-glow outline-none transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus-visible:outline-none lg:min-w-[112px]"
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

        {searchError ? (
          <p className="mx-auto mt-3 w-full max-w-[980px] text-[13px] font-medium text-[var(--color-danger,#b42318)]">
            {searchError}
          </p>
        ) : null}

        <div className="mx-auto mt-3 flex w-full max-w-[980px] items-end justify-center gap-8 border-b border-border/80">
          {homepageTabs.map((category) => {
            const active = category.key === activeTab;
            const icon = categoryIcons[category.key] ?? categoryIcons.apartments;

            return (
              <button
                key={category.key}
                type="button"
                onClick={() => onTabChange(category.key)}
                className={`relative inline-flex items-center gap-2 pb-4 pt-2 text-[14px] font-semibold transition-colors duration-200 ${
                  active
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <span className={active ? "text-primary" : "text-text-secondary"}>{icon}</span>
                <span>{category.label}</span>
                <span
                  className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full transition-opacity duration-200 ${
                    active ? "bg-text-primary opacity-100" : "bg-transparent opacity-0"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
