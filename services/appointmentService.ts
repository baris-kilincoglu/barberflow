import {
  collection,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type AppointmentData = {
  date: string;
  time: string;
  name: string;
  phone: string;
  service: string;
};

export async function getBookedTimes(date: string): Promise<string[]> {
  try {
    const appointmentsRef = collection(db, "appointments");
    const snapshot = await getDocs(appointmentsRef);

    return snapshot.docs
      .map((doc) => doc.data())
      .filter((data) => data.date === date && data.status !== "cancelled")
      .map((data) => data.time as string);
  } catch (error) {
    console.error("Randevular alınamadı:", error);
    return [];
  }
}

export async function createAppointment(
  appointment: AppointmentData
): Promise<{ success: true } | { success: false; message: string }> {
  const { date, time, name, phone, service } = appointment;

  if (
    !date ||
    !time ||
    !name.trim() ||
    !phone.trim() ||
    !service.trim()
  ) {
    return {
      success: false,
      message: "Lütfen tüm bilgileri doldurun.",
    };
  }

  const appointmentId = `${date}_${time.replace(/:/g, "-")}`;

  const appointmentRef = doc(
    collection(db, "appointments"),
    appointmentId
  );

  try {
    await runTransaction(db, async (transaction) => {
      const existingAppointment = await transaction.get(appointmentRef);

      if (existingAppointment.exists()) {
        throw new Error("SLOT_ALREADY_BOOKED");
      }

      transaction.set(appointmentRef, {
        date,
        time,
        name: name.trim(),
        phone: phone.trim(),
        service: service.trim(),
        status: "confirmed",
        createdAt: serverTimestamp(),
      });
    });

    return {
      success: true,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "SLOT_ALREADY_BOOKED"
    ) {
      return {
        success: false,
        message: "Bu saat az önce başka bir müşteri tarafından alındı.",
      };
    }

    console.error("Randevu oluşturulamadı:", error);

    return {
      success: false,
      message: "Randevu oluşturulurken bir hata oluştu.",
    };
  }
}
