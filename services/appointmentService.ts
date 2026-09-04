import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";

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

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, appointmentId), {
    status,
    updatedAt: serverTimestamp(),
  });
}
