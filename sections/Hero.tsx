import React from "react";
import { Button } from "@/components/ui/Button";

export const Hero: React.FC = () => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-sora text-4xl md:text-5xl font-bold text-false-black mb-8 text-center">
          Find your perfect stay
        </h1>
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-false-black/70 mb-2">
                Search destinations
              </label>
              <input
                type="text"
                placeholder="Search destinations"
                className="w-full px-4 py-3 border border-false-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-false-black/70 mb-2">
                Check in
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-false-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-false-black/70 mb-2">
                Check out
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-false-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-green"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button size="lg" className="w-full md:w-auto">
              Search
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
