"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Aperture, ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/studio";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push(next.startsWith("/") ? next : "/studio");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <Link href="/" className="mb-10 flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 shadow-[0_0_24px_rgba(139,92,246,0.5)]">
          <Aperture className="size-5 text-white" strokeWidth={2.4} />
        </span>
        <span className="font-display text-lg font-extrabold tracking-[0.22em] text-white">
          MIRAGE
        </span>
      </Link>

      <h1 className="font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
        {isSignup ? (
          <>
            Join the <span className="text-gradient">render farm</span>
          </>
        ) : (
          <>
            Welcome back, <span className="text-gradient">director</span>
          </>
        )}
      </h1>
      <p className="mt-3 text-zinc-400">
        {isSignup
          ? "25 free credits, no card required. Your first scene is seconds away."
          : "Sign in to keep rendering your worlds."}
      </p>

      <form onSubmit={submit} className="mt-9 space-y-4">
        {isSignup && (
          <Field
            icon={User}
            type="text"
            placeholder="Director name"
            value={name}
            onChange={setName}
            autoComplete="name"
          />
        )}
        <Field
          icon={Mail}
          type="email"
          placeholder="you@studio.com"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <Field
          icon={Lock}
          type="password"
          placeholder={isSignup ? "Password (6+ characters)" : "Password"}
          value={password}
          onChange={setPassword}
          autoComplete={isSignup ? "new-password" : "current-password"}
        />

        {error && (
          <p className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn-sheen group flex h-13 w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-base font-bold text-white shadow-[0_0_34px_rgba(168,85,247,0.4)] transition-shadow hover:shadow-[0_0_48px_rgba(224,69,245,0.55)] disabled:opacity-70"
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              {isSignup ? "Create account" : "Sign in"}
              <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-1.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-sm text-zinc-500">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="font-semibold text-fuchsia-300 hover:text-fuchsia-200"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to MIRAGE?{" "}
            <Link
              href={`/signup?next=${encodeURIComponent(next)}`}
              className="font-semibold text-fuchsia-300 hover:text-fuchsia-200"
            >
              Claim 25 free credits
            </Link>
          </>
        )}
      </p>
    </motion.div>
  );
}

function Field({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  icon: typeof Mail;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  return (
    <div className="panel flex items-center rounded-2xl transition-colors focus-within:border-fuchsia-400/50">
      <Icon className="ml-4.5 size-4.5 shrink-0 text-zinc-500" />
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="h-13 w-full bg-transparent px-4 text-sm text-white placeholder-zinc-600 outline-none"
      />
    </div>
  );
}
