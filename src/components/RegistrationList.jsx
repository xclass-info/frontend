// src/components/RegistrationList.jsx
// Mentor-side: who has registered for a research / project / course.
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

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

  async function togglePaid(r) {
    try {
      await updateDoc(doc(db, "registrations", r.id), {
        paymentStatus: r.paymentStatus === "paid" ? "pending" : "paid",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update. Please try again.");
    }
  }

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
                {r.emailVerified && (
                  <span style={{ color: "#16a34a", marginLeft: 6 }}>
                    ✓ verified
                  </span>
                )}
              </div>
              {r.studentPhone && (
                <div style={{ color: "#666" }}>📞 {r.studentPhone}</div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <span style={{ color: "#aaa", fontSize: 11 }}>
                  {r.createdAt?.toDate
                    ? r.createdAt.toDate().toLocaleDateString()
                    : ""}
                </span>
                <button
                  onClick={() => togglePaid(r)}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 50,
                    cursor: "pointer",
                    border: "1px solid",
                    ...(r.paymentStatus === "paid"
                      ? {
                          color: "#166534",
                          borderColor: "rgba(22,101,52,0.3)",
                          background: "rgba(22,101,52,0.08)",
                        }
                      : {
                          color: "#92400e",
                          borderColor: "rgba(217,119,6,0.3)",
                          background: "rgba(217,119,6,0.08)",
                        }),
                  }}
                >
                  {r.paymentStatus === "paid" ? "Paid ✓" : "Unpaid - mark paid"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
