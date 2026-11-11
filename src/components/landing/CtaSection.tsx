"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Coins } from "lucide-react";
import { SIGNUP_CREDITS } from "@/lib/plans";

export default function CtaSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 pb-28 pt-10 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[2.5rem] border border-white/10 px-6 py-20 text-center sm:px-16"
      >
        <div className="absolute inset-0 -z-10 bg-[#0b0714]" />
        <div className="absolute -left-24 -top-24 -z-10 size-96 rounded-full bg-violet-600/30 blur-[110px]" />
        <div className="absolute -bottom-32 -right-20 -z-10 size-[28rem] rounded-full bg-fuchsia-600/25 blur-[130px]" />
        <div className="absolute left-1/2 top-0 -z-10 h-40 w-[36rem] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[100px]" />

        <p className="font-mono2 text-[11px] tracking-[0.35em] text-cyan-300">
          NO CREDIT CARD · {SIGNUP_CREDITS} FREE CREDITS
        </p>
        <h2 className="font-display mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-[1.02] text-white sm:text-6xl">
          Your first scene is on <span className="text-gradient-warm">the house.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-zinc-400">
          Sign up in twenty seconds, get {SIGNUP_CREDITS} credits, and render
          your first image or video before your coffee cools.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="btn-sheen group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-base font-bold text-black transition-shadow hover:shadow-[0_0_50px_rgba(255,255,255,0.35)]"
          >
            Claim free credits
            <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-1.5" />
          </Link>
          <span className="inline-flex items-center gap-2 font-mono2 text-[11px] tracking-widest text-zinc-500">
            <Coins className="size-3.5 text-amber-300" />
            NO SUBSCRIPTION REQUIRED
          </span>
        </div>
      </motion.div>
    </section>
  );
}
