"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Clapperboard, ImageIcon } from "lucide-react";
import { proxied } from "@/lib/engine";

type Item = {
  id: string;
  mode: string;
  prompt: string;
  aspect: string;
  motion: string | null;
  resultUrl: string | null;
};

const ratioFor = (aspect: string) =>
  ({ "16:9": "aspect-video", "9:16": "aspect-[9/16]", "1:1": "aspect-square", "4:3": "aspect-[4/3]", "3:4": "aspect-[3/4]" }[
    aspect
  ] ?? "aspect-square");

export default function Showcase() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((d) => setItems((d.items ?? []).slice(0, 10)))
      .catch(() => {});
  }, []);

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-28 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mb-14 flex flex-wrap items-end justify-between gap-6"
      >
        <div>
          <p className="font-mono2 text-[11px] tracking-[0.35em] text-cyan-300">
            02 — FRESH FROM THE RENDER FARM
          </p>
          <h2 className="font-display mt-4 text-4xl font-extrabold leading-[1.02] text-white sm:text-6xl">
            Made with <span className="text-gradient">MIRAGE</span>
          </h2>
        </div>
        <Link
          href="/gallery"
          className="group inline-flex items-center gap-2 rounded-full border border-white/12 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/8"
        >
          Open gallery
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </motion.div>

      <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
        {items.map((item, i) => (
          <motion.figure
            key={item.id}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, delay: (i % 4) * 0.08 }}
            className="group relative break-inside-avoid overflow-hidden rounded-2xl border border-white/8"
          >
            <img
              src={proxied(item.resultUrl ?? "")}
              alt={item.prompt}
              loading="lazy"
              className={`w-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.08] ${ratioFor(item.aspect)} ${
                item.mode === "video" && item.motion ? `group-hover:fx-${item.motion}` : ""
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <figcaption className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 font-mono2 text-[9px] tracking-widest text-white backdrop-blur">
                {item.mode === "video" ? (
                  <Clapperboard className="size-3 text-fuchsia-300" />
                ) : (
                  <ImageIcon className="size-3 text-cyan-300" />
                )}
                {item.mode.toUpperCase()}
              </span>
              <p className="line-clamp-2 text-xs leading-snug text-zinc-200">{item.prompt}</p>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
