import type { Timestamp } from "firebase/firestore";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed"
  | "blocked";

export type Appointment = {
  id: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  name: string;
  phone: string;
  service: string;
  status: AppointmentStatus;
  createdAt?: Timestamp | null;
};

export type NewAppointmentInput = {
  date: string;
  time: string;
  name: string;
  phone: string;
  service: string;
  // Sadece admin panelinden bir saati manuel kapatmak için kullanılır.
  // Belirtilmezse "pending" olarak kaydedilir (normal müşteri randevusu).
  status?: AppointmentStatus;
};

export type CreateAppointmentResult =
  | { success: true }
  | { success: false; message: string };
