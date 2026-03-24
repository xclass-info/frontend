import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  collection,
  addDoc,
  onSnapshot,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import styles from "./Classroom.module.css";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function Classroom() {
  const { classId } = useParams();
  const localVideoRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [sharing, setSharing] = useState(false);

  const localStream = useRef(null);
  const peerConnections = useRef({});
  const roomRef = useRef(null);
  const userId = useRef(`user_${Date.now()}`);

  //   async function setupMedia() {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: true,
  //       audio: true,
  //     });
  //     localStream.current = stream;
  //     if (localVideoRef.current) {
  //       localVideoRef.current.srcObject = stream;
  //     }
  //     return stream;
  //   }

  async function setupMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("Media error:", err.name, err.message);
      if (err.name === "NotFoundError") {
        alert(
          "No camera or microphone found. Please connect one and try again.",
        );
      } else if (err.name === "NotAllowedError") {
        alert(
          "Camera/microphone access denied. Please allow access in your browser settings.",
        );
      } else if (err.name === "NotReadableError") {
        alert(
          "Camera is already in use by another app. Please close it and try again.",
        );
      } else {
        alert(`Media error: ${err.message}`);
      }
    }
  }

  async function joinRoom() {
    if (!name.trim()) return;

    await setupMedia();
    roomRef.current = doc(db, "rooms", classId);

    // Save participant
    await addDoc(collection(db, "rooms", classId, "participants"), {
      userId: userId.current,
      name,
      role,
      joinedAt: new Date(),
    });

    // Listen for new participants
    onSnapshot(
      collection(db, "rooms", classId, "participants"),
      async (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            if (data.userId !== userId.current) {
              await createPeerConnection(data.userId, true);
            }
          }
        });
      },
    );

    // Listen for signaling
    onSnapshot(
      collection(db, "rooms", classId, "signals"),
      async (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            const signal = change.doc.data();
            if (signal.to !== userId.current) return;

            if (signal.type === "offer") {
              await handleOffer(signal);
            } else if (signal.type === "answer") {
              await handleAnswer(signal);
            } else if (signal.type === "candidate") {
              await handleCandidate(signal);
            }
          }
        });
      },
    );

    // Listen for chat
    onSnapshot(collection(db, "rooms", classId, "chat"), (snapshot) => {
      const msgs = snapshot.docs
        .map((d) => d.data())
        .sort((a, b) => a.sentAt?.seconds - b.sentAt?.seconds);
      setChat(msgs);
    });

    setJoined(true);
  }

  async function createPeerConnection(remoteUserId, isInitiator) {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnections.current[remoteUserId] = pc;

    // Add local tracks
    localStream.current.getTracks().forEach((track) => {
      pc.addTrack(track, localStream.current);
    });

    // Handle remote stream
    pc.ontrack = (event) => {
      setRemoteStreams((prev) => {
        const exists = prev.find((s) => s.userId === remoteUserId);
        if (exists) return prev;
        return [...prev, { userId: remoteUserId, stream: event.streams[0] }];
      });
    };

    // ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(collection(db, "rooms", classId, "signals"), {
          type: "candidate",
          candidate: event.candidate.toJSON(),
          from: userId.current,
          to: remoteUserId,
        });
      }
    };

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await addDoc(collection(db, "rooms", classId, "signals"), {
        type: "offer",
        sdp: offer.sdp,
        from: userId.current,
        to: remoteUserId,
      });
    }

    return pc;
  }

  async function handleOffer(signal) {
    const pc = await createPeerConnection(signal.from, false);
    await pc.setRemoteDescription(
      new RTCSessionDescription({ type: "offer", sdp: signal.sdp }),
    );
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await addDoc(collection(db, "rooms", classId, "signals"), {
      type: "answer",
      sdp: answer.sdp,
      from: userId.current,
      to: signal.from,
    });
  }

  async function handleAnswer(signal) {
    const pc = peerConnections.current[signal.from];
    if (pc) {
      await pc.setRemoteDescription(
        new RTCSessionDescription({ type: "answer", sdp: signal.sdp }),
      );
    }
  }

  async function handleCandidate(signal) {
    const pc = peerConnections.current[signal.from];
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
    }
  }

  function toggleMute() {
    localStream.current.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setMuted((m) => !m);
  }

  function toggleVideo() {
    localStream.current.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setVideoOff((v) => !v);
  }

  async function toggleScreenShare() {
    if (!sharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace video track in all peer connections
        Object.values(peerConnections.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });

        localVideoRef.current.srcObject = screenStream;
        setSharing(true);

        screenTrack.onended = () => {
          stopScreenShare();
        };
      } catch (err) {
        console.error("Screen share error:", err);
      }
    } else {
      stopScreenShare();
    }
  }

  function stopScreenShare() {
    const videoTrack = localStream.current.getVideoTracks()[0];
    Object.values(peerConnections.current).forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) sender.replaceTrack(videoTrack);
    });
    localVideoRef.current.srcObject = localStream.current;
    setSharing(false);
  }

  async function sendMessage() {
    if (!message.trim()) return;
    await addDoc(collection(db, "rooms", classId, "chat"), {
      text: message,
      sender: name,
      sentAt: new Date(),
    });
    setMessage("");
  }

  function leaveRoom() {
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    localStream.current?.getTracks().forEach((t) => t.stop());
    window.location.href = "/classes";
  }

  // Join screen
  if (!joined) {
    return (
      <div className={styles.joinPage}>
        <div className={styles.joinCard}>
          <h1 className={styles.joinTitle}>🎥 Join Classroom</h1>
          <p className={styles.joinSub}>
            Enter your name to join the live session
          </p>
          <input
            className={styles.joinInput}
            placeholder='Your name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && joinRoom()}
          />
          <select
            className={styles.joinInput}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value='student'>Student</option>
            <option value='teacher'>Teacher</option>
          </select>
          <button className={styles.joinBtn} onClick={joinRoom}>
            Join Now →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.room}>
      {/* Video grid */}
      <div className={styles.videoGrid}>
        {/* Local video */}
        <div className={styles.videoWrapper}>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={styles.video}
          />
          <span className={styles.videoLabel}>You ({name})</span>
        </div>

        {/* Remote videos */}
        {remoteStreams.map((rs) => (
          <RemoteVideo key={rs.userId} stream={rs.stream} userId={rs.userId} />
        ))}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button
          className={`${styles.controlBtn} ${muted ? styles.controlOff : ""}`}
          onClick={toggleMute}
        >
          {muted ? "🔇 Unmute" : "🎙️ Mute"}
        </button>
        <button
          className={`${styles.controlBtn} ${videoOff ? styles.controlOff : ""}`}
          onClick={toggleVideo}
        >
          {videoOff ? "📷 Start Video" : "📹 Stop Video"}
        </button>
        <button
          className={`${styles.controlBtn} ${sharing ? styles.controlActive : ""}`}
          onClick={toggleScreenShare}
        >
          {sharing ? "🖥️ Stop Share" : "🖥️ Share Screen"}
        </button>

        <button
          className={styles.controlBtn}
          onClick={() => {
            document.querySelectorAll("video").forEach((v) => {
              v.muted = false;
              v.play();
            });
          }}
        >
          🔊 Unmute All
        </button>
        <button className={styles.leaveBtn} onClick={leaveRoom}>
          📴 Leave
        </button>
      </div>

      {/* Chat */}
      <div className={styles.chat}>
        <h3 className={styles.chatTitle}>💬 Chat</h3>
        <div className={styles.chatMessages}>
          {chat.map((msg, i) => (
            <div key={i} className={styles.chatMsg}>
              <span className={styles.chatSender}>{msg.sender}:</span>
              <span className={styles.chatText}>{msg.text}</span>
            </div>
          ))}
        </div>
        <div className={styles.chatInput}>
          <input
            className={styles.chatInputField}
            placeholder='Type a message...'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className={styles.chatSendBtn} onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function RemoteVideo({ stream, userId }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
      // Force play with audio
      ref.current.play().catch((e) => console.warn("Autoplay blocked:", e));
    }
  }, [stream]);
  return (
    <div className={styles.videoWrapper}>
      <video
        ref={ref}
        autoPlay
        playsInline
        className={styles.video}
        // NO muted here — this is remote audio!
      />
      <span className={styles.videoLabel}>Student</span>
    </div>
  );
}
