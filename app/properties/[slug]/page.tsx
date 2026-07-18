import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyBookingCard } from "@/components/property/PropertyBookingCard";
import { ListingCard } from "@/components/ui/ListingCard";
import {
  getPropertyBySlug,
  getRelatedProperties,
  properties,
  type Property,
} from "@/data/properties";

type PropertyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const statItems = (property: Property) => [
  { label: "Guests", value: `${property.guestCount}` },
  { label: "Bedrooms", value: `${property.bedroomCount}` },
  { label: "Bathrooms", value: `${property.bathroomCount}` },
  { label: "Type", value: property.propertyType },
];

const amenityIcon = (label: string) => {
  const lowerLabel = label.toLowerCase();

  if (lowerLabel.includes("wifi")) {
    return "Wi";
  }
  if (lowerLabel.includes("air")) {
    return "AC";
  }
  if (lowerLabel.includes("kitchen")) {
    return "KT";
  }
  if (lowerLabel.includes("workspace")) {
    return "WS";
  }
  if (lowerLabel.includes("water")) {
    return "HW";
  }
  if (lowerLabel.includes("tv")) {
    return "TV";
  }
  if (lowerLabel.includes("parking")) {
    return "PK";
  }

  return "OK";
};

const SectionTitle: React.FC<{
  eyebrow: string;
  title: string;
  description?: string;
}> = ({ eyebrow, title, description }) => (
  <div>
    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
      {eyebrow}
    </p>
    <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary md:text-[34px]">
      {title}
    </h2>
    {description ? (
      <p className="mt-3 max-w-3xl text-[15px] leading-7 text-text-secondary">{description}</p>
    ) : null}
  </div>
);

const DetailStat: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <div className="rounded-[22px] border border-border bg-card px-4 py-4 shadow-soft">
    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
      {label}
    </p>
    <p className="mt-2 text-[15px] font-semibold text-text-primary">{value}</p>
  </div>
);

