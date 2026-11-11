import { NextResponse } from "next/server";

/**
 * Same-origin media proxy. The AI render farm lives on a remote origin — piping
 * assets through here keeps URLs private, adds long-lived cache headers and
 * (crucially) lets the studio's canvas video-exporter read pixels without CORS.
 */
const ALLOWED_HOSTS = new Set([
  "image.pollinations.ai",
  "pollinations.ai",
]);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("u");
  if (!raw) return NextResponse.json({ error: "Missing u" }, { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Bad URL" }, { status: 400 });
  }
  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  try {
    const upstream = await fetch(target.toString(), {
      signal: controller.signal,
      headers: { "User-Agent": "MIRAGE-Studio/1.0" },
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: "Upstream failed" }, { status: 502 });
    }
    const buf = await upstream.arrayBuffer();
    return new NextResponse(buf, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json({ error: "Render timed out" }, { status: 504 });
  } finally {
    clearTimeout(timeout);
  }
}
