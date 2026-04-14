import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import styles from "./Classroom.module.css";

export default function Classroom() {
  const { classId } = useParams();
  const [meetingLink, setMeetingLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editLink, setEditLink] = useState("");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "classes", classId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const link = data.meeting_link || null;
        setMeetingLink(link);
        setEditLink(link || "");

        // ✅ Check if current user is the teacher of this class
        const currentUser = auth.currentUser;
        if (currentUser && data.teacherId === currentUser.uid) {
          setIsInstructor(true);
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [classId]);

  async function saveLink() {
    await updateDoc(doc(db, "classes", classId), {
      meeting_link: editLink,
    });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return <div style={{ padding: 32 }}>⏳ Loading class...</div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#1a1a1a", color: "white", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24 }}>

      {/* ── Instructor: set/edit the link ── */}
      {isInstructor && (
        <div style={{ background: "#2a2a2a", padding: 24, borderRadius: 12, width: 480 }}>
          <h3 style={{ margin: "0 0 12px" }}>Meeting Link</h3>
          {editing ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={editLink}
                onChange={(e) => setEditLink(e.target.value)}
                placeholder="https://zoom.us/j/your-meeting-id"
                style={{ flex: 1, padding: 8, borderRadius: 4, border: "none", background: "#444", color: "white" }}
              />
              <button onClick={saveLink} style={{ padding: "8px 16px", borderRadius: 4, border: "none", background: "#4a90e2", color: "white", cursor: "pointer" }}>
                Save
              </button>
              <button onClick={() => setEditing(false)} style={{ padding: "8px 16px", borderRadius: 4, border: "none", background: "#555", color: "white", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ flex: 1, fontSize: 13, color: "#aaa", wordBreak: "break-all" }}>
                {meetingLink || "No link set yet"}
              </span>
              <button onClick={() => setEditing(true)} style={{ padding: "8px 16px", borderRadius: 4, border: "none", background: "#555", color: "white", cursor: "pointer" }}>
                {meetingLink ? "Edit" : "Add Link"}
              </button>
            </div>
          )}
          {saved && <p style={{ color: "#4caf50", marginTop: 8, fontSize: 13 }}>Saved!</p>}
        </div>
      )}

      {/* ── Join button ── */}
      {meetingLink ? (
        <div style={{ textAlign: "center" }}>
          <h2 style={{ marginBottom: 8 }}>Class is ready</h2>
          <p style={{ color: "#aaa", marginBottom: 24 }}>Click below to join the meeting</p>
          <a href={meetingLink} target="_blank" rel="noreferrer">
            <button style={{ padding: "14px 40px", borderRadius: 32, border: "none", background: "#4a90e2", color: "white", fontSize: 16, cursor: "pointer" }}>
              Join Meeting
            </button>
          </a>
          {isInstructor && (
            <p style={{ marginTop: 16, fontSize: 13, color: "#888" }}>
              Make sure you start the Zoom meeting before students join.
            </p>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <h2>No meeting link yet</h2>
          <p style={{ color: "#aaa" }}>
            {isInstructor
              ? "Add your Zoom link above."
              : "Your instructor hasn't added a meeting link yet. Check back soon."}
          </p>
        </div>
      )}

    </div>
  );
}