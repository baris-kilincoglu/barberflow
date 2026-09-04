// Tarih yardımcıları. Hem randevu widget'ı hem admin panel bu dosyayı kullanır,
// böylece iki yerde aynı mantık ayrı ayrı bakım gerektirmez.

const DAY_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"] as const;

const MONTHS_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
] as const;

/** JS Date.getDay() (0=Pazar..6=Cumartesi) -> Pazartesi=0..Pazar=6 */
export function toMondayIndex(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function dayShortLabel(jsDay: number): string {
  return DAY_SHORT[toMondayIndex(jsDay)];
}

export function dateToKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return dateToKey(new Date());
}

/** "YYYY-MM-DD" -> Date (öğlen saatine sabitlenir, saat dilimi kaymalarını önler) */
export function keyToDate(key: string): Date {
  return new Date(`${key}T12:00:00`);
}

export function formatLongDate(key: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(keyToDate(key));
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatDayMonth(date: Date): string {
  return `${date.getDate()} ${MONTHS_TR[date.getMonth()]}`;
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const diff = toMondayIndex(d.getDay());
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** weekOffset=0 bu hafta, 1 sonraki hafta, -1 önceki hafta ... */
export function weekDates(weekOffset: number, from: Date = new Date()): Date[] {
  const monday = startOfWeek(from);
  monday.setDate(monday.getDate() + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function formatWeekRange(dates: Date[]): string {
  if (dates.length === 0) return "";
  const first = dates[0];
  const last = dates[dates.length - 1];

  const firstText = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
  }).format(first);

  const lastText = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(last);

  return `${firstText} – ${lastText}`;
}
