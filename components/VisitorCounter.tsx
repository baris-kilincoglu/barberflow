"use client";

import { useEffect, useState } from "react";

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    /*
     * Şimdilik lokal sayaç.
     *
     * Firebase bağlantısını bir sonraki adımda ekleyeceğiz.
     * Böylece gerçek ziyaretçi sayısı tüm cihazlarda ortak olacak.
     */
    const storageKey = "barberflow-visitor-count";

    try {
      const stored = window.localStorage.getItem(storageKey);

      if (stored) {
        const current = Number.parseInt(stored, 10);

        if (Number.isFinite(current) && current >= 0) {
          const next = current + 1;
          window.localStorage.setItem(storageKey, String(next));
          setCount(next);
          return;
        }
      }

      window.localStorage.setItem(storageKey, "1");
      setCount(1);
    } catch {
      setCount(null);
    }
  }, []);

  return (
    <div
      className="glass-card flex items-center gap-2 rounded-full px-3 py-2 shadow-lg"
      aria-label={
        count === null
          ? "Ziyaretçi sayısı yükleniyor"
          : `Toplam ${count} ziyaretçi`
      }
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C9A962]/15 text-sm"
        aria-hidden="true"
      >
        👥
      </span>

      <div className="flex flex-col leading-none">
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Ziyaretçi
        </span>

        <span className="mt-0.5 text-xs font-semibold text-white">
          {count === null ? "..." : count}
        </span>
      </div>
    </div>
  );
}
