import { doc, collection, runTransaction, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// Which Firestore collection holds each kind of item, and which field is its
// total seat count.
const KINDS = {
  research: { collection: "research", seatsField: "seats" },
  project: { collection: "projects", seatsField: "seats" },
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

// Submits one person's application for one item. The seat check and the
// application record happen in a single transaction so two people can't both
// take the last seat once approved. The registration id is derived from item
// + email, so the same email can't have two live applications for the same
// item - but a previously REJECTED application doesn't block reapplying;
// tx.set below overwrites it with a fresh pending submission. The seat isn't
// actually taken yet - applying only reserves a review slot; an admin must
// approve it (see approveStudentApplication below) before it counts against
// enrolledCount.
export async function registerForItem(kind, itemId, { name, email, studentUid }) {
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
    if (regSnap.exists() && regSnap.data().status !== "rejected") {
      throw new Error("DUPLICATE");
    }

    const item = itemSnap.data();
    const taken = item.enrolledCount || 0;
    if (taken >= Number(item[seatsField])) throw new Error("FULL");

    tx.set(regRef, {
      kind,
      itemId,
      itemTitle: item.title,
      teacherId: item.teacherId,
      studentName: name.trim(),
      studentEmail: email.trim(),
      studentEmailLower: email.trim().toLowerCase(),
      ...(studentUid ? { studentUid } : {}),
      status: "pending",
      createdAt: new Date(),
    });
  });
}

// Admin approves a pending application: re-checks seats are still available
// (several applications can be pending for fewer remaining seats) then both
// takes the seat and marks the application approved, atomically.
export async function approveStudentApplication(regId) {
  const regRef = doc(db, "registrations", regId);

  await runTransaction(db, async (tx) => {
    const regSnap = await tx.get(regRef);
    if (!regSnap.exists()) throw new Error("NOT_FOUND");
    const reg = regSnap.data();
    if (reg.status && reg.status !== "pending") throw new Error("ALREADY_REVIEWED");

    const { collection: coll, seatsField } = KINDS[reg.kind];
    const itemRef = doc(db, coll, reg.itemId);
    const itemSnap = await tx.get(itemRef);
    if (!itemSnap.exists()) throw new Error("NOT_FOUND");

    const item = itemSnap.data();
    const taken = item.enrolledCount || 0;
    if (taken >= Number(item[seatsField])) throw new Error("FULL");

    tx.update(itemRef, { enrolledCount: taken + 1 });
    tx.update(regRef, { status: "approved" });
  });
}

// Admin rejects a pending application. No seat was ever taken, so this is
// just a status update.
export async function rejectStudentApplication(regId, reason) {
  const regRef = doc(db, "registrations", regId);
  await updateDoc(regRef, { status: "rejected", rejectionReason: reason.trim() });
}
