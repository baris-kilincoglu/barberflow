import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  where,
  collection,
  runTransaction,
  serverTimestamp,
  onSnapshot,
  query,
  getDocs
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";

import { db } from "@/lib/firebase";

import type {
  Appointment,
  AppointmentStatus,
  CreateAppointmentResult,
  NewAppointmentInput,
} from "@/lib/types";

const COLLECTION = "appointments";

function slotId(date: string, time: string): string {
  return `${date}_${time.replace(/:/g, "-")}`;
}

function isValidInput(input: NewAppointmentInput): string | null {
  if (!input.date || !input.time) return "Lütfen tarih ve saat seçin.";
  if (input.name.trim().length < 2) return "Lütfen adınızı girin.";
  if (input.phone.trim().length < 10) return "Lütfen geçerli bir telefon numarası girin.";
  if (!input.service.trim()) return "Lütfen bir hizmet seçin.";
  return null;
}

/**
 * Yeni randevu oluşturur. Aynı tarih+saat için bir kayıt zaten varsa
 * (transaction ile atomik kontrol edilir) hata döner — böylece iki müşteri
 * aynı anda aynı saati alamaz. Randevu her zaman "pending" (onay bekliyor)
 * olarak başlar; admin panelden onaylanması/reddedilmesi gerekir.
 */
export async function createAppointment(
  input: NewAppointmentInput
): Promise<CreateAppointmentResult> {
  const validationError = isValidInput(input);
  if (validationError) {
    return { success: false, message: validationError };
  }

  const ref = doc(collection(db, COLLECTION), slotId(input.date, input.time));

  try {
    await runTransaction(db, async (transaction) => {
      const existing = await transaction.get(ref);
      if (existing.exists()) {
        throw new Error("SLOT_ALREADY_BOOKED");
      }

      transaction.set(ref, {
        date: input.date,
        time: input.time,
        name: input.name.trim(),
        phone: input.phone.trim(),
        service: input.service.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
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
 * çağırabilir — Firestore kuralları bunu zaten zorunlu kılar, ama bu
 * fonksiyon da sadece admin panelinden kullanılmalıdır.
 */
export function subscribeToAppointments(
  onData: (appointments: Appointment[]) => void,
  onError: (error: unknown) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTION),
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
 * Belirli bir berber ve tarih için rezerve edilmiş saatleri getirir.
 */
export async function getBookedTimes(barberId: string, date: string) {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("date", "==", date),
      // "confirmed", "pending" ve "blocked" olan tüm saatleri dolu kabul et
      where("status", "in", ["confirmed", "pending", "blocked"])
    );
    
    const snapshot = await getDocs(q);
    const bookedTimes = snapshot.docs.map((doc) => doc.data().time);
    
    return bookedTimes;
  } catch (error) {
    console.error("Error fetching booked times:", error);
    return [];
  }
}

/**
 * Admin paneli (Dashboard.tsx) üzerinden randevu durumunu güncellemeye yarar.
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<{ success: boolean; message?: string }> {
  try {
    const ref = doc(db, COLLECTION, appointmentId);
    await updateDoc(ref, {
      status: status,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Randevu durumu güncellenirken hata oluştu:", error);
    return {
      success: false,
      message: "Durum güncellenemedi.",
    };
  }
}
/**
 * Adminin istediği tarih ve saati manuel olarak randevulara kapatmasını sağlar.
 */
export async function blockTimeSlot(date: string, time: string, reason: string = "Dolu / Kapalı") {
  const ref = doc(collection(db, COLLECTION), slotId(date, time));

  try {
    await setDoc(ref, {
      date,
      time,
      name: "SİSTEM / ADMİN",
      phone: "-",
      service: reason,
      status: "blocked", // Müşterilere kapalı olduğunu belirten durum
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Saat kapatılırken hata oluştu:", error);
    return { success: false, message: "Saat kapatılamadı." };
  }
} 