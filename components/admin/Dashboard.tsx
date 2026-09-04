"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut, type User } from "firebase/auth";

import { auth } from "@/lib/firebase";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import {
  subscribeToAppointments,
  updateAppointmentStatus,
} from "@/services/appointmentService";
import {
  dateToKey,
  formatLongDate,
  formatWeekRange,
  todayKey,
  toMondayIndex,
  weekDates,
} from "@/lib/dates";
import { BUSINESS } from "@/lib/business";

function getStatusLabel(status: AppointmentStatus): string {
  switch (status) {
    case "confirmed": return "Onaylandı";
    case "rejected": return "Reddedildi";
    case "cancelled": return "İptal";
    case "completed": return "Tamamlandı";
    case "pending":
    default:
      return "Onay Bekliyor";
  }
}

function getStatusClasses(status: AppointmentStatus): string {
  switch (status) {
    case "confirmed": return "bg-green-500/10 text-green-300 border-green-500/20";
    case "rejected": return "bg-red-500/10 text-red-300 border-red-500/20";
    case "cancelled": return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    case "completed": return "bg-blue-500/10 text-blue-300 border-blue-500/20";
    case "pending":
    default:
      return "bg-amber-500/10 text-amber-300 border-amber-500/20";
  }
}

function getStatusIcon(status: AppointmentStatus): string {
  if (status === "confirmed") return "🟢";
  if (status === "rejected") return "🔴";
  return "🟡";
}

