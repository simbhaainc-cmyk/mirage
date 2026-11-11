"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Clapperboard, Play, Sparkles } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.12 * i, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const STATS = [
  { k: "128K+", v: "creators onboard" },
  { k: "2.1M", v: "renders shipped" },
  { k: "8", v: "camera moves" },
  { k: "4K", v: "export quality" },
];

export default function Hero() {
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 800], [0, 180]);
  const yCards = useTransform(scrollY, [0, 800], [0, -120]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0.15]);

  return (
    <section className="relative flex min-h-svh items-center overflow-hidden">
      {/* Cinematic ink-flow backdrop */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 -z-10">
        <video
          className="h-full w-full object-cover opacity-55"
          src="https://videos.pexels.com/video-files/11944801/11944801-uhd_4096_2160_30fps.mp4"
          poster="/img/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          style={{ filter: "saturate(1.35) brightness(0.62) hue-rotate(8deg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/80 via-[#050508]/35 to-[#050508]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#050508_78%)]" />
      </motion.div>

      {/* Floating render cards */}
      <motion.div style={{ y: yCards }} className="pointer-events-none absolute inset-0 -z-0 hidden lg:block">
        <div className="tilt-wrap absolute right-[6%] top-[16%] w-52 animate-float-y">
          <div className="card-3d overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
            <img src="/img/show-1.jpg" alt="" className="aspect-[3/4] w-full object-cover" />
            <div className="flex items-center justify-between bg-black/70 px-3 py-2 backdrop-blur">
              <span className="font-mono2 text-[9px] tracking-widest text-fuchsia-300">SEED 00711</span>
              <span className="font-mono2 text-[9px] tracking-widest text-zinc-400">DOLLY-IN</span>
            </div>
          </div>
        </div>
        <div className="tilt-wrap absolute right-[22%] top-[52%] w-44 animate-float-y" style={{ animationDelay: "-2.4s" }}>
          <div className="card-3d overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
            <img src="/img/show-4.jpg" alt="" className="aspect-square w-full object-cover" />
            <div className="flex items-center justify-between bg-black/70 px-3 py-2 backdrop-blur">
              <span className="font-mono2 text-[9px] tracking-widest text-cyan-300">SEED 01999</span>
              <span className="font-mono2 text-[9px] tracking-widest text-zinc-400">CHROME</span>
            </div>
          </div>
        </div>
        <div className="tilt-wrap absolute left-[5%] top-[58%] w-44 animate-float-y" style={{ animationDelay: "-4.2s" }}>
          <div className="card-3d overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
            <img src="/img/show-3.jpg" alt="" className="aspect-video w-full object-cover" />
            <div className="flex items-center justify-between bg-black/70 px-3 py-2 backdrop-blur">
              <span className="font-mono2 text-[9px] tracking-widest text-violet-300">SEED 00808</span>
              <span className="font-mono2 text-[9px] tracking-widest text-zinc-400">ORBIT</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div style={{ opacity }} className="relative mx-auto w-full max-w-7xl px-5 pb-24 pt-36 sm:px-8">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
          <span className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-2 font-mono2 text-[11px] tracking-[0.25em] text-zinc-300">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            GENERATION ENGINE · ONLINE
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="font-display mt-8 max-w-5xl text-[clamp(3.2rem,9vw,7.5rem)] font-extrabold leading-[0.92] tracking-tight text-white"
        >
          DREAM IN
          <br />
          <span className="text-gradient">MOTION.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="mt-7 max-w-xl text-lg leading-relaxed text-zinc-400"
        >
          MIRAGE turns plain words into award-winning images and cinematic video —
          with camera choreography, style DNA and one-tap exports. No crew, no
          camera, no limits.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link
            href="/signup"
            className="btn-sheen group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 bg-[length:200%_100%] px-8 py-4 text-base font-bold text-white shadow-[0_0_44px_rgba(168,85,247,0.5)] transition-all hover:bg-[position:100%_0] hover:shadow-[0_0_60px_rgba(224,69,245,0.65)]"
          >
            <Sparkles className="size-5" />
            Start creating — free
            <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-1.5" />
          </Link>
          <Link
            href="/gallery"
            className="glass inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
          >
            <Play className="size-4.5 fill-white" />
            Watch showcase
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={4}
          className="mt-16 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4"
        >
          {STATS.map((s) => (
            <div key={s.v} className="border-l border-white/12 pl-4">
              <p className="font-display text-2xl font-bold text-white">{s.k}</p>
              <p className="font-mono2 mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                {s.v}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={5}
          className="mt-14 inline-flex items-center gap-2 font-mono2 text-[10px] tracking-[0.3em] text-zinc-500"
        >
          <Clapperboard className="size-3.5" />
          SCROLL TO ENTER THE MACHINE
        </motion.div>
      </motion.div>
    </section>
  );
}
