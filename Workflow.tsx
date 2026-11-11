"use client";

import { motion } from "framer-motion";
import { Clapperboard, Download, PenLine } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: PenLine,
    title: "Describe",
    body: "Write the scene in your head like you'd text it to a friend. Add a style preset or let the engine freestyle.",
  },
  {
    n: "02",
    icon: Clapperboard,
    title: "Direct",
    body: "Pick a camera move, lock a seed, choose your frame. Hit render and watch the GPU smoke.",
  },
  {
    n: "03",
    icon: Download,
    title: "Export",
    body: "Download crisp PNGs or motion-ready video files. Publish to the gallery and build your following.",
  },
];

export default function Workflow() {
  return (
    <section className="relative border-y border-white/8 bg-[#08080f] py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <p className="font-mono2 text-[11px] tracking-[0.35em] text-violet-300">03 — PIPELINE</p>
          <h2 className="font-display mt-4 text-4xl font-extrabold text-white sm:text-6xl">
            Idea to export in <span className="text-gradient">40 seconds</span>
          </h2>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="glass group relative overflow-hidden rounded-3xl p-8 transition-colors hover:bg-white/8"
            >
              <span className="font-display absolute -right-2 -top-6 text-[7rem] font-extrabold leading-none text-white/5 transition-colors group-hover:text-fuchsia-400/10">
                {s.n}
              </span>
              <div className="relative">
                <div className="grid size-13 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/25 to-cyan-400/20 ring-1 ring-white/12">
                  <s.icon className="size-6 text-white" strokeWidth={1.8} />
                </div>
                <h3 className="font-display mt-6 text-2xl font-bold text-white">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-zinc-400">{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