function getWhatsAppHref(appointment: Appointment): string {
  if (!appointment.phone) return "#";

  const digits = appointment.phone.replace(/\D/g, "");
  const normalized = digits.startsWith("0")
    ? `90${digits.slice(1)}`
    : digits.startsWith("90")
      ? digits
      : `90${digits}`;

  const message = [
    `Merhaba ${appointment.name || "değerli müşterimiz"},`,
    "",
    `${BUSINESS.name} randevunuzun detayları:`,
    `Tarih: ${formatLongDate(appointment.date)}`,
    `Saat: ${appointment.time}`,
    `Hizmet: ${appointment.service || "Belirtilmemiş"}`,
    "",
    "Görüşmek üzere.",
  ].join("\n");

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export default function Dashboard({ user }: { user: User }) {
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");
  const [mobileFilter, setMobileFilter] = useState<"all" | "pending">("all");

  const [weekOffset, setWeekOffset] = useState(0);
  const dates = useMemo(() => weekDates(weekOffset).map(dateToKey), [weekOffset]);

  useEffect(() => {
    setLoading(true);
    setError("");

    return subscribeToAppointments(
      (all) => {
        const active = all
          .filter((a) => a.status !== "cancelled")
          .sort((a, b) => (a.date !== b.date ? a.date.localeCompare(b.date) : a.time.localeCompare(b.time)));
        setAppointments(active);
        setLoading(false);
      },
      () => {
        setError("Randevular yüklenemedi. Firestore bağlantısını kontrol edin.");
        setLoading(false);
      }
    );
  }, []);

  const weekAppointments = useMemo(
    () => appointments.filter((a) => dates.includes(a.date)),
    [appointments, dates]
  );

  const selectedDayAppointments = useMemo(
    () => appointments.filter((a) => a.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, selectedDate]
  );

  const pendingAppointments = useMemo(
    () => selectedDayAppointments.filter((a) => a.status === "pending"),
    [selectedDayAppointments]
  );

  const visibleAppointments = useMemo(
    () => (mobileFilter === "pending" ? pendingAppointments : selectedDayAppointments),
    [mobileFilter, pendingAppointments, selectedDayAppointments]
  );

  const topService = useMemo(() => {
    const counts = new Map<string, number>();
    selectedDayAppointments.forEach((a) => {
      const service = a.service || "Belirtilmemiş";
      counts.set(service, (counts.get(service) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  }, [selectedDayAppointments]);

  async function handleStatusChange(appointment: Appointment, status: AppointmentStatus) {
    const actionText = status === "confirmed" ? "onaylamak" : status === "rejected" ? "reddetmek" : "iptal etmek";
    if (!window.confirm(`${appointment.name || "Bu müşteri"} adlı randevuyu ${actionText} istediğinize emin misiniz?`)) {
      return;
    }

    setActionId(appointment.id);
    setError("");

    try {
      await updateAppointmentStatus(appointment.id, status);
    } catch {
      setError("Randevu durumu güncellenemedi.");
    } finally {
      setActionId("");
    }
  }

  const isToday = selectedDate === todayKey();

  return (
    <main className="min-h-dvh bg-[#050505] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A962]">{BUSINESS.name}</div>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Yönetim Paneli</h1>
            <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.07] hover:text-white"
          >
            Çıkış Yap
          </button>
        </header>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="col-span-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 sm:col-span-1 sm:p-5">
            <div className="text-xs text-zinc-500">Seçilen Gün</div>
            <div className="mt-2 text-sm font-semibold leading-5">{formatLongDate(selectedDate)}</div>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 sm:p-5">
            <div className="text-xs text-zinc-500">Günlük</div>
            <div className="mt-2 text-2xl font-semibold text-[#C9A962]">{selectedDayAppointments.length}</div>
          </div>
          <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-4 sm:p-5">
            <div className="text-xs text-amber-200/60">Onay Bekleyen</div>
            <div className="mt-2 text-2xl font-semibold text-amber-300">{pendingAppointments.length}</div>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 sm:p-5">
            <div className="text-xs text-zinc-500">Haftalık</div>
            <div className="mt-2 text-2xl font-semibold text-[#C9A962]">{weekAppointments.length}</div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Haftalık Takvim</h2>
              <p className="mt-1 text-sm text-zinc-500">Bir güne tıklayarak o günün randevularını görüntüleyin.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWeekOffset((w) => w - 1)}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-zinc-300 transition hover:border-[#C9A962]/30 hover:text-white"
              >
                ← Önceki Hafta
              </button>
              <div className="min-w-[190px] text-center text-sm font-medium text-[#C9A962]">
                {formatWeekRange(weekDates(weekOffset))}
              </div>
              <button
                type="button"
                onClick={() => setWeekOffset((w) => w + 1)}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-zinc-300 transition hover:border-[#C9A962]/30 hover:text-white"
              >
                Sonraki Hafta →
              </button>
              {!isToday && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayKey())}
                  className="rounded-xl bg-[#C9A962] px-3 py-2 text-sm font-semibold text-black transition hover:bg-[#D4B872]"
                >
                  Bugün
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
            {dates.map((day) => {
              const dayAppointments = weekAppointments.filter((a) => a.date === day);
              const dayDate = new Date(`${day}T12:00:00`);
              const dayName = new Intl.DateTimeFormat("tr-TR", { weekday: "short" }).format(dayDate);
              const sunday = toMondayIndex(dayDate.getDay()) === 6;
              const selected = day === selectedDate;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[145px] rounded-2xl border p-3 text-left transition ${
                    selected
                      ? "border-[#C9A962]/60 bg-[#C9A962]/10"
                      : "border-white/[0.07] bg-black/20 hover:border-white/[0.15] hover:bg-white/[0.035]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className={`text-xs font-semibold uppercase ${selected ? "text-[#C9A962]" : "text-zinc-500"}`}>
                        {dayName}
                      </div>
                      <div className="mt-1 text-lg font-semibold">{dayDate.getDate()}</div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        dayAppointments.length ? "bg-[#C9A962]/15 text-[#C9A962]" : "bg-white/[0.04] text-zinc-600"
                      }`}
                    >
                      {dayAppointments.length}
                    </span>
                  </div>

                  {sunday ? (
                    <div className="mt-8 text-xs text-zinc-600">Pazar kapalı</div>
                  ) : dayAppointments.length === 0 ? (
                    <div className="mt-8 text-xs text-zinc-600">Boş</div>
                  ) : (
                    <div className="mt-4 space-y-1.5">
                      {dayAppointments.slice(0, 4).map((a) => (
                        <div key={a.id} className="truncate rounded-lg bg-white/[0.04] px-2 py-1.5 text-xs">
                          <span className="font-semibold text-[#C9A962]">{a.time}</span>{" "}
                          <span className="text-zinc-400">{a.name || "Müşteri"}</span>
                        </div>
                      ))}
                      {dayAppointments.length > 4 && (
                        <div className="px-2 text-[11px] text-zinc-600">+{dayAppointments.length - 4} randevu daha</div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Randevular</h2>
                <p className="mt-1 text-sm text-zinc-500">{formatLongDate(selectedDate)} günü gerçek zamanlı güncellenir.</p>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/40 px-3 text-sm text-white outline-none focus:border-[#C9A962]/50 sm:w-auto"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
              <button
                type="button"
                onClick={() => setMobileFilter("all")}
                className={`h-11 rounded-xl px-4 text-sm font-semibold transition ${
                  mobileFilter === "all" ? "bg-[#C9A962] text-black" : "border border-white/[0.08] bg-white/[0.03] text-zinc-400"
                }`}
              >
                Tümü ({selectedDayAppointments.length})
              </button>
              <button
                type="button"
                onClick={() => setMobileFilter("pending")}
                className={`h-11 rounded-xl px-4 text-sm font-semibold transition ${
                  mobileFilter === "pending"
                    ? "bg-amber-400 text-black"
                    : "border border-amber-500/20 bg-amber-500/[0.05] text-amber-300"
                }`}
              >
                Bekleyen ({pendingAppointments.length})
              </button>
            </div>
          </div>

          {selectedDayAppointments.length > 0 && (
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3 text-sm text-zinc-400">
              En çok seçilen hizmet: <span className="font-semibold text-[#C9A962]">{topService}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-sm text-zinc-500">Randevular yükleniyor...</div>
          ) : visibleAppointments.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-3xl">📅</div>
              <p className="mt-3 text-sm text-zinc-500">
                {mobileFilter === "pending" ? "Bu gün için bekleyen randevu bulunmuyor." : "Bu gün için randevu bulunmuyor."}
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {visibleAppointments.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="min-w-[70px] rounded-xl bg-[#C9A962]/10 px-3 py-2 text-center">
                      <div className="text-lg font-bold text-[#C9A962]">{a.time}</div>
                    </div>
                    <div>
                      <div className="font-semibold">{a.name || "İsimsiz müşteri"}</div>
                      <div className="mt-1 text-sm text-zinc-500">{a.service || "Hizmet belirtilmemiş"}</div>
                      <div className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(a.status)}`}>
                        {getStatusIcon(a.status)} {getStatusLabel(a.status)}
                      </div>
                      {a.phone && (
                        <a href={`tel:${a.phone}`} className="mt-1 block text-sm text-zinc-400 hover:text-white">
                          {a.phone}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
                    {a.status === "pending" && (
                      <>
                        <button
                          disabled={actionId === a.id}
                          onClick={() => handleStatusChange(a, "confirmed")}
                          className="col-span-2 h-11 rounded-xl bg-green-500 px-4 text-sm font-bold text-black transition hover:bg-green-400 disabled:opacity-50 sm:col-span-1"
                        >
                          {actionId === a.id ? "İşleniyor..." : "✓ Onayla"}
                        </button>
                        <button
                          disabled={actionId === a.id}
                          onClick={() => handleStatusChange(a, "rejected")}
                          className="h-11 rounded-xl border border-red-500/20 bg-red-500/5 px-4 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          ✕ Reddet
                        </button>
                      </>
                    )}

                    {a.phone && (
                      <>
                        <a
                          href={getWhatsAppHref(a)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-11 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-2.5 text-center text-sm font-medium text-green-300 transition hover:bg-green-500/10"
                        >
                          💬 WhatsApp
                        </a>
                        <a
                          href={`tel:${a.phone}`}
                          className="h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-center text-sm font-medium text-zinc-300 transition hover:bg-white/[0.07] hover:text-white"
                        >
                          ☎ Ara
                        </a>
                      </>
                    )}

                    {a.status === "confirmed" && (
                      <button
                        disabled={actionId === a.id}
                        onClick={() => handleStatusChange(a, "cancelled")}
                        className="col-span-2 h-11 rounded-xl border border-red-500/20 bg-red-500/5 px-4 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-50 sm:col-span-1"
                      >
                        {actionId === a.id ? "İptal ediliyor..." : "🔴 İptal Et"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
