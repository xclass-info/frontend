// src/components/ProjectListing.jsx
import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import Navbar from "./Navbar";
import { SkeletonClassCard } from "./Skeleton";
import { useNavigate, Link } from "react-router-dom";
import Footer from "./Footer";
import { formatMentorName } from "../utils/mentorName";
import { seatsStatus } from "../utils/format";
import { GRADE_RANGE_OPTIONS } from "../utils/gradeRange";
import { DELIVERABLE_OPTIONS } from "../utils/deliverables";

const labelStyle = {
  fontSize: 12,
  color: "#aaa",
  margin: "0 0 4px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const clampStyle = (lines) => ({
  fontSize: 13,
  color: "#555",
  margin: 0,
  lineHeight: 1.5,
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});

const STAGE_BADGE = {
  active: { label: "Active", color: "#166534", bg: "rgba(22,101,52,0.08)" },
  completed: { label: "Completed", color: "#1e40af", bg: "rgba(37,99,235,0.08)" },
};
const STAGE_OPTIONS = ["active", "completed"];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
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

export default function ProjectListing() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [teachers, setTeachers] = useState({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedDeliverables, setSelectedDeliverables] = useState([]);
  const [seatsOnly, setSeatsOnly] = useState(false);
  const [selectedStages, setSelectedStages] = useState([...STAGE_OPTIONS]);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "projects"), (snap) => {
      setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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

  function mentorName(p) {
    const liveName = teachers[p.teacherId];
    if (liveName) return formatMentorName(liveName);
    return p.teacherName && p.teacherName !== "Teacher"
      ? p.teacherName
      : "Mentor";
  }

  function mentorLabel(p) {
    const name = mentorName(p);
    if (!teachers[p.teacherId]) return name;
    return (
      <Link
        to={`/teacher/${p.teacherId}`}
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
    setSelectedDeliverables([]);
    setSeatsOnly(false);
    setSelectedStages([...STAGE_OPTIONS]);
    setSortBy("newest");
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = projects.filter((p) => {
      if (q) {
        const haystack = `${p.title} ${p.description || ""} ${p.learning || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (selectedGrades.length > 0 && !selectedGrades.includes(p.gradeLevel)) {
        return false;
      }
      if (
        selectedDeliverables.length > 0 &&
        !selectedDeliverables.includes(p.deliverable)
      ) {
        return false;
      }
      if (seatsOnly) {
        const left = (p.seats || 0) - (p.enrolledCount || 0);
        if (left <= 0) return false;
      }
      const stage = p.stage || "active";
      if (selectedStages.length > 0 && !selectedStages.includes(stage)) {
        return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "seats") {
        const leftA = (a.seats || 0) - (a.enrolledCount || 0);
        const leftB = (b.seats || 0) - (b.enrolledCount || 0);
        return leftB - leftA;
      }
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    });

    return list;
  }, [projects, search, selectedGrades, selectedDeliverables, seatsOnly, selectedStages, sortBy]);

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

          <p style={filterLabel}>You'll Produce</p>
          {DELIVERABLE_OPTIONS.map((d) => (
            <label key={d} style={checkboxRow}>
              <input
                type='checkbox'
                checked={selectedDeliverables.includes(d)}
                onChange={() =>
                  toggleValue(selectedDeliverables, setSelectedDeliverables, d)
                }
              />
              {d}
            </label>
          ))}

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
          {STAGE_OPTIONS.map((s) => (
            <label key={s} style={checkboxRow}>
              <input
                type='checkbox'
                checked={selectedStages.includes(s)}
                onChange={() => toggleValue(selectedStages, setSelectedStages, s)}
              />
              {STAGE_BADGE[s].label}
            </label>
          ))}
        </aside>

        {/* Main content */}
        <div style={{ flex: "1 1 600px", minWidth: 0 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
              💡 Projects
            </h1>
            <p style={{ color: "#666", fontSize: "1rem" }}>
              Explore hands-on projects you can work on with our mentors.
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
              placeholder='Search projects...'
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
            {filtered.length} of {projects.length} project
            {projects.length === 1 ? "" : "s"} match your filters
          </p>

          {projects.length === 0 ? (
            <div style={{ textAlign: "center", color: "#aaa", padding: 40 }}>
              <p>😴 No projects posted yet. Check back soon!</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "#aaa", padding: 40 }}>
              <p>No projects match your filters.</p>
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
              {filtered.map((p) => {
                const stage = STAGE_BADGE[p.stage] || STAGE_BADGE.active;
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
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
                        {p.title}
                      </h3>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: stage.color,
                          background: stage.bg,
                          padding: "3px 10px",
                          borderRadius: 20,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {stage.label}
                      </span>
                    </div>

                    {p.gradeLevel && (
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
                          marginBottom: 12,
                        }}
                      >
                        🎓 {p.gradeLevel}
                      </span>
                    )}

                    <div style={{ marginBottom: 12 }}>
                      <p style={labelStyle}>Description</p>
                      <p style={clampStyle(3)}>{p.description}</p>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <p style={labelStyle}>What You'll Learn</p>
                      <p style={clampStyle(2)}>{p.learning}</p>
                    </div>

                    {p.deliverable && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "#166534",
                          fontWeight: 600,
                          margin: "0 0 8px",
                        }}
                      >
                        📦 You'll produce: {p.deliverable}
                      </p>
                    )}

                    {p.prerequisites && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "#888",
                          margin: "0 0 8px",
                        }}
                      >
                        ✅ Prerequisites: {p.prerequisites}
                      </p>
                    )}

                    {p.seats ? (
                      <p
                        style={{
                          fontSize: 12,
                          color: "#555",
                          fontWeight: 600,
                          margin: "0 0 12px",
                        }}
                      >
                        👥 {seatsStatus(p.seats, p.enrolledCount)}
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
                        👩‍🏫 Mentored by: {mentorLabel(p)}
                      </span>
                      <span
                        style={{ fontSize: 12, color: "#00274c", fontWeight: 600 }}
                      >
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
