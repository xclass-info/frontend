import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const ITEM_COLLECTION = {
  research: "research",
  project: "projects",
  course: "classes",
};

// Everything the student dashboard lists: the student's registrations
// (matched on their login email), each with the item as it is now and the
// mentor's name. `item` is null if the item has since been deleted.
export async function loadStudentRegistrations(email) {
  const e = email.trim().toLowerCase();
  // Older registrations only have studentEmail; newer ones also have
  // studentEmailLower, so check both and merge.
  const [a, b] = await Promise.all([
    getDocs(
      query(collection(db, "registrations"), where("studentEmail", "==", e)),
    ),
    getDocs(
      query(collection(db, "registrations"), where("studentEmailLower", "==", e)),
    ),
  ]);
  const merged = new Map();
  [...a.docs, ...b.docs].forEach((d) =>
    merged.set(d.id, { id: d.id, ...d.data() }),
  );
  const regs = [...merged.values()].sort(
    (x, y) => (y.createdAt?.seconds || 0) - (x.createdAt?.seconds || 0),
  );

  return Promise.all(
    regs.map(async (reg) => {
      const coll = ITEM_COLLECTION[reg.kind];
      const [itemSnap, teacherSnap] = await Promise.all([
        coll ? getDoc(doc(db, coll, reg.itemId)) : null,
        reg.teacherId ? getDoc(doc(db, "teachers", reg.teacherId)) : null,
      ]);
      return {
        reg,
        item: itemSnap?.exists() ? { id: itemSnap.id, ...itemSnap.data() } : null,
        mentorName: teacherSnap?.exists() ? teacherSnap.data().name : null,
      };
    }),
  );
}
