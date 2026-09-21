import { doc, collection, runTransaction } from "firebase/firestore";
import { db } from "../firebase";

// Which Firestore collection holds each kind of item, and which field is its
// total seat count (courses predate research/projects and use maxSeats).
const KINDS = {
  research: { collection: "research", seatsField: "seats" },
  project: { collection: "projects", seatsField: "seats" },
  course: { collection: "classes", seatsField: "maxSeats" },
};

// null means the item has no seat count, so it can't be registered for.
export function seatsLeft(kind, item) {
  const total = Number(item[KINDS[kind].seatsField]);
  if (!total) return null;
  return Math.max(total - (item.enrolledCount || 0), 0);
}

export function totalSeats(kind, item) {
  return Number(item[KINDS[kind].seatsField]) || null;
}

// Registers one person for one item. The seat check, the counter bump and the
// registration record happen in a single transaction so two people can't both
// take the last seat. The registration id is derived from item + email, so the
// same email can't register for the same item twice.
export async function registerForItem(kind, itemId, { name, email }) {
  const { collection: coll, seatsField } = KINDS[kind];
  const itemRef = doc(db, coll, itemId);
  const regRef = doc(
    db,
    "registrations",
    `${itemId}_${encodeURIComponent(email.trim().toLowerCase())}`,
  );

  await runTransaction(db, async (tx) => {
    const itemSnap = await tx.get(itemRef);
    if (!itemSnap.exists()) throw new Error("NOT_FOUND");
    const regSnap = await tx.get(regRef);
    if (regSnap.exists()) throw new Error("DUPLICATE");

    const item = itemSnap.data();
    const taken = item.enrolledCount || 0;
    if (taken >= Number(item[seatsField])) throw new Error("FULL");

    tx.update(itemRef, { enrolledCount: taken + 1 });
    tx.set(regRef, {
      kind,
      itemId,
      itemTitle: item.title,
      teacherId: item.teacherId,
      studentName: name.trim(),
      studentEmail: email.trim(),
      studentEmailLower: email.trim().toLowerCase(),
      createdAt: new Date(),
    });
  });
}
