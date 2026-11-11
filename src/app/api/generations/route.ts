import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { generations } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { adjustCredits } from "@/lib/credits";
import { buildRenderUrl } from "@/lib/engine";
import { CREDIT_COSTS } from "@/lib/plans";
import { getAspect, getStyle } from "@/lib/presets";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const rows = await db
    .select()
    .from(generations)
    .where(eq(generations.userId, user.id))
    .orderBy(desc(generations.createdAt))
    .limit(80);

  return NextResponse.json({ generations: rows, credits: user.credits });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const mode = body?.mode === "video" ? "video" : "image";
  const prompt = String(body?.prompt ?? "").trim();
  const style = getStyle(String(body?.style ?? "none"));
  const aspect = getAspect(String(body?.aspect ?? "16:9"));
  const motion = mode === "video" ? String(body?.motion ?? "dolly-in") : null;
  const seed = Number.isFinite(body?.seed) ? Math.floor(body.seed) : Math.floor(Math.random() * 1_000_000);

  if (prompt.length < 3) {
    return NextResponse.json({ error: "Describe your scene first — at least a few words." }, { status: 400 });
  }
  if (prompt.length > 1200) {
    return NextResponse.json({ error: "Prompt is too long (max 1200 characters)." }, { status: 400 });
  }

  const cost = CREDIT_COSTS[mode];
  if (user.credits < cost) {
    return NextResponse.json(
      { error: "INSUFFICIENT_CREDITS", needed: cost, balance: user.credits },
      { status: 402 }
    );
  }

  const resultUrl = buildRenderUrl({ prompt, style: style.id, aspect: aspect.id, seed });

  const [job] = await db
    .insert(generations)
    .values({
      userId: user.id,
      mode,
      prompt,
      style: style.id,
      motion,
      aspect: aspect.id,
      width: aspect.w,
      height: aspect.h,
      seed,
      status: "processing",
      resultUrl,
      creditsUsed: cost,
    })
    .returning();

  await adjustCredits(user.id, -cost, `Render: ${mode}`);

  // Simulated GPU pipeline — the remote engine renders the asset lazily at serve
  // time, so the job is marked complete once the render window has elapsed.
  const delay = mode === "video" ? 11_000 + Math.random() * 3000 : 6_500 + Math.random() * 2500;
  setTimeout(async () => {
    try {
      await db
        .update(generations)
        .set({ status: "completed", completedAt: new Date() })
        .where(eq(generations.id, job.id));
    } catch (err) {
      console.error("finalize generation failed", err);
    }
  }, delay);

  return NextResponse.json(
    { job, balance: user.credits - cost, etaMs: delay },
    { status: 201 }
  );
}
