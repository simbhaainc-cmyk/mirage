"use client";

import { motion } from "framer-motion";
import { Camera, Fingerprint, Wand2 } from "lucide-react";

const reveal = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const } },
};

const ROWS = [
  {
    icon: Wand2,
    tag: "PROMPT ENGINE",
    title: "Type a sentence.\nGet a scene.",
    body: "The engine reads intent, mood and composition from plain language. Style presets rewrite the underlying prompt science for you — cinematic glass, neon noir, liquid chrome — without you touching a parameter.",
    img: "/img/hero-poster.jpg",
    caption: "RENDER // CHROME PORTRAIT",
    chips: ["flux core", "seed lock", "prompt enhance"],
    flip: false,
  },
  {
    icon: Camera,
    tag: "CAMERA CHOREOGRAPHY",
    title: "Direct the camera\nlike a DP.",
    body: "Eight signature moves — dolly-in, orbit, handheld shake, heartbeat pulse — turn a single render into a living shot. Pick a move, set the mood, MIRAGE choreographs the motion for you.",
    img: "/img/feature-motion.jpg",
    caption: "MOTION // DOLLY-IN 7S",
    chips: ["8 moves", "temporal smoothing", "loop-ready"],
    flip: true,
  },
  {
    icon: Fingerprint,
    tag: "STYLE DNA",
    title: "A look that's\nunmistakably yours.",
    body: "Every preset remixes light, texture and palette into a signature. Lock a seed and your style DNA stays consistent across an entire series — frames, thumbnails, key art.",
    img: "/img/show-4.jpg",
    caption: "STYLE // LIQUID CHROME",
    chips: ["8 presets", "series consistency", "4K grade"],
    flip: false,
  },
];

export default function Features() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-28 sm:px-8">
      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mb-20"
      >
        <p className="font-mono2 text-[11px] tracking-[0.35em] text-fuchsia-400">
          01 — THE ENGINE
        </p>
        <h2 className="font-display mt-4 max-w-2xl text-4xl font-extrabold leading-[1.02] text-white sm:text-6xl">
          One prompt.
          <br />
          <span className="text-gradient">Infinite cinema.</span>
        </h2>
      </motion.div>

      <div className="space-y-28">
        {ROWS.map((row) => (
          <div
            key={row.tag}
            className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
              row.flip ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
            >
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 px-4 py-1.5">
                <row.icon className="size-3.5 text-cyan-300" />
                <span className="font-mono2 text-[10px] tracking-[0.3em] text-zinc-400">
                  {row.tag}
                </span>
              </div>
              <h3 className="font-display mt-6 whitespace-pre-line text-3xl font-bold leading-[1.05] text-white sm:text-5xl">
                {row.title}
              </h3>
              <p className="mt-6 max-w-md leading-relaxed text-zinc-400">{row.body}</p>
              <div className="mt-7 flex flex-wrap gap-2">
                {row.chips.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-fuchsia-400/25 bg-fuchsia-400/8 px-3.5 py-1.5 font-mono2 text-[10px] uppercase tracking-widest text-fuchsia-200"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="tilt-wrap"
            >
              <div className="card-3d group relative overflow-hidden rounded-3xl border border-white/10">
                <img
                  src={row.img}
                  alt={row.title}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 backdrop-blur">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <span className="font-mono2 text-[10px] tracking-[0.25em] text-zinc-300">
                    {row.caption}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
