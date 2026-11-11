import { NextResponse } from "next/server";
import { getCurrentUser, publicUser } from "@/lib/auth";
import { setPlan } from "@/lib/credits";
import { getPlan, type PlanId } from "@/lib/plans";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Billing endpoint.
 *
 * DEMO MODE (default): instantly activates the plan and grants its monthly
 * credit allotment so the product works end-to-end out of the box.
 *
 * GOING LIVE WITH REAL PAYMENTS (Stripe, Paddle, LemonSqueezy…):
 *  1. npm install stripe && set STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET
 *  2. Replace the activation below with a Stripe Checkout Session redirect
 *  3. Call setPlan(userId, planId, credits) from your webhook handler after
 *     `checkout.session.completed`. The credit ledger already keeps a full
 *     audit trail for refunds/chargebacks.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const planId = String(body?.plan ?? "");
  const valid: PlanId[] = ["free", "creator", "pro", "studio"];
  if (!valid.includes(planId as PlanId)) {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }
  const plan = getPlan(planId);
  if (plan.id === "free") {
    await setPlan(user.id, "free", 0);
    const [fresh] = await db.select().from(users).where(eq(users.id, user.id));
    return NextResponse.json({ ok: true, mode: "demo", user: publicUser(fresh) });
  }

  await setPlan(user.id, plan.id, plan.creditsPerMonth);
  const [fresh] = await db.select().from(users).where(eq(users.id, user.id));
  return NextResponse.json({ ok: true, mode: "demo", user: publicUser(fresh) });
}
