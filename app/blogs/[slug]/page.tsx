import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogContentSection } from "@/components/blog/BlogContentSection";
import { BlogCTA } from "@/components/blog/BlogCTA";
import {
  blogPosts,
  getBlogPostBySlug,
  getRelatedBlogPosts,
  type BlogPost,
} from "@/data/blogPosts";

type BlogPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const MetaPill: React.FC<{ label: string }> = ({ label }) => (
  <span className="rounded-full border border-border bg-card px-4 py-2 text-[12px] font-semibold text-text-secondary shadow-soft">
    {label}
  </span>
);

const BodyHeading: React.FC<{
  eyebrow: string;
  title: string;
  description?: string;
}> = ({ eyebrow, title, description }) => (
  <div>
    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
      {eyebrow}
    </p>
    <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary md:text-[34px]">
      {title}
    </h2>
    {description ? (
      <p className="mt-3 max-w-3xl text-[15px] leading-8 text-text-secondary">{description}</p>
    ) : null}
  </div>
);

const buildTocItems = (post: BlogPost) => [
  "Introduction",
  ...post.sections.map((section) => section.heading),
  "Travel Notes",
  "Final Thoughts",
];

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog not found | XYZ Travellers",
    };
  }

  return {
    title: `${post.title} | XYZ Travellers`,
    description: post.summary,
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPosts(post);
  const tocItems = buildTocItems(post);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="section-shell overflow-hidden bg-background pb-20 pt-8 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center gap-3 text-[13px] font-medium text-text-secondary">
              <Link href="/" className="transition-colors duration-200 hover:text-text-primary">
                Home
              </Link>
              <span>/</span>
              <Link href="/blogs" className="transition-colors duration-200 hover:text-text-primary">
                Blogs
              </Link>
              <span>/</span>
              <span className="text-text-primary">{post.category}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <span className="section-badge">{post.category}</span>
              <span className="rounded-full border border-border bg-card px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary shadow-soft">
                {post.heroLabel}
              </span>
            </div>

            <h1 className="mt-6 max-w-4xl font-sora text-[38px] font-bold leading-tight tracking-[-0.05em] text-text-primary md:text-[56px]">
              {post.title}
            </h1>

            <p className="mt-6 max-w-3xl text-[17px] leading-8 text-text-secondary">
              {post.summary}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <MetaPill label={post.author} />
              <MetaPill label={post.authorRole} />
              <MetaPill label={post.date} />
              <MetaPill label={post.readTime} />
            </div>
          </div>

          <section className="mx-auto mt-10 max-w-6xl">
            <div className="surface-card-strong overflow-hidden rounded-[32px] p-3">
              <div className="relative h-[320px] overflow-hidden rounded-[26px] sm:h-[420px] lg:h-[520px]">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
              </div>
            </div>
          </section>

          <section className="mx-auto mt-10 grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-8">
              <section className="surface-card-strong rounded-[30px] p-6 md:p-8">
                <BodyHeading
                  eyebrow="Introduction"
                  title="A clearer starting point for the article"
                  description="The first section should help readers settle in quickly before the longer editorial content begins."
                />

                <div className="mt-6 space-y-5">
                  {post.intro.map((paragraph) => (
                    <p key={paragraph} className="text-[15px] leading-8 text-text-secondary">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>

              {post.sections.map((section, index) => (
                <BlogContentSection key={section.heading} section={section} index={index} />
              ))}

              <section className="surface-card rounded-[30px] p-6 md:p-8">
                <BodyHeading
                  eyebrow="Travel Notes"
                  title="Quick guidance worth keeping in mind"
                  description="Simple, practical points that help the article stay useful instead of purely inspirational."
                />

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {post.tips.map((tip) => (
                    <div
                      key={tip}
                      className="rounded-[22px] border border-border-light bg-card px-5 py-5 shadow-soft"
                    >
                      <div className="icon-chip h-10 w-10 rounded-[14px] text-[12px] font-bold">
                        +
                      </div>
                      <p className="mt-4 text-[14px] leading-7 text-text-primary">{tip}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[30px] border border-border bg-primary-light px-6 py-8 shadow-soft md:px-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                  Pull Quote
                </p>
                <blockquote className="mt-4 max-w-4xl font-sora text-[28px] font-bold leading-[1.25] tracking-[-0.04em] text-text-primary md:text-[36px]">
                  "{post.quote.text}"
                </blockquote>
                <p className="mt-4 text-[14px] font-medium text-text-secondary">
                  {post.quote.attribution}
                </p>
              </section>

              <BlogCTA cta={post.cta} />

              <section className="surface-card rounded-[30px] p-6 md:p-8">
                <BodyHeading
                  eyebrow="Final Thoughts"
                  title="A cleaner ending to the story"
                  description="Close the article with a useful takeaway instead of simply stopping after the last section."
                />

                <div className="mt-6 space-y-5">
                  {post.finalThoughts.map((paragraph) => (
                    <p key={paragraph} className="text-[15px] leading-8 text-text-secondary">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap gap-2.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-card px-4 py-2 text-[12px] font-semibold text-text-secondary shadow-soft"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-6 self-start lg:sticky lg:top-28">
              <section className="surface-card-strong rounded-[30px] p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                  Article Outline
                </p>
                <div className="mt-4 space-y-3">
                  {tocItems.map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-[18px] border border-border-light bg-card px-4 py-3 shadow-soft"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-[12px] font-bold text-text-primary">
                        {index + 1}
                      </span>
                      <span className="text-[14px] font-medium text-text-primary">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="surface-card rounded-[30px] p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                  Written By
                </p>
                <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                  {post.author}
                </h2>
                <p className="mt-2 text-[14px] font-medium text-text-secondary">
                  {post.authorRole}
                </p>
                <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                  Built for readers who want practical travel and stay guidance with less noise and better structure.
                </p>

                <div className="mt-5 rounded-[22px] border border-border-light bg-surface px-4 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                    Reading Time
                  </p>
                  <p className="mt-2 text-[15px] font-semibold text-text-primary">{post.readTime}</p>
                </div>
              </section>
            </aside>
          </section>

          <section className="mx-auto mt-12 max-w-6xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <BodyHeading
                eyebrow="Related Posts"
                title="Continue reading within the same editorial system"
                description="Keep the journey connected by surfacing a few related stories after the main article ends."
              />
              <Link
                href="/blogs"
                className="inline-flex w-fit items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium"
              >
                View all blogs
              </Link>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <BlogPostCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
