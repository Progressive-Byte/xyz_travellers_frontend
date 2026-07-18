'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { PropertyImage } from "@/data/properties";

type PropertyGalleryProps = {
  title: string;
  images: PropertyImage[];
};

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ title, images }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [leadImage, ...secondaryImages] = images;
  const activeImage = images[activeIndex];

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current + 1) % images.length);
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => (current - 1 + images.length) % images.length);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length, isModalOpen]);

  if (!leadImage) {
    return null;
  }

  const openGallery = (index: number) => {
    setActiveIndex(index);
    setIsModalOpen(true);
  };

  return (
    <>
      <section className="mt-8">
        <div className="surface-card-strong overflow-hidden rounded-[30px] p-3">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <button
            type="button"
            onClick={() => openGallery(0)}
            className="relative min-h-[320px] overflow-hidden rounded-[24px] bg-surface-muted text-left sm:min-h-[420px]"
            aria-label={`Open full gallery for ${title}`}
          >
            <Image
              src={leadImage.src}
              alt={leadImage.alt || title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/16 via-transparent to-transparent" />
          </button>

          <div className="grid grid-cols-2 gap-3">
            {secondaryImages.slice(0, 4).map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => openGallery(index + 1)}
                className="relative min-h-[150px] overflow-hidden rounded-[20px] bg-surface-muted text-left sm:min-h-[200px]"
                aria-label={`Open gallery image ${index + 2} for ${title}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt || `${title} gallery image ${index + 2}`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
                {index === 3 ? (
                  <div className="absolute inset-x-3 bottom-3 rounded-full bg-[rgba(255,255,255,0.92)] px-3 py-2 text-center text-[12px] font-semibold text-text-primary shadow-soft">
                    View full gallery
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        </div>
        </div>
      </section>

      {isModalOpen && activeImage ? (
        <div
          className="fixed inset-0 z-[80] overflow-y-auto bg-[rgba(26,27,18,0.82)] px-3 py-3 backdrop-blur-md sm:px-4 sm:py-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} full gallery`}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="surface-card-strong relative mx-auto flex max-h-[calc(100vh-24px)] w-full max-w-6xl flex-col overflow-hidden rounded-[30px] p-3 sm:max-h-[calc(100vh-48px)] sm:p-4 md:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                  Full Gallery
                </p>
                <h3 className="mt-2 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary md:text-[30px]">
                  {title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-text-primary shadow-soft transition-all duration-200 hover:bg-surface"
                aria-label="Close full gallery"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M6 6l12 12M18 6 6 18"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="relative overflow-hidden rounded-[24px] bg-surface-muted">
                <div className="relative h-[clamp(260px,52vh,680px)] w-full">
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt || `${title} full gallery image`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                </div>

                {images.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveIndex((current) => (current - 1 + images.length) % images.length)
                      }
                      className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(255,255,255,0.92)] text-text-primary shadow-medium transition-all duration-200 hover:scale-105 sm:left-4 sm:h-11 sm:w-11"
                      aria-label="Previous gallery image"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path
                          d="M15 18l-6-6 6-6"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveIndex((current) => (current + 1) % images.length)}
                      className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(255,255,255,0.92)] text-text-primary shadow-medium transition-all duration-200 hover:scale-105 sm:right-4 sm:h-11 sm:w-11"
                      aria-label="Next gallery image"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path
                          d="M9 6l6 6-6 6"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[14px] font-medium text-text-secondary">
                  Image {activeIndex + 1} of {images.length}
                </p>
                <p className="hidden text-[13px] text-text-secondary md:block">
                  Use arrow keys or thumbnails to browse
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {images.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative overflow-hidden rounded-[18px] border ${
                      index === activeIndex
                        ? "border-text-primary shadow-medium"
                        : "border-border hover:border-text-primary/30"
                    }`}
                    aria-label={`Show gallery image ${index + 1}`}
                  >
                    <div className="relative aspect-[4/3] w-full bg-surface-muted">
                      <Image
                        src={image.src}
                        alt={image.alt || `${title} thumbnail ${index + 1}`}
                        fill
                        sizes="240px"
                        className="object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
