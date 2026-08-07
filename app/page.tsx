import AppointmentBooking from "../components/AppointmentBooking";

const BUSINESS = {
  name: "Brothers Erkek Kuaförü",
  tagline: "Premium Men's Barber",
  address: "Güzelyalı Mah. 56/2 Sok. No:1B Konak / İzmir",
  phone: "+90 555 588 42 56",
  phoneHref: "tel:+905555884256",
  instagram: "@brothers_erkek_kuaforu",
  instagramHref: "https://www.instagram.com/brothers_erkek_kuaforu/",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=G%C3%BCzelyal%C4%B1+Mah.+56%2F2+Sok.+No%3A1B+Konak+%C4%B0zmir",
  whatsappHref: "https://wa.me/905555884256",
  rating: 4.9,
  reviewCount: 128,
} as const;

const SERVICES = ["Saç Kesimi", "Sakal", "Çocuk", "Saç + Sakal"] as const;

/* ─── Primitives ─── */

function IconButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  const isTel = href.startsWith("tel:");
  return (
    <a
      href={href}
      target={isTel ? undefined : "_blank"}
      rel={isTel ? undefined : "noopener noreferrer"}
      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-[13px] font-medium text-zinc-300 transition-all duration-200 hover:border-[#C9A962]/20 hover:bg-white/[0.06] active:scale-[0.98] sm:py-3"
    >
      <span className="text-[#C9A962]">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}

/* ─── Icons ─── */

function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[#C9A962]" aria-hidden>
      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.651l-4.753-.381-1.83-4.401Z" clipRule="evenodd" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 shrink-0" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
    </svg>
  );
}

function MapsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
    </svg>
  );
}

/* ─── Sections ─── */

function BrandPanel() {
  return (
    <div className="flex h-full flex-col justify-center px-1 lg:px-4">
      <div className="animate-fade-in mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#C9A962]/15 bg-[#C9A962]/[0.08] text-2xl shadow-[0_0_24px_-4px_rgba(201,169,98,0.2)]">
        💈
      </div>

      <h1 className="animate-fade-in text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-tight tracking-[-0.03em] text-white">
        {BUSINESS.name}
      </h1>
      <p className="animate-fade-in mt-1.5 text-sm font-medium tracking-wide text-[#C9A962]/80 sm:text-[15px]">
        {BUSINESS.tagline}
      </p>

      <div className="animate-fade-in mt-4 flex items-center gap-2">
        <div className="flex items-center gap-1">
          <StarIcon />
          <span className="text-sm font-semibold text-white">{BUSINESS.rating}</span>
        </div>
        <span className="text-zinc-600">·</span>
        <span className="text-sm text-zinc-500">{BUSINESS.reviewCount} değerlendirme</span>
      </div>

      <a
        href={BUSINESS.mapsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="animate-fade-in mt-4 flex items-start gap-2 text-sm leading-snug text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <MapPinIcon />
        <span>{BUSINESS.address}</span>
      </a>

      <a
        href="#booking"
        className="animate-fade-in mt-6 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#C9A962] text-base font-semibold text-black shadow-[0_4px_24px_-4px_rgba(201,169,98,0.5)] transition-all duration-200 hover:bg-[#D4B872] active:scale-[0.98] sm:mt-8 lg:h-[3.75rem] lg:text-lg"
      >
        Randevu Al
      </a>
    </div>
  );
}

function ServiceCard({ name }: { name: string }) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-center text-[13px] font-medium text-zinc-300 transition-all duration-200 hover:border-[#C9A962]/15 hover:bg-white/[0.05] sm:py-3.5 sm:text-sm">
      {name}
    </div>
  );
}

function BottomBar() {
  return (
    <div className="shrink-0 space-y-3 border-t border-white/[0.04] px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
      <div className="mx-auto flex max-w-6xl gap-2 sm:gap-3">
        {SERVICES.map((service) => (
          <ServiceCard key={service} name={service} />
        ))}
      </div>
      <div className="mx-auto flex max-w-6xl gap-2 sm:gap-3">
        <IconButton href={BUSINESS.phoneHref} icon={<PhoneIcon />} label="Ara" />
        <IconButton href={BUSINESS.whatsappHref} icon={<WhatsAppIcon />} label="WhatsApp" />
        <IconButton href={BUSINESS.instagramHref} icon={<InstagramIcon />} label="Instagram" />
        <IconButton href={BUSINESS.mapsHref} icon={<MapsIcon />} label="Google Maps" />
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default function Home() {
  return (
    <>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in { animation: none; }
        }
      `}</style>

      <div className="flex min-h-dvh flex-col bg-[#050505] font-sans text-white lg:h-dvh lg:overflow-hidden">
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute left-0 top-0 h-[50vh] w-[50vw] bg-[radial-gradient(ellipse,rgba(201,169,98,0.08)_0%,transparent_70%)]" />
        </div>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:min-h-0 lg:flex-row lg:items-stretch lg:gap-8 lg:px-8 lg:py-8">
          <section className="lg:flex lg:w-[42%] lg:items-center">
            <BrandPanel />
          </section>
          <section className="lg:flex lg:min-h-0 lg:w-[58%] lg:items-stretch">
            <AppointmentBooking />
          </section>
        </main>

        <BottomBar />
      </div>
    </>
  );
}
