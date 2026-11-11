import { Sparkle } from "lucide-react";

const ITEMS = [
  "TEXT TO IMAGE",
  "TEXT TO VIDEO",
  "CAMERA CONTROL",
  "STYLE DNA",
  "4K UPSCALE",
  "MOTION PRESETS",
  "COMMERCIAL LICENSE",
  "SEED CONTROL",
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-white/8 bg-[#08080f] py-5">
      <div className="flex w-max animate-marquee items-center gap-10">
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center gap-10" aria-hidden={half === 1}>
            {row.map((item, i) => (
              <span key={`${half}-${i}`} className="flex items-center gap-10">
                <span className="font-display text-sm font-bold tracking-[0.3em] text-zinc-500">
                  {item}
                </span>
                <Sparkle className="size-3.5 text-fuchsia-400/70" />
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050508] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050508] to-transparent" />
    </div>
  );
}
