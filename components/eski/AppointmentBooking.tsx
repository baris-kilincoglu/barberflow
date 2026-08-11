"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createAppointment,
  getBookedTimes,
} from "@/services/appointmentService";

const SERVICES = ["Saç Kesimi", "Sakal", "Çocuk", "Saç + Sakal"] as const;

const OCCUPANCY = [35, 58, 72, 48, 88, 92, 0] as const;
const CLOSED_DAYS = new Set([6]);

const ALL_SLOTS = [
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "17:00",
  "17:30",
  "18:00",
  "19:00",
  "19:30",
  "20:00",
] as const;

const UNAVAILABLE_BY_DAY: Record<number, readonly string[]> = {
  0: ["11:00", "15:00", "17:00"],
  1: ["10:30", "14:00", "16:00", "19:00"],
  2: ["10:00", "11:30", "14:30", "18:00", "19:30"],
  3: ["12:00", "15:30", "17:30"],
  4: [
    "10:00",
    "10:30",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ],
  5: [
    "10:00",
    "11:00",
    "11:30",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "19:00",
  ],
  6: ALL_SLOTS as unknown as readonly string[],
};

const DAY_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"] as const;

const MONTHS_TR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
] as const;

const WHATSAPP_HREF = "https://wa.me/905555884256";

type WeekDay = {
  index: number;
  date: Date;
  dayNum: number;
  short: string;
  occupancy: number;
  closed: boolean;
  isToday: boolean;
};

function getWeekDays(weekOffset = 0): WeekDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(today);
  monday.setDate(
    today.getDate() + mondayOffset + weekOffset * 7
  );

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    const weekdayIndex =
      date.getDay() === 0 ? 6 : date.getDay() - 1;

    return {
      index: i,
      date,
      dayNum: date.getDate(),
      short: DAY_SHORT[weekdayIndex],
      occupancy: OCCUPANCY[weekdayIndex],
      closed: CLOSED_DAYS.has(weekdayIndex),
      isToday: date.getTime() === today.getTime(),
    };
  });
}

function formatDate(date: Date) {
  return `${date.getDate()} ${MONTHS_TR[date.getMonth()]}`;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function occupancyTone(occupancy: number, closed: boolean) {
  if (closed) return "text-zinc-600";
  if (occupancy < 45) return "text-emerald-400";
  if (occupancy < 75) return "text-amber-400";
  return "text-red-400";
}

function Card({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] ${className}`}
    >
      {children}
    </div>
  );
}

function StepDot({
  active,
  done,
}: {
  active: boolean;
  done: boolean;
}) {
  return (
    <span
      className={`h-1.5 rounded-full transition-all duration-300 ${
        done
          ? "w-6 bg-[#C9A962]"
          : active
            ? "w-6 bg-[#C9A962]/60"
            : "w-1.5 bg-white/10"
      }`}
    />
  );
}

function DayCard({
  day,
  selected,
  onSelect,
}: {
  day: WeekDay;
  selected: boolean;
  onSelect: () => void;
}) {
  const disabled = day.closed;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`group relative flex flex-col items-center rounded-xl border px-2 py-3 transition-all duration-200 sm:px-3 sm:py-3.5 ${
        disabled
          ? "cursor-not-allowed border-white/[0.03] bg-white/[0.01] opacity-40"
          : selected
            ? "border-[#C9A962]/40 bg-[#C9A962]/10 shadow-[0_0_20px_-4px_rgba(201,169,98,0.25)]"
            : "border-white/[0.06] bg-white/[0.03] hover:border-[#C9A962]/20 hover:bg-white/[0.05] active:scale-[0.97]"
      }`}
    >
      {day.isToday && !disabled && (
        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-[#C9A962] px-1.5 py-px text-[9px] font-semibold text-black">
          Bugün
        </span>
      )}

      <span
        className={`text-[11px] font-medium ${
          selected ? "text-[#C9A962]" : "text-zinc-500"
        }`}
      >
        {day.short}
      </span>

      <span
        className={`mt-1 text-lg font-semibold tabular-nums ${
          selected ? "text-white" : "text-zinc-200"
        }`}
      >
        {day.dayNum}
      </span>

      <span
        className={`mt-1 text-[10px] font-medium ${occupancyTone(
          day.occupancy,
          day.closed
        )}`}
      >
        {day.closed ? "Kapalı" : `%${day.occupancy}`}
      </span>
    </button>
  );
}

function TimeSlotButton({
  time,
  available,
  selected,
  onSelect,
}: {
  time: string;
  available: boolean;
  selected: boolean;
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
          : selected
            ? "border-[#C9A962]/50 bg-[#C9A962] text-black shadow-[0_0_16px_-2px_rgba(201,169,98,0.4)]"
            : "border-white/[0.08] bg-white/[0.04] text-zinc-200 hover:border-[#C9A962]/30 hover:bg-[#C9A962]/10 hover:text-[#C9A962] active:scale-[0.97]"
      }`}
    >
      {time}
    </button>
  );
}

