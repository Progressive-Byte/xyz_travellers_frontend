import React from "react";
import type { BlogContentSection as BlogContentSectionType } from "@/data/blogPosts";

type BlogContentSectionProps = {
  section: BlogContentSectionType;
  index: number;
};

export const BlogContentSection: React.FC<BlogContentSectionProps> = ({ section, index }) => {
  return (
    <section className="surface-card rounded-[30px] p-6 md:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[16px] bg-primary-light text-[13px] font-bold text-text-primary">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
            Article Section
          </p>
          <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            {section.heading}
          </h2>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {section.body.map((paragraph) => (
          <p key={paragraph} className="text-[15px] leading-8 text-text-secondary">
            {paragraph}
          </p>
        ))}
      </div>

      {section.bullets?.length ? (
        <div className="mt-6 rounded-[24px] border border-border-light bg-card px-5 py-5 shadow-soft">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
            Key Takeaways
          </p>
          <ul className="mt-4 space-y-3">
            {section.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-[14px] leading-7 text-text-primary">
                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {section.highlight ? (
        <div className="mt-6 rounded-[24px] border border-border bg-primary-light px-5 py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
            Highlight
          </p>
          <p className="mt-3 text-[15px] leading-8 text-text-primary">{section.highlight}</p>
        </div>
      ) : null}
    </section>
  );
};
