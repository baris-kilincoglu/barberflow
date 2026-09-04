export const BUSINESS = {
  name: "Brothers Erkek Kuaförü",
  tagline: "Premium Men's Barber",
  address: "Güzelyalı Mah. 56/2 Sok. No:1B Konak / İzmir",
  phone: "+90 555 588 42 56",
  phoneHref: "tel:+905555884256",
  whatsappHref: "https://wa.me/905555884256",
  instagram: "@brothers_erkek_kuaforu",
  instagramHref: "https://www.instagram.com/brothers_erkek_kuaforu/",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=G%C3%BCzelyal%C4%B1+Mah.+56%2F2+Sok.+No%3A1B+Konak+%C4%B0zmir",
  hours: {
    days: "Pazartesi - Cumartesi",
    time: "10:00 - 21:00",
    closed: "Pazar kapalı",
  },
} as const;

export const SERVICES = ["Saç Kesimi", "Sakal", "Çocuk", "Saç + Sakal"] as const;

// Haftanın her günü için gösterge amaçlı doluluk yüzdesi (0 = Pazartesi).
export const WEEKLY_OCCUPANCY = [35, 58, 72, 48, 88, 92, 0] as const;

// Kapalı günler (0 = Pazartesi ... 6 = Pazar).
export const CLOSED_WEEKDAYS = new Set([6]);

export const ALL_SLOTS = [
  "10:00", "10:30", "11:00", "11:30", "12:00",
  "14:00", "14:30", "15:00", "15:30", "16:00",
  "17:00", "17:30", "18:00", "19:00", "19:30", "20:00",
] as const;

// Berberin elle kapattığı / dolu kabul edilen saatler (0 = Pazartesi ... 6 = Pazar).
// Not: Bu liste statiktir; gerçek çakışma kontrolü randevu kaydı sırasında
// appointmentService.createAppointment() içindeki transaction ile yapılır.
export const UNAVAILABLE_BY_WEEKDAY: Record<number, readonly string[]> = {
  0: ["10:30", "14:00", "16:00", "19:00"],
  1: ["10:00", "11:30", "14:30", "18:00", "19:30"],
  2: ["12:00", "15:30", "17:30"],
  3: [
    "10:00", "10:30", "11:00", "14:00",
    "15:00", "16:00", "17:00", "18:00",
  ],
  4: [
    "10:00", "11:00", "11:30", "14:00",
    "15:00", "16:00", "17:00", "19:00",
  ],
  5: ["11:00", "15:00", "17:00"],
  6: ALL_SLOTS,
};
