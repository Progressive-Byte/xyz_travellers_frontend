"use client";

import Image from "next/image";
import Link from "next/link";
import brandLogo from "@/assets/logo/TS Logo 2.svg";

type BrandLogoProps = {
  href: string;
  subtitle?: string;
  onClick?: () => void;
  variant?: "navbar" | "sidebar";
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  href,
  subtitle,
  onClick,
  variant = "navbar",
}) => {
  const imageClassName =
    variant === "navbar" ? "h-[68px] w-auto md:h-[80px]" : "h-[62px] w-auto md:h-[72px]";
  const imageWidth = variant === "navbar" ? 340 : 300;
  const imageHeight = variant === "navbar" ? 159 : 141;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-[20px] transition-all duration-200 ${
        variant === "navbar" ? "" : "px-1 py-1 hover:bg-white/70"
      }`}
    >
      <div className="min-w-0">
        <Image
          src={brandLogo}
          alt="XYZ Travellers"
          width={imageWidth}
          height={imageHeight}
          priority
          className={imageClassName}
        />
        {subtitle ? (
          <span className="mt-1 block pl-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            {subtitle}
          </span>
        ) : null}
      </div>
    </Link>
  );
};
