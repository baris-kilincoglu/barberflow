"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "barberflow-visitor-count";

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Not: bu sayaç sadece bu tarayıcıya özel (localStorage), tüm
    // ziyaretçiler arasında paylaşılan gerçek bir toplam değil.
    // Gerçek/paylaşılan bir sayaç istenirse Firestore'da tek bir
    // dokümanı transaction ile artıran bir yapıya taşınabilir.
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const current = stored ? Number.parseInt(stored, 10) : 0;
      const next = Number.isFinite(current) && current >= 0 ? current + 1 : 1;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      setCount(next);
    } catch {
      setCount(null);
    }
  }, []);

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/40 px-3 py-2 shadow-lg backdrop-blur-md"
      aria-label={count === null ? "Ziyaretçi sayısı yükleniyor" : `Toplam ${count} ziyaretçi`}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C9A962]/15 text-sm" aria-hidden="true">
        👥
      </span>
      <div className="flex flex-col leading-none">
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Ziyaretçi</span>
        <span className="mt-0.5 text-xs font-semibold text-white">{count === null ? "..." : count}</span>
      </div>
    </div>
  );
}
