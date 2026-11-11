import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";
import AuthVisual from "@/components/auth/AuthVisual";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 pb-16 pt-14 sm:px-12">
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      </div>
      <AuthVisual />
    </div>
  );
}
