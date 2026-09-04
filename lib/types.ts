import type { Timestamp } from "firebase/firestore";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed";

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
};

export type CreateAppointmentResult =
  | { success: true }
  | { success: false; message: string };
