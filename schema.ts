import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    plan: text("plan").notNull().default("free"),
    credits: integer("credits").notNull().default(25),
    avatarHue: integer("avatar_hue").notNull().default(265),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email)]
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    token: text("token").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("sessions_token_uq").on(t.token),
    index("sessions_user_idx").on(t.userId),
  ]
);

export const generations = pgTable(
  "generations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    mode: text("mode").notNull().default("image"), // image | video
    prompt: text("prompt").notNull(),
    style: text("style").notNull().default("none"),
    motion: text("motion"), // camera motion preset for video
    aspect: text("aspect").notNull().default("16:9"),
    width: integer("width").notNull().default(1024),
    height: integer("height").notNull().default(576),
    seed: integer("seed").notNull().default(0),
    status: text("status").notNull().default("processing"), // processing | completed | failed
    resultUrl: text("result_url"),
    isPublic: boolean("is_public").notNull().default(false),
    creditsUsed: integer("credits_used").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [
    index("gen_user_idx").on(t.userId),
    index("gen_public_idx").on(t.isPublic),
  ]
);

export const creditLedger = pgTable(
  "credit_ledger",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(),
    reason: text("reason").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("ledger_user_idx").on(t.userId)]
);

export type User = typeof users.$inferSelect;
export type Generation = typeof generations.$inferSelect;
export type LedgerEntry = typeof creditLedger.$inferSelect;
