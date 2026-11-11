"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Aperture, Coins, LayoutDashboard, LogOut, Menu, Sparkles, X } from "lucide-react";

type Me = { name: string; credits: number; plan: string; avatarHue: number } | null;

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/pricing", label: "Pricing" },
];

export default function Navbar() {
  const [me, setMe] = useState<Me>(null);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user))
      .catch(() => setMe(null));
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "backdrop-blur-xl bg-[#050508]/70 border-b border-white/8" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 shadow-[0_0_24px_rgba(139,92,246,0.5)] transition-transform duration-500 group-hover:rotate-90">
            <Aperture className="size-4.5 text-white" strokeWidth={2.4} />
          </span>
          <span className="font-display text-lg font-800 tracking-[0.22em] text-white">
            MIRAGE
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                pathname === l.href
                  ? "text-white bg-white/8"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {me ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 font-mono2 text-xs text-amber-200 hover:bg-white/10 transition-colors"
              >
                <Coins className="size-3.5" />
                {me.credits}
              </Link>
              <Link
                href="/studio"
                className="btn-sheen rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_28px_rgba(168,85,247,0.45)] hover:shadow-[0_0_36px_rgba(224,69,245,0.6)] transition-shadow"
              >
                Launch Studio
              </Link>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="grid size-9 place-items-center rounded-full text-sm font-bold text-white"
                  style={{
                    background: `conic-gradient(from 180deg, hsl(${me.avatarHue},80%,55%), hsl(${(me.avatarHue + 80) % 360},80%,45%), hsl(${me.avatarHue},80%,55%))`,
                  }}
                  aria-label="Account menu"
                >
                  {me.name.slice(0, 1).toUpperCase()}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c14]/95 shadow-2xl backdrop-blur-xl">
                    <div className="border-b border-white/8 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-white">{me.name}</p>
                      <p className="font-mono2 text-[10px] uppercase tracking-widest text-fuchsia-300">
                        {me.plan} plan
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LayoutDashboard className="size-4" /> Dashboard
                    </Link>
                    <Link
                      href="/pricing"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Sparkles className="size-4" /> Upgrade plan
                    </Link>
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2.5 border-t border-white/8 px-4 py-2.5 text-sm text-rose-300 hover:bg-rose-500/10"
                    >
                      <LogOut className="size-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="btn-sheen rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_28px_rgba(168,85,247,0.45)] hover:shadow-[0_0_36px_rgba(224,69,245,0.6)] transition-shadow"
              >
                Start free
              </Link>
            </>
          )}
        </div>

        <button
          className="grid size-10 place-items-center rounded-xl border border-white/10 text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/8 bg-[#050508]/95 px-5 py-4 backdrop-blur-xl md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-base text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-3 flex gap-3 border-t border-white/8 pt-4">
            {me ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 py-2.5 text-sm text-amber-200"
                >
                  <Coins className="size-4" /> {me.credits} credits
                </Link>
                <Link
                  href="/studio"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Launch Studio
                </Link>
                <button
                  onClick={logout}
                  className="grid size-10 place-items-center rounded-full border border-white/10 text-rose-300"
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full border border-white/15 py-2.5 text-center text-sm text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Start free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
