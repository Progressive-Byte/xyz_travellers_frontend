import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { blogPosts } from "@/data/blogPosts";

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="section-shell bg-background pb-20 pt-8 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-4xl text-center">
            <span className="section-badge">XYZ Travellers Blogs</span>
            <h1 className="section-heading mt-6">
              Travel stories, practical guides, and smarter stay advice
            </h1>
            <p className="section-subtitle mx-auto mt-5">
              Explore editorial pieces designed to feel useful, readable, and closely
              connected to the wider XYZ Travellers experience.
            </p>
            <div className="section-divider mx-auto mt-6" />
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2">
            {blogPosts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium"
            >
              Back to homepage
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
