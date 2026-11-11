import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { creditLedger, generations } from "@/db/schema";
import { getCurrentUser, publicUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  const [countRow] = await db
    .select({
      total: sql<number>`count(*)::int`,
      videos: sql<number>`count(*) filter (where ${generations.mode} = 'video')::int`,
      images: sql<number>`count(*) filter (where ${generations.mode} = 'image')::int`,
    })
    .from(generations)
    .where(eq(generations.userId, user.id));

  const ledger = await db
    .select()
    .from(creditLedger)
    .where(eq(creditLedger.userId, user.id))
    .orderBy(desc(creditLedger.createdAt))
    .limit(12);

  return NextResponse.json({ user: publicUser(user), stats: countRow, ledger });
}
