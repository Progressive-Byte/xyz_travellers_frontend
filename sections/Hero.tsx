'use client';

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const Hero: React.FC = () => {
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

  const categories = [
    { 
      label: "Apartments", 
      active: true, 
      icon: (
        <svg className="w-7 h-7 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ) 
    },
    { 
      label: "Rooms", 
      active: false, 
      icon: (
        <svg className="w-7 h-7 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M2 4v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4" />
          <path d="M2 14h20" />
          <circle cx="7" cy="10" r="2" />
          <path d="M17 10h4" />
        </svg>
      ) 
    },
    { 
      label: "Hotels", 
      active: false, 
      icon: (
        <svg className="w-7 h-7 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M9 19V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14" />
          <path d="M12 19h7a2 2 0 0 0 2-2v-2H5v2a2 2 0 0 0 2 2h5" />
          <path d="M8 7h8" />
          <path d="M8 11h8" />
          <path d="M8 15h8" />
        </svg>
      ) 
    },
  ];

  return (
    <section className="bg-background">
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        {/* Search Bar */}
        <div className="flex justify-center pb-6">
          <div className="flex w-full max-w-[980px] items-center bg-card border border-border rounded-full shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex-1 px-6 py-3 border-r border-border cursor-pointer hover:bg-background rounded-l-full transition-colors">
              <p className="text-xs font-bold text-text-primary uppercase tracking-wide mb-1">Where</p>
              <p className="text-sm text-text-secondary font-medium">Search destinations</p>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="flex-1 px-6 py-3 border-r border-border cursor-pointer hover:bg-background transition-colors">
              <p className="text-xs font-bold text-text-primary uppercase tracking-wide mb-1">Check in</p>
              <DatePicker
                selected={checkInDate}
                onChange={(date: Date | null) => setCheckInDate(date)}
                selectsStart
                startDate={checkInDate}
                endDate={checkOutDate}
                minDate={new Date()}
                placeholderText="Add dates"
                className="w-full bg-transparent text-sm text-text-secondary focus:outline-none"
                customInput={
                  <div className="cursor-pointer">
                    {checkInDate ? (
                      <p className="text-sm text-text-primary font-medium">
                        {checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    ) : (
                      <p className="text-sm text-text-secondary font-medium">Add dates</p>
                    )}
                  </div>
                }
              />
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="flex-1 px-6 py-3 border-r border-border cursor-pointer hover:bg-background transition-colors">
              <p className="text-xs font-bold text-text-primary uppercase tracking-wide mb-1">Check out</p>
              <DatePicker
                selected={checkOutDate}
                onChange={(date: Date | null) => setCheckOutDate(date)}
                selectsEnd
                startDate={checkInDate}
                endDate={checkOutDate}
                minDate={checkInDate || new Date()}
                placeholderText="Add dates"
                className="w-full bg-transparent text-sm text-text-secondary focus:outline-none"
                customInput={
                  <div className="cursor-pointer">
                    {checkOutDate ? (
                      <p className="text-sm text-text-primary font-medium">
                        {checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    ) : (
                      <p className="text-sm text-text-secondary font-medium">Add dates</p>
                    )}
                  </div>
                }
              />
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="relative flex flex-1 items-center" ref={guestDropdownRef}>
              <div 
                className="px-6 py-3 flex items-center gap-3 cursor-pointer hover:bg-background transition-colors"
                onClick={() => setShowGuestDropdown(!showGuestDropdown)}
              >
                <div>
                  <p className="text-xs font-bold text-text-primary uppercase tracking-wide mb-1">Who</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-text-primary font-medium">
                      {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}
                    </p>
                    {infants > 0 && <span className="text-text-secondary text-sm font-medium">, {infants} infant{infants > 1 ? 's' : ''}</span>}
                    {totalGuests + infants > 0 && <span 
                      className="text-text-secondary text-sm hover:text-primary cursor-pointer transition-colors font-medium"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setAdults(2); 
                        setChildren(0); 
                        setInfants(0); 
                      }}
                    >×</span>}
                  </div>
                </div>
              </div>
              <div className="pr-3">
                <button className="bg-primary p-2.5 rounded-full hover:shadow-md hover:bg-primary-hover transition-all duration-200 hover:scale-105">
                  <svg className="w-3.5 h-3.5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>

              {/* Guest Dropdown */}
              <div 
                className={`absolute right-0 top-full mt-3 w-80 bg-card rounded-2xl shadow-xl border border-border overflow-hidden transition-all duration-300 ease-out z-50 ${
                  showGuestDropdown 
                    ? 'opacity-100 translate-y-0 pointer-events-auto' 
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="px-6 py-5">
                  {/* Adults */}
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-text-primary font-semibold text-sm">Adults</p>
                      <p className="text-text-secondary text-xs mt-1">Ages 13 or above</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-text-primary hover:bg-background transition-all duration-200"
                        onClick={(e) => { e.stopPropagation(); setAdults(Math.max(1, adults - 1)); }}
                      >
                        <svg className="w-4 h-4 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-text-primary font-semibold text-sm">{adults}</span>
                      <button 
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-text-primary hover:bg-background transition-all duration-200"
                        onClick={(e) => { e.stopPropagation(); setAdults(adults + 1); }}
                      >
                        <svg className="w-4 h-4 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16M4 12h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-border-light"></div>

                  {/* Children */}
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-text-primary font-semibold text-sm">Children</p>
                      <p className="text-text-secondary text-xs mt-1">Ages 2–12</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-text-primary hover:bg-background transition-all duration-200"
                        onClick={(e) => { e.stopPropagation(); setChildren(Math.max(0, children - 1)); }}
                      >
                        <svg className="w-4 h-4 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-text-primary font-semibold text-sm">{children}</span>
                      <button 
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-text-primary hover:bg-background transition-all duration-200"
                        onClick={(e) => { e.stopPropagation(); setChildren(children + 1); }}
                      >
                        <svg className="w-4 h-4 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16M4 12h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-border-light"></div>

                  {/* Infants */}
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-text-primary font-semibold text-sm">Infants</p>
                      <p className="text-text-secondary text-xs mt-1">Under 2</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-text-primary hover:bg-background transition-all duration-200"
                        onClick={(e) => { e.stopPropagation(); setInfants(Math.max(0, infants - 1)); }}
                      >
                        <svg className="w-4 h-4 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-text-primary font-semibold text-sm">{infants}</span>
                      <button 
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-text-primary hover:bg-background transition-all duration-200"
                        onClick={(e) => { e.stopPropagation(); setInfants(infants + 1); }}
                      >
                        <svg className="w-4 h-4 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16M4 12h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Buttons */}
        <div className="flex justify-center gap-8">
          {categories.map((category) => (
            <Link
              key={category.label}
              href="/"
              className={`flex flex-col items-center gap-2 pb-3 transition-all duration-200 ${
                category.active 
                  ? 'text-text-primary' 
                  : 'text-text-secondary hover:text-text-primary hover:scale-105'
              }`}
            >
              <div className={`p-2.5 rounded-xl transition-all duration-200 ${category.active ? 'bg-primary-light' : 'hover:bg-background'}`}>
                {category.icon}
              </div>
              <span className={`text-xs ${category.active ? "font-bold" : "font-semibold"} ${category.active ? 'border-b-2 border-primary pb-1' : ''}`}>
                {category.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
