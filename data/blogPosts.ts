export type BlogContentSection = {
  heading: string;
  body: string[];
  bullets?: string[];
  highlight?: string;
};

export type BlogQuote = {
  text: string;
  attribution: string;
};

export type BlogCTA = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export type BlogPost = {
  id: number;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  coverImage: string;
  heroLabel: string;
  summary: string;
  intro: string[];
  sections: BlogContentSection[];
  tips: string[];
  quote: BlogQuote;
  finalThoughts: string[];
  tags: string[];
  cta: BlogCTA;
  relatedSlugs: string[];
};

const imageUrl = (prompt: string, imageSize: string) =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${encodeURIComponent(imageSize)}`;

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "top-10-tourist-places-in-dhaka",
    category: "Travel Guide",
    title: "Top 10 Tourist Places in Dhaka With a First-Time Visitor's Guide",
    excerpt:
      "A practical starting point for travelers who want culture, landmarks, and city energy without missing the essentials.",
    author: "XYZ Travellers Team",
    authorRole: "Editorial travel desk",
    date: "Oct 09, 2025",
    readTime: "8 min read",
    coverImage: imageUrl(
      "travel editorial cover for Dhaka tourist guide, vibrant city landmarks, premium magazine-style composition, realistic photo",
      "landscape_16_9",
    ),
    heroLabel: "City guide",
    summary:
      "A cleaner guide to the places in Dhaka that are worth prioritizing when you want the city to feel memorable instead of overwhelming.",
    intro: [
      "Dhaka can feel intense on a first visit, but that energy becomes much easier to enjoy when you know which places actually deserve your time. The city is layered, fast-moving, and full of contrast, so a good plan matters more here than in destinations that are easier to explore casually.",
      "This guide focuses on places that give first-time visitors a stronger sense of Dhaka's history, texture, and everyday character. Instead of trying to see everything, the goal is to help you choose a few meaningful stops and move through the city more confidently.",
    ],
    sections: [
      {
        heading: "Start With The Places That Explain The City",
        body: [
          "For a first visit, it helps to begin with locations that give you context rather than only visual appeal. Historic landmarks, major public spaces, and a few culturally significant neighborhoods usually create a better understanding of Dhaka than a long list of random stops.",
          "That means your first day should balance old Dhaka atmosphere, one or two iconic city institutions, and at least one place where you can simply observe local life without rushing.",
        ],
        bullets: [
          "Prioritize 3 to 4 strong stops instead of trying to cover all 10 in one day",
          "Group nearby places together to reduce traffic-heavy movement",
          "Leave room for food, walking, and flexible time between major sights",
        ],
      },
      {
        heading: "Old Dhaka Still Delivers The Strongest Sense Of Place",
        body: [
          "If you want to feel the city's character quickly, old Dhaka is still one of the most effective starting points. The architecture, density, sounds, and street rhythm give you a very different experience from the newer parts of the capital.",
          "Places around Ahsan Manzil, Armenian Church, and the riverside can be especially rewarding when visited with realistic timing and moderate expectations about traffic and crowding.",
        ],
        highlight:
          "Old Dhaka works best when treated as an experience block, not just one quick photo stop.",
      },
      {
        heading: "Mix Intensity With Breathing Space",
        body: [
          "One common mistake is building an itinerary that is too intense from morning to evening. Dhaka becomes much more enjoyable when busier stops are paired with calmer spaces such as museums, parks, lakeside areas, or a slower lunch break.",
          "The city rewards pacing. A shorter, better-structured day usually feels more memorable than an overpacked one.",
        ],
      },
    ],
    tips: [
      "Use morning windows for the busiest destinations whenever possible.",
      "Keep travel time between stops realistic because Dhaka traffic changes quickly.",
      "Choose one food stop with intention instead of treating meals as an afterthought.",
      "A reliable stay location can improve the whole city experience more than adding one extra landmark.",
    ],
    quote: {
      text:
        "The best first experience of Dhaka is not about seeing everything. It is about choosing the right few places and giving them enough space to feel real.",
      attribution: "XYZ Travellers Editorial",
    },
    finalThoughts: [
      "Dhaka rewards visitors who approach it with curiosity and structure. The city may feel complex at first, but that same complexity is what makes it memorable.",
      "If you stay in the right area, pace your day well, and focus on a thoughtful mix of landmarks and local atmosphere, your first impression of Dhaka becomes much richer and far less exhausting.",
    ],
    tags: ["Dhaka", "Travel Guide", "Bangladesh", "City Tips", "First Visit"],
    cta: {
      eyebrow: "Plan Better",
      title: "Need a better base while exploring Dhaka?",
      description:
        "Choose a stay that keeps the city easier to navigate, more comfortable to return to, and better structured for short trips.",
      primaryLabel: "Browse stays",
      primaryHref: "/",
      secondaryLabel: "See more guides",
      secondaryHref: "/blogs",
    },
    relatedSlugs: [
      "weekend-guide-to-sylhet-for-short-stay-travelers",
      "how-to-book-short-term-stays-with-more-confidence",
    ],
  },
  {
    id: 2,
    slug: "top-5-side-hustles-in-bangladesh",
    category: "Hosting Tips",
    title: "Top 5 Side Hustles in Bangladesh You Can Start Today",
    excerpt:
      "A more grounded look at flexible income ideas for young professionals, students, and aspiring hosts who want smarter earning options.",
    author: "XYZ Travellers Team",
    authorRole: "Hosting and growth desk",
    date: "Oct 08, 2025",
    readTime: "6 min read",
    coverImage: imageUrl(
      "young Bangladeshi professionals planning income ideas with laptop and notebook, premium editorial blog cover, realistic photo",
      "landscape_16_9",
    ),
    heroLabel: "Income ideas",
    summary:
      "A practical breakdown of side hustles that feel realistic, low-friction, and easier to start without a huge upfront setup.",
    intro: [
      "A good side hustle should fit into real life. It should match your schedule, have a clear path to consistency, and not depend entirely on hype or unrealistic expectations.",
      "For people in Bangladesh, the strongest options are usually the ones that combine digital flexibility with existing skills, available space, or local demand. The point is not to chase every trend. It is to choose something that is easier to start and easier to sustain.",
    ],
    sections: [
      {
        heading: "Choose Simplicity Over Novelty",
        body: [
          "Many people lose momentum because they start with an idea that sounds exciting but requires too many moving parts. A better approach is to choose an option that is boring in a good way: understandable, useful, and repeatable.",
          "The best side hustles often come from skills you already use or assets you already have, including writing, design, tutoring, delivery coordination, or spare furnished space.",
        ],
      },
      {
        heading: "Short-Term Hosting Is Stronger When It Is Structured",
        body: [
          "Hosting can become a practical side income when the setup is clean, responsive, and built around trust. It works best when availability, communication, cleanliness, and guest expectations are clearly managed from the start.",
          "That makes short-stay hosting less about luck and more about systems. A reliable host experience is what creates repeat recommendations and smoother occupancy.",
        ],
        bullets: [
          "Keep listing information accurate and easy to understand",
          "Respond quickly and clearly before arrival",
          "Focus on presentation, basic amenities, and clean turnover",
        ],
      },
      {
        heading: "Skill-Based Work Scales Better Than Random Experiments",
        body: [
          "Freelance writing, design support, tutoring, social media assistance, and online service work can all grow into more stable income streams because they improve with reputation and repetition.",
          "A smaller set of useful skills usually beats constantly switching between unrelated opportunities.",
        ],
        highlight:
          "The side hustle that lasts is usually the one that can be repeated consistently, not the one that looks most impressive in week one.",
      },
    ],
    tips: [
      "Start with one idea and give it a clean 30-day test.",
      "Track time, income, and friction so you know what is actually working.",
      "Build trust signals early: responsiveness, quality, consistency, and clarity.",
      "Avoid side hustles that depend on too many hidden costs or vague promises.",
    ],
    quote: {
      text:
        "A side hustle becomes meaningful when it fits your life well enough to keep going, even after the initial motivation fades.",
      attribution: "XYZ Travellers Hosting Desk",
    },
    finalThoughts: [
      "If you want additional income, the best place to start is with something practical and sustainable. The more clearly a side hustle fits your skills or resources, the easier it becomes to keep improving it.",
      "That is also why hosting, when done properly, can become one of the more realistic options for people who want to turn available space into steady value.",
    ],
    tags: ["Hosting", "Income", "Bangladesh", "Side Hustle", "Practical Tips"],
    cta: {
      eyebrow: "Explore Hosting",
      title: "Thinking about earning from your space?",
      description:
        "See how a more polished short-stay experience can help turn available space into a smarter hosting opportunity.",
      primaryLabel: "Become a host",
      primaryHref: "/auth?mode=register&intent=host",
      secondaryLabel: "Read more blogs",
      secondaryHref: "/blogs",
    },
    relatedSlugs: [
      "how-to-book-short-term-stays-with-more-confidence",
      "top-10-tourist-places-in-dhaka",
    ],
  },
  {
    id: 3,
    slug: "weekend-guide-to-sylhet-for-short-stay-travelers",
    category: "Destination Advice",
    title: "Weekend Guide to Sylhet for Short-Stay Travelers",
    excerpt:
      "A calmer, better-paced look at how to plan a Sylhet weekend without turning it into a rushed checklist.",
    author: "XYZ Travellers Team",
    authorRole: "Destination editorial desk",
    date: "Oct 05, 2025",
    readTime: "7 min read",
    coverImage: imageUrl(
      "Sylhet weekend travel editorial cover, green tea garden landscape, soft premium magazine aesthetic, realistic photo",
      "landscape_16_9",
    ),
    heroLabel: "Weekend escape",
    summary:
      "A short guide to planning a Sylhet weekend that feels calm, scenic, and better matched to the pace of a quick trip.",
    intro: [
      "Sylhet works best when you stop trying to do everything. The appeal of the region is not only its landmarks. It is also the shift in rhythm: greener views, slower pacing, and a softer travel mood compared with Dhaka.",
      "A strong Sylhet weekend usually comes from choosing one or two signature experiences, building around a well-located stay, and leaving enough time to actually enjoy the setting instead of racing through it.",
    ],
    sections: [
      {
        heading: "Let The Landscape Set The Pace",
        body: [
          "Tea gardens, shorter drives with scenic value, and slower meal stops are what make Sylhet feel restorative. If you overload the trip with too many distant stops, that calm disappears.",
          "The best short itinerary usually combines one core destination day with one lighter day focused on local atmosphere and rest.",
        ],
      },
      {
        heading: "A Good Stay Changes The Whole Weekend",
        body: [
          "Short-stay travel becomes much easier when the accommodation supports the trip instead of creating friction. That means quieter rooms, cleaner layouts, dependable communication, and a location that reduces unnecessary movement.",
          "A weekend can feel twice as smooth when your stay functions as a real base, not just a place to sleep between outings.",
        ],
        bullets: [
          "Choose a stay that fits the trip length and travel style",
          "Keep travel time to major stops realistic",
          "Prioritize comfort for the return hours in the evening",
        ],
      },
      {
        heading: "Build Around Fewer, Better Moments",
        body: [
          "Instead of creating a checklist of every possible attraction, choose fewer places that genuinely match your mood. That might be tea estates, a stronger local meal, a scenic route, or a more relaxed morning before checkout.",
          "The trip becomes more memorable when it feels like a sequence of intentional choices rather than crowded movement.",
        ],
      },
    ],
    tips: [
      "Keep the second day lighter than the first.",
      "Use the stay itself as part of the weekend experience, not just a functional stop.",
      "Leave room for one slow meal and one unplanned pause.",
      "Plan around rest as much as movement if the trip is short.",
    ],
    quote: {
      text:
        "A strong weekend escape is not the one that covers the most ground. It is the one that gives you the clearest change of pace.",
      attribution: "XYZ Travellers Destination Desk",
    },
    finalThoughts: [
      "Sylhet is one of those destinations that rewards restraint. If you pace it well, even a short stay can feel much more refreshing than expected.",
      "The right combination of fewer stops, cleaner planning, and a well-matched stay can turn a basic weekend into something that feels properly restorative.",
    ],
    tags: ["Sylhet", "Weekend Trip", "Destination Guide", "Short Stay", "Bangladesh"],
    cta: {
      eyebrow: "Travel Lighter",
      title: "Planning a better short stay outside Dhaka?",
      description:
        "Explore stay options designed to feel cleaner, calmer, and easier to trust when you want the trip itself to stay simple.",
      primaryLabel: "Explore stays",
      primaryHref: "/",
      secondaryLabel: "Read related blogs",
      secondaryHref: "/blogs",
    },
    relatedSlugs: [
      "top-10-tourist-places-in-dhaka",
      "how-to-book-short-term-stays-with-more-confidence",
    ],
  },
  {
    id: 4,
    slug: "how-to-book-short-term-stays-with-more-confidence",
    category: "Stay Advice",
    title: "How to Book Short-Term Stays With More Confidence",
    excerpt:
      "The practical questions, checks, and expectations that help guests choose better stays with less guesswork.",
    author: "XYZ Travellers Team",
    authorRole: "Guest experience desk",
    date: "Oct 03, 2025",
    readTime: "5 min read",
    coverImage: imageUrl(
      "guest booking short term stay on laptop with calm premium editorial travel style, realistic photo",
      "landscape_16_9",
    ),
    heroLabel: "Guest confidence",
    summary:
      "A clearer framework for evaluating short-term stays before booking so the experience feels more trustworthy and less uncertain.",
    intro: [
      "Booking a stay should feel straightforward, but many guests still end up comparing too many options without enough clarity. The result is hesitation, second-guessing, or a stay that looks good on paper but feels mismatched in practice.",
      "A better booking decision usually comes from asking a few practical questions early and paying attention to the signs that suggest a place is genuinely reliable.",
    ],
    sections: [
      {
        heading: "Start With The Stay Purpose",
        body: [
          "Not every good listing is good for every trip. The right stay for a solo work visit may be completely different from the right stay for a family weekend or a relocation transition.",
          "Once the trip purpose is clear, it becomes easier to evaluate location, room count, amenities, and support style with more confidence.",
        ],
      },
      {
        heading: "Look For Clarity, Not Just Attractive Photos",
        body: [
          "Strong photos help, but confidence usually comes from the information around them: what the stay includes, how communication works, what the check-in expectations are, and whether the listing feels transparent.",
          "The more specific and clean the listing details are, the easier it is to trust what you are booking.",
        ],
        bullets: [
          "Check whether amenities are clearly named",
          "Look for practical language around check-in and support",
          "Avoid listings that feel vague about basics",
        ],
      },
      {
        heading: "Support And Responsiveness Matter More Than Guests Expect",
        body: [
          "Many booking issues are not about the property itself. They come from unclear communication before arrival or difficulty getting help when questions come up.",
          "That is why host responsiveness and platform clarity can shape confidence almost as much as the stay photos.",
        ],
        highlight:
          "A stay feels premium when the booking process itself feels calm, clear, and predictable.",
      },
    ],
    tips: [
      "Match the stay to the trip, not just the budget.",
      "Use amenities and communication clarity as trust signals.",
      "Short-term stays feel better when expectations are set early.",
      "A cleaner booking flow reduces friction before the trip even begins.",
    ],
    quote: {
      text:
        "Confidence in booking rarely comes from one perfect image. It comes from a pattern of small details that make the stay feel trustworthy.",
      attribution: "XYZ Travellers Guest Experience Desk",
    },
    finalThoughts: [
      "Guests do not need endless choices. They need better signals. Once those signals are clear, short-term stays become much easier to compare and book.",
      "That is the direction a stronger travel platform should always move toward: less guesswork, more clarity, and a better fit between guest expectations and the actual stay.",
    ],
    tags: ["Booking Tips", "Short Stay", "Travel Advice", "Guest Experience", "XYZ Travellers"],
    cta: {
      eyebrow: "Book Smarter",
      title: "Want a cleaner way to compare stays?",
      description:
        "Browse properties designed to feel easier to read, easier to trust, and easier to book with confidence.",
      primaryLabel: "Browse properties",
      primaryHref: "/",
      secondaryLabel: "See all blogs",
      secondaryHref: "/blogs",
    },
    relatedSlugs: [
      "top-5-side-hustles-in-bangladesh",
      "top-10-tourist-places-in-dhaka",
    ],
  },
];

export const getBlogPostBySlug = (slug: string): BlogPost | undefined =>
  blogPosts.find((post) => post.slug === slug);

export const getRelatedBlogPosts = (post: BlogPost, limit = 3): BlogPost[] => {
  const explicitRelated = post.relatedSlugs
    .map((slug) => getBlogPostBySlug(slug))
    .filter((value): value is BlogPost => Boolean(value));

  if (explicitRelated.length >= limit) {
    return explicitRelated.slice(0, limit);
  }

  const fallback = blogPosts.filter(
    (candidate) =>
      candidate.slug !== post.slug &&
      !explicitRelated.some((related) => related.slug === candidate.slug),
  );

  return [...explicitRelated, ...fallback].slice(0, limit);
};
