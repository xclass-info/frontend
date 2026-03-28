import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import styles from "./AdPost.module.css";

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
];

const SUBJECTS = [
  "Early Reading & Phonics",
  "Basic Math",
  "Elementary Writing",
  "Elementary Science",
  "Elementary Social Studies",
  "Pre-Algebra",
  "Algebra I",
  "Algebra II",
  "Geometry",
  "Trigonometry",
  "Pre-Calculus",
  "Calculus",
  "Statistics",
  "AP Calculus AB",
  "AP Calculus BC",
  "AP Statistics",
  "Biology",
  "Chemistry",
  "Physics",
  "Earth Science",
  "Environmental Science",
  "Anatomy & Physiology",
  "AP Biology",
  "AP Chemistry",
  "AP Physics 1",
  "AP Physics 2",
  "AP Environmental Science",
  "English 9",
  "English 10",
  "English 11",
  "English 12",
  "Grammar & Writing",
  "Creative Writing",
  "Literature",
  "AP English Language & Composition",
  "AP English Literature & Composition",
  "World History",
  "US History",
  "Government & Politics",
  "Economics",
  "Psychology",
  "AP World History",
  "AP US History",
  "AP Psychology",
  "AP Human Geography",
  "Coding for Kids",
  "Python",
  "Java",
  "JavaScript",
  "Web Development",
  "AI & Machine Learning",
  "Data Science",
  "AP Computer Science A",
  "AP Computer Science Principles",
  "Spanish I",
  "Spanish II",
  "French I",
  "French II",
  "Chinese (Mandarin) I",
  "Chinese (Mandarin) II",
  "German I",
  "Japanese I",
  "Korean I",
  "SAT Prep",
  "ACT Prep",
  "PSAT Prep",
  "AP Exam Prep",
  "Study Skills",
  "Homework Help",
  "Special Education",
  "ESL / English as Second Language",
  "College Counseling",
];

function formatUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

export default function AdPost() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [page, setPage] = useState(0);
  const [fading, setFading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterClassType, setFilterClassType] = useState("");

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
    if (filteredPosts.length <= POSTS_PER_PAGE) return;
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setPage((prev) => (prev + 1) % totalPages);
        setFading(false);
      }, 400);
    }, 6000);
    return () => clearInterval(interval);
  }, [posts, search, filterState, filterCity, filterSubject, filterClassType]);

  function handleDotClick(i) {
    setFading(true);
    setTimeout(() => {
      setPage(i);
      setFading(false);
    }, 400);
  }

  function clearFilters() {
    setSearch("");
    setFilterState("");
    setFilterCity("");
    setFilterSubject("");
    setFilterClassType("");
    setPage(0);
  }

  // Filter logic
  const filteredPosts = posts.filter((p) => {
    const searchLower = search.toLowerCase();
    const matchSearch =
      !search ||
      (p.title && p.title.toLowerCase().includes(searchLower)) ||
      (p.message && p.message.toLowerCase().includes(searchLower));
    const matchState = !filterState || p.state === filterState;
    const matchCity =
      !filterCity ||
      (p.city && p.city.toLowerCase().includes(filterCity.toLowerCase()));
    const matchSubject = !filterSubject || p.subject === filterSubject;
    const matchClassType = !filterClassType || p.classType === filterClassType;
    return (
      matchSearch && matchState && matchCity && matchSubject && matchClassType
    );
  });

  if (loading) return null;

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const visiblePosts = filteredPosts.slice(
    page * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE + POSTS_PER_PAGE,
  );

  const hasActiveFilters =
    search || filterState || filterCity || filterSubject || filterClassType;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className='section-label'>
            📌 Resources, announcements and messages shared by our community
          </div>
          {/* <h3>
            Resources, announcements and messages shared by our community. 💬
          </h3> */}
          {/* <p className='section-sub'>
            Resources, announcements and messages shared by our community.
          </p> */}
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          {/* Search */}
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              placeholder='Search title or message...'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>

          {/* State */}
          <select
            className={styles.filterSelect}
            value={filterState}
            onChange={(e) => {
              setFilterState(e.target.value);
              setFilterCity("");
              setPage(0);
            }}
          >
            <option value=''>All States</option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>

          {/* City */}
          <input
            className={styles.filterInput}
            placeholder='City...'
            value={filterCity}
            onChange={(e) => {
              setFilterCity(e.target.value);
              setPage(0);
            }}
          />

          {/* Subject */}
          <select
            className={styles.filterSelect}
            value={filterSubject}
            onChange={(e) => {
              setFilterSubject(e.target.value);
              setPage(0);
            }}
          >
            <option value=''>All Subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Class Type */}
          <select
            className={styles.filterSelect}
            value={filterClassType}
            onChange={(e) => {
              setFilterClassType(e.target.value);
              setPage(0);
            }}
          >
            <option value=''>All Types</option>
            <option value='In-Person'>In-Person</option>
            <option value='Online'>Online</option>
            <option value='Both'>Both</option>
          </select>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button className={styles.clearBtn} onClick={clearFilters}>
              ✕ Clear
            </button>
          )}
        </div>

        {/* Results count */}
        {hasActiveFilters && (
          <p className={styles.resultsCount}>
            {filteredPosts.length} result{filteredPosts.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        )}

        {/* Empty state */}
        {filteredPosts.length === 0 ? (
          <div className={styles.empty}>
            <p>😔 No ads found matching your filters.</p>
            <button className={styles.clearBtn} onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div
              className={`${styles.grid} ${fading ? styles.fadeOut : styles.fadeIn}`}
            >
              {visiblePosts.map((p) => (
                <div key={p.id} className={styles.card}>
                  {p.title && <div className={styles.cardTitle}>{p.title}</div>}
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.name}
                      className={styles.image}
                      onClick={() => setSelectedImage(p.image)}
                    />
                  )}
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
                    {p.subject && (
                      <span className={styles.subject}>📖 {p.subject}</span>
                    )}
                    {p.classType && (
                      <span className={styles.classType}>🏫 {p.classType}</span>
                    )}
                    {(p.city || p.state) && (
                      <span className={styles.location}>
                        📍 {p.city}
                        {p.city && p.state ? ", " : ""}
                        {p.state}
                      </span>
                    )}
                  </div>
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
          </>
        )}
      </div>

      {/* Lightbox */}
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
