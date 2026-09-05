"use client";

import type { ReactNode } from "react";

import AppointmentBooking from "@/components/AppointmentBooking";
import VisitorCounter from "@/components/VisitorCounter";
import { BUSINESS, WEEKLY_OCCUPANCY } from "@/lib/business";

const WEEKLY_OCCUPANCY_DISPLAY = [
  { day: "Pazartesi", short: "Pzt" },
  { day: "Salı", short: "Sal" },
  { day: "Çarşamba", short: "Çar" },
  { day: "Perşembe", short: "Per" },
  { day: "Cuma", short: "Cum" },
  { day: "Cumartesi", short: "Cmt" },
  { day: "Pazar", short: "Paz" },
].map((item, index) => ({ ...item, percentage: WEEKLY_OCCUPANCY[index] }));

function MapPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
    </svg>
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
    <section className="rounded-3xl border border-white/[0.08] bg-black/35 p-5 backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A962]">Randevu Durumu</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Haftalık Doluluk</h2>
        </div>
        <span className="text-xs text-zinc-500">Bu hafta</span>
      </div>

      <div className="space-y-4">
        {WEEKLY_OCCUPANCY_DISPLAY.map((item) => (
          <div key={item.day}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-sm text-zinc-300">
                <span className="sm:hidden">{item.short}</span>
                <span className="hidden sm:inline">{item.day}</span>
              </span>
              <span
                className={`text-xs font-semibold ${
                  item.percentage >= 90 ? "text-[#D7B66D]" : item.percentage === 0 ? "text-zinc-600" : "text-zinc-400"
                }`}
              >
                {item.percentage === 0 ? "Kapalı" : `%${item.percentage}`}
              </span>
            </div>
            <OccupancyBar percentage={item.percentage} />
          </div>
        ))}
      </div>
    </section>
  );
}

function InfoCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
      <div className="mb-2 flex items-center gap-2 text-[#C9A962]">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.16em]">{title}</span>
      </div>
      <div className="text-sm leading-relaxed text-zinc-400">{children}</div>
    </div>
  );
}

function scrollToBooking() {
  const target = document.getElementById("booking");
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - 20;
  window.scrollTo({ top, behavior: "smooth" });
}

export default function Home() {
  return (
    <div className="min-h-dvh bg-[#080807] text-white">
      <div className="fixed right-4 top-4 z-[70] sm:right-6 sm:top-6">
        <VisitorCounter />
      </div>

      {/* HERO */}
      <section className="relative min-h-[720px] overflow-hidden sm:min-h-[780px]">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/brothers-hero.png')" }} />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-[#080807]" />

        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 sm:py-6 lg:px-10">
          <a href="#top" className="flex items-center gap-3" aria-label="Brothers ana sayfa">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-[#f4efe3] shadow-lg sm:h-16 sm:w-16">
              <img src="/brothers-logo.png" alt={BUSINESS.name} className="h-full w-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold tracking-[0.2em] text-white">BROTHERS</div>
              <div className="text-[10px] tracking-[0.22em] text-[#C9A962]">ERKEK KUAFÖRÜ</div>
            </div>
          </a>

          <nav className="hidden items-center gap-8 text-sm text-white/75 md:flex">
            <a href="#randevu" className="transition-colors hover:text-white">Randevu</a>
            <a href="#bilgi" className="transition-colors hover:text-white">Bilgi</a>
            <a href={BUSINESS.instagramHref} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">Instagram</a>
          </nav>

          <button
            type="button"
            onClick={scrollToBooking}
            className="rounded-xl bg-[#C9A962] px-5 py-3 text-sm font-semibold text-black shadow-[0_8px_30px_rgba(201,169,98,0.25)] transition-all hover:bg-[#D7B66D] active:scale-[0.97]"
          >
            Randevu Al
          </button>
        </header>

        <div id="top" className="relative z-10 mx-auto flex min-h-[620px] max-w-5xl flex-col items-center justify-center px-5 pb-20 text-center sm:min-h-[660px] sm:px-8">
          <div className="animate-fade-in">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-[#D7B66D] sm:text-sm">Güzelyalı · İzmir</p>

            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-white drop-shadow-2xl sm:text-6xl lg:text-7xl">
              Tarzını yenile.
              <br />
              <span className="text-[#D7B66D]">Kendini iyi hisset.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              Modern erkek bakımının adresi Brothers. Profesyonel dokunuş, kaliteli hizmet ve sana uygun randevu zamanı.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={scrollToBooking}
                className="inline-flex h-14 min-w-[220px] items-center justify-center rounded-2xl bg-[#C9A962] px-8 text-base font-semibold text-black shadow-[0_10px_40px_rgba(201,169,98,0.28)] transition-all hover:bg-[#D7B66D] hover:scale-[1.02] active:scale-[0.98]"
              >
                Randevu Al
              </button>
              <a
                href={BUSINESS.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-14 min-w-[180px] items-center justify-center rounded-2xl border border-white/20 bg-black/20 px-7 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/10"
              >
                Konumu Gör
              </a>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-white/35">
            Aşağı kaydır
          </div>
        </div>
      </section>

      {/* QUICK INFO */}
      <section id="bilgi" className="relative z-20 mx-auto -mt-10 w-full max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard icon={<ClockIcon />} title="Çalışma Saatleri">
            <div>{BUSINESS.hours.days}</div>
            <div className="mt-1 text-white">{BUSINESS.hours.time}</div>
            <div className="mt-1 text-zinc-600">{BUSINESS.hours.closed}</div>
          </InfoCard>

          <InfoCard icon={<MapPinIcon />} title="Konum">
            <a href={BUSINESS.mapsHref} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
              {BUSINESS.address}
            </a>
          </InfoCard>

          <InfoCard icon={<PhoneIcon />} title="İletişim">
            <a href={BUSINESS.phoneHref} className="text-white transition-colors hover:text-[#C9A962]">
              {BUSINESS.phone}
            </a>
            <div className="mt-1">
              <a href={BUSINESS.instagramHref} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
                {BUSINESS.instagram}
              </a>
            </div>
          </InfoCard>
        </div>
      </section>

      {/* APPOINTMENT */}
      <main id="randevu" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C9A962]">Brothers</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">Randevunu oluştur</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">
            Sana uygun hizmeti, günü ve saati seç. Randevunu birkaç adımda kolayca oluştur.
          </p>
        </div>

        <div id="booking" className="scroll-mt-8">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/[0.08] bg-white/[0.025] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-5">
            <AppointmentBooking />
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-5xl">
          <WeeklyOccupancy />
        </div>
      </main>

      {/* INSTAGRAM CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 text-center backdrop-blur-xl sm:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#C9A962]">Brothers</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Bizi Instagram&apos;da takip edin</h2>
          <p className="mt-2 text-sm text-zinc-500">Yeni çalışmalarımızı ve güncel içeriklerimizi keşfedin.</p>
          <a
            href={BUSINESS.instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 py-3 text-sm text-zinc-300 transition-all hover:border-[#C9A962]/40 hover:text-white"
          >
            <InstagramIcon />
            {BUSINESS.instagram}
          </a>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-4 py-6 text-center text-xs text-zinc-600">
        <div>© {new Date().getFullYear()} {BUSINESS.name}</div>
        <a href={BUSINESS.phoneHref} className="mt-1 inline-block transition-colors hover:text-zinc-400">
          {BUSINESS.phone}
        </a>
      </footer>
    </div>
  );
}
