"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Clapperboard, ImageIcon, Loader2, Wand2 } from "lucide-react";
import { proxied } from "@/lib/engine";

type Item = {
  id: string;
  mode: string;
  prompt: string;
  style: string;
  aspect: string;
  motion: string | null;
  seed: number;
  resultUrl: string | null;
};

const ratioFor = (aspect: string) =>
  ({ "16:9": "aspect-video", "9:16": "aspect-[9/16]", "1:1": "aspect-square", "4:3": "aspect-[4/3]", "3:4": "aspect-[3/4]" }[
    aspect
  ] ?? "aspect-square");

const TABS = [
  { id: "all", label: "Everything" },
  { id: "image", label: "Images" },
  { id: "video", label: "Videos" },
] as const;

export default function GalleryGrid() {
  const [items, setItems] = useState<Item[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visible = tab === "all" ? items : items.filter((i) => i.mode === tab);

  return (
    <div>
      <div className="mb-12 flex justify-center">
        <div className="glass inline-flex rounded-full p-1.5">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${
                  active ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="gallery-tab"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.55 }}
                  />
                )}
                <span className="relative">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-32 text-zinc-500">
          <Loader2 className="size-7 animate-spin text-fuchsia-400" />
          <p className="mt-4 font-mono2 text-xs tracking-[0.3em]">LOADING RENDER FARM…</p>
        </div>
      ) : (
        <motion.div layout className="columns-2 gap-4 md:columns-3 xl:columns-4 [&>*]:mb-4">
          <AnimatePresence mode="popLayout">
            {visible.map((item) => (
              <motion.figure
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.45 }}
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <figcaption className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 font-mono2 text-[9px] tracking-widest text-white backdrop-blur">
                      {item.mode === "video" ? (
                        <Clapperboard className="size-3 text-fuchsia-300" />
                      ) : (
                        <ImageIcon className="size-3 text-cyan-300" />
                      )}
                      {item.mode.toUpperCase()} · SEED {String(item.seed).padStart(5, "0")}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs leading-snug text-zinc-200">{item.prompt}</p>
                  <Link
                    href={`/studio?prompt=${encodeURIComponent(item.prompt)}&style=${item.style}&mode=${item.mode}`}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur transition-colors hover:bg-fuchsia-500"
                  >
                    <Wand2 className="size-3" /> Remix this
                  </Link>
                </figcaption>
              </motion.figure>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
