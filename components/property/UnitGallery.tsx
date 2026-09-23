"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import type { FrontPropertyGalleryImage } from "@/lib/front";

type UnitGalleryProps = {
  unitLabel: string;
  images: FrontPropertyGalleryImage[];
};

export const UnitGallery: React.FC<UnitGalleryProps> = ({
  unitLabel,
  images,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
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
        setActiveIndex(
          (current) => (current - 1 + images.length) % images.length,
        );
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length, isModalOpen]);

  if (!images.length) {
    return null;
  }

  const openGallery = (index: number) => {
    setActiveIndex(index);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {images.slice(0, 5).map((image, index) => (
          <button
            key={image.id || image.src}
            type="button"
            onClick={() => openGallery(index)}
            className="group relative h-24 w-24 overflow-hidden rounded-[18px] border border-border bg-surface-muted transition-transform duration-200 hover:-translate-y-0.5 sm:h-28 sm:w-28"
            aria-label={`Open ${unitLabel} gallery image ${index + 1}`}
          >
            <Image
              src={image.src}
              alt={image.alt || `${unitLabel} gallery image`}
              fill
              sizes="112px"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
            {index === 4 && images.length > 5 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-[13px] font-semibold text-white">
                +{images.length - 5}
              </div>
            ) : null}
          </button>
        ))}
      </div>

      {isModalOpen && activeImage && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] overflow-y-auto bg-[rgba(26,27,18,0.82)] px-3 py-3 backdrop-blur-md sm:px-4 sm:py-6 [animation:gallery-backdrop-in_0.22s_ease-out]"
              role="dialog"
              aria-modal="true"
              aria-label={`${unitLabel} full gallery`}
              onClick={() => setIsModalOpen(false)}
            >
              <div
                className="surface-card-strong relative mx-auto flex max-h-[calc(100vh-24px)] w-full max-w-5xl flex-col overflow-hidden rounded-[30px] p-3 [animation:gallery-panel-in_0.32s_cubic-bezier(0.16,1,0.3,1)] sm:max-h-[calc(100vh-48px)] sm:p-4 md:p-5"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <h3 className="font-sora text-[20px] font-bold tracking-[-0.03em] text-text-primary md:text-[24px]">
                    {unitLabel}
                  </h3>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-text-primary shadow-soft transition-all duration-200 hover:bg-surface"
                    aria-label="Close gallery"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
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
                    <div
                      key={activeIndex}
                      className="relative h-[clamp(280px,58vh,720px)] w-full [animation:gallery-slide-fade_0.35s_ease-out]"
                    >
                      <Image
                        src={activeImage.src}
                        alt={activeImage.alt || `${unitLabel} gallery image`}
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
                            setActiveIndex(
                              (current) =>
                                (current - 1 + images.length) % images.length,
                            )
                          }
                          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(255,255,255,0.92)] text-text-primary shadow-medium transition-all duration-200 hover:scale-105 sm:left-4 sm:h-11 sm:w-11"
                          aria-label="Previous image"
                        >
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
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
                          onClick={() =>
                            setActiveIndex(
                              (current) => (current + 1) % images.length,
                            )
                          }
                          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(255,255,255,0.92)] text-text-primary shadow-medium transition-all duration-200 hover:scale-105 sm:right-4 sm:h-11 sm:w-11"
                          aria-label="Next image"
                        >
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
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
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                    {images.map((image, index) => (
                      <button
                        key={image.id || image.src}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={`relative overflow-hidden rounded-[14px] border ${
                          index === activeIndex
                            ? "border-text-primary shadow-medium"
                            : "border-border hover:border-text-primary/30"
                        }`}
                        aria-label={`Show gallery image ${index + 1}`}
                      >
                        <div className="relative aspect-[4/3] w-full bg-surface-muted">
                          <Image
                            src={image.src}
                            alt={
                              image.alt || `${unitLabel} thumbnail ${index + 1}`
                            }
                            fill
                            sizes="180px"
                            className="object-cover"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
};
