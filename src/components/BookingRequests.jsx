// src/components/BookingRequests.jsx
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function BookingRequests() {
  const [requests, setRequests] = useState([]);
  const teacherId = auth.currentUser?.uid;

  useEffect(() => {
    if (!teacherId) return;
    const q = query(
      collection(db, "bookings"),
      where("teacherId", "==", teacherId),
      where("status", "==", "pending"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [teacherId]);

  async function handleRequest(bookingId, slotId, status) {
    // Update booking status
    await updateDoc(doc(db, "bookings", bookingId), { status });

    // If approved, mark slot as booked
    if (status === "approved") {
      await updateDoc(doc(db, "teachers", teacherId, "availability", slotId), {
        booked: true,
      });
    }
  }

  if (requests.length === 0) {
    return (
      <div style={{ marginTop: 32 }}>
        <h3>📬 Booking Requests</h3>
        <p style={{ color: "#aaa", fontSize: 14 }}>No pending requests.</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 32 }}>
      <h3>📬 Booking Requests ({requests.length})</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginTop: 16,
        }}
      >
        {requests.map((req) => (
          <div
            key={req.id}
            style={{
              padding: 16,
              borderRadius: 10,
              background: "#fffbeb",
              border: "1px solid #fde68a",
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <strong>{req.studentName}</strong>
              <span style={{ color: "#888", fontSize: 13, marginLeft: 8 }}>
                {req.studentEmail}
              </span>
            </div>
            <div style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>
              📅 {req.date} &nbsp; ⏰ {req.time} &nbsp; ({req.duration} min)
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => handleRequest(req.id, req.slotId, "approved")}
                style={{
                  padding: "6px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: "#27ae60",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                ✅ Approve
              </button>
              <button
                onClick={() => handleRequest(req.id, req.slotId, "rejected")}
                style={{
                  padding: "6px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: "#e74c3c",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                ❌ Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
