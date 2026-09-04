"use client";

import { useMemo, useState } from "react";

import { createAppointment } from "@/services/appointmentService";
import { ALL_SLOTS, BUSINESS, SERVICES, UNAVAILABLE_BY_WEEKDAY, WEEKLY_OCCUPANCY } from "@/lib/business";
import {
  dateToKey,
  dayShortLabel,
  formatDayMonth,
  formatWeekRange,
  toMondayIndex,
  weekDates,
} from "@/lib/dates";

type WeekDay = {
  date: Date;
  dayNum: number;
  short: string;
  occupancy: number;
  closed: boolean;
  isToday: boolean;
};

function buildWeek(weekOffset: number): WeekDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return weekDates(weekOffset, today).map((date) => {
    const weekdayIndex = toMondayIndex(date.getDay());
    return {
      date,
      dayNum: date.getDate(),
      short: dayShortLabel(date.getDay()),
      occupancy: WEEKLY_OCCUPANCY[weekdayIndex],
      closed: weekdayIndex === 6, // Pazar
      isToday: date.getTime() === today.getTime(),
    };
  });
}

function occupancyTone(occupancy: number, closed: boolean): string {
  if (closed) return "text-zinc-600";
  if (occupancy < 45) return "text-emerald-400";
  if (occupancy < 75) return "text-amber-400";
  return "text-red-400";
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] ${className}`}
    >
      {children}
    </div>
  );
}

function StepDot({ active, done }: { active: boolean; done: boolean }) {
  return (
    <span
      className={`h-1.5 rounded-full transition-all duration-300 ${
        done ? "w-6 bg-[#C9A962]" : active ? "w-6 bg-[#C9A962]/60" : "w-1.5 bg-white/10"
      }`}
    />
  );
}

function DayCard({ day, selected, onSelect }: { day: WeekDay; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      disabled={day.closed}
      onClick={onSelect}
      className={`group relative flex flex-col items-center rounded-xl border px-2 py-3 transition-all duration-200 sm:px-3 sm:py-3.5 ${
        day.closed
          ? "cursor-not-allowed border-white/[0.03] bg-white/[0.01] opacity-40"
          : selected
            ? "border-[#C9A962]/40 bg-[#C9A962]/10 shadow-[0_0_20px_-4px_rgba(201,169,98,0.25)]"
            : "border-white/[0.06] bg-white/[0.03] hover:border-[#C9A962]/20 hover:bg-white/[0.05] active:scale-[0.97]"
      }`}
    >
      {day.isToday && !day.closed && (
        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-[#C9A962] px-1.5 py-px text-[9px] font-semibold text-black">
          Bugün
        </span>
      )}
      <span className={`text-[11px] font-medium ${selected ? "text-[#C9A962]" : "text-zinc-500"}`}>
        {day.short}
      </span>
      <span className={`mt-1 text-lg font-semibold tabular-nums ${selected ? "text-white" : "text-zinc-200"}`}>
        {day.dayNum}
      </span>
      <span className={`mt-1 text-[10px] font-medium ${occupancyTone(day.occupancy, day.closed)}`}>
        {day.closed ? "Kapalı" : `%${day.occupancy}`}
      </span>
    </button>
  );
}

function TimeSlotButton({
  time,
  available,
  onSelect,
}: {
  time: string;
  available: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!available}
      onClick={onSelect}
      className={`rounded-lg border px-3 py-2 text-[13px] font-medium tabular-nums transition-all duration-200 ${
        !available
          ? "cursor-not-allowed border-transparent bg-transparent text-zinc-700 line-through"
          : "border-white/[0.08] bg-white/[0.04] text-zinc-200 hover:border-[#C9A962]/30 hover:bg-[#C9A962]/10 hover:text-[#C9A962] active:scale-[0.97]"
      }`}
    >
      {time}
    </button>
  );
}

function BookingForm({ day, time, onDone }: { day: WeekDay; time: string; onDone: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState<string>(SERVICES[0]);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const canSubmit = name.trim().length >= 2 && phone.trim().length >= 10 && !saving;

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setErrorMessage("");

    const result = await createAppointment({
      date: dateToKey(day.date),
      time,
      name,
      phone,
      service,
    });

    setSaving(false);

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    const message = encodeURIComponent(
      [
        `Merhaba ${BUSINESS.name},`,
        "",
        "Randevu talebim:",
        `👤 Ad Soyad: ${name.trim()}`,
        `📅 Tarih: ${formatDayMonth(day.date)}`,
        `🕐 Saat: ${time}`,
        `✂️ Hizmet: ${service}`,
        `📱 Telefon: ${phone.trim()}`,
        "",
        "Teşekkürler.",
      ].join("\n")
    );

    setWhatsappUrl(`${BUSINESS.whatsappHref}?text=${message}`);
    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <div className="animate-slide-in flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-2xl text-emerald-400">
          ✓
        </div>
        <h3 className="text-lg font-semibold text-white">Randevunuz Kaydedildi</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          Randevu talebiniz alındı. Berber tarafından onaylandığında bilgilendirileceksiniz.
          Dilerseniz WhatsApp üzerinden de talebinizi iletebilirsiniz.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_4px_24px_-4px_rgba(37,211,102,0.35)] transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        >
          <span className="text-lg">☘</span>
          WhatsApp&apos;tan Gönder
        </a>
        <button
          type="button"
          onClick={onDone}
          className="mt-5 text-sm font-medium text-[#C9A962] transition-colors hover:text-[#E8D5A3]"
        >
          Yeni randevu al
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleConfirm} className="animate-slide-in space-y-4">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-600">Randevu Detayı</p>
          <p className="mt-1 text-sm text-zinc-400">
            {formatDayMonth(day.date)} · <span className="font-medium text-[#C9A962]">{time}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onDone}
          className="text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-300"
        >
          ← Geri
        </button>
      </div>

      <div>
        <label htmlFor="booking-name" className="mb-1.5 block text-[13px] font-medium text-zinc-400">
          Ad Soyad
        </label>
        <input
          id="booking-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Adınız Soyadınız"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-[#C9A962]/40 focus:bg-white/[0.06]"
        />
      </div>

      <div>
        <label htmlFor="booking-phone" className="mb-1.5 block text-[13px] font-medium text-zinc-400">
          Telefon
        </label>
        <input
          id="booking-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="05XX XXX XX XX"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-[#C9A962]/40 focus:bg-white/[0.06]"
        />
      </div>

      <div>
        <label htmlFor="booking-service" className="mb-1.5 block text-[13px] font-medium text-zinc-400">
          Hizmet
        </label>
        <select
          id="booking-service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#C9A962]/40 focus:bg-white/[0.06]"
        >
          {SERVICES.map((s) => (
            <option key={s} value={s} className="bg-[#111]">
              {s}
            </option>
          ))}
        </select>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-2 w-full rounded-2xl bg-[#C9A962] py-3.5 text-sm font-semibold text-black shadow-[0_4px_24px_-4px_rgba(201,169,98,0.5)] transition-all duration-200 hover:bg-[#D4B872] disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
      >
        {saving ? "Randevu kaydediliyor..." : "Randevuyu Onayla"}
      </button>
    </form>
  );
}

export default function AppointmentBooking() {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDays = useMemo(() => buildWeek(weekOffset), [weekOffset]);

  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const selectedDay = selectedDayIndex !== null ? weekDays[selectedDayIndex] : null;

  // Not: dolu saatler istemci tarafında Firestore'dan okunmuyor — appointments
  // koleksiyonu sadece admin'e açık (bkz. firestore.rules). Burada sadece
  // önceden belirlenmiş kapalı saatler gösterilir; gerçek çakışma kontrolü
  // randevu kaydı sırasında appointmentService.createAppointment() içindeki
  // transaction ile yapılır ve çakışma varsa BookingForm'da hata gösterilir.
  const slots = useMemo(() => {
    if (!selectedDay) return [];
    const weekdayIndex = toMondayIndex(selectedDay.date.getDay());
    const unavailable = new Set(UNAVAILABLE_BY_WEEKDAY[weekdayIndex] ?? []);
    return ALL_SLOTS.map((time) => ({ time, available: !unavailable.has(time) }));
  }, [selectedDay]);

  const step = selectedTime && selectedDay ? 3 : selectedDay ? 2 : 1;

  function selectDay(index: number) {
    if (weekDays[index]?.closed) return;
    setSelectedDayIndex(index);
    setSelectedTime(null);
  }

  function changeWeek(direction: number) {
    setWeekOffset((current) => Math.max(0, current + direction));
    setSelectedDayIndex(null);
    setSelectedTime(null);
  }

  function resetToTimeSelection() {
    setSelectedTime(null);
    setFormKey((k) => k + 1);
  }

  function resetAll() {
    setSelectedDayIndex(null);
    setSelectedTime(null);
    setFormKey((k) => k + 1);
  }

  return (
    <>
      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-in { animation: none; }
        }
      `}</style>

      <Card className="flex h-full flex-col p-4 sm:p-5 lg:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-600">Randevu</p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-white">Randevu Al</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <StepDot active={step === 1} done={step > 1} />
            <StepDot active={step === 2} done={step > 2} />
            <StepDot active={step === 3} done={false} />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row-reverse lg:gap-5">
          <div className="lg:w-[42%] lg:shrink-0">
            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600">Gün Seçin</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => changeWeek(-1)}
                  disabled={weekOffset === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-500 transition hover:border-[#C9A962]/30 hover:text-[#C9A962] disabled:cursor-not-allowed disabled:opacity-20"
                  aria-label="Önceki hafta"
                >
                  ‹
                </button>
                <span className="min-w-[72px] text-center text-[10px] font-medium text-zinc-600">
                  {weekOffset === 0 ? "Bu hafta" : `${weekOffset}. hafta`}
                </span>
                <button
                  type="button"
                  onClick={() => changeWeek(1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-500 transition hover:border-[#C9A962]/30 hover:text-[#C9A962]"
                  aria-label="Sonraki hafta"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {weekDays.map((day, index) => (
                <DayCard
                  key={day.date.toISOString()}
                  day={day}
                  selected={selectedDayIndex === index}
                  onSelect={() => selectDay(index)}
                />
              ))}
            </div>

            {selectedDay && (
              <p className="animate-slide-in mt-3 text-[13px] text-zinc-500">
                Seçili:{" "}
                <span className="font-medium text-zinc-300">
                  {selectedDay.short}, {formatDayMonth(selectedDay.date)}
                </span>
                {!selectedDay.closed && (
                  <span className={`ml-1.5 ${occupancyTone(selectedDay.occupancy, false)}`}>
                    · %{selectedDay.occupancy} dolu
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col lg:border-r lg:border-white/[0.06] lg:pr-5">
            {!selectedDay && (
              <div className="animate-slide-in flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] px-4 py-10 text-center">
                <p className="text-sm font-medium text-zinc-400">Bir gün seçin</p>
                <p className="mt-1 text-[13px] text-zinc-600">
                  Müsait saatleri görmek için takvimden bir gün seçin.
                </p>
              </div>
            )}

            {selectedDay && !selectedTime && (
              <div className="animate-slide-in flex flex-1 flex-col">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600">
                  Saat Seçin
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map(({ time, available }) => (
                    <TimeSlotButton
                      key={time}
                      time={time}
                      available={available}
                      onSelect={() => setSelectedTime(time)}
                    />
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-zinc-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#C9A962] align-middle" /> Müsait
                  saatler · <span className="text-zinc-700 line-through">Kapalı</span>
                </p>
              </div>
            )}

            {selectedDay && selectedTime && (
              <BookingForm key={formKey} day={selectedDay} time={selectedTime} onDone={resetToTimeSelection} />
            )}
          </div>
        </div>

        {(selectedDayIndex !== null || selectedTime) && (
          <button
            type="button"
            onClick={resetAll}
            className="mt-4 text-center text-[12px] font-medium text-zinc-600 transition-colors hover:text-zinc-400"
          >
            Baştan başla
          </button>
        )}
      </Card>
    </>
  );
}
