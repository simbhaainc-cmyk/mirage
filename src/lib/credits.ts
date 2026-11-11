// ─── Credit economy helpers ─────────────────────────────────────────────────
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { creditLedger, users } from "@/db/schema";
import type { PlanId } from "./plans";

/** Atomically adjust a user's credit balance and record a ledger entry. */
export async function adjustCredits(
  userId: string,
  delta: number,
  reason: string
): Promise<number> {
  const updated = await db
    .update(users)
    .set({ credits: sql`${users.credits} + ${delta}` })
    .where(eq(users.id, userId))
    .returning({ credits: users.credits });
  const balance = updated[0]?.credits ?? 0;
  await db.insert(creditLedger).values({
    userId,
    delta,
    reason,
    balanceAfter: balance,
  });
  return balance;
}

export async function setPlan(userId: string, plan: PlanId, grantCredits: number) {
  await db.update(users).set({ plan }).where(eq(users.id, userId));
  if (grantCredits > 0) {
    await adjustCredits(userId, grantCredits, `Plan activation: ${plan}`);
  }
}
