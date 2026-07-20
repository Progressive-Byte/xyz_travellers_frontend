 "use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/sections/Hero";
import { Listings } from "@/sections/Listings";
import { WhyChooseUs } from "@/sections/WhyChooseUs";
import { AboutXYZTravellers } from "@/sections/AboutXYZTravellers";
import { Blogs } from "@/sections/Blogs";
import { ApiError } from "@/lib/api";
import {
  defaultFrontHomepageTabs,
  getFrontHomepageListings,
  type FrontHomepageFeed,
  type FrontHomepageTabKey,
} from "@/lib/front";

export default function Home() {
  const [activeTab, setActiveTab] = useState<FrontHomepageTabKey>("apartments");
  const [homepageFeed, setHomepageFeed] = useState<FrontHomepageFeed | null>(null);
  const [isLoadingHomepage, setIsLoadingHomepage] = useState(true);
  const [homepageError, setHomepageError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadHomepage = async () => {
      setIsLoadingHomepage(true);
      setHomepageError("");

      try {
        const data = await getFrontHomepageListings(activeTab);

        if (cancelled) {
          return;
        }

        setHomepageFeed(data);
        setActiveTab(data.activeTab);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setHomepageError(
          error instanceof ApiError
            ? error.message
            : "Unable to load the curated homepage listings right now.",
        );
      } finally {
        if (!cancelled) {
          setIsLoadingHomepage(false);
        }
      }
    };

    void loadHomepage();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero
          tabs={homepageFeed?.tabs ?? [...defaultFrontHomepageTabs]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <Listings
          sections={homepageFeed?.sections ?? []}
          isLoading={isLoadingHomepage}
          error={homepageError}
        />
        <WhyChooseUs />
        <AboutXYZTravellers />
        <Blogs />
      </main>
      <Footer />
    </div>
  );
}
