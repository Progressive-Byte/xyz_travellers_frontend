import React from "react";
import Link from "next/link";
import type { BlogCTA as BlogCTAType } from "@/data/blogPosts";

type BlogCTAProps = {
  cta: BlogCTAType;
};

export const BlogCTA: React.FC<BlogCTAProps> = ({ cta }) => {
  return (
    <section className="rounded-[30px] bg-[linear-gradient(135deg,var(--color-text-primary),rgba(26,27,18,0.92))] px-6 py-8 text-white shadow-strong md:px-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{cta.eyebrow}</p>
      <h2 className="mt-4 font-sora text-[30px] font-bold tracking-[-0.04em] text-white md:text-[38px]">
        {cta.title}
      </h2>
      <p className="mt-4 max-w-2xl text-[15px] leading-8 text-white/76">{cta.description}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={cta.primaryHref}
          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover"
        >
          {cta.primaryLabel}
        </Link>

        {cta.secondaryLabel && cta.secondaryHref ? (
          <Link
            href={cta.secondaryHref}
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/8 px-6 py-3 text-[14px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/12"
          >
            {cta.secondaryLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
};
