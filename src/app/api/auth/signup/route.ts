import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { creditLedger, users } from "@/db/schema";
import { createSession, hashPassword, publicUser } from "@/lib/auth";
import { SIGNUP_CREDITS } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (name.length < 2) {
      return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const avatarHue = Math.floor(Math.random() * 360);
    const inserted = await db
      .insert(users)
      .values({ name, email, passwordHash: hashPassword(password), credits: SIGNUP_CREDITS, avatarHue })
      .returning();
    const user = inserted[0];

    await db.insert(creditLedger).values({
      userId: user.id,
      delta: SIGNUP_CREDITS,
      reason: "Welcome bonus",
      balanceAfter: SIGNUP_CREDITS,
    });

    await createSession(user.id);
    return NextResponse.json({ user: publicUser(user) }, { status: 201 });
  } catch (err) {
    console.error("signup error", err);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
