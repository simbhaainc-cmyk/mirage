// ─── Image engine routing ───────────────────────────────────────────────────
// Builds deterministic render URLs. Requests are served through /api/media so
// remote origins stay private and the canvas/video exporter never hits CORS.

import { getAspect, getStyle } from "./presets";

export function buildRenderUrl(opts: {
  prompt: string;
  style?: string;
  aspect?: string;
  seed?: number;
}): string {
  const style = getStyle(opts.style ?? "none");
  const aspect = getAspect(opts.aspect ?? "16:9");
  const fullPrompt = (opts.prompt + style.suffix).slice(0, 1200);
  const params = new URLSearchParams({
    width: String(aspect.w),
    height: String(aspect.h),
    seed: String(opts.seed ?? 42),
    nologo: "true",
    model: "flux",
  });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(
    fullPrompt
  )}?${params.toString()}`;
}

/** Route any remote URL through our same-origin proxy */
export function proxied(url: string): string {
  if (url.startsWith("/")) return url;
  return `/api/media?u=${encodeURIComponent(url)}`;
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 1_000_000);
}

/** Pipeline stages shown while a job renders (progress theater) */
export const RENDER_STAGES_IMAGE = [
  "Parsing prompt semantics",
  "Allocating GPU node",
  "Sampling latent space",
  "Diffusing 40 steps",
  "Refining details",
  "Upscaling output",
  "Final color grade",
];

export const RENDER_STAGES_VIDEO = [
  "Parsing prompt semantics",
  "Allocating GPU cluster",
  "Generating keyframe",
  "Simulating camera rig",
  "Interpolating motion",
  "Temporal smoothing",
  "Encoding frames",
  "Mastering final cut",
];
