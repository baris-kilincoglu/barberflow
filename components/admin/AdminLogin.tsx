"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "@/lib/firebase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setError("E-posta veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#050505] px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="text-4xl">💈</div>
          <h1 className="mt-4 text-2xl font-semibold">Brothers Yönetim</h1>
          <p className="mt-2 text-sm text-zinc-500">Randevu yönetim paneli</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta"
            className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#C9A962]/50"
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifre"
            className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#C9A962]/50"
          />

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="h-12 w-full rounded-xl bg-[#C9A962] text-sm font-semibold text-black transition hover:bg-[#D4B872] disabled:opacity-50"
          >
            {loading ? "Giriş yapılıyor..." : "Admin Girişi"}
          </button>
        </form>
      </div>
    </main>
  );
}
