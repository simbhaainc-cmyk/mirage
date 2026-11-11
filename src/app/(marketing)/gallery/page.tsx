import type { Metadata } from "next";
import GalleryGrid from "@/components/gallery/GalleryGrid";

export const metadata: Metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <div className="relative overflow-hidden px-5 pb-28 pt-36 sm:px-8">
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-[40rem] rounded-full bg-fuchsia-600/15 blur-[130px]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="font-mono2 text-[11px] tracking-[0.35em] text-cyan-300">
            COMMUNITY RENDER FARM
          </p>
          <h1 className="font-display mx-auto mt-4 max-w-3xl text-5xl font-extrabold leading-[1.0] text-white sm:text-7xl">
            Scenes the world <span className="text-gradient">dreamed up</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg text-zinc-400">
            Every piece below was rendered inside MIRAGE. Hover a video to see
            its camera come alive — or remix any prompt into your own vision.
          </p>
        </div>
        <GalleryGrid />
      </div>
    </div>
  );
}
