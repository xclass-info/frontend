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
  getDoc,
} from "firebase/firestore";
import emailjs from "@emailjs/browser";

const DAILY_API_KEY = import.meta.env.VITE_DAILY_API_KEY;
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export default function BookingRequests() {
  const [requests, setRequests] = useState([]);
  const [processing, setProcessing] = useState(null);
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

  async function generateMeetingLink(bookingId) {
    const res = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: `xclass-session-${bookingId.slice(-8)}`,
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

  async function sendEmail({
    toName,
    toEmail,
    teacherName,
    studentName,
    date,
    time,
    duration,
    meetingLink,
  }) {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_name: toName,
        to_email: toEmail,
        teacher_name: teacherName,
        student_name: studentName,
        date,
        time,
        duration,
        meeting_link: meetingLink,
      },
      EMAILJS_PUBLIC_KEY,
    );
  }

  async function handleApprove(req) {
    setProcessing(req.id);
    try {
      // 1. Generate Daily.co meeting link
      const meetingLink = await generateMeetingLink(req.id);

      // 2. Get teacher email from Firestore
      const teacherDoc = await getDoc(doc(db, "teachers", teacherId));
      const teacherEmail = teacherDoc.data()?.email;
      const teacherName = teacherDoc.data()?.name;

      // 3. Update booking in Firestore
      await updateDoc(doc(db, "bookings", req.id), {
        status: "approved",
        meeting_link: meetingLink,
      });

      // 4. Mark slot as booked
      await updateDoc(
        doc(db, "teachers", teacherId, "availability", req.slotId),
        { booked: true },
      );

      // 5. Send email to student
      await sendEmail({
        toName: req.studentName,
        toEmail: req.studentEmail,
        teacherName: req.teacherName,
        studentName: req.studentName,
        date: req.date,
        time: req.time,
        duration: req.duration,
        meetingLink,
      });

      // 6. Send email to teacher
      if (teacherEmail) {
        await sendEmail({
          toName: teacherName,
          toEmail: teacherEmail,
          teacherName: req.teacherName,
          studentName: req.studentName,
          date: req.date,
          time: req.time,
          duration: req.duration,
          meetingLink,
        });
      }

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
      await updateDoc(doc(db, "bookings", req.id), { status: "rejected" });
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
                  background: "#27ae60",
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
                  background: "#e74c3c",
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
