import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type AppointmentData = {
  date: string;
  time: string;
  name: string;
  phone: string;
};

export async function createAppointment(
  appointment: AppointmentData
): Promise<{ success: true } | { success: false; message: string }> {
  const { date, time, name, phone } = appointment;

  if (!date || !time || !name.trim() || !phone.trim()) {
    return {
      success: false,
      message: "Lütfen tarih, saat, ad ve telefon bilgilerini doldurun.",
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
        message: "Bu saat daha önce alınmış. Lütfen başka bir saat seçin.",
      };
    }

    console.error("Randevu oluşturulamadı:", error);

    return {
      success: false,
      message: "Randevu oluşturulurken bir hata oluştu.",
    };
  }
}