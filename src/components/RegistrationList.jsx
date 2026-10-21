// src/components/RegistrationList.jsx
// Mentor-side: who has registered for a research post / project.
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

// Older registrations predate the review step and have no status field -
// they were confirmed under the old instant-accept flow, so treat missing
// status as approved rather than pending.
const STATUS_BADGE = {
  pending: { label: "Pending review", color: "#9a772b", bg: "#fff8dc" },
  approved: { label: "Approved", color: "#1f6f4a", bg: "#f0fdf4" },
  rejected: { label: "Rejected", color: "#a01f13", bg: "#fef2f2" },
};

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

  if (regs.length === 0) {
    return (
      <div style={{ marginBottom: 12, fontSize: 13, color: "#94a3b8", fontWeight: 700 }}>
        👥 No registrations yet
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          color: "#2f6175",
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
          {regs.map((r) => {
            const badge = STATUS_BADGE[r.status || "approved"];
            return (
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <strong>{r.studentName}</strong>
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 50,
                      color: badge.color,
                      background: badge.bg,
                    }}
                  >
                    {badge.label}
                  </span>
                </div>
                <div style={{ color: "#666", wordBreak: "break-all" }}>
                  {r.studentEmail}
                </div>
                <div style={{ color: "#aaa", fontSize: 11 }}>
                  {r.createdAt?.toDate
                    ? r.createdAt.toDate().toLocaleDateString()
                    : ""}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
