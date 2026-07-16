import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 bg-cream-white border-b border-false-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="font-sora text-2xl font-bold text-false-black">
              Travela
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/apartments"
                className="text-false-black hover:text-lime-green px-3 py-2 rounded-md text-sm font-medium"
              >
                Apartments
              </Link>
              <Link
                href="/rooms"
                className="text-false-black hover:text-lime-green px-3 py-2 rounded-md text-sm font-medium"
              >
                Rooms
              </Link>
              <Link
                href="/hotels"
                className="text-false-black hover:text-lime-green px-3 py-2 rounded-md text-sm font-medium"
              >
                Hotels
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/host"
              className="text-false-black hover:text-lime-green text-sm font-medium"
            >
              Earn By hosting
            </Link>
            <Button variant="secondary" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
