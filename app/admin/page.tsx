"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { auth } from "@/lib/firebase";
import AdminLogin from "@/components/admin/AdminLogin";
import Dashboard from "@/components/admin/Dashboard";

export default function AdminPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (user === undefined) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#050505] text-sm text-zinc-500">
        Admin paneli yükleniyor...
      </main>
    );
  }

  return user ? <Dashboard user={user} /> : <AdminLogin />;
}
