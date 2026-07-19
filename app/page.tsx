 "use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/sections/Hero";
import { Listings } from "@/sections/Listings";
import { WhyChooseUs } from "@/sections/WhyChooseUs";
import { AboutXYZTravellers } from "@/sections/AboutXYZTravellers";
import { Blogs } from "@/sections/Blogs";
import type { HomeCategory } from "@/data/homeCategories";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<HomeCategory>("Apartments");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <Listings activeCategory={activeCategory} />
        <WhyChooseUs />
        <AboutXYZTravellers />
        <Blogs />
      </main>
      <Footer />
    </div>
  );
}