export async function generateStaticParams() {
  return properties.map((property) => ({ slug: property.slug }));
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    return {
      title: "Property not found | XYZ Travellers",
    };
  }

  return {
    title: `${property.title} | XYZ Travellers`,
    description: property.summary,
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const relatedProperties = getRelatedProperties(property);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="section-shell overflow-hidden bg-background pb-20 pt-8 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto">
            <div className="flex flex-wrap items-center gap-3 text-[13px] font-medium text-text-secondary">
              <Link href="/" className="transition-colors duration-200 hover:text-text-primary">
                Home
              </Link>
              <span>/</span>
              <span>Properties</span>
              <span>/</span>
              <span className="text-text-primary">{property.title}</span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {property.isNew ? (
                <span className="rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-text-primary shadow-glow">
                  New listing
                </span>
              ) : null}
              {property.featuredBadge ? (
                <span className="rounded-full border border-border bg-card px-4 py-2 text-[12px] font-semibold text-text-primary shadow-soft">
                  {property.featuredBadge}
                </span>
              ) : null}
              <span className="rounded-full border border-border bg-white/70 px-4 py-2 text-[12px] font-semibold text-text-secondary">
                {property.category}
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl font-sora text-[38px] font-bold leading-tight tracking-[-0.05em] text-text-primary md:text-[54px]">
              {property.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-[14px] text-text-secondary">
              <span className="rounded-full border border-border bg-card px-4 py-2 font-medium shadow-soft">
                {property.location}
              </span>
              <span className="rounded-full border border-border bg-card px-4 py-2 font-medium shadow-soft">
                {property.rating ? `${property.rating.toFixed(1)} rating` : "New property"}
              </span>
              <span className="rounded-full border border-border bg-card px-4 py-2 font-medium shadow-soft">
                {property.reviewCount} reviews
              </span>
              <span className="rounded-full border border-border bg-card px-4 py-2 font-medium shadow-soft">
                Up to {property.guestCount} guests
              </span>
            </div>
          </div>

          <PropertyGallery title={property.title} images={property.gallery} />

          <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_360px]">
            <div className="space-y-8">
              <div className="surface-card-strong rounded-[30px] p-6 md:p-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                  About This Stay
                </p>

                <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary md:text-[34px]">
                  {`A ${property.propertyType.toLowerCase()} in ${property.shortLocation}`}
                </h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {statItems(property).map((item) => (
                    <DetailStat key={item.label} label={item.label} value={item.value} />
                  ))}
                </div>

                <p className="mt-5 max-w-3xl text-[15px] leading-7 text-text-secondary">
                  Structured for easy scanning, comfortable booking, and a cleaner guest
                  experience from arrival to checkout.
                </p>

                <div className="mt-8 space-y-5">
                  {property.description.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-[15px] leading-8 text-text-secondary"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

              </div>

              <div className="surface-card rounded-[30px] p-6 md:p-8">
                <SectionTitle
                  eyebrow="Facilities"
                  title="Thoughtful essentials for a smoother stay"
                  description="A balanced amenity set shaped around comfort, practicality, and the expectations of short-term guests."
                />

                <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {property.facilities.map((facility) => (
                    <div
                      key={facility}
                      className="rounded-[22px] border border-border-light bg-card px-4 py-4 shadow-soft"
                    >
                      <div className="icon-chip h-10 w-10 rounded-[14px] text-[11px] font-bold">
                        {amenityIcon(facility)}
                      </div>
                      <p className="mt-4 text-[14px] font-medium text-text-primary">{facility}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="surface-card rounded-[30px] p-6 md:p-8">
                  <SectionTitle
                    eyebrow="Hosted By"
                    title={property.host.name}
                    description={property.host.note}
                  />

                  <div className="mt-7 rounded-[26px] border border-border-light bg-card p-5 shadow-soft">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-[24px] font-bold text-text-primary shadow-glow">
                        {property.host.initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[19px] font-semibold text-text-primary">
                            {property.host.tagline}
                          </p>
                          <span className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                            {property.host.isVerified ? "Verified host" : "Independent host"}
                          </span>
                        </div>

                        <p className="mt-2 text-[14px] leading-7 text-text-secondary">
                          Languages: {property.host.languages.join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[20px] border border-border-light bg-surface px-4 py-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                          Support style
                        </p>
                        <p className="mt-2 text-[14px] leading-7 text-text-primary">
                          Calm communication and local help before arrival when needed.
                        </p>
                      </div>

                      <div className="rounded-[20px] border border-border-light bg-surface px-4 py-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                          Best for
                        </p>
                        <p className="mt-2 text-[14px] leading-7 text-text-primary">
                          Guests who want a simple, reliable check-in and quick answers.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-6 inline-flex rounded-full border border-border bg-card px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium"
                  >
                    Contact host
                  </button>
                </div>

                <div className="surface-card rounded-[30px] p-6 md:p-8">
                  <SectionTitle
                    eyebrow="Location"
                    title={`${property.map.area}, ${property.map.city}`}
                    description={property.map.summary}
                  />

                  <div className="mt-7 overflow-hidden rounded-[26px] border border-border bg-surface shadow-soft">
                    <div className="relative h-[260px] bg-[linear-gradient(180deg,rgba(227,235,241,0.95),rgba(244,248,250,0.98))]">
                      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(26,27,18,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(26,27,18,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
                      <div className="absolute left-[10%] top-[16%] rounded-full bg-white/92 px-4 py-2 text-[12px] font-semibold text-text-primary shadow-soft">
                        {property.map.area}
                      </div>
                      <div className="absolute right-[12%] top-[32%] rounded-full bg-white/92 px-4 py-2 text-[12px] font-semibold text-text-primary shadow-soft">
                        Nearby
                      </div>
                      <div className="absolute left-1/2 top-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-text-primary text-primary shadow-strong">
                        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z"
                            fill="currentColor"
                          />
                          <circle cx="12" cy="10" r="2.5" fill="var(--color-primary)" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2.5">
                    {property.map.landmarks.map((landmark) => (
                      <span
                        key={landmark}
                        className="rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium text-text-secondary shadow-soft"
                      >
                        {landmark}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="surface-card rounded-[30px] p-6 md:p-8">
                <SectionTitle
                  eyebrow="Reviews"
                  title={`What guests say about ${property.title}`}
                  description="Real guest feedback surfaced in a cleaner format that is easier to scan than a marketplace-heavy review block."
                />

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-text-primary shadow-glow">
                    {property.rating ? property.rating.toFixed(1) : "New"}
                  </div>
                  <p className="text-[14px] text-text-secondary">
                    Based on {property.reviewCount} reviews from recent guests
                  </p>
                </div>

                <div className="mt-8 grid gap-4">
                  {property.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-[24px] border border-border-light bg-card px-5 py-5 shadow-soft"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-[15px] font-semibold text-text-primary">
                            {review.author}
                          </p>
                          <p className="mt-1 text-[13px] text-text-secondary">{review.date}</p>
                        </div>
                        <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-text-primary">
                          {review.rating.toFixed(1)} / 5
                        </span>
                      </div>
                      <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="self-start lg:sticky lg:top-28">
              <PropertyBookingCard
                pricePerNight={property.pricePerNight}
                guestCount={property.guestCount}
              />
            </div>
          </section>

          <section className="mt-12">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <SectionTitle
                eyebrow="Related Stays"
                title="Continue exploring similar properties"
                description="Use the same card system from the homepage so discovery stays familiar and connected."
              />
              <Link
                href="/"
                className="inline-flex w-fit rounded-full border border-border bg-card px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium"
              >
                Back to listings
              </Link>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {relatedProperties.map((relatedProperty) => (
                <ListingCard
                  key={relatedProperty.slug}
                  title={relatedProperty.title}
                  location={relatedProperty.location}
                  price={relatedProperty.pricePerNight}
                  rating={relatedProperty.rating}
                  isNew={relatedProperty.isNew}
                  imageUrl={relatedProperty.gallery[0]?.src}
                  href={`/properties/${relatedProperty.slug}`}
                  className="w-full"
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
