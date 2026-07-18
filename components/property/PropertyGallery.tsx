import React from "react";
import Image from "next/image";
import type { PropertyImage } from "@/data/properties";

type PropertyGalleryProps = {
  title: string;
  images: PropertyImage[];
};

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ title, images }) => {
  const [leadImage, ...secondaryImages] = images;

  if (!leadImage) {
    return null;
  }

  return (
    <section className="mt-8">
      <div className="surface-card-strong overflow-hidden rounded-[30px] p-3">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="relative min-h-[320px] overflow-hidden rounded-[24px] bg-surface-muted sm:min-h-[420px]">
            <Image
              src={leadImage.src}
              alt={leadImage.alt || title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/16 via-transparent to-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {secondaryImages.slice(0, 4).map((image, index) => (
              <div
                key={image.src}
                className="relative min-h-[150px] overflow-hidden rounded-[20px] bg-surface-muted sm:min-h-[200px]"
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
