import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import styles from "./Classroom.module.css";
import SERVER_URL from "../config"; // adjust path if needed

const socket = io(SERVER_URL, {
  transports: ["websocket", "polling"],
});

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function Classroom() {
  const { classId } = useParams();
  const roomName = `xc${classId.slice(-8)}`;

  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef(null);
  const localStream = useRef(null);
  const peers = useRef({});  // { sid: RTCPeerConnection }

  // Temporary hardcoded user until auth is ready
  const user = { id: "u1", name: "Teacher", role: "instructor" };

  useEffect(() => {
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("room-state", async ({ participants, chat }) => {
      setParticipants(participants);
      setChat(chat);
      // Create offers to all existing participants
      for (const p of participants) {
        await createOffer(p.sid);
      }
    });

    socket.on("user-joined", async ({ user: newUser }) => {
      setParticipants((prev) => [...prev, newUser]);
      // New user joined — they will send us an offer, we wait
    });

    socket.on("user-left", ({ sid }) => {
      setParticipants((prev) => prev.filter((p) => p.sid !== sid));
      peers.current[sid]?.close();
      delete peers.current[sid];
    });

    socket.on("chat-message", (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    // ── WebRTC signaling events ──────────────────────────────────

    socket.on("webrtc-offer", async ({ offer, fromSid, fromUser }) => {
      const peer = createPeer(fromSid);
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("webrtc-answer", { targetSid: fromSid, answer });
    });

    socket.on("webrtc-answer", async ({ answer, fromSid }) => {
      await peers.current[fromSid]?.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("webrtc-ice-candidate", async ({ candidate, fromSid }) => {
      try {
        await peers.current[fromSid]?.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (e) {
        console.error("ICE candidate error:", e);
      }
    });

    return () => socket.off();
  }, []);

  // ── WebRTC helpers ─────────────────────────────────────────────

  function createPeer(targetSid) {
    const peer = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to the peer connection
    localStream.current?.getTracks().forEach((track) => {
      peer.addTrack(track, localStream.current);
    });

    // Send ICE candidates to the other peer
    peer.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit("webrtc-ice-candidate", { targetSid, candidate });
      }
    };

    // When remote video/audio arrives, attach to video element
    peer.ontrack = ({ streams }) => {
      const remoteVideo = document.getElementById(`video-${targetSid}`);
      if (remoteVideo) remoteVideo.srcObject = streams[0];
    };

    peer.onconnectionstatechange = () => {
      console.log(`Peer ${targetSid} state:`, peer.connectionState);
    };

    peers.current[targetSid] = peer;
    return peer;
  }

  async function createOffer(targetSid) {
    const peer = createPeer(targetSid);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit("webrtc-offer", {
      targetSid,
      offer,
      fromUser: user,
    });
  }

  // ── Room actions ───────────────────────────────────────────────

  async function joinRoom() {
    // 1. Get camera + mic
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Could not access camera/microphone: " + err.message);
      return;
    }

    // 2. Join the signaling room
    socket.emit("join-room", { roomId: roomName, user });
    setJoined(true);
  }

  function leaveRoom() {
    socket.emit("leave-room", { roomId: roomName, userId: user.id });
    localStream.current?.getTracks().forEach((t) => t.stop());
    Object.values(peers.current).forEach((p) => p.close());
    peers.current = {};
    setJoined(false);
    setParticipants([]);
    setChat([]);
  }

  function toggleMute() {
    localStream.current?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsMuted((prev) => !prev);
  }

  function toggleVideo() {
    localStream.current?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsVideoOff((prev) => !prev);
  }

  async function shareScreen() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getTracks()[0];

      // Replace video track in all peer connections
      Object.values(peers.current).forEach((peer) => {
        const sender = peer.getSenders().find((s) => s.track?.kind === "video");
        sender?.replaceTrack(screenTrack);
      });

      // Also show locally
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      // When screen sharing stops, switch back to camera
      screenTrack.onended = () => {
        const cameraTrack = localStream.current?.getVideoTracks()[0];
        Object.values(peers.current).forEach((peer) => {
          const sender = peer.getSenders().find((s) => s.track?.kind === "video");
          sender?.replaceTrack(cameraTrack);
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream.current;
        }
      };
    } catch (err) {
      console.error("Screen share error:", err);
    }
  }

  function sendMessage() {
    if (!message.trim()) return;
    socket.emit("chat-message", {
      roomId: roomName,
      user,
      text: message,
      time: new Date().toISOString(),
    });
    setMessage("");
  }

  // ── UI ─────────────────────────────────────────────────────────

  if (!connected) {
    return <div style={{ padding: 32 }}>⏳ Connecting to meeting server...</div>;
  }

  if (!joined) {
    return (
      <div style={{ padding: 32 }}>
        <h2>Room: {roomName}</h2>
        <p>✅ Server connected</p>
        <button onClick={joinRoom}>Join Meeting</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#1a1a1a", color: "white" }}>

      {/* ── Video Grid ── */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8, padding: 8, alignContent: "start" }}>

        {/* Local video */}
        <div style={{ position: "relative", background: "#333", borderRadius: 8, overflow: "hidden" }}>
          <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "100%", display: "block" }} />
          <span style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.6)", padding: "2px 8px", borderRadius: 4, fontSize: 13 }}>
            {user.name} (You)
          </span>
        </div>

        {/* Remote videos */}
        {participants.map((p) => (
          <div key={p.sid} style={{ position: "relative", background: "#333", borderRadius: 8, overflow: "hidden" }}>
            <video
              id={`video-${p.sid}`}
              autoPlay
              playsInline
              style={{ width: "100%", display: "block" }}
            />
            <span style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.6)", padding: "2px 8px", borderRadius: 4, fontSize: 13 }}>
              {p.name}
            </span>
          </div>
        ))}
      </div>

      {/* ── Chat Sidebar ── */}
      <div style={{ width: 280, background: "#2a2a2a", display: "flex", flexDirection: "column", padding: 12 }}>
        <h3 style={{ margin: "0 0 12px" }}>Chat</h3>
        <div style={{ flex: 1, overflowY: "auto", marginBottom: 8 }}>
          {chat.map((msg, i) => (
            <div key={i} style={{ marginBottom: 8, fontSize: 14 }}>
              <strong style={{ color: "#adf" }}>{msg.userName}:</strong> {msg.text}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            style={{ flex: 1, padding: 8, borderRadius: 4, border: "none", background: "#444", color: "white" }}
          />
          <button onClick={sendMessage} style={{ padding: "8px 12px", borderRadius: 4, border: "none", background: "#4a90e2", color: "white", cursor: "pointer" }}>
            Send
          </button>
        </div>
      </div>

      {/* ── Controls Bar ── */}
      <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 12, background: "#333", padding: "12px 24px", borderRadius: 32, zIndex: 10 }}>
        <button onClick={toggleMute} style={{ padding: "8px 16px", borderRadius: 20, border: "none", background: isMuted ? "#e74c3c" : "#555", color: "white", cursor: "pointer" }}>
          {isMuted ? "🔇 Unmute" : "🎤 Mute"}
        </button>
        <button onClick={toggleVideo} style={{ padding: "8px 16px", borderRadius: 20, border: "none", background: isVideoOff ? "#e74c3c" : "#555", color: "white", cursor: "pointer" }}>
          {isVideoOff ? "📷 Start Video" : "📹 Stop Video"}
        </button>
        <button onClick={shareScreen} style={{ padding: "8px 16px", borderRadius: 20, border: "none", background: "#555", color: "white", cursor: "pointer" }}>
          🖥️ Share Screen
        </button>
        <button onClick={leaveRoom} style={{ padding: "8px 16px", borderRadius: 20, border: "none", background: "#e74c3c", color: "white", cursor: "pointer" }}>
          📵 Leave
        </button>
      </div>

    </div>
  );
}