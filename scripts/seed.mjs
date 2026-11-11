// Seed the public gallery with curated MIRAGE showcase pieces.
// Usage: node scripts/seed.mjs   (idempotent — skips if rows exist)
import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const STYLE_SUFFIX = {
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
  none: "",
};

const ASPECTS = {
  "16:9": [1344, 768],
  "9:16": [768, 1344],
  "1:1": [1024, 1024],
  "4:3": [1152, 864],
  "3:4": [864, 1152],
};

const PIECES = [
  { prompt: "A chrome astronaut meditating inside a cathedral of fog, volumetric god rays", style: "neon-noir", aspect: "9:16", seed: 711, mode: "video", motion: "dolly-in" },
  { prompt: "Rain-soaked cyberpunk alley, lone figure with transparent umbrella", style: "neon-noir", aspect: "16:9", seed: 42, mode: "image" },
  { prompt: "Colossal mirror monolith in an endless white desert at dusk, tiny walking silhouette", style: "ethereal", aspect: "16:9", seed: 808, mode: "video", motion: "orbit" },
  { prompt: "Macro flower sculpted from liquid mercury chrome, dripping petals", style: "liquid-chrome", aspect: "1:1", seed: 1999, mode: "image" },
  { prompt: "Bioluminescent jellyfish drifting through a submerged neon city", style: "cinematic", aspect: "16:9", seed: 314, mode: "video", motion: "pan-right" },
  { prompt: "Ballerina made of smoke and embers mid-pirouette on a dark stage", style: "cinematic", aspect: "9:16", seed: 2718, mode: "image" },
  { prompt: "Retro-futuristic roadside diner on Mars, dusty windows glowing warm", style: "analog", aspect: "4:3", seed: 555, mode: "image" },
  { prompt: "Ancient monolith carved with glowing cyan runes in a violet desert storm", style: "neon-noir", aspect: "3:4", seed: 1337, mode: "video", motion: "tilt-up" },
  { prompt: "A gentle giant koi fish swimming through clouds above a sleeping city", style: "ukiyoe", aspect: "16:9", seed: 98, mode: "image" },
  { prompt: "Siberian tiger walking through a blizzard, piercing amber eyes", style: "hyperreal", aspect: "16:9", seed: 777, mode: "image" },
  { prompt: "Glass greenhouse glowing on the lunar surface, earthrise behind", style: "ethereal", aspect: "16:9", seed: 2077, mode: "video", motion: "dolly-out" },
  { prompt: "Portrait of a weaver bird building a nest of golden fiber-optic threads", style: "hyperreal", aspect: "1:1", seed: 606, mode: "image" },
];

function renderUrl({ prompt, style, aspect, seed }) {
  const [w, h] = ASPECTS[aspect];
  const full = (prompt + (STYLE_SUFFIX[style] ?? "")).slice(0, 1200);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(full)}?width=${w}&height=${h}&seed=${seed}&nologo=true&model=flux`;
}

const client = await pool.connect();
try {
  const { rows } = await client.query(
    "SELECT COUNT(*)::int AS n FROM generations WHERE is_public = true"
  );
  if (rows[0].n > 0) {
    console.log(`Gallery already seeded (${rows[0].n} public pieces) — skipping.`);
    process.exit(0);
  }
  for (let i = 0; i < PIECES.length; i++) {
    const p = PIECES[i];
    const [w, h] = ASPECTS[p.aspect];
    await client.query(
      `INSERT INTO generations (user_id, mode, prompt, style, motion, aspect, width, height, seed, status, result_url, is_public, credits_used, created_at, completed_at)
       VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8, 'completed', $9, true, 0, NOW() - ($10 || ' hours')::interval, NOW() - ($10 || ' hours')::interval)`,
      [p.mode, p.prompt, p.style, p.motion ?? null, p.aspect, w, h, p.seed, renderUrl(p), String(200 - i)]
    );
  }
  console.log(`Seeded ${PIECES.length} showcase pieces.`);
} finally {
  client.release();
  await pool.end();
}
