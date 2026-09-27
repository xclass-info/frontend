// src/components/CourseListing.jsx
import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import Navbar from "./Navbar";
import { SkeletonClassCard } from "./Skeleton";
import { useNavigate, Link } from "react-router-dom";
import Footer from "./Footer";
import { formatMentorName } from "../utils/mentorName";
import { seatsStatus, lessonWeekday } from "../utils/format";
import { GRADE_RANGE_OPTIONS } from "../utils/gradeRange";

const STATUS_BADGE = {
  registration: { label: "Registration", color: "#92400e", bg: "rgba(217,119,6,0.08)" },
  active: { label: "Active", color: "#166534", bg: "rgba(22,101,52,0.08)" },
  completed: { label: "Completed", color: "#1e40af", bg: "rgba(37,99,235,0.08)" },
};

const STATUS_OPTIONS = ["registration", "active", "completed"];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "seats", label: "Most Seats Available" },
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

export default function CourseListing() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [freeOnly, setFreeOnly] = useState(false);
  const [seatsOnly, setSeatsOnly] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState([...STATUS_OPTIONS]);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "classes"), (snap) => {
      setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    getDocs(collection(db, "teachers"))
      .then((snap) => {
        const map = {};
        snap.docs.forEach((d) => {
          map[d.id] = d.data().name;
        });
        setTeachers(map);
      })
      .catch((err) => console.error(err));
  }, []);

  function mentorName(c) {
    const liveName = teachers[c.teacherId];
    if (liveName) return formatMentorName(liveName);
    return c.teacherName && c.teacherName !== "Teacher"
      ? c.teacherName
      : "Mentor";
  }

  function mentorLabel(c) {
    const name = mentorName(c);
    if (!teachers[c.teacherId]) return name;
    return (
      <Link
        to={`/teacher/${c.teacherId}`}
        onClick={(e) => e.stopPropagation()}
        style={{ color: "#00274c", textDecoration: "underline" }}
      >
        {name}
      </Link>
    );
  }

  function toggleValue(list, setList, value) {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  }

  function clearFilters() {
    setSearch("");
    setSelectedGrades([]);
    setFreeOnly(false);
    setSeatsOnly(false);
    setSelectedStatuses([...STATUS_OPTIONS]);
    setSortBy("newest");
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = courses.filter((c) => {
      if (q) {
        const haystack = `${c.title} ${c.description || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (selectedGrades.length > 0 && !selectedGrades.includes(c.gradeLevel)) {
        return false;
      }
      if (freeOnly && c.price > 0) return false;
      if (seatsOnly) {
        const left = (c.maxSeats || 0) - (c.enrolledCount || 0);
        if (left <= 0) return false;
      }
      const status = c.status || "registration";
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(status)) {
        return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
      if (sortBy === "seats") {
        const leftA = (a.maxSeats || 0) - (a.enrolledCount || 0);
        const leftB = (b.maxSeats || 0) - (b.enrolledCount || 0);
        return leftB - leftA;
      }
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    });

    return list;
  }, [courses, search, selectedGrades, freeOnly, seatsOnly, selectedStatuses, sortBy]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
        <Navbar />
        <div
          style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 48px" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            {[1, 2, 3].map((i) => (
              <SkeletonClassCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <Navbar />
      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          padding: "100px 24px 48px",
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

          <p style={filterLabel}>Grade Level</p>
          {GRADE_RANGE_OPTIONS.map((g) => (
            <label key={g} style={checkboxRow}>
              <input
                type='checkbox'
                checked={selectedGrades.includes(g)}
                onChange={() => toggleValue(selectedGrades, setSelectedGrades, g)}
              />
              {g}
            </label>
          ))}

          <p style={filterLabel}>Price</p>
          <label style={checkboxRow}>
            <input
              type='checkbox'
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
            />
            Free only
          </label>

          <p style={filterLabel}>Availability</p>
          <label style={checkboxRow}>
            <input
              type='checkbox'
              checked={seatsOnly}
              onChange={(e) => setSeatsOnly(e.target.checked)}
            />
            Seats available
          </label>

          <p style={filterLabel}>Status</p>
          {STATUS_OPTIONS.map((s) => (
            <label key={s} style={checkboxRow}>
              <input
                type='checkbox'
                checked={selectedStatuses.includes(s)}
                onChange={() =>
                  toggleValue(selectedStatuses, setSelectedStatuses, s)
                }
              />
              {STATUS_BADGE[s].label}
            </label>
          ))}
        </aside>

        {/* Main content */}
        <div style={{ flex: "1 1 600px", minWidth: 0 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
              📚 Courses
            </h1>
            <p style={{ color: "#666", fontSize: "1rem" }}>
              Browse live online courses taught by our mentors.
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
              placeholder='Search courses...'
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
            {filtered.length} of {courses.length} course
            {courses.length === 1 ? "" : "s"} match your filters
          </p>

          {courses.length === 0 ? (
            <div style={{ textAlign: "center", color: "#aaa", padding: 40 }}>
              <p>😴 No courses posted yet. Check back soon!</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "#aaa", padding: 40 }}>
              <p>No courses match your filters.</p>
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 24,
              }}
            >
              {filtered.map((c) => {
                const badge = STATUS_BADGE[c.status] || STATUS_BADGE.registration;
                return (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/courses/${c.id}`)}
                    style={{
                      background: "white",
                      borderRadius: 16,
                      padding: 24,
                      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 12px rgba(0,0,0,0.07)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#333", margin: 0 }}>
                        {c.title}
                      </h3>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: badge.color,
                          background: badge.bg,
                          padding: "3px 10px",
                          borderRadius: 20,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {c.gradeLevel && (
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#00274c",
                          background: "#fff8dc",
                          border: "1px solid #ffcb05",
                          padding: "2px 10px",
                          borderRadius: 20,
                          marginBottom: 10,
                        }}
                      >
                        🎓 {c.gradeLevel}
                      </span>
                    )}

                    <p
                      style={{
                        fontSize: 13,
                        color: "#555",
                        margin: "0 0 16px",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {c.description}
                    </p>

                    {c.prerequisites && (
                      <p style={{ fontSize: 12, color: "#888", margin: "0 0 8px" }}>
                        ✅ Prerequisites: {c.prerequisites}
                      </p>
                    )}

                    {c.lessons?.length > 0 && (
                      <p style={{ fontSize: 12, color: "#666", margin: "0 0 8px" }}>
                        📅 {c.lessons[0].date} ({lessonWeekday(c.lessons[0].date)})
                        {c.lessons.length > 1 ? ` +${c.lessons.length - 1} more` : ""}
                      </p>
                    )}

                    <p style={{ fontSize: 12, color: "#666", margin: "0 0 4px" }}>
                      💰 {c.price > 0 ? `$${c.price}` : "Free"}
                    </p>

                    {c.maxSeats ? (
                      <p
                        style={{
                          fontSize: 12,
                          color: "#555",
                          fontWeight: 600,
                          margin: "0 0 12px",
                        }}
                      >
                        👥 {seatsStatus(c.maxSeats, c.enrolledCount)}
                      </p>
                    ) : null}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: 12, color: "#888" }}>
                        👩‍🏫 Mentored by: {mentorLabel(c)}
                      </span>
                      <span style={{ fontSize: 12, color: "#00274c", fontWeight: 600 }}>
                        Read more →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
