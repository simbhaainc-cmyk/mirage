// ─── Zero-touch database bootstrap ──────────────────────────────────────────
// Runs once at server start (via instrumentation.ts). If the PostgreSQL
// database is empty, MIRAGE creates its tables and seeds the public gallery
// automatically — deploying anywhere only requires a DATABASE_URL.

const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  credits INTEGER NOT NULL DEFAULT 25,
  avatar_hue INTEGER NOT NULL DEFAULT 265,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_uq ON users (email);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS sessions_token_uq ON sessions (token);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);

CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'image',
  prompt TEXT NOT NULL,
  style TEXT NOT NULL DEFAULT 'none',
  motion TEXT,
  aspect TEXT NOT NULL DEFAULT '16:9',
  width INTEGER NOT NULL DEFAULT 1024,
  height INTEGER NOT NULL DEFAULT 576,
  seed INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing',
  result_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS gen_user_idx ON generations (user_id);
CREATE INDEX IF NOT EXISTS gen_public_idx ON generations (is_public);

CREATE TABLE IF NOT EXISTS credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ledger_user_idx ON credit_ledger (user_id);
`;

const STYLE_SUFFIX: Record<string, string> = {
  cinematic:
    ", cinematic film still, anamorphic lens, dramatic volumetric lighting, teal and orange grade, 35mm",
  "neon-noir":
    ", cyberpunk neon noir, rain-soaked streets, pink and cyan neon glow, moody fog, high contrast",
  ethereal:
    ", ethereal dreamlike atmosphere, soft pastel haze, floating particles, delicate light leaks, fine art",
  hyperreal:
    ", ultra photorealistic, 8k detail, natural skin texture, sharp focus, professional photography",
  analog:
    ", vintage 1970s analog film photo, kodachrome grain, faded warm tones, retro nostalgia, light leaks",
  "liquid-chrome":
    ", liquid chrome metal, iridescent oil-slick reflections, molten mercury, studio lighting on black",
  ukiyoe:
    ", modern ukiyo-e woodblock print style, bold outlines, flat color fields, japanese art reimagined",
};

const ASPECTS: Record<string, [number, number]> = {
  "16:9": [1344, 768],
  "9:16": [768, 1344],
  "1:1": [1024, 1024],
  "4:3": [1152, 864],
  "3:4": [864, 1152],
};

const PIECES = [
  { prompt: "A chrome astronaut meditating inside a cathedral of fog, volumetric god rays", style: "neon-noir", aspect: "9:16", seed: 711, mode: "video", motion: "dolly-in" },
  { prompt: "Rain-soaked cyberpunk alley, lone figure with transparent umbrella", style: "neon-noir", aspect: "16:9", seed: 42, mode: "image", motion: null },
  { prompt: "Colossal mirror monolith in an endless white desert at dusk, tiny walking silhouette", style: "ethereal", aspect: "16:9", seed: 808, mode: "video", motion: "orbit" },
  { prompt: "Macro flower sculpted from liquid mercury chrome, dripping petals", style: "liquid-chrome", aspect: "1:1", seed: 1999, mode: "image", motion: null },
  { prompt: "Bioluminescent jellyfish drifting through a submerged neon city", style: "cinematic", aspect: "16:9", seed: 314, mode: "video", motion: "pan-right" },
  { prompt: "Ballerina made of smoke and embers mid-pirouette on a dark stage", style: "cinematic", aspect: "9:16", seed: 2718, mode: "image", motion: null },
  { prompt: "Retro-futuristic roadside diner on Mars, dusty windows glowing warm", style: "analog", aspect: "4:3", seed: 555, mode: "image", motion: null },
  { prompt: "Ancient monolith carved with glowing cyan runes in a violet desert storm", style: "neon-noir", aspect: "3:4", seed: 1337, mode: "video", motion: "tilt-up" },
  { prompt: "A gentle giant koi fish swimming through clouds above a sleeping city", style: "ukiyoe", aspect: "16:9", seed: 98, mode: "image", motion: null },
  { prompt: "Siberian tiger walking through a blizzard, piercing amber eyes", style: "hyperreal", aspect: "16:9", seed: 777, mode: "image", motion: null },
  { prompt: "Glass greenhouse glowing on the lunar surface, earthrise behind", style: "ethereal", aspect: "16:9", seed: 2077, mode: "video", motion: "dolly-out" },
  { prompt: "Portrait of a weaver bird building a nest of golden fiber-optic threads", style: "hyperreal", aspect: "1:1", seed: 606, mode: "image", motion: null },
];

export async function ensureDatabase(): Promise<void> {
  const { pool } = await import("@/db");
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`SELECT to_regclass('public.users') AS t`);
    if (!rows[0].t) {
      await client.query(DDL);
    }
    const { rows: pub } = await client.query(
      `SELECT 1 FROM generations WHERE is_public = TRUE LIMIT 1`
    );
    if (pub.length === 0) {
      for (let i = 0; i < PIECES.length; i++) {
        const p = PIECES[i];
        const [w, h] = ASPECTS[p.aspect];
        const full = (p.prompt + (STYLE_SUFFIX[p.style] ?? "")).slice(0, 1200);
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(full)}?width=${w}&height=${h}&seed=${p.seed}&nologo=true&model=flux`;
        await client.query(
          `INSERT INTO generations (user_id, mode, prompt, style, motion, aspect, width, height, seed, status, result_url, is_public, credits_used, created_at, completed_at)
           VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8, 'completed', $9, TRUE, 0, NOW() - ($10 || ' hours')::interval, NOW() - ($10 || ' hours')::interval)`,
          [p.mode, p.prompt, p.style, p.motion, p.aspect, w, h, p.seed, url, String(200 - i)]
        );
      }
    }
    console.log("MIRAGE bootstrap: database ready ✔");
  } finally {
    client.release();
  }
}
