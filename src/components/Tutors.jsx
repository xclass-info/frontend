// src/components/Tutors.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import styles from "./Tutors.module.css";
import { SkeletonCard } from "./Skeleton";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import InitialsAvatar from "./InitialsAvatar";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "name", label: "Name (A-Z)" },
];

const checkboxRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 14,
  color: "#333",
  marginBottom: 8,
  cursor: "pointer",
};

const filterLabel = {
  fontSize: 13,
  fontWeight: 700,
  color: "#00274c",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  margin: "20px 0 10px",
};

function featuredSort(a, b) {
  if (a.name?.toLowerCase().includes("wu")) return -1;
  if (b.name?.toLowerCase().includes("wu")) return 1;
  if (a.name?.toLowerCase().includes("pan")) return 1;
  if (b.name?.toLowerCase().includes("pan")) return -1;
  return 0;
}

export default function Tutors({ standalone = false }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  const [search, setSearch] = useState("");
  const [selectedDegrees, setSelectedDegrees] = useState([]);
  const [selectedMajors, setSelectedMajors] = useState([]);
  const [selectedResearchAreas, setSelectedResearchAreas] = useState([]);
  const [sortBy, setSortBy] = useState("featured");
  const [visibleCount, setVisibleCount] = useState(20);

  // Self-contained scroll-fade-in for this section's own .reveal elements -
  // this component is used both embedded on the homepage (which sets up its
  // own page-wide observer) and standalone at /tutors (which has no such
  // observer), so it can't rely on a parent to make its cards visible.
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    root.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, teachers]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "teachers"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const filtered = data.filter((t) => !t.disabled);
      filtered.sort(featuredSort);
      setTeachers(filtered);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const degreeOptions = useMemo(
    () => [...new Set(teachers.map((t) => t.degree).filter(Boolean))].sort(),
    [teachers],
  );

  const majorOptions = useMemo(
    () => [...new Set(teachers.map((t) => t.major).filter(Boolean))].sort(),
    [teachers],
  );

  const researchAreaOptions = useMemo(
    () => [...new Set(teachers.map((t) => t.researchArea).filter(Boolean))].sort(),
    [teachers],
  );

  function toggleValue(list, setList, value) {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  }

  function clearFilters() {
    setSearch("");
    setSelectedDegrees([]);
    setSelectedMajors([]);
    setSelectedResearchAreas([]);
    setSortBy("featured");
  }

  const filteredTeachers = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = teachers.filter((t) => {
      if (q) {
        const haystack = `${t.name || ""} ${t.expertise || ""} ${t.bio || ""} ${t.major || ""} ${t.researchArea || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (selectedDegrees.length > 0 && !selectedDegrees.includes(t.degree)) {
        return false;
      }
      if (selectedMajors.length > 0 && !selectedMajors.includes(t.major)) {
        return false;
      }
      if (
        selectedResearchAreas.length > 0 &&
        !selectedResearchAreas.includes(t.researchArea)
      ) {
        return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      return featuredSort(a, b);
    });

    return list;
  }, [
    teachers,
    search,
    selectedDegrees,
    selectedMajors,
    selectedResearchAreas,
    sortBy,
  ]);

  // Reset pagination back to the first page whenever the filtered set changes,
  // so "Show more" doesn't leave a stale page depth after a new search/filter.
  useEffect(() => {
    setVisibleCount(20);
  }, [search, selectedDegrees, selectedMajors, selectedResearchAreas, sortBy]);

  const visibleTeachers = filteredTeachers.slice(0, visibleCount);

  function renderCard(teacher) {
    return (
      <div
        key={teacher.id}
        className={`${styles.card} reveal`}
        onClick={() => navigate(`/teacher/${teacher.id}`)}
        style={{ cursor: "pointer" }}
      >
        {/* Avatar */}
        <div className={styles.avatarWrapper}>
          {teacher.photoURL ? (
            <img
              src={teacher.photoURL}
              alt={teacher.name}
              className={styles.avatar}
            />
          ) : (
            <InitialsAvatar
              name={teacher.name}
              seed={teacher.id}
              className={styles.avatar}
              fontSize='2.5rem'
            />
          )}
        </div>

        <h1 style={{ margin: "0 0 8px", fontSize: 26 }}>
          {teacher.name?.startsWith("Prof.")
            ? teacher.name?.split(" ").slice(0, 2).join(" ")
            : teacher.name?.startsWith("Dr.")
              ? `Dr. ${teacher.name?.split(" ").pop()}`
              : `Dr. ${teacher.name?.split(" ").pop()}`}
        </h1>

        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          {teacher.gender && (
            <span
              style={{
                fontSize: 11,
                background: "#f0f4ff",
                color: "#00274c",
                padding: "2px 10px",
                borderRadius: 20,
                fontWeight: 600,
              }}
            >
              {teacher.gender === "Male" ? "👨" : "👩"} {teacher.gender}
            </span>
          )}
          {teacher.degree && (
            <span
              style={{
                fontSize: 11,
                background: "#f0fdf4",
                color: "#16a34a",
                padding: "2px 10px",
                borderRadius: 20,
                fontWeight: 600,
              }}
            >
              🎓 {teacher.degree}
            </span>
          )}
        </div>
        {teacher.major && (
          <span
            style={{
              fontSize: 11,
              background: "#fdf4ff",
              color: "#9333ea",
              padding: "2px 10px",
              borderRadius: 20,
              fontWeight: 600,
            }}
          >
            🔬 {teacher.major}
          </span>
        )}

        {teacher.expertise && (
          <p
            style={{
              fontSize: 13,
              color: "#555",
              marginBottom: 6,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            💡 {teacher.expertise}
          </p>
        )}

        {teacher.bio && <p className={styles.bio}>{teacher.bio}</p>}

        {teacher.projects && teacher.projects.length > 0 && (
          <p
            style={{
              fontSize: 12,
              color: "#888",
              marginBottom: 6,
              textAlign: "center",
            }}
          >
            💡 {teacher.projects.length} project idea
            {teacher.projects.length > 1 ? "s" : ""} available
          </p>
        )}

        <p style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>
          Click to view full profile →
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        {standalone && <Navbar />}
        <section id='tutors' ref={sectionRef} className={styles.section}>
          <div className={styles.inner}>
            <div className={`${styles.header} reveal`}>
              <h2 className={styles.title}>👩‍🏫 Meet Our Mentors</h2>
              <p className={styles.sub}>
                Expert mentors ready to help you learn anything.
              </p>
            </div>
            <div className={styles.grid}>
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </section>
        {standalone && <Footer />}
      </>
    );
  }

  if (!standalone) {
    return (
      <section id='tutors' ref={sectionRef} className={styles.section}>
        <div className={styles.inner}>
          <div className={`${styles.header} reveal`}>
            <h2 className={styles.title}>Meet Our Research Mentors</h2>
            <p className={styles.sub}>
              Join world-class researchers and explore cutting-edge research
              topics that match your passion, curiosity, and future ambitions.
            </p>
          </div>

          {teachers.length === 0 ? (
            <div className={styles.empty}>
              <p>😴 No tutors registered yet. Check back soon!</p>
            </div>
          ) : (
            <div className={styles.grid}>{teachers.map(renderCard)}</div>
          )}
        </div>
      </section>
    );
  }

  return (
    <>
      <Navbar />
      <section id='tutors' ref={sectionRef} className={styles.section}>
        <div
          style={{
            maxWidth: 1300,
            margin: "0 auto",
            display: "flex",
            gap: 32,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* Filters sidebar */}
          <aside
            style={{
              width: 240,
              flexShrink: 0,
              background: "white",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16 }}>Filters</h3>
              <button
                onClick={clearFilters}
                style={{
                  background: "none",
                  border: "none",
                  color: "#00274c",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Clear all
              </button>
            </div>

            {degreeOptions.length > 0 && (
              <>
                <p style={filterLabel}>Degree</p>
                {degreeOptions.map((d) => (
                  <label key={d} style={checkboxRow}>
                    <input
                      type='checkbox'
                      checked={selectedDegrees.includes(d)}
                      onChange={() =>
                        toggleValue(selectedDegrees, setSelectedDegrees, d)
                      }
                    />
                    {d}
                  </label>
                ))}
              </>
            )}

            {majorOptions.length > 0 && (
              <>
                <p style={filterLabel}>Major</p>
                <div
                  style={{
                    maxHeight: 180,
                    overflowY: "auto",
                    paddingRight: 4,
                  }}
                >
                  {majorOptions.map((m) => (
                    <label key={m} style={checkboxRow}>
                      <input
                        type='checkbox'
                        checked={selectedMajors.includes(m)}
                        onChange={() =>
                          toggleValue(selectedMajors, setSelectedMajors, m)
                        }
                      />
                      {m}
                    </label>
                  ))}
                </div>
              </>
            )}

            {researchAreaOptions.length > 0 && (
              <>
                <p style={filterLabel}>Research Area</p>
                <div
                  style={{
                    maxHeight: 180,
                    overflowY: "auto",
                    paddingRight: 4,
                  }}
                >
                  {researchAreaOptions.map((r) => (
                    <label key={r} style={checkboxRow}>
                      <input
                        type='checkbox'
                        checked={selectedResearchAreas.includes(r)}
                        onChange={() =>
                          toggleValue(
                            selectedResearchAreas,
                            setSelectedResearchAreas,
                            r,
                          )
                        }
                      />
                      {r}
                    </label>
                  ))}
                </div>
              </>
            )}
          </aside>

          {/* Main content */}
          <div style={{ flex: "1 1 600px", minWidth: 0 }}>
            <div className={`${styles.header} reveal`} style={{ marginBottom: 24 }}>
              <h2 className={styles.title}>Meet Our Research Mentors</h2>
              <p className={styles.sub}>
                Join world-class researchers and explore cutting-edge research
                topics that match your passion, curiosity, and future
                ambitions.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <input
                type='text'
                placeholder='Search mentors...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: "1 1 260px",
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  fontSize: 14,
                  background: "white",
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    Sort: {o.label}
                  </option>
                ))}
              </select>
            </div>

            <p style={{ color: "#888", fontSize: 13, margin: "0 0 20px" }}>
              {filteredTeachers.length} of {teachers.length} mentor
              {teachers.length === 1 ? "" : "s"} match your filters
            </p>

            {teachers.length === 0 ? (
              <div className={styles.empty}>
                <p>😴 No tutors registered yet. Check back soon!</p>
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className={styles.empty}>
                <p>No mentors match your filters.</p>
                <button
                  onClick={clearFilters}
                  style={{
                    marginTop: 12,
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "#00274c",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  {visibleTeachers.map(renderCard)}
                </div>
                {visibleCount < filteredTeachers.length && (
                  <div style={{ textAlign: "center", marginTop: 32 }}>
                    <button
                      onClick={() => setVisibleCount((c) => c + 20)}
                      style={{
                        padding: "12px 32px",
                        borderRadius: 10,
                        border: "2px solid #00274c",
                        background: "white",
                        color: "#00274c",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Show more (
                      {filteredTeachers.length - visibleCount} more)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
