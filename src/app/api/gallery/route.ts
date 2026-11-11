import { NextResponse } from "next/server";
import { desc, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { generations } from "@/db/schema";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(generations)
      .where(and(eq(generations.isPublic, true), eq(generations.status, "completed")))
      .orderBy(desc(generations.createdAt))
      .limit(36);
    return NextResponse.json({ items: rows });
  } catch (err) {
    console.error("gallery error", err);
    return NextResponse.json({ items: [] });
  }
}
