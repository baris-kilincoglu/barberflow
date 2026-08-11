"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  type Timestamp,
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { app, db } from "@/lib/firebase";

type Appointment = {
  id: string;
  date: string;
  time: string;
  name?: string;
  phone?: string;
  service?: string;
  status?: string;
  createdAt?: Timestamp | null;
};

const auth = getAuth(app);

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setError("E-posta veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#050505] px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="text-4xl">💈</div>
          <h1 className="mt-4 text-2xl font-semibold">Brothers Yönetim</h1>
          <p className="mt-2 text-sm text-zinc-500">Randevu yönetim paneli</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta"
            className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#C9A962]/50"
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifre"
            className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#C9A962]/50"
          />
          {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
          <button disabled={loading} className="h-12 w-full rounded-xl bg-[#C9A962] text-sm font-semibold text-black transition hover:bg-[#D4B872] disabled:opacity-50">
            {loading ? "Giriş yapılıyor..." : "Admin Girişi"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Dashboard({ user }: { user: User }) {
  const [date, setDate] = useState(todayString());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
  
    const appointmentsRef = collection(db, "appointments");
  
    return onSnapshot(
      appointmentsRef,
      (snapshot) => {
        const allAppointments = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<Appointment, "id">),
        }));
  
        const filteredAppointments = allAppointments
          .filter((appointment) => {
            return (
              appointment.date === date &&
              appointment.status !== "cancelled"
            );
          })
          .sort((a, b) => a.time.localeCompare(b.time));
  
        setAppointments(filteredAppointments);
        setLoading(false);
      },
      () => {
        setError("Randevular yüklenemedi. Firestore bağlantısını kontrol edin.");
        setLoading(false);
      }
    );
  }, [date]);

  const services = useMemo(() => {
    const counts = new Map<string, number>();
    appointments.forEach((a) => {
      const service = a.service || "Belirtilmemiş";
      counts.set(service, (counts.get(service) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [appointments]);

  async function cancelAppointment(a: Appointment) {
    if (!window.confirm(`${a.name || "Bu müşteri"} adlı randevuyu iptal etmek istediğinize emin misiniz?`)) return;
    setActionId(a.id);
    setError("");
    try {
      await deleteDoc(doc(db, "appointments", a.id));
    } catch {
      setError("Randevu iptal edilemedi.");
    } finally {
      setActionId("");
    }
  }

  return (
    <main className="min-h-dvh bg-[#050505] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A962]">Brothers Erkek Kuaförü</div>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Yönetim Paneli</h1>
            <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
          </div>
          <button onClick={() => signOut(auth)} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.07] hover:text-white">Çıkış Yap</button>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"><div className="text-sm text-zinc-500">Seçilen Gün</div><div className="mt-2 text-lg font-semibold">{formatDate(date)}</div></div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"><div className="text-sm text-zinc-500">Toplam Randevu</div><div className="mt-2 text-3xl font-semibold text-[#C9A962]">{appointments.length}</div></div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"><div className="text-sm text-zinc-500">En Çok Seçilen</div><div className="mt-2 text-lg font-semibold">{services[0]?.[0] || "—"}</div></div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><h2 className="text-xl font-semibold">Randevular</h2><p className="mt-1 text-sm text-zinc-500">Seçilen gün gerçek zamanlı güncellenir.</p></div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-xl border border-white/[0.08] bg-black/40 px-3 text-sm text-white outline-none focus:border-[#C9A962]/50" />
          </div>
          {error && <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
          {loading ? <div className="py-12 text-center text-sm text-zinc-500">Randevular yükleniyor...</div> : appointments.length === 0 ? <div className="py-12 text-center"><div className="text-3xl">📅</div><p className="mt-3 text-sm text-zinc-500">Bu gün için randevu bulunmuyor.</p></div> : (
            <div className="mt-5 space-y-3">
              {appointments.map((a) => (
                <div key={a.id} className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="min-w-[70px] rounded-xl bg-[#C9A962]/10 px-3 py-2 text-center"><div className="text-lg font-bold text-[#C9A962]">{a.time}</div></div>
                    <div><div className="font-semibold">{a.name || "İsimsiz müşteri"}</div><div className="mt-1 text-sm text-zinc-500">{a.service || "Hizmet belirtilmemiş"}</div>{a.phone && <a href={`tel:${a.phone}`} className="mt-1 block text-sm text-zinc-400 hover:text-white">{a.phone}</a>}</div>
                  </div>
                  <button disabled={actionId === a.id} onClick={() => cancelAppointment(a)} className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-50">{actionId === a.id ? "İptal ediliyor..." : "Randevuyu İptal Et"}</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  if (user === undefined) return <main className="flex min-h-dvh items-center justify-center bg-[#050505] text-sm text-zinc-500">Admin paneli yükleniyor...</main>;
  return user ? <Dashboard user={user} /> : <AdminLogin />;
}
