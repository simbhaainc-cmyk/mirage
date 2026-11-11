// ─── MIRAGE monetization: plans, pricing & credit economy ───────────────────

export const CREDIT_COSTS = {
  image: 5,
  video: 20,
} as const;

export const SIGNUP_CREDITS = 25;

export type PlanId = "free" | "creator" | "pro" | "studio";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  creditsPerMonth: number;
  highlighted?: boolean;
  badge?: string;
  features: string[];
  cta: string;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Taste the machine",
    priceMonthly: 0,
    priceYearly: 0,
    creditsPerMonth: 25,
    cta: "Start creating",
    features: [
      "25 credits on signup",
      "Image generation (720p)",
      "8 style presets",
      "Community gallery",
      "Watermarked exports",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    tagline: "For daily dreamers",
    priceMonthly: 12,
    priceYearly: 115,
    creditsPerMonth: 500,
    cta: "Go Creator",
    features: [
      "500 credits / month",
      "Image + Video generation",
      "1080p exports, no watermark",
      "All styles & camera motions",
      "Priority render queue",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "The professional cut",
    priceMonthly: 36,
    priceYearly: 345,
    creditsPerMonth: 2000,
    highlighted: true,
    badge: "Most popular",
    cta: "Go Pro",
    features: [
      "2,000 credits / month",
      "4K upscaled exports",
      "Fastest render queue",
      "Commercial license",
      "Private generations",
      "Early access to new models",
    ],
  },
  {
    id: "studio",
    name: "Studio",
    tagline: "For teams & agencies",
    priceMonthly: 90,
    priceYearly: 860,
    creditsPerMonth: 8000,
    cta: "Go Studio",
    features: [
      "8,000 credits / month",
      "Everything in Pro",
      "5 team seats",
      "API access",
      "Dedicated support",
      "Custom model fine-tunes",
    ],
  },
];

export function getPlan(id: string | null | undefined): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

/** Roughly how many images / videos a credit pack yields */
export function planYields(credits: number) {
  return {
    images: Math.floor(credits / CREDIT_COSTS.image),
    videos: Math.floor(credits / CREDIT_COSTS.video),
  };
}
