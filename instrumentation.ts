// Next.js instrumentation hook — runs once when the server boots.
// Self-installs the database schema + gallery seeds on any fresh PostgreSQL,
// so publishing MIRAGE requires nothing more than a DATABASE_URL.

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!process.env.DATABASE_URL) return;
  try {
    const { ensureDatabase } = await import("@/lib/bootstrap");
    await ensureDatabase();
  } catch (err) {
    console.error("MIRAGE bootstrap failed (app will still serve):", err);
  }
}
