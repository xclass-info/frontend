// src/components/Availability.jsx
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function Availability() {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ date: "", time: "", duration: 60 });
  const [loading, setLoading] = useState(false);

  const teacherId = auth.currentUser?.uid;

  useEffect(() => {
    if (!teacherId) return;
    const unsub = onSnapshot(
      collection(db, "teachers", teacherId, "availability"),
      (snap) => {
        setSlots(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort(
              (a, b) =>
                new Date(`${a.date}T${a.time}`) -
                new Date(`${b.date}T${b.time}`),
            ),
        );
      },
    );
    return () => unsub();
  }, [teacherId]);

  async function addSlot() {
    if (!form.date || !form.time) return alert("Please fill in date and time");
    setLoading(true);
    try {
      await addDoc(collection(db, "teachers", teacherId, "availability"), {
        date: form.date,
        time: form.time,
        duration: Number(form.duration),
        booked: false,
        createdAt: new Date(),
      });
      setForm({ date: "", time: "", duration: 60 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function removeSlot(slotId) {
    await deleteDoc(doc(db, "teachers", teacherId, "availability", slotId));
  }

  return (
    <div style={{ marginTop: 32 }}>
      <h3>🗓 My Availability</h3>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 16 }}>
        Add time slots when you're available for 1-on-1 sessions.
      </p>

      {/* Add slot form */}
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}
      >
        <input
          type='date'
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
        />
        <input
          type='time'
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
        />
        <select
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
        >
          <option value={30}>30 min</option>
          <option value={60}>60 min</option>
          <option value={90}>90 min</option>
        </select>
        <button
          onClick={addSlot}
          disabled={loading}
          style={{
            padding: "8px 20px",
            borderRadius: 6,
            border: "none",
            background: "#4a90e2",
            color: "white",
            cursor: "pointer",
          }}
        >
          {loading ? "Adding..." : "+ Add Slot"}
        </button>
      </div>

      {/* Slots list */}
      {slots.length === 0 ? (
        <p style={{ color: "#aaa", fontSize: 14 }}>No availability set yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {slots.map((slot) => (
            <div
              key={slot.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                borderRadius: 8,
                background: slot.booked ? "#f0fdf4" : "#f9fafb",
                border: "1px solid #eee",
              }}
            >
              <div>
                <span style={{ fontWeight: 500 }}>📅 {slot.date}</span>
                <span style={{ margin: "0 8px", color: "#888" }}>
                  ⏰ {slot.time}
                </span>
                <span style={{ color: "#888" }}>({slot.duration} min)</span>
                {slot.booked && (
                  <span
                    style={{ marginLeft: 8, color: "#27ae60", fontSize: 13 }}
                  >
                    ✅ Booked
                  </span>
                )}
              </div>
              {!slot.booked && (
                <button
                  onClick={() => removeSlot(slot.id)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 6,
                    border: "none",
                    background: "#fee2e2",
                    color: "#e74c3c",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
