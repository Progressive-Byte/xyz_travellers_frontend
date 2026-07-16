'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";

const blogs = [
  {
    category: "Travel Guide",
    title: "Top 10 Tourist Places in Dhaka With a First-Time Visitor's Guide",
    excerpt:
      "A practical starting point for travelers who want culture, landmarks, and city energy without missing the essentials.",
    author: "XYZ Travellers Team",
    date: "Oct 09, 2025",
    readTime: "8 min read",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=travel%20editorial%20cover%20for%20Dhaka%20tourist%20guide%2C%20vibrant%20city%20landmarks%2C%20premium%20magazine-style%20composition%2C%20realistic%20photo&image_size=landscape_4_3",
  },
  {
    category: "Hosting Tips",
    title: "Top 5 Side Hustles in Bangladesh You Can Start Today",
    excerpt:
      "A more grounded look at flexible income ideas for young professionals, students, and aspiring hosts who want smarter earning options.",
    author: "XYZ Travellers Team",
    date: "Oct 08, 2025",
    readTime: "6 min read",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=young%20Bangladeshi%20professionals%20planning%20income%20ideas%20with%20laptop%20and%20notebook%2C%20premium%20editorial%20blog%20cover%2C%20realistic%20photo&image_size=landscape_4_3",
  },
];

export const Blogs: React.FC = () => {
  return (
    <section className="section-shell bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-badge">XYZ Travellers Blogs</span>
          <h2 className="section-heading mt-6">Stories, practical guides, and smarter ways to stay</h2>
          <p className="section-subtitle mx-auto mt-5">
            Read travel ideas, hosting insights, and helpful recommendations curated
            to support better trips across Bangladesh.
          </p>
          <div className="section-divider mx-auto mt-6" />
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2">
          {blogs.map((blog) => (
            <article
              key={blog.title}
              className="surface-card-strong hover-lift overflow-hidden rounded-panel"
            >
              <div className="relative h-[260px] overflow-hidden">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

                <div className="absolute left-5 top-5 rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-text-primary shadow-soft">
                  {blog.category}
                </div>
                <div className="absolute right-5 top-5 rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                  {blog.readTime}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
                  <span>{blog.author}</span>
                  <span className="h-1 w-1 rounded-full bg-text-secondary" />
                  <span>{blog.date}</span>
                </div>

                <h3 className="mt-4 font-sora text-[26px] font-bold leading-[1.2] tracking-[-0.04em] text-text-primary">
                  {blog.title}
                </h3>
                <p className="mt-4 text-[15px] leading-7 text-text-secondary">
                  {blog.excerpt}
                </p>

                <Link
                  href="/blogs"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-[14px] font-semibold text-text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:bg-surface"
                >
                  Read full article
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover"
          >
            <span>View More Blogs</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
