"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, Aperture, Clapperboard, Coins, Dices, Download, Globe, GlobeLock,
  ImageIcon, Layers, Loader2, Lock, MoveRight, MoveUp, Orbit, RefreshCcw,
  Shuffle, Sparkles, Trash2, Wand2, Zap, ZoomIn, ZoomOut,
} from "lucide-react";
import VideoStage from "@/components/studio/VideoStage";
import { proxied, RENDER_STAGES_IMAGE, RENDER_STAGES_VIDEO } from "@/lib/engine";
import { ASPECTS, CREDIT_COSTS_UI, MOTION_PRESETS, PROMPT_IDEAS, STYLE_PRESETS } from "@/lib/studio-data";

type Job = {
  id: string; mode: string; prompt: string; style: string; motion: string | null;
  aspect: string; seed: number; status: string; resultUrl: string | null;
  isPublic: boolean; creditsUsed: number; createdAt: string;
};
type Me = { name: string; plan: string; credits: number } | null;

const MOTION_ICONS: Record<string, typeof ZoomIn> = {
  "dolly-in": ZoomIn, "dolly-out": ZoomOut, "pan-right": MoveRight, "tilt-up": MoveUp,
  orbit: Orbit, parallax: Layers, shake: Shuffle, pulse: Zap,
};

const ratioFor = (aspect: string) =>
  ({ "16:9": "aspect-video", "9:16": "aspect-[9/16]", "1:1": "aspect-square", "4:3": "aspect-[4/3]", "3:4": "aspect-[3/4]" }[
    aspect
  ] ?? "aspect-video");

