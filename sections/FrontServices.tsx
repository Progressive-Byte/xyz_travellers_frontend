import React from "react";
import Image from "next/image";
import Link from "next/link";
import { frontServices } from "@/data/frontServices";
import event3 from "@/assets/Event/event3.png";
import sundar1 from "@/assets/sundarbans_&_tanguar/sundar1.png";
import sundar2 from "@/assets/sundarbans_&_tanguar/sundar2.png";
import sundar3 from "@/assets/sundarbans_&_tanguar/sundar3.png";
import transp3 from "@/assets/Trasnport/transp3.png";

const visualLayouts = [
  [
    "left-4 top-8 h-28 w-28",
    "left-24 top-16 h-20 w-20",
    "left-14 top-28 h-24 w-24",
  ],
  [
    "left-8 top-10 h-28 w-28",
    "left-24 top-20 h-24 w-24",
    "left-14 top-28 h-20 w-20",
  ],
  [
    "left-12 top-8 h-24 w-24",
    "left-28 top-14 h-28 w-28",
    "left-20 top-30 h-20 w-20",
  ],
] as const;

export const FrontServices: React.FC = () => {
  return (
    <section className="section-shell bg-card py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="space-y-6">
          {frontServices.map((service, index) => {
            const isTourService = service.slug === "tanguar-haor-sundarbans-tour";
            const isEventService = service.slug === "event-management-programs";
            const isTransportService = service.slug === "transport-booking-programs";

            return (
              <article
                key={service.slug}
                className="surface-card-strong overflow-hidden rounded-panel p-6 md:p-8"
              >
                <div
                  className={`grid gap-8 lg:items-center ${
                    isTourService
                      ? "lg:grid-cols-[minmax(0,1.02fr)_420px]"
                      : isEventService || isTransportService
                        ? "lg:grid-cols-[minmax(0,1.08fr)_360px]"
                        : "lg:grid-cols-[minmax(0,1.2fr)_280px]"
                  }`}
                >
                <div className="max-w-2xl">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                    XYZ Travellers Programs
                  </p>
                  <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary md:text-[34px]">
                    {service.homeTitle}
                  </h2>
                  <div className="section-divider mt-4" />
                  <p className="mt-5 text-[15px] leading-8 text-text-secondary">
                    {service.homeDescription}
                  </p>

                  <div className="mt-6">
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover"
                    >
                      <span>{service.homeButtonLabel}</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>

                  {isTourService ? (
                    <div className="relative hidden h-[300px] overflow-hidden rounded-[28px] border border-border-light bg-surface lg:block">
                      <div className={`absolute inset-0 bg-gradient-to-br ${service.accent}`} />
                      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(26,27,18,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(26,27,18,0.05)_1px,transparent_1px)] [background-size:24px_24px]" />

                      <div className="absolute left-4 top-5 h-[176px] w-[176px] overflow-hidden rounded-[26px] border border-white/80 bg-white shadow-medium">
                        <Image
                          src={sundar1}
                          alt="Sundarbans tiger tour"
                          fill
                          sizes="176px"
                          className="object-cover"
                        />
                      </div>

                      <div className="absolute right-5 top-8 h-[150px] w-[150px] rotate-[6deg] overflow-hidden rounded-[26px] border border-white/80 bg-white shadow-medium">
                        <Image
                          src={sundar2}
                          alt="Sundarbans cruise tour"
                          fill
                          sizes="150px"
                          className="object-cover"
                        />
                      </div>

                      <div className="absolute bottom-5 left-[118px] h-[164px] w-[164px] -rotate-[5deg] overflow-hidden rounded-[26px] border border-white/80 bg-white shadow-medium">
                        <Image
                          src={sundar3}
                          alt="Sundarbans wildlife tour"
                          fill
                          sizes="164px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ) : isEventService || isTransportService ? (
                    <div className="relative hidden h-[260px] overflow-hidden rounded-[28px] border border-border-light bg-surface lg:block">
                      <div className={`absolute inset-0 bg-gradient-to-br ${service.accent}`} />
                      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(26,27,18,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(26,27,18,0.05)_1px,transparent_1px)] [background-size:24px_24px]" />
                      <div className="absolute inset-5 overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-medium">
                        <Image
                          src={isEventService ? event3 : transp3}
                          alt={
                            isEventService
                              ? "Event management program visual"
                              : "Transport booking program visual"
                          }
                          fill
                          sizes="360px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative hidden h-[210px] overflow-hidden rounded-[28px] border border-border-light bg-surface lg:block">
                      <div className={`absolute inset-0 bg-gradient-to-br ${service.accent}`} />
                      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(26,27,18,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(26,27,18,0.05)_1px,transparent_1px)] [background-size:24px_24px]" />
                      {visualLayouts[index]?.map((position, blockIndex) => (
                        <div
                          key={position}
                          className={`absolute rounded-[24px] border border-white/70 bg-white/85 shadow-soft backdrop-blur ${position} ${
                            blockIndex === 1 ? "rotate-[7deg]" : blockIndex === 2 ? "-rotate-[6deg]" : ""
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
