 "use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/sections/Hero";
import { Listings } from "@/sections/Listings";
import { WhyChooseUs } from "@/sections/WhyChooseUs";
import { AboutXYZTravellers } from "@/sections/AboutXYZTravellers";
import { FrontServices } from "@/sections/FrontServices";
import { Blogs } from "@/sections/Blogs";
import { ApiError } from "@/lib/api";
import {
  defaultFrontHomepageTabs,
  getFrontDestinationPage,
  getFrontHomepageListings,
  type FrontHomepageFeed,
  type FrontHomepageSection,
  type FrontHomepageTabKey,
} from "@/lib/front";

const FEATURED_DESTINATION_SLUG = "sundarban";

export default function Home() {
  const [activeTab, setActiveTab] = useState<FrontHomepageTabKey>("apartments");
  const [homepageFeed, setHomepageFeed] = useState<FrontHomepageFeed | null>(null);
  const [isLoadingHomepage, setIsLoadingHomepage] = useState(true);
  const [homepageError, setHomepageError] = useState("");
  const [featuredSection, setFeaturedSection] = useState<FrontHomepageSection | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Featured destination rail shown above the curated sections; hidden if the location is missing or empty.
    getFrontDestinationPage(FEATURED_DESTINATION_SLUG, { listingsLimit: 12 })
      .then((page) => {
        if (cancelled || page.listingsSection.items.length === 0) return;
        setFeaturedSection({
          key: `destination-${FEATURED_DESTINATION_SLUG}`,
          title: page.location.name || "Sundarban",
          slug: page.location.slug || FEATURED_DESTINATION_SLUG,
          source: "destination",
          sectionId: "",
          items: page.listingsSection.items,
        });
      })
      .catch(() => {
        if (!cancelled) setFeaturedSection(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
          sections={[
            ...(featuredSection ? [featuredSection] : []),
            ...(homepageFeed?.sections ?? []),
          ]}
          isLoading={isLoadingHomepage}
          error={homepageError}
        />
        <WhyChooseUs />
        <AboutXYZTravellers />
        <FrontServices />
        <Blogs />
      </main>
      <Footer />
    </div>
  );
}
