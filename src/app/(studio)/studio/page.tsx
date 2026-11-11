import type { Metadata } from "next";
import { Suspense } from "react";
import StudioApp from "@/components/studio/StudioApp";

export const metadata: Metadata = { title: "Studio" };

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-svh place-items-center bg-[#050508] text-zinc-500">
          <p className="font-mono2 text-xs tracking-[0.35em]">BOOTING STUDIO…</p>
        </div>
      }
    >
      <StudioApp />
    </Suspense>
  );
}
