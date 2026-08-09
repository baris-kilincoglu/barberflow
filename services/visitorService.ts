import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  increment,
  onSnapshot,
} from "firebase/firestore";

const visitorRef = doc(db, "visitors", "counter");

export async function incrementVisitor() {
  const visited = localStorage.getItem("visited");

  if (visited) return;

  await updateDoc(visitorRef, {
    total: increment(1),
  });

  localStorage.setItem("visited", "true");
}

export function subscribeVisitorCount(
  callback: (count: number) => void
) {
  return onSnapshot(visitorRef, (snapshot) => {
    if (!snapshot.exists()) return;

    callback(snapshot.data().total);
  });
}
