import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/sections/Hero";
import { Listings } from "@/sections/Listings";
import { WhyChooseUs } from "@/sections/WhyChooseUs";
import { AboutTravela } from "@/sections/AboutTravela";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Listings />
        <WhyChooseUs />
        <AboutTravela />
      </main>
      <Footer />
    </div>
  );
}
