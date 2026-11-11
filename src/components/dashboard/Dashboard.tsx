"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Aperture, ArrowRight, BadgeCheck, Clapperboard, Coins, Download, Globe,
  GlobeLock, ImageIcon, Loader2, LogOut, Sparkles, Trash2, Wand2,
} from "lucide-react";
import { proxied } from "@/lib/engine";
import { getPlan } from "@/lib/plans";

type Me = {
  id: string; name: string; email: string; plan: string;
  credits: number; avatarHue: number; createdAt: string;
};
type Stats = { total: number; images: number; videos: number };
type Ledger = { id: string; delta: number; reason: string; balanceAfter: number; createdAt: string };
type Job = {
  id: string; mode: string; prompt: string; aspect: string; status: string;
  resultUrl: string | null; isPublic: boolean; createdAt: string;
};

const ratioFor = (aspect: string) =>
  ({ "16:9": "aspect-video", "9:16": "aspect-[9/16]", "1:1": "aspect-square", "4:3": "aspect-[4/3]", "3:4": "aspect-[3/4]" }[
    aspect
  ] ?? "aspect-video");

export default function Dashboard() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, images: 0, videos: 0 });
  const [ledger, setLedger] = useState<Ledger[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tab, setTab] = useState<"all" | "image" | "video">("all");
  const [booted, setBooted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }, []);

  const load = useCallback(async () => {
    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();
    if (!meData.user) {
      router.replace(`/login?next=${encodeURIComponent("/dashboard")}`);
      return;
    }
    setMe(meData.user);
    setStats(meData.stats ?? { total: 0, images: 0, videos: 0 });
    setLedger(meData.ledger ?? []);
    const g = await fetch("/api/generations").then((r) => (r.ok ? r.json() : { generations: [] }));
    setJobs(g.generations ?? []);
    setBooted(true);
  }, [router]);

  useEffect(() => {
    load();
    // refresh while anything renders
    const t = setInterval(() => {
      setJobs((prev) => {
        if (prev.some((j) => j.status === "processing")) load();
        return prev;
      });
    }, 4000);
    return () => clearInterval(t);
  }, [load]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function removeJob(id: string) {
    const res = await fetch(`/api/generations/${id}`, { method: "DELETE" });
    if (res.ok) {
      setJobs((p) => p.filter((j) => j.id !== id));
      flash("Deleted");
    }
  }

  async function togglePublish(job: Job) {
    const res = await fetch(`/api/generations/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !job.isPublic }),
    });
    if (res.ok) {
      const { job: updated } = await res.json();
      setJobs((p) => p.map((j) => (j.id === updated.id ? updated : j)));
      flash(updated.isPublic ? "Published to gallery" : "Made private");
    }
  }

  async function download(job: Job) {
    if (!job.resultUrl) return;
    try {
      const res = await fetch(proxied(job.resultUrl));
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `mirage-${job.id.slice(0, 8)}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      flash("Download failed");
    }
  }

  if (!booted || !me) {
    return (
      <div className="grid min-h-svh place-items-center bg-[#050508]">
        <Aperture className="size-10 animate-spin-slow text-fuchsia-400" />
      </div>
    );
  }

  const plan = getPlan(me.plan);
  const visible = tab === "all" ? jobs : jobs.filter((j) => j.mode === tab);

  return (
    <div className="min-h-svh bg-[#050508]">
      {/* header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/8 bg-[#050508]/85 px-4 backdrop-blur-xl sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400">
            <Aperture className="size-4 text-white" strokeWidth={2.4} />
          </span>
          <span className="font-display text-sm font-extrabold tracking-[0.22em] text-white">MIRAGE</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <Link
            href="/studio"
            className="btn-sheen rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-1.5 text-xs font-bold text-white"
          >
            Open Studio
          </Link>
          <button
            onClick={logout}
            className="grid size-8 place-items-center rounded-full border border-white/12 text-zinc-400 transition-colors hover:text-rose-300"
            aria-label="Sign out"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        {/* identity + stats */}
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="panel relative overflow-hidden rounded-3xl p-8"
          >
            <div className="absolute -right-16 -top-16 size-56 rounded-full bg-violet-600/20 blur-[70px]" />
            <div className="relative flex flex-wrap items-center gap-5">
              <span
                className="grid size-16 place-items-center rounded-2xl text-2xl font-extrabold text-white"
                style={{
                  background: `conic-gradient(from 180deg, hsl(${me.avatarHue},80%,55%), hsl(${(me.avatarHue + 80) % 360},80%,45%), hsl(${me.avatarHue},80%,55%))`,
                }}
              >
                {me.name.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <h1 className="font-display text-2xl font-extrabold text-white">{me.name}</h1>
                <p className="text-sm text-zinc-500">{me.email}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-3 py-1 font-mono2 text-[10px] uppercase tracking-widest text-fuchsia-200">
                  <BadgeCheck className="size-3" /> {plan.name} plan
                </span>
              </div>
            </div>

            <div className="relative mt-8 grid grid-cols-3 gap-4">
              <Stat label="TOTAL RENDERS" value={stats.total} icon={Sparkles} />
              <Stat label="IMAGES" value={stats.images} icon={ImageIcon} />
              <Stat label="VIDEOS" value={stats.videos} icon={Clapperboard} />
            </div>
          </motion.div>

          {/* credits card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-300/10 via-[#0c0c14] to-[#0c0c14] p-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono2 text-[10px] tracking-[0.3em] text-amber-200/80">
                  CREDIT BALANCE
                </p>
                <p className="font-display mt-2 text-6xl font-extrabold text-white">
                  {me.credits.toLocaleString()}
                </p>
              </div>
              <span className="grid size-12 place-items-center rounded-2xl bg-amber-300/15">
                <Coins className="size-6 text-amber-300" />
              </span>
            </div>
            <p className="mt-2 font-mono2 text-[10px] tracking-wider text-zinc-500">
              {plan.creditsPerMonth.toLocaleString()} MORE LAND ON EACH {plan.id === "free" ? "UPGRADE" : "CYCLE"}
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/pricing"
                className="btn-sheen flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-bold text-white"
              >
                <Sparkles className="size-4" />
                {plan.id === "studio" ? "Manage plan" : "Refill & upgrade"}
              </Link>
              <Link
                href="/studio"
                className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/12 px-5 text-sm font-semibold text-white hover:bg-white/8"
              >
                <Wand2 className="size-4" /> Create
              </Link>
            </div>
          </motion.div>
        </div>

        {/* renders grid */}
        <div className="mt-12">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-extrabold text-white">Your renders</h2>
            <div className="glass inline-flex rounded-full p-1">
              {(["all", "image", "video"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
                    tab === t ? "text-white" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {tab === t && (
                    <motion.span
                      layoutId="dash-tab"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  <span className="relative">{t === "all" ? "All" : t === "image" ? "Images" : "Videos"}</span>
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="panel grid place-items-center rounded-3xl py-20 text-center">
              <div className="grid size-16 place-items-center rounded-2xl border border-dashed border-white/15">
                <ImageIcon className="size-6 text-zinc-600" />
              </div>
              <p className="mt-5 font-display text-lg font-bold text-zinc-300">Nothing here yet</p>
              <p className="mt-1.5 text-sm text-zinc-500">Fire up the studio and render your first scene.</p>
              <Link
                href="/studio"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white"
              >
                Open Studio <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {visible.map((job) => (
                  <motion.figure
                    layout
                    key={job.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    className="group relative overflow-hidden rounded-2xl border border-white/8"
                  >
                    {job.status === "completed" && job.resultUrl ? (
                      <img
                        src={proxied(job.resultUrl)}
                        alt={job.prompt}
                        loading="lazy"
                        className={`w-full object-cover ${ratioFor(job.aspect)}`}
                      />
                    ) : (
                      <div className={`grid w-full place-items-center bg-white/4 ${ratioFor(job.aspect)}`}>
                        <Loader2 className="size-5 animate-spin text-fuchsia-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <figcaption className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="line-clamp-2 text-[11px] leading-snug text-zinc-200">{job.prompt}</p>
                      <div className="mt-2 flex gap-1.5">
                        {job.status === "completed" && (
                          <button
                            onClick={() => download(job)}
                            title="Download"
                            className="grid size-8 place-items-center rounded-full bg-white/12 text-white backdrop-blur hover:bg-white/25"
                          >
                            <Download className="size-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => togglePublish(job)}
                          title={job.isPublic ? "Unpublish" : "Publish to gallery"}
                          className={`grid size-8 place-items-center rounded-full backdrop-blur ${
                            job.isPublic
                              ? "bg-emerald-400/25 text-emerald-200"
                              : "bg-white/12 text-white hover:bg-white/25"
                          }`}
                        >
                          {job.isPublic ? <Globe className="size-3.5" /> : <GlobeLock className="size-3.5" />}
                        </button>
                        <button
                          onClick={() => removeJob(job.id)}
                          title="Delete"
                          className="grid size-8 place-items-center rounded-full bg-rose-500/20 text-rose-200 backdrop-blur hover:bg-rose-500/40"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </figcaption>
                    <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 font-mono2 text-[8px] tracking-widest text-white backdrop-blur">
                      {job.mode === "video" ? (
                        <Clapperboard className="size-2.5 text-fuchsia-300" />
                      ) : (
                        <ImageIcon className="size-2.5 text-cyan-300" />
                      )}
                      {job.mode.toUpperCase()}
                    </span>
                    {job.isPublic && (
                      <span className="absolute right-2.5 top-2.5 rounded-full bg-emerald-400/80 px-2 py-1 font-mono2 text-[8px] font-bold tracking-widest text-black">
                        LIVE
                      </span>
                    )}
                  </motion.figure>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ledger */}
        <div className="mt-12">
          <h2 className="font-display mb-6 text-2xl font-extrabold text-white">Credit ledger</h2>
          <div className="panel overflow-hidden rounded-3xl">
            {ledger.length === 0 ? (
              <p className="p-6 text-sm text-zinc-500">No credit movements yet.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/8 font-mono2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="hidden px-6 py-4 sm:table-cell">Balance</th>
                    <th className="hidden px-6 py-4 md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((row) => (
                    <tr key={row.id} className="border-b border-white/5 last:border-0 hover:bg-white/3">
                      <td className="px-6 py-3.5 text-zinc-300">{row.reason}</td>
                      <td
                        className={`px-6 py-3.5 font-mono2 font-bold ${
                          row.delta >= 0 ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {row.delta >= 0 ? "+" : ""}
                        {row.delta}
                      </td>
                      <td className="hidden px-6 py-3.5 font-mono2 text-zinc-400 sm:table-cell">
                        {row.balanceAfter}
                      </td>
                      <td className="hidden px-6 py-3.5 text-zinc-500 md:table-cell">
                        {new Date(row.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-full border border-white/12 bg-[#0c0c14]/95 px-5 py-2.5 font-mono2 text-xs tracking-wider text-white shadow-2xl backdrop-blur"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof ImageIcon }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
      <Icon className="size-4 text-fuchsia-300" />
      <p className="font-display mt-3 text-2xl font-extrabold text-white">{value}</p>
      <p className="font-mono2 mt-1 text-[9px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
    </div>
  );
}
