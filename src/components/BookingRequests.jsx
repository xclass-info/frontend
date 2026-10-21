// src/components/BookingRequests.jsx
import { useState, useEffect } from "react";
import { api, live, seg } from "../api";
import { getCurrentUser } from "../auth";

const DAILY_API_KEY = import.meta.env.VITE_DAILY_API_KEY;

export default function BookingRequests() {
  const [requests, setRequests] = useState([]);
  const [processing, setProcessing] = useState(null);
  const teacherId = getCurrentUser()?.uid;

  useEffect(() => {
    if (!teacherId) return;
    const unsub = live(
      () => api.get("/teachers/me/bookings?status=pending"),
      setRequests,
    );
    return () => unsub();
  }, [teacherId]);

  async function generateMeetingLink(bookingId) {
    const res = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: `happyresearch-session-${bookingId.slice(-8)}`,
        properties: {
          enable_chat: true,
          enable_screenshare: true,
          max_participants: 2,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
        },
      }),
    });
    const data = await res.json();
    console.log("Daily.co response:", data); // ← add this
    console.log("API Key:", import.meta.env.VITE_DAILY_API_KEY);
    if (!data.url) throw new Error("Failed to generate meeting link");
    return data.url;
  }

  async function handleApprove(req) {
    setProcessing(req.id);
    try {
      // 1. Generate Daily.co meeting link
      const meetingLink = await generateMeetingLink(req.id);

      // 2. Approve: the backend saves the link, marks the slot booked and
      // emails the confirmation to the student and to you.
      await api.post(`/bookings/${seg(req.id)}/approve`, {
        meeting_link: meetingLink,
      });

      alert(`✅ Approved! Meeting link sent to ${req.studentEmail}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong: " + err.message);
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(req) {
    setProcessing(req.id);
    try {
      await api.post(`/bookings/${seg(req.id)}/reject`);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
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
                onClick={() => handleApprove(req)}
                disabled={processing === req.id}
                style={{
                  padding: "6px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: "#1f6f4a",
                  color: "white",
                  cursor: "pointer",
                  opacity: processing === req.id ? 0.6 : 1,
                }}
              >
                {processing === req.id
                  ? "Processing..."
                  : "✅ Approve & Send Link"}
              </button>
              <button
                onClick={() => handleReject(req)}
                disabled={processing === req.id}
                style={{
                  padding: "6px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: "#a01f13",
                  color: "white",
                  cursor: "pointer",
                  opacity: processing === req.id ? 0.6 : 1,
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
