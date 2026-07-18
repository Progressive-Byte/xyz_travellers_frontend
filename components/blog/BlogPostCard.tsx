import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/data/blogPosts";

type BlogPostCardProps = {
  post: BlogPost;
  className?: string;
};

export const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, className = "" }) => {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className={`surface-card-strong hover-lift group block overflow-hidden rounded-panel ${className}`.trim()}
    >
      <div className="relative h-[260px] overflow-hidden">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

        <div className="absolute left-5 top-5 rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-text-primary shadow-soft">
          {post.category}
        </div>
        <div className="absolute right-5 top-5 rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          {post.readTime}
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-wrap items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
          <span>{post.author}</span>
          <span className="h-1 w-1 rounded-full bg-text-secondary" />
          <span>{post.date}</span>
        </div>

        <h3 className="mt-4 font-sora text-[26px] font-bold leading-[1.2] tracking-[-0.04em] text-text-primary">
          {post.title}
        </h3>
        <p className="mt-4 text-[15px] leading-7 text-text-secondary">{post.excerpt}</p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-[14px] font-semibold text-text-primary transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-text-primary/20 group-hover:bg-surface">
          Read full article
          <span aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
};
