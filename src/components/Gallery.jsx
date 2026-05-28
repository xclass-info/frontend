import { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const photosByYear = {
  2026: [
    { url: "/gallery/2026/Image_20260528091845.jpg", caption: "Lab session" },
    { url: "/gallery/2026/Image_20260528091856.jpg", caption: "Lab session" },
    { url: "/gallery/2026/Image_20260528091927.jpg", caption: "Lab session" },
    { url: "/gallery/2026/Image_20260528091933.jpg", caption: "Lab session" },
    { url: "/gallery/2026/Image_20260528091940.jpg", caption: "Lab session" },
    { url: "/gallery/2026/Image_20260528091946.jpg", caption: "Lab session" },
    { url: "/gallery/2026/Image_20260528091951.jpg", caption: "Lab session" },
  ],
  2025: [
    { url: "/gallery/2025/4633.jpeg", caption: "Research workshop" },
    { url: "/gallery/2025/4634.jpeg", caption: "Student presentation" },
    { url: "/gallery/2025/4635.jpeg", caption: "Lab session" },
    { url: "/gallery/2025/4636.jpeg", caption: "Lab session" },
  ],
  2024: [],
  2023: [{ url: "/gallery/2023/4634.jpeg", caption: "Student presentation" }],
  2022: [
    { url: "/gallery/2022/20220701.png", caption: "Lab session" },
    { url: "/gallery/2022/20220711.png", caption: "Lab session" },
  ],
};

const videos = [
  {
    url: "https://www.youtube.com/embed/G1IM1_tz-qQ",
    caption: "Introduction to HappyResearch",
  },
];

function PhotoCarousel({ photos, onPhotoClick }) {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);
  const perPage = 3;
  const totalPages = Math.ceil(photos.length / perPage);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalPages);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [totalPages]);

  function goTo(index) {
    setCurrent(index);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalPages);
    }, 3000);
  }

  function prev() {
    goTo((current - 1 + totalPages) % totalPages);
  }

  function next() {
    goTo((current + 1) % totalPages);
  }

  if (photos.length === 0) return null;

  return (
    <div>
      {/* Sliding container */}
      <div style={{ overflow: "hidden", borderRadius: 16 }}>
        <div
          style={{
            display: "flex",
            transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            transform: `translateX(-${current * 100}%)`,
          }}
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div
              key={pageIndex}
              style={{
                minWidth: "100%",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
                padding: "4px",
              }}
            >
              {photos
                .slice(pageIndex * perPage, pageIndex * perPage + perPage)
                .map((photo, index) => (
                  <div
                    key={index}
                    onClick={() => onPhotoClick(photo)}
                    style={{
                      position: "relative",
                      cursor: "pointer",
                      borderRadius: 12,
                      overflow: "hidden",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                      transition: "transform 0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-4px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      style={{
                        width: "100%",
                        height: 280,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    {photo.caption && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background:
                            "linear-gradient(transparent, rgba(0,0,0,0.6))",
                          padding: "24px 12px 10px",
                          color: "white",
                          fontSize: 13,
                        }}
                      >
                        {photo.caption}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          marginTop: 16,
        }}
      >
        <button
          onClick={prev}
          style={{
            background: "#f0f4ff",
            border: "none",
            borderRadius: "50%",
            width: 40,
            height: 40,
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#4a90e2",
            fontWeight: 700,
          }}
        >
          ‹
        </button>

        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              style={{
                width: index === current ? 20 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background: index === current ? "#4a90e2" : "#ddd",
                cursor: "pointer",
                transition: "all 0.3s",
                padding: 0,
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          style={{
            background: "#f0f4ff",
            border: "none",
            borderRadius: "50%",
            width: 40,
            height: 40,
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#4a90e2",
            fontWeight: 700,
          }}
        >
          ›
        </button>

        <span style={{ fontSize: 13, color: "#aaa" }}>
          {current * perPage + 1}–
          {Math.min(current * perPage + perPage, photos.length)} of{" "}
          {photos.length}
        </span>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [tab, setTab] = useState("photos");
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <Navbar />
      <div
        style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 48px" }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
            🖼️ Gallery
          </h1>
          <p style={{ color: "#666" }}>
            Moments from our research programs, internships and student
            journeys.
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          {[
            { id: "photos", label: "📷 Photos" },
            { id: "videos", label: "🎥 Videos" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "8px 24px",
                borderRadius: 20,
                border: "none",
                background: tab === t.id ? "#4a90e2" : "#e0e0e0",
                color: tab === t.id ? "white" : "#555",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Photos Tab */}
        {tab === "photos" && (
          <div>
            {Object.entries(photosByYear)
              .sort(([a], [b]) => b - a)
              .map(([year, photos]) => (
                <div key={year} style={{ marginBottom: 48 }}>
                  {/* Year header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      marginBottom: 20,
                    }}
                  >
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
                      🗂️ {year}
                    </h2>
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background: "#eee",
                        borderRadius: 2,
                      }}
                    />
                    <span style={{ fontSize: 13, color: "#aaa" }}>
                      {photos.length} photo{photos.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {photos.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 40,
                        color: "#aaa",
                        background: "white",
                        borderRadius: 12,
                        border: "1px dashed #ddd",
                      }}
                    >
                      <p style={{ fontSize: 14, margin: 0 }}>
                        No photos for {year} yet.
                      </p>
                    </div>
                  ) : (
                    <PhotoCarousel
                      photos={photos}
                      onPhotoClick={(photo) =>
                        setSelected({ type: "photo", ...photo })
                      }
                    />
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Videos Tab */}
        {tab === "videos" && (
          <div>
            {videos.length === 0 ? (
              <div style={{ textAlign: "center", padding: 80, color: "#aaa" }}>
                <p style={{ fontSize: 48, marginBottom: 12 }}>🎥</p>
                <p style={{ fontSize: 16 }}>No videos yet. Check back soon!</p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: 16,
                }}
              >
                {videos.map((video, index) => (
                  <div
                    key={index}
                    style={{
                      borderRadius: 12,
                      overflow: "hidden",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                      background: "white",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        paddingBottom: "56.25%",
                        height: 0,
                      }}
                    >
                      <iframe
                        src={video.url}
                        title={video.caption}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          border: "none",
                        }}
                        allowFullScreen
                      />
                    </div>
                    {video.caption && (
                      <div style={{ padding: "12px 16px" }}>
                        <p style={{ margin: 0, fontSize: 13, color: "#555" }}>
                          {video.caption}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Photo lightbox modal */}
      {selected && selected.type === "photo" && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 800, width: "100%" }}
          >
            <img
              src={selected.url}
              alt={selected.caption}
              style={{
                width: "100%",
                borderRadius: 12,
                objectFit: "contain",
                maxHeight: "80vh",
              }}
            />
            {selected.caption && (
              <p
                style={{
                  color: "white",
                  textAlign: "center",
                  marginTop: 12,
                  fontSize: 14,
                }}
              >
                {selected.caption}
              </p>
            )}
            <button
              onClick={() => setSelected(null)}
              style={{
                display: "block",
                margin: "16px auto 0",
                padding: "8px 24px",
                borderRadius: 8,
                border: "none",
                background: "white",
                color: "#333",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
