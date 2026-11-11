import { Sparkles } from "lucide-react";

export default function AuthVisual() {
  return (
    <div className="relative hidden overflow-hidden lg:block">
      <img
        src="/img/hero-poster.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050508] via-[#050508]/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/85 via-transparent to-[#050508]/40" />
      <div className="absolute bottom-14 left-12 right-12">
        <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono2 text-[10px] tracking-[0.3em] text-fuchsia-200">
          <Sparkles className="size-3.5" />
          RENDERED WITH MIRAGE
        </div>
        <p className="font-display mt-5 max-w-md text-3xl font-bold leading-tight text-white">
          “I typed one sentence. MIRAGE handed me a film still.”
        </p>
        <p className="mt-4 font-mono2 text-[11px] tracking-[0.25em] text-zinc-400">
          SEED 042 — CHROME PORTRAIT SERIES
        </p>
      </div>
    </div>
  );
}
