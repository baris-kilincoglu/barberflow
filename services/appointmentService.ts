import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type {
  Appointment,
  AppointmentStatus,
  CreateAppointmentResult,
  NewAppointmentInput,
} from "@/lib/types";

const APPOINTMENTS = "appointments";
const SLOT_STATUS = "slotStatus";

// Bir slot "dolu" (rezerve edilmiş görünür) sayılan durumlar. Müşteri
// sayfası sadece bu bilgiyi (tarih/saat + dolu mu) görür, isim/telefon gibi
// hiçbir kişisel veriyi görmez — bkz. slotStatus koleksiyonu ve
// firestore.rules.
const OCCUPIED_STATUSES: AppointmentStatus[] = ["pending", "confirmed", "blocked"];

function slotId(date: string, time: string): string {
  return `${date}_${time.replace(/:/g, "-")}`;
}

function isValidInput(input: NewAppointmentInput): string | null {
  if (!input.date || !input.time) return "Lütfen tarih ve saat seçin.";

  // Admin'in bir saati manuel "kapalı" olarak işaretlemesi durumunda isim/telefon
  // zorunlu değildir — bu, müşteri randevusu değil, berberin kendi engellemesidir.
  if (input.status === "blocked") return null;

  if (input.name.trim().length < 2) return "Lütfen adınızı girin.";
  if (input.phone.trim().length < 10) return "Lütfen geçerli bir telefon numarası girin.";
  if (!input.service.trim()) return "Lütfen bir hizmet seçin.";
  return null;
}

/**
 * Yeni randevu (veya admin tarafından manuel saat kapatma) oluşturur. Aynı
 * tarih+saat için hâlâ dolu (slotStatus.taken === true) ise hata döner —
 * iki müşteri aynı anda aynı saati alamaz. Çakışma kontrolü kasıtlı olarak
 * kişisel veri İÇERMEYEN `slotStatus` koleksiyonu üzerinden yapılır, çünkü
 * `appointments` koleksiyonu sadece admin'e açık (isim/telefon içerir) —
 * giriş yapmamış bir müşteri o koleksiyonu okuyamaz.
 */
export async function createAppointment(
  input: NewAppointmentInput
): Promise<CreateAppointmentResult> {
  const validationError = isValidInput(input);
  if (validationError) {
    return { success: false, message: validationError };
  }

  const id = slotId(input.date, input.time);
  const appointmentRef = doc(collection(db, APPOINTMENTS), id);
  const slotStatusRef = doc(collection(db, SLOT_STATUS), id);

  try {
    await runTransaction(db, async (transaction) => {
      const slotSnap = await transaction.get(slotStatusRef);

      if (slotSnap.exists() && slotSnap.data().taken === true) {
        throw new Error("SLOT_ALREADY_BOOKED");
      }

      transaction.set(appointmentRef, {
        date: input.date,
        time: input.time,
        name: input.name.trim(),
        phone: input.phone.trim(),
        service: input.service.trim(),
        status: input.status ?? "pending",
        createdAt: serverTimestamp(),
      });

      transaction.set(slotStatusRef, {
        date: input.date,
        time: input.time,
        taken: true,
      });
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_ALREADY_BOOKED") {
      return {
        success: false,
        message: "Bu saat az önce başka bir müşteri tarafından alındı.",
      };
    }

    console.error("Randevu oluşturulamadı:", error);
    return {
      success: false,
      message: "Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
    };
  }
}

/**
 * Tüm randevuları gerçek zamanlı dinler. Sadece giriş yapmış admin
 * çağırabilir — Firestore kuralları bunu zaten zorunlu kılar.
 */
export function subscribeToAppointments(
  onData: (appointments: Appointment[]) => void,
  onError: (error: unknown) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, APPOINTMENTS),
    (snapshot) => {
      const appointments = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Appointment, "id">),
      }));
      onData(appointments);
    },
    onError
  );
}

/**
 * Belirli bir tarih için slotStatus durumlarını { saat: dolu mu } şeklinde
 * bir harita olarak dinler. Üç anlamı vardır:
 *  - harita[saat] === true  -> dolu/kapalı (randevu veya admin engeli)
 *  - harita[saat] === false -> admin tarafından ÖZELLİKLE açık işaretlenmiş
 *    (statik haftalık kapanış listesini bu tarih için geçersiz kılar)
 *  - harita[saat] tanımsız   -> Firestore'da kayıt yok, statik haftalık
 *    programa (lib/business.ts → UNAVAILABLE_BY_WEEKDAY) bakılır.
 * Kişisel veri içermez, herkes (giriş yapmadan) çağırabilir.
 */
export function subscribeToSlotStatus(
  date: string,
  onData: (statusMap: Record<string, boolean>) => void,
  onError: (error: unknown) => void
): Unsubscribe {
  const q = query(collection(db, SLOT_STATUS), where("date", "==", date));

  return onSnapshot(
    q,
    (snapshot) => {
      const statusMap: Record<string, boolean> = {};
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        statusMap[data.time as string] = data.taken === true;
      });
      onData(statusMap);
    },
    onError
  );
}

/**
 * Admin'in, statik haftalık programda kapalı görünen bir saati sadece bu
 * tarih için "açık" yapmasını sağlar (override). Sadece giriş yapmış admin
 * çağırabilir — bkz. firestore.rules.
 */
export async function setSlotOverrideOpen(date: string, time: string): Promise<void> {
  const ref = doc(db, SLOT_STATUS, slotId(date, time));
  await setDoc(ref, { date, time, taken: false });
}

/**
 * Randevu durumunu günceller (onay/red/iptal/engel). Sadece admin
 * çağırmalıdır (Firestore kuralları bunu zaten zorunlu kılar).
 *
 * Durum "dolu" sayılan bir duruma (pending/confirmed/blocked) geçtiyse,
 * kayıt güncellenir ve slotStatus "dolu" işaretlenir. Durum serbest
 * bırakan bir duruma (cancelled/rejected) geçtiyse, hem appointments hem
 * slotStatus kaydı TAMAMEN SİLİNİR — sadece durumu değiştirmek yeterli
 * değildir, çünkü var olan bir dokümana yazmak Firestore kurallarında
 * "update" sayılır ve bu, müşterinin (giriş yapmadan) o saati tekrar
 * alabilmesini engeller. Silme işlemi, bir sonraki müşterinin temiz bir
 * "create" yapabilmesini garanti eder.
 *
 * Not: Bu, reddedilen/iptal edilen randevuların admin panelinde kalıcı bir
 * geçmiş olarak görünmemesi anlamına gelir — istenirse ayrı bir "geçmiş"
 * kaydı eklenebilir.
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<void> {
  const appointmentRef = doc(db, APPOINTMENTS, appointmentId);
  const slotStatusRef = doc(db, SLOT_STATUS, appointmentId);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(appointmentRef);
    if (!snap.exists()) return;

    if (OCCUPIED_STATUSES.includes(status)) {
      const data = snap.data();
      transaction.update(appointmentRef, {
        status,
        updatedAt: serverTimestamp(),
      });
      transaction.set(slotStatusRef, { date: data.date, time: data.time, taken: true });
    } else {
      transaction.delete(appointmentRef);
      transaction.delete(slotStatusRef);
    }
  });
}
