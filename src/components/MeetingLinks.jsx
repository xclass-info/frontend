import { useState } from "react";

const meetingRooms = [
  {
    id: 1,
    name: "Room 1",
    url: "https://happyresearch.daily.co/happyresearch-1",
  },
  {
    id: 2,
    name: "Room 2",
    url: "https://happyresearch.daily.co/happyresearch-2",
  },
  {
    id: 3,
    name: "Room 3",
    url: "https://happyresearch.daily.co/happyresearch-3",
  },
  {
    id: 4,
    name: "Room 4",
    url: "https://happyresearch.daily.co/happyresearch-4",
  },
  {
    id: 5,
    name: "Room 5",
    url: "https://happyresearch.daily.co/happyresearch-5",
  },
  {
    id: 6,
    name: "Room 6",
    url: "https://happyresearch.daily.co/happyresearch-6",
  },
  {
    id: 7,
    name: "Room 7",
    url: "https://happyresearch.daily.co/happyresearch-7",
  },
  {
    id: 8,
    name: "Room 8",
    url: "https://happyresearch.daily.co/happyresearch-8",
  },
  {
    id: 9,
    name: "Room 9",
    url: "https://happyresearch.daily.co/happyresearch-9",
  },
  {
    id: 10,
    name: "Room 10",
    url: "https://happyresearch.daily.co/happyresearch-10",
  },
];

export default function MeetingLinks() {
  const [copied, setCopied] = useState(null);

  function copyLink(id, url) {
    const message = `Join my HappyResearch session!\n\n🔗 Link: ${url}\n🔐 Password: happy\n\nSee you there!`;
    navigator.clipboard.writeText(message);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <h2 style={{ color: "#00274c", marginBottom: 8 }}>🎥 Meeting Rooms</h2>
      <div
        style={{
          background: "#fff8dc",
          border: "2px solid #ffcb05",
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <p
          style={{ fontSize: 14, color: "#00274c", fontWeight: 600, margin: 0 }}
        >
          🔐 Password for all rooms:{" "}
          <span
            style={{
              fontSize: 18,
              letterSpacing: 4,
              background: "#ffcb05",
              padding: "2px 12px",
              borderRadius: 8,
              marginLeft: 8,
            }}
          >
            happy
          </span>
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 16,
        }}
      >
        {meetingRooms.map((room) => (
          <div
            key={room.id}
            style={{
              background: "white",
              borderRadius: 12,
              padding: 20,
              border: "2px solid #e2e8f0",
              borderTop: "4px solid #00274c",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h3 style={{ color: "#00274c", margin: 0, fontSize: 16 }}>
                🎥 {room.name}
              </h3>
              <span
                style={{
                  fontSize: 11,
                  background: "#f0fdf4",
                  color: "#166534",
                  padding: "2px 10px",
                  borderRadius: 20,
                  fontWeight: 600,
                }}
              >
                Ready
              </span>
            </div>

            <p
              style={{
                fontSize: 12,
                color: "#64748b",
                marginBottom: 12,
                wordBreak: "break-all",
              }}
            >
              {room.url}
            </p>

            <div style={{ display: "flex", gap: 8 }}>
              <a
                href={room.url}
                target='_blank'
                rel='noopener noreferrer'
                style={{
                  flex: 1,
                  textAlign: "center",
                  background: "#00274c",
                  color: "#ffcb05",
                  padding: "8px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                Start →
              </a>
              <button
                onClick={() => copyLink(room.id, room.url)}
                style={{
                  flex: 1,
                  background: copied === room.id ? "#27ae60" : "#f0f4ff",
                  color: copied === room.id ? "white" : "#00274c",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {copied === room.id ? "✅ Copied!" : "📋 Copy Link"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
