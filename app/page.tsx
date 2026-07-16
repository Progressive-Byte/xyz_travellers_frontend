import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/sections/Hero";
import { Listings } from "@/sections/Listings";
import { WhyChooseUs } from "@/sections/WhyChooseUs";
import { AboutXYZTravellers } from "@/sections/AboutXYZTravellers";
import { Blogs } from "@/sections/Blogs";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Listings />
        <WhyChooseUs />
        <AboutXYZTravellers />
        <Blogs />
      </main>
      <Footer />
    </div>
  );
}
