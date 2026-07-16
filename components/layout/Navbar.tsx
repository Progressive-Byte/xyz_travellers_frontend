'use client';

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

export const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop offset="100%" stopColor="var(--color-primary-hover)" />
                  </linearGradient>
                </defs>
                <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="url(#logoGradient)"/>
                <path d="M10 14H14V17H10V14Z" fill="white"/>
              </svg>
              <span className="font-sora text-2xl font-bold text-text-primary tracking-tight">travela</span>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-5">
            <Link href="/host" className="text-text-primary text-sm font-medium px-4 py-2 rounded-full hover:bg-background cursor-pointer transition-all duration-200">
              Earn By hosting
            </Link>
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={toggleDropdown}
                className="flex items-center gap-3 border border-border rounded-full px-3 py-2 bg-card hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              </button>

              {/* Dropdown Menu */}
              <div 
                className={`absolute right-0 top-full mt-3 w-64 bg-card rounded-2xl shadow-xl border border-border overflow-hidden transition-all duration-300 ease-out ${
                  isDropdownOpen 
                    ? 'opacity-100 translate-y-0 pointer-events-auto' 
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="px-4 py-3">
                  <Link href="/login" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-background cursor-pointer transition-all duration-200 group">
                    <div className="w-9 h-9 rounded-full bg-background flex items-center justify-center group-hover:scale-105 transition-transform">
                      <svg className="w-4.5 h-4.5 text-text-secondary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-text-primary text-sm font-semibold">Log in or sign up</span>
                    </div>
                  </Link>
                </div>
                <div className="h-px bg-border mx-4"></div>
                <div className="px-4 py-3 space-y-1">
                  <Link href="/host" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-background cursor-pointer transition-all duration-200 group">
                    <div className="w-9 h-9 rounded-full bg-background flex items-center justify-center group-hover:scale-105 transition-transform">
                      <svg className="w-4.5 h-4.5 text-text-secondary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-text-primary text-sm font-medium">Earn by Hosting</span>
                  </Link>
                  <Link href="/help" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-background cursor-pointer transition-all duration-200 group">
                    <div className="w-9 h-9 rounded-full bg-background flex items-center justify-center group-hover:scale-105 transition-transform">
                      <svg className="w-4.5 h-4.5 text-text-secondary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-text-primary text-sm font-medium">Help Center</span>
                  </Link>
                  <Link href="/about" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-background cursor-pointer transition-all duration-200 group">
                    <div className="w-9 h-9 rounded-full bg-background flex items-center justify-center group-hover:scale-105 transition-transform">
                      <svg className="w-4.5 h-4.5 text-text-secondary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-text-primary text-sm font-medium">About Us</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