export default function StudioApp() {
  const router = useRouter();
  const params = useSearchParams();

  const [me, setMe] = useState<Me>(null);
  const [booted, setBooted] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [mode, setMode] = useState<"image" | "video">("image");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [aspect, setAspect] = useState("16:9");
  const [cameraMotion, setCameraMotion] = useState("dolly-in");
  const [seedLocked, setSeedLocked] = useState(false);
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1_000_000));

  const [submitting, setSubmitting] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const etaMap = useRef<Record<string, number>>({});
  const submittedAt = useRef<Record<string, number>>({});
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const active = useMemo(() => jobs.find((j) => j.id === activeId) ?? jobs[0] ?? null, [jobs, activeId]);
  const hasProcessing = jobs.some((j) => j.status === "processing");

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  /* ── boot: auth + prefill from remix params ─────────────────────────── */
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!data.user) {
        router.replace(`/login?next=${encodeURIComponent("/studio")}`);
        return;
      }
      setMe(data.user);
      const p = params.get("prompt");
      const s = params.get("style");
      const m = params.get("mode");
      if (p) setPrompt(p);
      if (s && STYLE_PRESETS.some((x) => x.id === s)) setStyle(s);
      if (m === "video" || m === "image") setMode(m);
      const g = await fetch("/api/generations").then((r) => (r.ok ? r.json() : { generations: [] }));
      setJobs(g.generations ?? []);
      if ((g.generations ?? []).length) setActiveId(g.generations[0].id);
      setBooted(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── polling while anything renders ─────────────────────────────────── */
  useEffect(() => {
    if (!hasProcessing) {
      if (pollTimer.current) clearInterval(pollTimer.current);
      pollTimer.current = null;
      return;
    }
    if (pollTimer.current) return;
    pollTimer.current = setInterval(async () => {
      const res = await fetch("/api/generations");
      if (!res.ok) return;
      const data = await res.json();
      setJobs(data.generations ?? []);
      if (typeof data.credits === "number") {
        setMe((prev) => (prev ? { ...prev, credits: data.credits } : prev));
      }
    }, 2000);
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
      pollTimer.current = null;
    };
  }, [hasProcessing]);

  async function generate(seedOverride?: number) {
    if (submitting) return;
    if (prompt.trim().length < 3) {
      flash("Describe your scene first");
      return;
    }
    const useSeed = seedLocked ? seed : seedOverride ?? Math.floor(Math.random() * 1_000_000);
    setSubmitting(true);
    try {
      const res = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, prompt: prompt.trim(), style, aspect, motion: cameraMotion, seed: useSeed }),
      });
      const data = await res.json();
      if (res.status === 402) {
        setUpgradeOpen(true);
        return;
      }
      if (res.status === 401) {
        router.replace(`/login?next=${encodeURIComponent("/studio")}`);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Render failed");
      submittedAt.current[data.job.id] = Date.now();
      etaMap.current[data.job.id] = data.etaMs ?? 9000;
      setJobs((prev) => [data.job, ...prev]);
      setActiveId(data.job.id);
      setMe((prev) => (prev ? { ...prev, credits: data.balance } : prev));
      if (!seedLocked) setSeed(useSeed);
    } catch (e) {
      flash(e instanceof Error ? e.message : "Render failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeJob(id: string) {
    const res = await fetch(`/api/generations/${id}`, { method: "DELETE" });
    if (res.ok) {
      setJobs((prev) => {
        const next = prev.filter((j) => j.id !== id);
        if (activeId === id) setActiveId(next[0]?.id ?? null);
        return next;
      });
      flash("Render deleted");
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
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      flash(updated.isPublic ? "Published to gallery" : "Made private");
    }
  }

  async function downloadImage(job: Job) {
    try {
      const res = await fetch(proxied(job.resultUrl ?? ""));
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `mirage-${job.seed}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      flash("Download failed");
    }
  }

  const cost = CREDIT_COSTS_UI[mode];

  if (!booted) {
    return (
      <div className="grid min-h-svh place-items-center bg-[#050508]">
        <div className="flex flex-col items-center gap-5">
          <Aperture className="size-10 animate-spin-slow text-fuchsia-400" />
          <p className="font-mono2 text-xs tracking-[0.35em] text-zinc-500">BOOTING STUDIO…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col bg-[#050508]">
      {/* ── Studio chrome ─────────────────────────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-md bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400">
              <Aperture className="size-4 text-white" strokeWidth={2.4} />
            </span>
            <span className="font-display text-sm font-extrabold tracking-[0.22em] text-white">
              MIRAGE
            </span>
          </Link>
          <span className="hidden rounded-full border border-white/10 px-3 py-1 font-mono2 text-[10px] tracking-[0.25em] text-zinc-500 sm:block">
            STUDIO v2.4
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 rounded-full border border-amber-300/25 bg-amber-300/8 px-3.5 py-1.5 font-mono2 text-xs text-amber-200">
            <Coins className="size-3.5" />
            {me?.credits ?? 0}
          </span>
          <Link
            href="/pricing"
            className="hidden rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-1.5 text-xs font-bold text-white sm:block"
          >
            Upgrade
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/12 px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/8"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* ── Control deck ────────────────────────────────────────────── */}
        <aside className="w-full shrink-0 overflow-y-auto border-b border-white/8 p-5 lg:h-[calc(100svh-3.5rem)] lg:w-[380px] lg:border-b-0 lg:border-r">
          {/* Mode */}
          <div className="glass grid grid-cols-2 gap-1.5 rounded-2xl p-1.5">
            {(["image", "video"] as const).map((m) => {
              const isActive = mode === m;
              const Icon = m === "image" ? ImageIcon : Clapperboard;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`relative flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors ${
                    isActive ? "text-white" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="mode-pill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className="size-4" />
                    {m === "image" ? "Image" : "Video"}
                    <span className="rounded-full bg-black/30 px-1.5 py-0.5 font-mono2 text-[9px]">
                      {CREDIT_COSTS_UI[m]}cr
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Prompt */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono2 text-[10px] tracking-[0.3em] text-zinc-500">
                PROMPT
              </label>
              <button
                onClick={() => setPrompt(PROMPT_IDEAS[Math.floor(Math.random() * PROMPT_IDEAS.length)])}
                className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[11px] text-zinc-400 transition-colors hover:border-fuchsia-400/40 hover:text-white"
              >
                <Dices className="size-3.5" /> Surprise me
              </button>
            </div>
            <div className="panel rounded-2xl">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                maxLength={1200}
                placeholder="A lighthouse keeper tending a beacon that shines through parallel universes…"
                className="w-full resize-none rounded-2xl bg-transparent p-4 text-sm leading-relaxed text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-fuchsia-400/50"
              />
              <div className="flex justify-end px-4 pb-3">
                <span className="font-mono2 text-[10px] text-zinc-600">{prompt.length}/1200</span>
              </div>
            </div>
          </div>

          {/* Styles */}
          <div className="mt-5">
            <label className="font-mono2 text-[10px] tracking-[0.3em] text-zinc-500">
              STYLE DNA
            </label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {STYLE_PRESETS.map((s) => {
                const isActive = style === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    title={s.name}
                    className={`group flex flex-col items-center gap-1.5 rounded-xl p-1.5 transition-colors ${
                      isActive ? "bg-white/8" : "hover:bg-white/5"
                    }`}
                  >
                    <span
                      className={`h-9 w-full rounded-lg transition-shadow ${
                        isActive ? "ring-2 ring-fuchsia-400 shadow-[0_0_16px_rgba(224,69,245,0.4)]" : "ring-1 ring-white/10"
                      }`}
                      style={{ background: s.swatch }}
                    />
                    <span className={`text-[9px] font-medium ${isActive ? "text-white" : "text-zinc-500"}`}>
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Camera motion (video only) */}
          <AnimatePresence initial={false}>
            {mode === "video" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-5">
                  <label className="font-mono2 text-[10px] tracking-[0.3em] text-zinc-500">
                    CAMERA MOVE
                  </label>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {MOTION_PRESETS.map((m) => {
                      const isActive = cameraMotion === m.id;
                      const Icon = MOTION_ICONS[m.id] ?? Activity;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setCameraMotion(m.id)}
                          title={m.desc}
                          className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                            isActive
                              ? "border-fuchsia-400/60 bg-fuchsia-400/10 text-white"
                              : "border-white/8 text-zinc-500 hover:border-white/25 hover:text-zinc-200"
                          }`}
                        >
                          <Icon className="size-4.5" />
                          <span className="text-[9px] font-semibold leading-tight text-center">{m.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Aspect + seed */}
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono2 text-[10px] tracking-[0.3em] text-zinc-500">FRAME</label>
              <div className="mt-2 grid grid-cols-5 gap-1.5">
                {ASPECTS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAspect(a.id)}
                    title={a.name}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 transition-colors ${
                      aspect === a.id
                        ? "border-cyan-300/60 bg-cyan-300/10 text-white"
                        : "border-white/8 text-zinc-500 hover:border-white/25"
                    }`}
                  >
                    <span
                      className="rounded-[3px] border border-current opacity-80"
                      style={{
                        width: 16,
                        height: Math.max(6, Math.round((a.h / a.w) * 16 * 0.9)),
                        maxHeight: 18,
                      }}
                    />
                    <span className="text-[8px] font-mono2">{a.id}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-mono2 text-[10px] tracking-[0.3em] text-zinc-500">SEED</label>
              <div className="panel mt-2 flex items-center rounded-xl">
                <input
                  type="number"
                  value={seed}
                  disabled={!seedLocked}
                  onChange={(e) => setSeed(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                  className="w-full bg-transparent px-3 py-2.5 font-mono2 text-xs text-white outline-none disabled:opacity-40"
                />
                <button
                  onClick={() => setSeedLocked((v) => !v)}
                  className={`mr-1.5 grid size-8 shrink-0 place-items-center rounded-lg transition-colors ${
                    seedLocked ? "bg-fuchsia-500/20 text-fuchsia-300" : "text-zinc-500 hover:text-white"
                  }`}
                  title={seedLocked ? "Seed locked — every render uses it" : "Seed unlocked — random per render"}
                >
                  {seedLocked ? <Lock className="size-3.5" /> : <RefreshCcw className="size-3.5" />}
                </button>
              </div>
              <p className="mt-1.5 font-mono2 text-[9px] leading-relaxed text-zinc-600">
                {seedLocked ? "LOCKED — IDENTICAL SEED EVERY RENDER" : "RANDOM EACH RENDER"}
              </p>
            </div>
          </div>

          {/* Generate */}
          <button
            onClick={() => generate()}
            disabled={submitting}
            className="btn-sheen mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 bg-[length:200%_100%] text-base font-extrabold text-white shadow-[0_0_36px_rgba(168,85,247,0.4)] transition-all hover:bg-[position:100%_0] hover:shadow-[0_0_52px_rgba(224,69,245,0.55)] disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <Wand2 className="size-5" />
                Render {mode}
                <span className="flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-1 font-mono2 text-[11px]">
                  <Coins className="size-3" /> {cost}
                </span>
              </>
            )}
          </button>
        </aside>

        {/* ── Stage ───────────────────────────────────────────────────── */}
        <section className="flex min-h-[70svh] flex-1 flex-col p-5 lg:h-[calc(100svh-3.5rem)] lg:min-h-0">
          <div className="panel relative flex-1 overflow-hidden rounded-3xl">
            {active ? (
              <StageView
                key={active.id}
                job={active}
                eta={etaMap.current[active.id] ?? 9000}
                submittedAt={submittedAt.current[active.id] ?? Date.now()}
                freePlan={me?.plan === "free"}
                onDownload={() => active.status === "completed" && downloadImage(active)}
                onVariation={() => {
                  setPrompt(active.prompt);
                  setStyle(active.style);
                  setMode(active.mode === "video" ? "video" : "image");
                  setAspect(active.aspect);
                  if (active.motion) setCameraMotion(active.motion);
                  generate();
                }}
                onPublish={() => togglePublish(active)}
                onDelete={() => removeJob(active.id)}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-5 p-8 text-center">
                <div className="grid size-20 place-items-center rounded-3xl border border-dashed border-white/15">
                  <Sparkles className="size-8 text-zinc-600" />
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-zinc-300">The stage is empty</p>
                  <p className="mt-2 max-w-xs text-sm text-zinc-500">
                    Write a prompt on the left and hit render — your scene will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* History strip */}
          {jobs.length > 0 && (
            <div className="mt-4 flex shrink-0 gap-3 overflow-x-auto pb-1">
              {jobs.map((j) => (
                <button
                  key={j.id}
                  onClick={() => setActiveId(j.id)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border transition-all ${
                    active?.id === j.id
                      ? "border-fuchsia-400 shadow-[0_0_18px_rgba(224,69,245,0.35)]"
                      : "border-white/10 opacity-60 hover:opacity-100"
                  }`}
                >
                  {j.status === "completed" && j.resultUrl ? (
                    <img src={proxied(j.resultUrl)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="grid h-full w-full place-items-center bg-white/5">
                      <Loader2 className="size-4 animate-spin text-fuchsia-300" />
                    </span>
                  )}
                  <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 font-mono2 text-[8px] text-white">
                    {j.mode === "video" ? "VID" : "IMG"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Upgrade modal */}
      <AnimatePresence>
        {upgradeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setUpgradeOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/12 bg-[#0c0c14] p-8 text-center"
            >
              <div className="absolute -top-20 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-fuchsia-600/30 blur-[80px]" />
              <div className="relative">
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
                  <Coins className="size-7 text-white" />
                </div>
                <h3 className="font-display mt-5 text-2xl font-extrabold text-white">
                  Out of credits
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  This render needs <b className="text-white">{cost} credits</b> and you have{" "}
                  <b className="text-amber-300">{me?.credits ?? 0}</b>. Upgrade to a plan and get up
                  to 8,000 fresh credits every month.
                </p>
                <div className="mt-7 grid gap-3">
                  <Link
                    href="/pricing"
                    className="btn-sheen flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-bold text-white"
                  >
                    <Zap className="size-4" /> View plans
                  </Link>
                  <button
                    onClick={() => setUpgradeOpen(false)}
                    className="h-11 rounded-full border border-white/12 text-sm font-semibold text-zinc-300 hover:bg-white/5"
                  >
                    Not now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
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

/* ─── Stage: progress theater while processing, artwork when done ────────── */
function StageView({
  job,
  eta,
  submittedAt,
  freePlan,
  onDownload,
  onVariation,
  onPublish,
  onDelete,
}: {
  job: Job;
  eta: number;
  submittedAt: number;
  freePlan: boolean;
  onDownload: () => void;
  onVariation: () => void;
  onPublish: () => void;
  onDelete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const stages = job.mode === "video" ? RENDER_STAGES_VIDEO : RENDER_STAGES_IMAGE;

  useEffect(() => {
    if (job.status !== "processing") {
      setProgress(1);
      return;
    }
    const tick = () => {
      const p = Math.min(0.96, (Date.now() - submittedAt) / eta);
      setProgress(p);
    };
    tick();
    const t = setInterval(tick, 160);
    return () => clearInterval(t);
  }, [job.status, eta, submittedAt]);

  const stageText = stages[Math.min(stages.length - 1, Math.floor(progress * stages.length))];
  const ratio = ratioFor(job.aspect);
  const src = proxied(job.resultUrl ?? "");

  if (job.status !== "completed") {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black ${ratio} w-full max-w-3xl`}>
          <div className="shimmer-line absolute inset-0" />
          <div className="absolute inset-x-0 h-px animate-scan bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6">
            <Aperture className="size-10 animate-spin-slow text-fuchsia-400" />
            <div className="w-full max-w-xs">
              <div className="mb-2.5 flex items-center justify-between font-mono2 text-[10px] tracking-[0.25em] text-zinc-400">
                <span>{stageText.toUpperCase()}</span>
                <span className="text-fuchsia-300">{Math.round(progress * 100)}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 transition-[width] duration-300"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            </div>
            <p className="line-clamp-1 max-w-sm font-mono2 text-[10px] tracking-wider text-zinc-600">
              “{job.prompt}”
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden">
        {job.mode === "video" ? (
          <VideoStage
            src={src}
            motion={job.motion}
            aspect={job.aspect}
            watermark={freePlan}
            prompt={job.prompt}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6">
            <div className={`relative overflow-hidden rounded-2xl border border-white/10 ${ratio} max-h-full w-auto max-w-full`}>
              <img src={src} alt={job.prompt} className="h-full max-h-[60vh] w-full object-contain" />
              {freePlan && (
                <span className="absolute bottom-3 right-3 font-display text-[10px] font-bold tracking-[0.3em] text-white/60">
                  MIRAGE
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2.5 border-t border-white/8 p-4">
        <p className="mr-auto line-clamp-1 max-w-md text-xs text-zinc-400">
          <span className="text-zinc-600">“</span>{job.prompt}<span className="text-zinc-600">”</span>
          <span className="ml-2 font-mono2 text-[10px] text-zinc-600">
            {job.style.toUpperCase()} · SEED {job.seed} · {job.aspect}
          </span>
        </p>
        {job.mode === "image" && (
          <ActionBtn onClick={onDownload} icon={Download} label="Download" primary />
        )}
        <ActionBtn onClick={onVariation} icon={RefreshCcw} label="Re-render" />
        <ActionBtn
          onClick={onPublish}
          icon={job.isPublic ? GlobeLock : Globe}
          label={job.isPublic ? "Unpublish" : "Publish"}
        />
        <ActionBtn onClick={onDelete} icon={Trash2} label="Delete" danger />
      </div>
    </div>
  );
}

function ActionBtn({
  onClick,
  icon: Icon,
  label,
  primary = false,
  danger = false,
}: {
  onClick: () => void;
  icon: typeof Download;
  label: string;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold transition-colors ${
        primary
          ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
          : danger
            ? "border border-white/10 text-rose-300 hover:bg-rose-500/10"
            : "border border-white/10 text-zinc-300 hover:bg-white/8"
      }`}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}
