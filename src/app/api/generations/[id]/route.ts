import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { generations } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  const { id } = await ctx.params;
  const rows = await db.select().from(generations).where(eq(generations.id, id)).limit(1);
  const job = rows[0];
  if (!job) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (!job.isPublic && job.userId !== user?.id) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  return NextResponse.json({ job });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { id } = await ctx.params;
  const rows = await db.select().from(generations).where(eq(generations.id, id)).limit(1);
  const job = rows[0];
  if (!job || job.userId !== user.id) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  await db.delete(generations).where(eq(generations.id, id));
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const rows = await db.select().from(generations).where(eq(generations.id, id)).limit(1);
  const job = rows[0];
  if (!job || job.userId !== user.id) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  const [updated] = await db
    .update(generations)
    .set({ isPublic: Boolean(body?.isPublic) })
    .where(eq(generations.id, id))
    .returning();
  return NextResponse.json({ job: updated });
}
