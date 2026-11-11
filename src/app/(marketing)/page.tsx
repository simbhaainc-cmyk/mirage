import Hero from "@/components/landing/Hero";
import Marquee from "@/components/landing/Marquee";
import Features from "@/components/landing/Features";
import Showcase from "@/components/landing/Showcase";
import Workflow from "@/components/landing/Workflow";
import PricingCards from "@/components/PricingCards";
import CtaSection from "@/components/landing/CtaSection";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Features />
      <Showcase />
      <Workflow />
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <div className="mb-14 text-center">
          <p className="font-mono2 text-[11px] tracking-[0.35em] text-fuchsia-400">
            04 — PRICING
          </p>
          <h2 className="font-display mx-auto mt-4 max-w-2xl text-4xl font-extrabold leading-[1.02] text-white sm:text-6xl">
            Pay for renders, <span className="text-gradient">not software.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-zinc-400">
            Start free. Upgrade when the renders start paying for themselves.
            Cancel anytime.
          </p>
        </div>
        <PricingCards idPrefix="home-" />
      </section>
      <CtaSection />
    </>
  );
}
