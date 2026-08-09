"use client";

import AppointmentBooking from "../components/AppointmentBooking";
import VisitorCounter from "../components/VisitorCounter";

const BUSINESS = {
  name: "Brothers Erkek Kuaförü",
  tagline: "Premium Men's Barber",
  address: "Güzelyalı Mah. 56/2 Sok. No:1B Konak / İzmir",
  phone: "+90 555 588 42 56",
  phoneHref: "tel:+905555884256",
  instagram: "@brothers_erkek_kuaforu",
  instagramHref:
    "https://www.instagram.com/brothers_erkek_kuaforu/",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=G%C3%BCzelyal%C4%B1+Mah.+56%2F2+Sok.+No%3A1B+Konak+%C4%B0zmir",
} as const;

const WEEKLY_OCCUPANCY = [
  { day: "Pazartesi", short: "Pzt", percentage: 70 },
  { day: "Salı", short: "Sal", percentage: 45 },
  { day: "Çarşamba", short: "Çar", percentage: 85 },
  { day: "Perşembe", short: "Per", percentage: 60 },
  { day: "Cuma", short: "Cum", percentage: 90 },
  { day: "Cumartesi", short: "Cmt", percentage: 95 },
  { day: "Pazar", short: "Paz", percentage: 0 },
] as const;

function MapPinIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

function LogoMark() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#C9A962]/30 bg-black/20 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
      <span className="text-3xl" aria-hidden="true">
        💈
      </span>
    </div>
  );
}

function OccupancyBar({ percentage }: { percentage: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
      <div
        className="h-full rounded-full bg-[#C9A962] transition-all duration-700"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function WeeklyOccupancy() {
  return (
    <section className="glass-card rounded-3xl p-5 sm:p-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A962]">
            Randevu Durumu
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Haftalık Doluluk
          </h2>
        </div>

        <span className="text-xs text-zinc-500">
          Bu hafta
        </span>
      </div>

      <div className="space-y-4">
        {WEEKLY_OCCUPANCY.map((item) => (
          <div key={item.day}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-sm text-zinc-300">
                <span className="sm:hidden">{item.short}</span>
                <span className="hidden sm:inline">{item.day}</span>
              </span>

              <span
                className={`text-xs font-semibold ${
                  item.percentage >= 90
                    ? "text-[#D7B66D]"
                    : item.percentage === 0
                      ? "text-zinc-600"
                      : "text-zinc-400"
                }`}
              >
                {item.percentage === 0
                  ? "Kapalı"
                  : `%${item.percentage}`}
              </span>
            </div>

            <OccupancyBar percentage={item.percentage} />
          </div>
        ))}
      </div>
    </section>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="mb-2 flex items-center gap-2 text-[#C9A962]">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.16em]">
          {title}
        </span>
      </div>

      <div className="text-sm leading-relaxed text-zinc-400">
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="wood-background min-h-dvh text-white">
      {/* Visitor counter */}
      <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
        <VisitorCounter />
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Header */}
        <header className="animate-fade-in flex flex-col items-center text-center">
          <LogoMark />

          <h1 className="mt-5 text-[clamp(1.8rem,4vw,3rem)] font-semibold tracking-[-0.04em] text-white">
            {BUSINESS.name}
          </h1>

          <p className="mt-2 text-sm font-medium tracking-[0.18em] text-[#C9A962] sm:text-[15px]">
            {BUSINESS.tagline}
          </p>

          <a
            href={BUSINESS.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 text-xs text-zinc-500 transition-colors hover:text-zinc-300 sm:text-sm"
          >
            <MapPinIcon />
            <span>{BUSINESS.address}</span>
          </a>
        </header>

        {/* Main content */}
        <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-6">
          {/* Left */}
          <section className="animate-fade-in-delay flex flex-col">
            <div className="glass-card flex flex-1 flex-col rounded-3xl p-5 sm:p-7">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A962]">
                  Brothers
                </p>

                <h2 className="mt-2 max-w-xl text-2xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-3xl">
                  Tarzını yenile.
                  <br />
                  <span className="text-[#C9A962]">
                    Randevunu şimdi oluştur.
                  </span>
                </h2>

                <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-400">
                  Size uygun günü ve saati seçerek hızlıca
                  randevunuzu oluşturabilirsiniz.
                </p>
              </div>

              <div className="mt-7">
                <a
                  href="#booking"
                  className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#C9A962] px-6 text-base font-semibold text-black shadow-[0_8px_30px_rgba(201,169,98,0.22)] transition-all duration-200 hover:bg-[#D7B66D] hover:shadow-[0_10px_35px_rgba(201,169,98,0.3)] active:scale-[0.98] sm:h-16 sm:text-lg"
                >
                  Randevu Al
                </a>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoCard
                  icon={<ClockIcon />}
                  title="Çalışma Saatleri"
                >
                  <div>Pazartesi - Cumartesi</div>
                  <div className="mt-1 text-white">
                    10:00 - 21:00
                  </div>
                  <div className="mt-1 text-zinc-600">
                    Pazar kapalı
                  </div>
                </InfoCard>

                <InfoCard
                  icon={<MapPinIcon />}
                  title="Konum"
                >
                  <a
                    href={BUSINESS.mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-white"
                  >
                    {BUSINESS.address}
                  </a>
                </InfoCard>
              </div>

              <div className="mt-auto pt-6">
                <a
                  href={BUSINESS.instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm text-zinc-300 transition-all hover:border-[#C9A962]/30 hover:bg-white/[0.06] hover:text-white"
                >
                  <InstagramIcon />
                  <span>Bizi Instagram'da takip edin</span>
                </a>
              </div>
            </div>
          </section>

          {/* Right */}
          <section
            id="booking"
            className="animate-fade-in-delay scroll-mt-6"
          >
            <div className="glass-card h-full rounded-3xl p-4 sm:p-5">
              <AppointmentBooking />
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-5 text-xs text-zinc-600 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {BUSINESS.name}
          </span>

          <a
            href={BUSINESS.phoneHref}
            className="transition-colors hover:text-zinc-400"
          >
            {BUSINESS.phone}
          </a>
        </footer>
      </main>
    </div>
  );
}
