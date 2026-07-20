import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { frontServices, getFrontServiceBySlug } from "@/data/frontServices";
import event1 from "@/assets/Event/event1.png";
import event2 from "@/assets/Event/event2.jpg";
import event3 from "@/assets/Event/event3.png";
import event4 from "@/assets/Event/event4.png";
import sundar1 from "@/assets/sundarbans_&_tanguar/sundar1.png";
import sundar2 from "@/assets/sundarbans_&_tanguar/sundar2.png";
import sundar3 from "@/assets/sundarbans_&_tanguar/sundar3.png";
import tanguar1 from "@/assets/sundarbans_&_tanguar/tanguar1.png";
import tanguar2 from "@/assets/sundarbans_&_tanguar/tanguar2.png";
import tasnp1 from "@/assets/Trasnport/tasnp1.png";
import transp2 from "@/assets/Trasnport/transp2.png";
import transp3 from "@/assets/Trasnport/transp3.png";
import transp4 from "@/assets/Trasnport/transp4.png";

type ServiceDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return frontServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getFrontServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service not found | XYZ Travellers",
    };
  }

  return {
    title: `${service.detailTitle} | XYZ Travellers`,
    description: service.detailDescription,
  };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params;
  const service = getFrontServiceBySlug(slug);
  const isTourService = slug === "tanguar-haor-sundarbans-tour";
  const isEventService = slug === "event-management-programs";
  const isTransportService = slug === "transport-booking-programs";
  const mediaSection =
    isTourService
      ? {
          eyebrow: "Why This Journey Stands Out",
          title: "A closer look at the experience",
          images: [
            { src: sundar1, alt: "Royal Bengal tiger in the Sundarbans" },
            { src: sundar2, alt: "Cruise ship tour at the Sundarbans" },
            { src: sundar3, alt: "Spotted deer in the Sundarbans forest" },
            { src: tanguar1, alt: "Tanguar Haor scenic travel view" },
            { src: tanguar2, alt: "Tanguar Haor boat and water landscape" },
          ],
        }
      : isEventService
        ? {
            eyebrow: "Built For Better Programs",
            title: "A closer look at the event experience",
            images: [
              { src: event1, alt: "Event setup and guest arrangement" },
              { src: event2, alt: "Organized event program environment" },
              { src: event3, alt: "Professional event management service" },
              { src: event4, alt: "Program coordination and event atmosphere" },
            ],
          }
        : isTransportService
          ? {
              eyebrow: "Built For Reliable Movement",
              title: "A closer look at the transport service",
              images: [
                { src: tasnp1, alt: "Group transport vehicle service" },
                { src: transp2, alt: "Comfortable transport booking option" },
                { src: transp3, alt: "Reliable transport fleet lineup" },
                { src: transp4, alt: "Travel transport support service" },
              ],
            }
          : null;

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="section-shell bg-background pb-20 pt-8 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-center gap-3 text-[13px] font-medium text-text-secondary">
            <Link href="/" className="transition-colors duration-200 hover:text-text-primary">
              Home
            </Link>
            <span>/</span>
            <span>Services</span>
            <span>/</span>
            <span className="text-text-primary">{service.detailTitle}</span>
          </div>

          <section className="mt-6 surface-card-strong overflow-hidden rounded-panel p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-1 lg:items-center">
              <div className="max-w-3xl">
                <span className="section-badge">XYZ Travellers Services</span>
                <h1 className="mt-6 font-sora text-[36px] font-bold leading-tight tracking-[-0.05em] text-text-primary md:text-[52px]">
                  {service.detailTitle}
                </h1>
                <p className="mt-6 text-[16px] leading-8 text-text-secondary">
                  {service.detailDescription}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover"
                  >
                    <span>{service.detailButtonLabel}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium"
                  >
                    <span>Back to Home</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {mediaSection ? (
            <section className="mt-6 surface-card rounded-panel p-6 md:p-8">
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                  {mediaSection.eyebrow}
                </p>
                <h2 className="font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary md:text-[30px]">
                  {mediaSection.title}
                </h2>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {mediaSection.images.map((image) => (
                  <div
                    key={image.alt}
                    className="relative overflow-hidden rounded-[24px] border border-border-light bg-surface shadow-soft"
                  >
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
