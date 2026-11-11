"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BadgeCheck, Check, Coins, Loader2, PartyPopper } from "lucide-react";
import { PLANS, planYields, type PlanId } from "@/lib/plans";

type Me = { plan: string } | null;

export default function PricingCards({ idPrefix = "" }: { idPrefix?: string }) {
  const [yearly, setYearly] = useState(false);
  const [me, setMe] = useState<Me>(null);
  const [busyPlan, setBusyPlan] = useState<PlanId | null>(null);
  const [successPlan, setSuccessPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user))
      .catch(() => setMe(null));
  }, [successPlan]);

  async function buy(planId: PlanId) {
    setError(null);
    if (planId === "free") {
      router.push(me ? "/studio" : "/signup");
      return;
    }
    if (!me) {
      router.push(`/signup?next=/pricing`);
      return;
    }
    setBusyPlan(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, cycle: yearly ? "yearly" : "monthly" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      setSuccessPlan(planId);
      setTimeout(() => router.push("/dashboard"), 1600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setBusyPlan(null);
    }
  }

  return (
    <div id={`${idPrefix}plans`}>
      {/* Billing cycle toggle */}
      <div className="mb-12 flex justify-center">
        <div className="glass inline-flex rounded-full p-1.5">
          {(["monthly", "yearly"] as const).map((cycle) => {
            const active = (cycle === "yearly") === yearly;
            return (
              <button
                key={cycle}
                onClick={() => setYearly(cycle === "yearly")}
                className={`relative rounded-full px-6 py-2.5 text-sm font-semibold capitalize transition-colors ${
                  active ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId={`${idPrefix}cycle-pill`}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.55 }}
                  />
                )}
                <span className="relative">
                  {cycle}
                  {cycle === "yearly" && (
                    <span className="ml-2 rounded-full bg-emerald-400/20 px-2 py-0.5 font-mono2 text-[10px] text-emerald-300">
                      −20%
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="mb-6 text-center font-mono2 text-sm text-rose-300">{error}</p>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan, i) => {
          const monthly = yearly ? plan.priceYearly / 12 : plan.priceMonthly;
          const yields = planYields(plan.creditsPerMonth);
          const isCurrent = me?.plan === plan.id;
          const isSuccess = successPlan === plan.id;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: i * 0.09 }}
              className={`relative flex flex-col rounded-3xl p-7 transition-transform duration-500 hover:-translate-y-2 ${
                plan.highlighted
                  ? "ring-glow bg-gradient-to-b from-violet-500/15 via-[#0c0c14] to-[#0c0c14] border border-violet-400/40"
                  : "panel"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-1.5 font-mono2 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
                  {plan.badge}
                </span>
              )}

              <p className="font-display text-xl font-bold text-white">{plan.name}</p>
              <p className="mt-1 text-sm text-zinc-500">{plan.tagline}</p>

              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-extrabold text-white">
                  ${monthly % 1 ? monthly.toFixed(2) : monthly.toFixed(0)}
                </span>
                <span className="font-mono2 text-xs text-zinc-500">/mo</span>
              </div>
              {yearly && plan.priceYearly > 0 && (
                <p className="mt-1 font-mono2 text-[10px] text-emerald-300">
                  billed ${plan.priceYearly} yearly
                </p>
              )}

              <div className="mt-5 flex items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/8 px-3.5 py-2.5">
                <Coins className="size-4 shrink-0 text-amber-300" />
                <span className="text-xs text-amber-100">
                  <b>{plan.creditsPerMonth.toLocaleString()}</b> credits
                  {plan.id !== "free" ? " / month" : ""} — ≈{yields.images} images
                  or {yields.videos} videos
                </span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <Check className="mt-0.5 size-4 shrink-0 text-fuchsia-300" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => buy(plan.id)}
                disabled={busyPlan !== null || isCurrent || isSuccess}
                className={`btn-sheen mt-8 flex h-12 items-center justify-center gap-2 rounded-full text-sm font-bold transition-all disabled:cursor-default ${
                  isSuccess
                    ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40"
                    : isCurrent
                      ? "bg-white/5 text-zinc-400 ring-1 ring-white/10"
                      : plan.highlighted
                        ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.45)] hover:shadow-[0_0_44px_rgba(224,69,245,0.6)]"
                        : "bg-white/10 text-white hover:bg-white/15"
                }`}
              >
                {busyPlan === plan.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isSuccess ? (
                  <>
                    <PartyPopper className="size-4" /> Plan live!
                  </>
                ) : isCurrent ? (
                  <>
                    <BadgeCheck className="size-4" /> Current plan
                  </>
                ) : (
                  plan.cta
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-zinc-600">
        Demo billing is enabled — plans activate instantly with their full
        monthly credit allotment, and every credit movement is recorded in your
        ledger. Connect Stripe in production for live payments (see README).
      </p>
    </div>
  );
}
