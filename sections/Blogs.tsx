'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";

const blogs = [
  {
    category: "Travel Guide",
    title: "Top 10 Tourist Places in Dhaka With A First-Time Visitor's Guide",
    excerpt:
      "Are you planning to take a trip to Dhaka for the first time and don't know where to start? Dhaka is known for its culture and rich history which offers a mix of ancient landmarks and modern city life.",
    author: "Travela Team",
    date: "Oct 09, 2025",
    readTime: "8 min read",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=travel%20collage%20poster%20for%20Dhaka%20tourist%20places%2C%20vibrant%20city%20landmarks%2C%20editorial%20blog%20cover%2C%20realistic%20graphic%20composition&image_size=landscape_4_3",
  },
  {
    category: "Business",
    title: "Top 5 Side Hustles in Bangladesh You Can Start Today",
    excerpt:
      "Are you feeling the pinch of rising costs? Or maybe your salary just doesn't stretch as far as it used to? You're not alone. Thousands of young professionals and students are looking for smarter income options.",
    author: "Travela Team",
    date: "Oct 8, 2025",
    readTime: "6 min read",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=young%20Bangladeshi%20professionals%20planning%20a%20side%20hustle%20with%20laptop%20and%20money%2C%20modern%20editorial%20blog%20cover%2C%20realistic%20photo&image_size=landscape_4_3",
  },
];

export const Blogs: React.FC = () => {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-sora text-[30px] font-bold leading-tight text-text-primary md:text-[48px]">
            Travela <span className="text-primary">Blogs</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[16px] font-medium leading-7 text-text-secondary">
            Read inspiring stories, practical tips, and expert advice from our
            travela community
          </p>
          <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-primary" />
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-8 md:grid-cols-2">
          {blogs.map((blog) => (
            <article
              key={blog.title}
              className="group overflow-hidden rounded-[22px] border border-border bg-card shadow-[0_14px_30px_rgba(26,27,18,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(26,27,18,0.12)]"
            >
              <div className="relative h-[250px] overflow-hidden">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
                <div className="absolute left-4 top-4 rounded-full bg-card/95 px-3 py-1 text-[11px] font-semibold text-primary shadow-sm">
                  {blog.category}
                </div>
                <div className="absolute right-4 top-4 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                  {blog.readTime}
                </div>
              </div>

              <div className="px-5 py-5">
                <h3 className="min-h-[64px] text-[28px] font-bold leading-8 text-text-primary md:text-[30px]">
                  {blog.title}
                </h3>
                <div className="mt-4 h-1 w-16 rounded-full bg-primary" />
                <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                  {blog.excerpt}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-4 text-[13px] text-text-secondary">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {blog.author}
                  </span>
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z"
                      />
                    </svg>
                    {blog.date}
                  </span>
                </div>

                <Link
                  href="/blogs"
                  className="mt-6 inline-flex w-full items-center justify-between rounded-xl bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary transition-all duration-200 hover:bg-primary-hover"
                >
                  <span>Read Full Article</span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-text-primary transition-all duration-200 hover:bg-primary-hover"
          >
            <span>View More Blogs</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
