import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import styles from "./AdPost.module.css";
import { createPortal } from "react-dom";

function formatUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
}

export default function AdPost() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [page, setPage] = useState(0);
  const [fading, setFading] = useState(false);

  const POSTS_PER_PAGE = window.innerWidth <= 560 ? 2 : 6;

  useEffect(() => {
    const q = query(collection(db, "adposts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPosts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (posts.length <= POSTS_PER_PAGE) return;
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setPage((prev) => (prev + 1) % totalPages);
        setFading(false);
      }, 400);
    }, 6000);
    return () => clearInterval(interval);
  }, [posts]);

  function handleDotClick(i) {
    setFading(true);
    setTimeout(() => {
      setPage(i);
      setFading(false);
    }, 400);
  }

  if (loading || posts.length === 0) return null;

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const visiblePosts = posts.slice(
    page * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE + POSTS_PER_PAGE,
  );

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className='section-label'>📌 Community Ads</div>
          <h2>From our community 💬</h2>
          <p className='section-sub'>
            Resources, announcements and messages shared by our community.
          </p>
        </div>

        <div
          className={`${styles.grid} ${fading ? styles.fadeOut : styles.fadeIn}`}
        >
          {visiblePosts.map((p) => (
            <div key={p.id} className={styles.card}>
              {/* Title */}
              {p.title && <div className={styles.cardTitle}>{p.title}</div>}

              {/* Image */}
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name}
                  className={styles.image}
                  onClick={() => setSelectedImage(p.image)}
                />
              )}

              {/* Body */}
              <div className={styles.body}>
                {p.message && <p className={styles.message}>{p.message}</p>}
                {p.url && (
                  <a
                    href={formatUrl(p.url)}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={styles.url}
                  >
                    🔗 {p.url}
                  </a>
                )}
                {(p.city || p.state) && (
                  <span className={styles.location}>
                    📍 {p.city}
                    {p.city && p.state ? ", " : ""}
                    {p.state}
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className={styles.footer}>
                <div className={styles.contactLabel}>📬 Contact</div>
                <div className={styles.author}>
                  <div className={styles.avatar}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className={styles.name}>{p.name}</span>
                    <span className={styles.email}>{p.email}</span>
                    {p.phone && (
                      <span className={styles.phone}>📞 {p.phone}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        {totalPages > 1 && (
          <div className={styles.dots}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === page ? styles.dotActive : ""}`}
                onClick={() => handleDotClick(i)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedImage &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setSelectedImage(null)}
          >
            <button
              style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                zIndex: 100000,
                background: "#ff6b4a",
                border: "3px solid white",
                borderRadius: "50%",
                width: "56px",
                height: "56px",
                fontSize: "1.4rem",
                fontWeight: "800",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt='Full size'
              style={{
                maxWidth: "90vw",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: "20px",
                marginTop: "60px",
                boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body,
        )}
    </section>
  );
}
