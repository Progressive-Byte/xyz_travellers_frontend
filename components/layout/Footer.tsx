import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-footer-bg text-footer-text py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-sora text-xl font-bold mb-4">Travela</h3>
            <p className="text-footer-text-muted text-sm">
              Book Rooms, Apartments, Hotels, Resorts & Villas in Bangladesh
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-footer-text-muted">
              <li>
                <Link href="/apartments" className="hover:text-primary">
                  Apartments
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="hover:text-primary">
                  Rooms
                </Link>
              </li>
              <li>
                <Link href="/hotels" className="hover:text-primary">
                  Hotels
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Host</h4>
            <ul className="space-y-2 text-sm text-footer-text-muted">
              <li>
                <Link href="/host" className="hover:text-primary">
                  Earn By hosting
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-footer-text-muted">
              <li>
                <Link href="/help" className="hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-footer-border mt-8 pt-8 text-center text-sm text-footer-text-muted/70">
          <p>© 2026 Travela. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