function BookingForm({
  day,
  time,
  onBack,
}: {
  day: WeekDay;
  time: string;
  onBack: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState<string>(SERVICES[0]);

  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const canSubmit =
    name.trim().length >= 2 &&
    phone.trim().length >= 10 &&
    !saving;

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();

    if (!canSubmit) return;

    setSaving(true);
    setErrorMessage("");

    const result = await createAppointment({
      date: formatDateKey(day.date),
      time,
      name,
      phone,
      service,
    });

    if (!result.success) {
      setErrorMessage(result.message);
      setSaving(false);
      return;
    }

    const message = encodeURIComponent(
      `Merhaba Brothers Erkek Kuaförü,
    
    Randevu talebim:
    
    👤 Ad Soyad: ${name.trim()}
    📅 Tarih: ${formatDate(day.date)}
    🕐 Saat: ${time}
    ✂️ Hizmet: ${service}
    📱 Telefon: ${phone.trim()}
    
    Teşekkürler.`
    );
    
    setWhatsappUrl(`${WHATSAPP_HREF}?text=${message}`);
    
    setSaving(false);
    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <div className="animate-slide-in flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-2xl text-emerald-400">
          ✓
        </div>
  
        <h3 className="text-lg font-semibold text-white">
          Randevunuz Kaydedildi
        </h3>
  
        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          Randevu bilgileriniz başarıyla kaydedildi.
          WhatsApp üzerinden berbere göndererek
          randevu talebinizi iletebilirsiniz.
        </p>
  
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_4px_24px_-4px_rgba(37,211,102,0.35)] transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        >
          <span className="text-lg">☘</span>
          WhatsApp'tan Gönder
        </a>
  
        <button
          type="button"
          onClick={onBack}
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
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-600">
            Randevu Detayı
          </p>

          <p className="mt-1 text-sm text-zinc-400">
            {formatDate(day.date)} ·{" "}
            <span className="font-medium text-[#C9A962]">
              {time}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-300"
        >
          ← Geri
        </button>
      </div>

      <div>
        <label
          htmlFor="booking-name"
          className="mb-1.5 block text-[13px] font-medium text-zinc-400"
        >
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
        <label
          htmlFor="booking-phone"
          className="mb-1.5 block text-[13px] font-medium text-zinc-400"
        >
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
        <label
          htmlFor="booking-service"
          className="mb-1.5 block text-[13px] font-medium text-zinc-400"
        >
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

  const weekDays = useMemo(
    () => getWeekDays(weekOffset),
    [weekOffset]
  );

  const [selectedDayIndex, setSelectedDayIndex] =
    useState<number | null>(null);

  const [selectedTime, setSelectedTime] =
    useState<string | null>(null);

  const [formKey, setFormKey] = useState(0);

  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingBookedTimes, setLoadingBookedTimes] = useState(false);

  const selectedDay =
    selectedDayIndex !== null
      ? weekDays[selectedDayIndex]
      : null;

  useEffect(() => {
    let cancelled = false;

    async function loadBookedTimes() {
      if (!selectedDay || selectedDay.closed) {
        setBookedTimes([]);
        return;
      }

      setLoadingBookedTimes(true);

      const dateKey = formatDateKey(selectedDay.date);
      const times = await getBookedTimes(dateKey);

      if (!cancelled) {
        setBookedTimes(times);
        setLoadingBookedTimes(false);
      }
    }

    loadBookedTimes();

    return () => {
      cancelled = true;
    };
  }, [selectedDay]);

  const slots = useMemo(() => {
    if (selectedDayIndex === null || !selectedDay) {
      return [];
    }

    const weekdayIndex =
      selectedDay.date.getDay() === 0
        ? 6
        : selectedDay.date.getDay() - 1;

    const unavailable = new Set(
      UNAVAILABLE_BY_DAY[weekdayIndex] ?? []
    );

    return ALL_SLOTS.map((time) => ({
      time,
      available:
        !unavailable.has(time) &&
        !bookedTimes.includes(time),
    }));
  }, [selectedDayIndex, selectedDay, bookedTimes]);

  const step =
    selectedTime && selectedDay
      ? 3
      : selectedDay
        ? 2
        : 1;

  function selectDay(index: number) {
    if (weekDays[index]?.closed) return;

    setSelectedDayIndex(index);
    setSelectedTime(null);
    setBookedTimes([]);
  }

  function changeWeek(direction: number) {
    setWeekOffset((current) => {
      const next = current + direction;
      return Math.max(0, next);
    });

    setSelectedDayIndex(null);
    setSelectedTime(null);
    setBookedTimes([]);
  }

  function selectTime(time: string) {
    setSelectedTime(time);
  }

  function resetForm() {
    setSelectedTime(null);
    setFormKey((k) => k + 1);
  }

  function resetAll() {
    setSelectedDayIndex(null);
    setSelectedTime(null);
    setBookedTimes([]);
    setFormKey((k) => k + 1);
  }

  return (
    <>
      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-slide-in {
            animation: none;
          }
        }
      `}</style>

      <Card
        id="booking"
        className="flex h-full flex-col p-4 sm:p-5 lg:p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-600">
              Randevu
            </p>

            <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-white">
              Randevu Al
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <StepDot active={step === 1} done={step > 1} />
            <StepDot active={step === 2} done={step > 2} />
            <StepDot active={step === 3} done={false} />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row-reverse lg:gap-5">

          {/* Calendar */}
          <div className="lg:w-[42%] lg:shrink-0">
            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600">
                Gün Seçin
              </p>

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
                  {weekOffset === 0
                    ? "Bu hafta"
                    : `${weekOffset}. hafta`}
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
              {weekDays.map((day) => (
                <DayCard
                  key={day.index}
                  day={day}
                  selected={selectedDayIndex === day.index}
                  onSelect={() => selectDay(day.index)}
                />
              ))}
            </div>

            {selectedDay && (
              <p className="animate-slide-in mt-3 text-[13px] text-zinc-500">
                Seçili:{" "}
                <span className="font-medium text-zinc-300">
                  {selectedDay.short},{" "}
                  {formatDate(selectedDay.date)}
                </span>

                {!selectedDay.closed && (
                  <span
                    className={`ml-1.5 ${occupancyTone(
                      selectedDay.occupancy,
                      false
                    )}`}
                  >
                    · %{selectedDay.occupancy} dolu
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Times / Form */}
          <div className="flex min-h-0 flex-1 flex-col lg:border-r lg:border-white/[0.06] lg:pr-5">

            {!selectedDay && (
              <div className="animate-slide-in flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] px-4 py-10 text-center">
                <p className="text-sm font-medium text-zinc-400">
                  Bir gün seçin
                </p>

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

                {loadingBookedTimes ? (
                  <div className="flex flex-1 items-center justify-center py-10 text-sm text-zinc-600">
                    Müsait saatler kontrol ediliyor...
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {slots.map(({ time, available }) => (
                        <TimeSlotButton
                          key={time}
                          time={time}
                          available={available}
                          selected={false}
                          onSelect={() => selectTime(time)}
                        />
                      ))}
                    </div>

                    <p className="mt-3 text-[11px] text-zinc-600">
                      <span className="inline-block h-2 w-2 rounded-full bg-[#C9A962] align-middle" />{" "}
                      Müsait saatler ·{" "}
                      <span className="text-zinc-700 line-through">
                        Dolu
                      </span>
                    </p>
                  </>
                )}
              </div>
            )}

            {selectedDay && selectedTime && (
              <BookingForm
                key={formKey}
                day={selectedDay}
                time={selectedTime}
                onBack={() => {
                  resetForm();
                }}
              />
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