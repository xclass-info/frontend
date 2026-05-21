import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import styles from "./Classroom.module.css";

const DAILY_API_KEY = import.meta.env.VITE_DAILY_API_KEY;

export default function Classroom() {
  const { classId } = useParams();
  const [meetingLink, setMeetingLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "classes", classId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setMeetingLink(data.meeting_link || null);
        const currentUser = auth.currentUser;
        if (currentUser && data.teacherId === currentUser.uid) {
          setIsInstructor(true);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [classId]);

  async function generateRoom() {
    setCreating(true);
    try {
      const res = await fetch("https://api.daily.co/v1/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
        body: JSON.stringify({
          name: `HappyResearch-${classId.slice(-8)}-${Date.now()}`,
          properties: {
            enable_chat: true,
            enable_screenshare: true,
            max_participants: 20,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
          },
        }),
      });

      const room = await res.json();
      if (!room.url) throw new Error("No URL returned");

      await updateDoc(doc(db, "classes", classId), {
        meeting_link: room.url,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create meeting room. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.joinPage}>
        <div className={styles.joinCard}>
          <p>⏳ Loading class...</p>
        </div>
      </div>
    );
  }

  // ── Embedded meeting ──
  if (joined && meetingLink) {
    return (
      <div style={{ position: "relative", height: "100vh" }}>
        <iframe
          src={meetingLink}
          style={{ width: "100%", height: "100%", border: "none" }}
          allow='camera; microphone; fullscreen; display-capture; autoplay'
          allowFullScreen
        />
        <button
          onClick={() => setJoined(false)}
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            padding: "6px 16px",
            borderRadius: 20,
            border: "none",
            background: "rgba(0,0,0,0.6)",
            color: "white",
            cursor: "pointer",
          }}
        >
          ← Leave
        </button>
      </div>
    );
  }

  // ── Lobby ──
  return (
    <div className={styles.joinPage}>
      <div className={styles.joinCard}>
        <h1 className={styles.joinTitle}>🎥 Join Classroom</h1>

        {/* Instructor controls */}
        {isInstructor && (
          <div
            style={{
              marginBottom: 20,
              padding: 16,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 8,
            }}
          >
            <p style={{ fontSize: 13, marginBottom: 8, opacity: 0.7 }}>
              {meetingLink
                ? "Room is ready for students."
                : "No meeting room yet."}
            </p>
            <button
              className={styles.joinBtn}
              onClick={generateRoom}
              disabled={creating}
              style={{ width: "100%", marginBottom: 0, background: "#555" }}
            >
              {creating
                ? "Creating..."
                : meetingLink
                  ? "Regenerate Room"
                  : "Generate Meeting Room"}
            </button>
          </div>
        )}

        {/* Join button */}
        {meetingLink ? (
          <>
            <p className={styles.joinSub}>
              {isInstructor
                ? "Start your class below."
                : "Your class is ready!"}
            </p>
            <button className={styles.joinBtn} onClick={() => setJoined(true)}>
              {isInstructor ? "Start Class →" : "Join Now →"}
            </button>
          </>
        ) : (
          <p className={styles.joinSub} style={{ textAlign: "center" }}>
            {isInstructor
              ? "Generate a room above to get started."
              : "Your instructor hasn't set up the meeting room yet. Check back soon."}
          </p>
        )}
      </div>
    </div>
  );
}
