import React from "react";
import Link from "next/link";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { blogPosts } from "@/data/blogPosts";

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
          {blogPosts.slice(0, 2).map((blog) => (
            <BlogPostCard key={blog.slug} post={blog} />
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
