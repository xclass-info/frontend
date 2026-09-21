// src/components/RegistrationList.jsx
// Mentor-side: who has registered for a research / project / course.
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function RegistrationList({ itemId }) {
  const [regs, setRegs] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "registrations"),
      where("itemId", "==", itemId),
    );
    const unsub = onSnapshot(q, (snap) => {
      setRegs(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort(
            (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0),
          ),
      );
    });
    return () => unsub();
  }, [itemId]);

  if (regs.length === 0) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          color: "#00274c",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 700,
          padding: 0,
        }}
      >
        👥 Registrations ({regs.length}) {open ? "▴" : "▾"}
      </button>
      {open && (
        <div
          style={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {regs.map((r) => (
            <div
              key={r.id}
              style={{
                fontSize: 13,
                padding: "8px 10px",
                borderRadius: 8,
                background: "#f9fafb",
                border: "1px solid #eee",
              }}
            >
              <strong>{r.studentName}</strong>
              <div style={{ color: "#666", wordBreak: "break-all" }}>
                {r.studentEmail}
              </div>
              <div style={{ color: "#aaa", fontSize: 11 }}>
                {r.createdAt?.toDate
                  ? r.createdAt.toDate().toLocaleDateString()
                  : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
