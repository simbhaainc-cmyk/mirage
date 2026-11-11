"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Circle, Download, Loader2, Pause, Play } from "lucide-react";

/**
 * VideoStage renders a generated keyframe with cinematic camera-motion FX,
 * timecode chrome and a real WebM/MP4 exporter that re-draws the move onto a
 * canvas and records it with MediaRecorder.
 */
export default function VideoStage({
  src,
  motion = "dolly-in",
  aspect = "16:9",
  watermark = false,
  prompt,
}: {
  src: string;
  motion?: string | null;
  aspect?: string;
  watermark?: boolean;
  prompt: string;
}) {
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportPct, setExportPct] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const fx = `fx-${motion ?? "dolly-in"}`;

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const t0 = performance.now();
    let acc = 0;
    const tick = (now: number) => {
      acc = (now - t0) / 1000;
      setElapsed(acc);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const tc = formatTimecode(elapsed);

  /* ── Canvas exporter ─────────────────────────────────────────────────── */
  const exportVideo = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    setExportPct(0);
    try {
      const img = new Image();
      img.src = src;
      await img.decode();

      const W = 1280;
      const H = aspect === "9:16" ? 720 : aspect === "1:1" ? 1280 : aspect === "3:4" ? 960 : 720;
      const cw = W;
      const ch = aspect === "1:1" ? 1280 : H;
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d")!;
      const base = Math.max(cw / img.width, ch / img.height);
      const iw = img.width * base;
      const ih = img.height * base;

      const draw = (p: number) => {
        const e = easeInOut(p);
        let s = 1.12;
        let tx = 0;
        let ty = 0;
        let rot = 0;
        switch (motion) {
          case "dolly-in": s = 1.02 + e * 0.2; break;
          case "dolly-out": s = 1.22 - e * 0.2; break;
          case "pan-right": s = 1.18; tx = (-0.045 + e * 0.09) * cw; break;
          case "tilt-up": s = 1.18; ty = (0.045 - e * 0.09) * ch; break;
          case "orbit": s = 1.16; rot = (-0.042 + e * 0.084); break;
          case "parallax": s = 1.12; tx = (-0.02 + e * 0.04) * cw; ty = (0.015 - e * 0.03) * ch; break;
          case "shake": {
            s = 1.14;
            const i = Math.floor(p * 400);
            tx = (pseudo(i) - 0.5) * 0.012 * cw;
            ty = (pseudo(i * 7 + 3) - 0.5) * 0.012 * ch;
            rot = (pseudo(i * 13 + 5) - 0.5) * 0.01;
            break;
          }
          case "pulse": {
            const beats = 3;
            const ph = (p * beats) % 1;
            s = 1.03 + 0.13 * Math.max(0, Math.sin(ph * Math.PI));
            break;
          }
        }
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cw, ch);
        ctx.save();
        ctx.translate(cw / 2 + tx, ch / 2 + ty);
        ctx.rotate(rot);
        ctx.scale(s, s);
        ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
        ctx.restore();
        // letterbox
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cw, ch * 0.07);
        ctx.fillRect(0, ch * 0.93, cw, ch * 0.07);
        if (watermark) {
          ctx.fillStyle = "rgba(255,255,255,0.55)";
          ctx.font = "600 22px sans-serif";
          ctx.textAlign = "right";
          ctx.fillText("MIRAGE", cw - 28, ch * 0.93 - 18);
        }
      };

      const mime = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
        "video/mp4",
      ].find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m));
      if (!mime) throw new Error("Video export not supported in this browser");

      const stream = canvas.captureStream(30);
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);

      const duration = 4000;
      const start = performance.now();
      await new Promise<void>((resolve) => {
        rec.onstop = () => resolve();
        rec.start(120);
        const loop = () => {
          const p = Math.min(1, (performance.now() - start) / duration);
          draw(p);
          setExportPct(Math.round(p * 100));
          if (p < 1) requestAnimationFrame(loop);
          else rec.stop();
        };
        loop();
      });

      const blob = new Blob(chunks, { type: mime.split(";")[0] });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `mirage-${motion ?? "video"}-${Date.now()}.${mime.includes("mp4") ? "mp4" : "webm"}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error(err);
      alert("Export failed in this browser — try Chrome or Edge for video exports.");
    } finally {
      setExporting(false);
      setExportPct(0);
    }
  }, [src, motion, aspect, watermark, exporting, prompt]);

  return (
    <div className="group relative h-full w-full select-none overflow-hidden bg-black">
      {/* The "shot" */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={imgRef}
          src={src}
          alt={prompt}
          className={`fx-layer h-full w-full object-cover ${playing ? fx : ""}`}
          style={!playing ? { transform: "scale(1.08)" } : undefined}
          draggable={false}
        />
      </div>
      <div className="vignette pointer-events-none absolute inset-0" />

      {/* Letterbox bars */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[7%] bg-black" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[7%] bg-black" />

      {/* Viewfinder chrome */}
      <div className="pointer-events-none absolute left-5 top-[calc(7%+14px)] z-30 flex items-center gap-2.5">
        <Circle className={`size-3 fill-rose-500 text-rose-500 ${playing ? "rec-dot" : "opacity-30"}`} />
        <span className="font-mono2 text-xs tracking-widest text-white/90">{playing ? "REC" : "PAUSED"}</span>
      </div>
      <div className="pointer-events-none absolute right-5 top-[calc(7%+14px)] z-30 font-mono2 text-xs tracking-widest text-white/80">
        TC {tc}
      </div>
      <div className="pointer-events-none absolute left-5 bottom-[calc(7%+14px)] z-30 font-mono2 text-[10px] tracking-[0.25em] text-white/60">
        {(motion ?? "dolly-in").replace("-", " ").toUpperCase()} · 24FPS · MIRAGE ENGINE
      </div>
      {/* corner brackets */}
      {[
        "left-4 top-[calc(7%+34px)] border-l-2 border-t-2 rounded-tl-lg",
        "right-4 top-[calc(7%+34px)] border-r-2 border-t-2 rounded-tr-lg",
        "left-4 bottom-[calc(7%+34px)] border-l-2 border-b-2 rounded-bl-lg",
        "right-4 bottom-[calc(7%+34px)] border-r-2 border-b-2 rounded-br-lg",
      ].map((c) => (
        <span key={c} className={`pointer-events-none absolute z-30 size-7 border-white/35 ${c}`} />
      ))}

      {watermark && (
        <span className="pointer-events-none absolute right-5 bottom-[calc(7%+14px)] z-30 font-display text-xs font-bold tracking-[0.25em] text-white/50">
          MIRAGE
        </span>
      )}

      {/* Controls */}
      <div className="absolute bottom-[calc(7%+16px)] left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <button
          onClick={() => setPlaying((v) => !v)}
          className="grid size-11 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition-colors hover:bg-white/25"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="size-4.5" /> : <Play className="size-4.5 fill-white pl-0.5" />}
        </button>
        <button
          onClick={exportVideo}
          disabled={exporting}
          className="flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-xs font-bold text-white shadow-lg transition-shadow hover:shadow-[0_0_30px_rgba(224,69,245,0.5)] disabled:opacity-80"
        >
          {exporting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Rendering {exportPct}%
            </>
          ) : (
            <>
              <Download className="size-4" /> Export video
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
function pseudo(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
function formatTimecode(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const f = Math.floor((sec % 1) * 24);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(m)}:${pad(s)}:${pad(f)}`;
}
