import Link from "next/link";
import { Aperture, AtSign, Clapperboard, Globe, MessageCircle } from "lucide-react";

const COLS = [
  {
    title: "Product",
    links: [
      { label: "Studio", href: "/studio" },
      { label: "Gallery", href: "/gallery" },
      { label: "Pricing", href: "/pricing" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign up", href: "/signup" },
      { label: "Sign in", href: "/login" },
      { label: "Upgrade", href: "/pricing" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/8 bg-[#050508]">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400">
                <Aperture className="size-5 text-white" strokeWidth={2.4} />
              </span>
              <span className="font-display text-xl font-extrabold tracking-[0.22em] text-white">
                MIRAGE
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-zinc-500">
              The AI studio that turns words into cinema. Built for dreamers,
              directors and anyone with a scene stuck in their head.
            </p>
            <div className="mt-6 flex gap-3">
              {[AtSign, MessageCircle, Clapperboard, Globe].map((Icon, i) => (
                <span
                  key={i}
                  className="grid size-9 cursor-pointer place-items-center rounded-full border border-white/10 text-zinc-400 transition-all hover:border-fuchsia-400/50 hover:text-white"
                >
                  <Icon className="size-4" />
                </span>
              ))}
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <p className="font-mono2 text-[11px] uppercase tracking-[0.3em] text-zinc-500">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-zinc-400 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
          <p className="font-mono2 text-[11px] tracking-wider text-zinc-600">
            © {new Date().getFullYear()} MIRAGE STUDIO SYSTEMS
          </p>
          <p className="font-mono2 text-[11px] tracking-wider text-zinc-600">
            RENDER PIPELINE v2.4 — ALL SYSTEMS NOMINAL
          </p>
        </div>
      </div>
    </footer>
  );
}
