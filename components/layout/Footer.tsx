import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-false-black text-cream-white py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-sora text-xl font-bold mb-4">Travela</h3>
            <p className="text-cream-white/70 text-sm">
              Book Rooms, Apartments, Hotels, Resorts & Villas in Bangladesh
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-cream-white/70">
              <li>
                <Link href="/apartments" className="hover:text-lime-green">
                  Apartments
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="hover:text-lime-green">
                  Rooms
                </Link>
              </li>
              <li>
                <Link href="/hotels" className="hover:text-lime-green">
                  Hotels
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Host</h4>
            <ul className="space-y-2 text-sm text-cream-white/70">
              <li>
                <Link href="/host" className="hover:text-lime-green">
                  Earn By hosting
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-cream-white/70">
              <li>
                <Link href="/help" className="hover:text-lime-green">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-lime-green">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-cream-white/20 mt-8 pt-8 text-center text-sm text-cream-white/50">
          <p>© 2026 Travela. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
