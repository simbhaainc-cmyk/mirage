import type { Metadata } from "next";
import PricingCards from "@/components/PricingCards";

export const metadata: Metadata = { title: "Pricing" };

const FAQS = [
  {
    q: "What exactly is a credit?",
    a: "Credits are the fuel of the render farm. One image render costs 5 credits, one cinematic video costs 20. Your balance is always visible in the studio header and every movement is logged in your dashboard ledger.",
  },
  {
    q: "Do unused credits roll over?",
    a: "Plan credits refresh every billing cycle. Bonus credits earned from promos never expire. If you cancel, you keep rendering until your balance hits zero.",
  },
  {
    q: "Can I use MIRAGE commercially?",
    a: "Pro and Studio plans include a full commercial license — use your renders in ads, films, client work, and products. Free and Creator plans are for personal projects.",
  },
  {
    q: "How do I cancel?",
    a: "One click from your dashboard. No retention flows, no dark patterns. Your account drops to the Free plan and keeps every render you ever made.",
  },
  {
    q: "Is there an API?",
    a: "Studio plans ship with API access and webhook callbacks, so you can wire MIRAGE into your own product or pipeline.",
  },
];

export default function PricingPage() {
  return (
    <div className="relative overflow-hidden px-5 pb-28 pt-36 sm:px-8">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[50rem] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[130px]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="font-mono2 text-[11px] tracking-[0.35em] text-fuchsia-400">
            PRICING
          </p>
          <h1 className="font-display mx-auto mt-4 max-w-3xl text-5xl font-extrabold leading-[1.0] text-white sm:text-7xl">
            Choose your <span className="text-gradient">render budget</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
            Four tiers built for everyone from midnight hobbyists to full
            production houses. Switch or cancel anytime.
          </p>
        </div>

        <PricingCards idPrefix="pricing-" />

        <div className="mx-auto mt-28 max-w-3xl">
          <h2 className="font-display text-center text-3xl font-extrabold text-white sm:text-4xl">
            Questions, answered
          </h2>
          <div className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="panel group rounded-2xl px-6 py-5 open:bg-white/5 transition-colors"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-white [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="font-mono2 text-xl text-fuchsia-300 transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-zinc-400">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
