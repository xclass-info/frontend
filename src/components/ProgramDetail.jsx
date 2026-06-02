// src/components/ProgramDetail.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Navbar from "./Navbar";
import Footer from "./Footer";

const programData = {
  "ai-cs": {
    emoji: "🤖",
    title: "AI & Computer Science",
    description:
      "Artificial Intelligence and Computer Science represent the frontier of modern research. Our mentors work on cutting-edge projects in machine learning, computer vision, natural language processing and autonomous systems.",
    color: "#00274c",
    highlights: [
      {
        icon: "🧠",
        title: "Machine Learning",
        desc: "Build models that learn from data to make predictions and decisions.",
      },
      {
        icon: "👁️",
        title: "Computer Vision",
        desc: "Teach computers to understand and interpret visual information.",
      },
      {
        icon: "💬",
        title: "Natural Language Processing",
        desc: "Enable machines to understand and generate human language.",
      },
      {
        icon: "🤖",
        title: "Robotics & AI",
        desc: "Design intelligent autonomous systems for real-world applications.",
      },
    ],
  },
  "public-health": {
    emoji: "🏥",
    title: "Public Health",
    description:
      "Public health research addresses some of the most pressing challenges facing humanity — from pandemic preparedness to mental health crises. Our mentors work on evidence-based solutions that save lives.",
    color: "#166534",
    highlights: [
      {
        icon: "🦠",
        title: "Epidemiology",
        desc: "Study how diseases spread and develop strategies to control them.",
      },
      {
        icon: "🧪",
        title: "Disease Prevention",
        desc: "Develop interventions that prevent illness before it occurs.",
      },
      {
        icon: "🧠",
        title: "Mental Health",
        desc: "Research mental health challenges and evidence-based treatments.",
      },
      {
        icon: "🌍",
        title: "Global Health",
        desc: "Address health disparities and challenges across the world.",
      },
    ],
  },
  bioinformatics: {
    emoji: "🧬",
    title: "Bioinformatics",
    description:
      "Bioinformatics sits at the intersection of biology and computer science, using computational tools to decode the mysteries of life. From cancer genomics to drug discovery, our mentors lead transformative research.",
    color: "#7c2d12",
    highlights: [
      {
        icon: "🧬",
        title: "Genomics",
        desc: "Analyze DNA sequences to understand genetic diseases and evolution.",
      },
      {
        icon: "💊",
        title: "Drug Discovery",
        desc: "Use computational methods to identify promising drug candidates.",
      },
      {
        icon: "🎯",
        title: "Precision Medicine",
        desc: "Develop personalized treatments based on individual genetic profiles.",
      },
      {
        icon: "🔬",
        title: "Cancer Research",
        desc: "Study cancer at the molecular level to develop better treatments.",
      },
    ],
  },
  "ee-robotics": {
    emoji: "⚡",
    title: "Electrical Engineering & Robotics",
    description:
      "Electrical Engineering and Robotics combine hardware and software to create intelligent systems that interact with the physical world. Our mentors design autonomous robots, smart devices and next-generation electronics.",
    color: "#1e1b4b",
    highlights: [
      {
        icon: "🤖",
        title: "Autonomous Systems",
        desc: "Design robots and vehicles that operate independently.",
      },
      {
        icon: "📡",
        title: "IoT & Smart Devices",
        desc: "Connect everyday objects to the internet for smarter living.",
      },
      {
        icon: "📊",
        title: "Signal Processing",
        desc: "Analyze and interpret signals from sensors and communication systems.",
      },
      {
        icon: "💡",
        title: "Embedded Systems",
        desc: "Program microcontrollers and hardware for real-world applications.",
      },
    ],
  },
};

export default function ProgramDetail() {
  const { programId } = useParams();
  const navigate = useNavigate();
  const program = programData[programId];

  const [mentors, setMentors] = useState([]);
  const [internships, setInternships] = useState([]);
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!program) return;

    const keywords = {
      "ai-cs": [
        "computer",
        "ai",
        "machine learning",
        "data",
        "software",
        "computing",
        "algorithm",
        "neural",
        "deep learning",
        "statistics",
        "llm",
        "vision",
        "language model",
      ],
      "public-health": [
        "health",
        "medical",
        "medicine",
        "biology",
        "public health",
        "epidemiology",
        "clinical",
        "nursing",
        "pharmacy",
      ],
      bioinformatics: [
        "bio",
        "genomic",
        "genetic",
        "bioinformatics",
        "protein",
        "molecular",
        "cancer",
        "drug",
        "sequencing",
      ],
      "ee-robotics": [
        "electrical",
        "robot",
        "embedded",
        "signal",
        "hardware",
        "iot",
        "electronic",
        "circuit",
        "mechanical",
        "control system",
      ],
    };

    // Load mentors
    const mentorUnsub = onSnapshot(collection(db, "teachers"), (snap) => {
      const all = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => !t.disabled);
      setMentors(
        all.filter((t) => {
          const fields =
            `${t.major} ${t.expertise} ${t.researchArea}`.toLowerCase();
          return keywords[programId]?.some((kw) => fields.includes(kw));
        }),
      );
    });

    // Load internships
    const internUnsub = onSnapshot(
      query(collection(db, "internships"), where("status", "==", "open")),
      (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setInternships(
          all.filter((i) => {
            const fields =
              `${i.field} ${i.title} ${i.description}`.toLowerCase();
            return keywords[programId]?.some((kw) => fields.includes(kw));
          }),
        );
      },
    );

    // Load research
    const researchUnsub = onSnapshot(
      query(collection(db, "research"), where("status", "==", "published")),
      (snap) => {
        setResearch(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
    );

    return () => {
      mentorUnsub();
      internUnsub();
      researchUnsub();
    };
  }, [programId]);

  if (!program) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Navbar />
        <div style={{ padding: "120px 24px", textAlign: "center" }}>
          <p>Program not found.</p>
          <button
            onClick={() => navigate("/")}
            style={{
              marginTop: 16,
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background: "#00274c",
              color: "white",
              cursor: "pointer",
            }}
          >
            ← Back to Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0" }}>
      <Navbar />

      {/* Hero */}
      <div
        style={{
          background: program.color,
          padding: "100px 24px 60px",
          textAlign: "center",
          color: "white",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "white",
            padding: "6px 16px",
            borderRadius: 20,
            cursor: "pointer",
            fontSize: 13,
            marginBottom: 24,
            display: "inline-block",
          }}
        >
          ← Back
        </button>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{program.emoji}</div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: 12 }}>
          {program.title}
        </h1>
        <p
          style={{
            fontSize: 15,
            opacity: 0.85,
            maxWidth: 600,
            margin: "0 auto",
            lineHeight: 1.7,
          }}
        >
          {program.description}
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
        {/* Highlights */}
        <div style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#00274c",
              marginBottom: 24,
            }}
          >
            📚 Research Directions
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {program.highlights.map((h) => (
              <div
                key={h.title}
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: 24,
                  border: "2px solid #e2e8f0",
                  borderTop: `4px solid ${program.color}`,
                  position: "relative",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#ffcb05";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(0,39,76,0.12)";
                  e.currentTarget.querySelector(".hover-panel").style.opacity =
                    "1";
                  e.currentTarget.querySelector(
                    ".hover-panel",
                  ).style.transform = "translateY(0)";
                  e.currentTarget.querySelector(
                    ".hover-panel",
                  ).style.pointerEvents = "auto";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.querySelector(".hover-panel").style.opacity =
                    "0";
                  e.currentTarget.querySelector(
                    ".hover-panel",
                  ).style.transform = "translateY(8px)";
                  e.currentTarget.querySelector(
                    ".hover-panel",
                  ).style.pointerEvents = "none";
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{h.icon}</div>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#00274c",
                    marginBottom: 6,
                  }}
                >
                  {h.title}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#64748b",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {h.desc}
                </p>

                {/* Hover panel */}
                <div
                  className='hover-panel'
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    right: 0,
                    background: "#00274c",
                    borderRadius: 12,
                    padding: 16,
                    zIndex: 10,
                    opacity: 0,
                    transform: "translateY(8px)",
                    transition: "all 0.25s ease",
                    pointerEvents: "none",
                    boxShadow: "0 8px 24px rgba(0,39,76,0.2)",
                    borderTop: "3px solid #ffcb05",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      color: "#ffcb05",
                      fontWeight: 700,
                      marginBottom: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Related Research
                  </p>
                  {research
                    .filter(
                      (r) =>
                        r.title
                          ?.toLowerCase()
                          .includes(h.title.toLowerCase()) ||
                        r.idea?.toLowerCase().includes(h.title.toLowerCase()) ||
                        r.title
                          ?.toLowerCase()
                          .includes(h.title.split(" ")[0].toLowerCase()),
                    )
                    .slice(0, 3)
                    .map((r) => (
                      <div
                        key={r.id}
                        style={{
                          marginBottom: 8,
                          paddingBottom: 8,
                          borderBottom: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 12,
                            color: "white",
                            fontWeight: 600,
                            margin: "0 0 2px",
                            lineHeight: 1.4,
                          }}
                        >
                          {r.title}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.6)",
                            margin: 0,
                            lineHeight: 1.4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {r.idea}
                        </p>
                      </div>
                    ))}
                  {research.filter(
                    (r) =>
                      r.title?.toLowerCase().includes(h.title.toLowerCase()) ||
                      r.idea?.toLowerCase().includes(h.title.toLowerCase()) ||
                      r.title
                        ?.toLowerCase()
                        .includes(h.title.split(" ")[0].toLowerCase()),
                  ).length === 0 && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.5)",
                        margin: 0,
                      }}
                    >
                      Explore our research page for related topics →
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mentors */}
        <div style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#00274c",
              marginBottom: 24,
            }}
          >
            👩‍🏫 Related Mentors
          </h2>
          {mentors.length === 0 ? (
            <div
              style={{
                background: "white",
                borderRadius: 12,
                padding: 32,
                textAlign: "center",
                color: "#aaa",
                border: "1px dashed #ddd",
              }}
            >
              <p>
                Browse all our mentors to find the right match for your
                interests.
              </p>
              <button
                onClick={() => navigate("/tutors")}
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
                Browse All Mentors
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 16,
              }}
            >
              {mentors.map((mentor) => (
                <div
                  key={mentor.id}
                  onClick={() => navigate(`/teacher/${mentor.id}`)}
                  style={{
                    background: "white",
                    borderRadius: 12,
                    padding: 20,
                    border: "2px solid #e2e8f0",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#ffcb05";
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {mentor.photoURL ? (
                    <img
                      src={mentor.photoURL}
                      alt={mentor.name}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginBottom: 12,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "#00274c",
                        color: "#ffcb05",
                        fontSize: 28,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                      }}
                    >
                      {mentor.name
                        ?.split(" ")
                        .slice(-1)[0]
                        ?.charAt(0)
                        .toUpperCase() || "T"}
                    </div>
                  )}
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#00274c",
                      marginBottom: 4,
                    }}
                  >
                    {mentor.name?.startsWith("Prof.")
                      ? mentor.name?.split(" ").slice(0, 2).join(" ")
                      : `Dr. ${mentor.name?.split(" ").pop()}`}
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      margin: "0 0 6px",
                    }}
                  >
                    {mentor.university}
                  </p>
                  {mentor.major && (
                    <span
                      style={{
                        fontSize: 11,
                        background: "#fff8dc",
                        color: "#00274c",
                        padding: "2px 10px",
                        borderRadius: 20,
                        fontWeight: 600,
                      }}
                    >
                      {mentor.major}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Internships */}
        <div style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#00274c",
              marginBottom: 24,
            }}
          >
            🧪 Related Internships
          </h2>
          {internships.length === 0 ? (
            <div
              style={{
                background: "white",
                borderRadius: 12,
                padding: 32,
                textAlign: "center",
                color: "#aaa",
                border: "1px dashed #ddd",
              }}
            >
              <p>Browse all internships to find opportunities in this area.</p>
              <button
                onClick={() => navigate("/internship")}
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
                Browse All Internships
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 16,
              }}
            >
              {internships.map((intern) => (
                <div
                  key={intern.id}
                  style={{
                    background: "white",
                    borderRadius: 12,
                    padding: 20,
                    border: "2px solid #e2e8f0",
                    borderTop: `4px solid ${program.color}`,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#00274c",
                      marginBottom: 6,
                    }}
                  >
                    {intern.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#00274c",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    🔬 {intern.field}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      marginBottom: 12,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.5,
                    }}
                  >
                    {intern.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      color: "#888",
                    }}
                  >
                    <span>⏱ {intern.duration}</span>
                    <span style={{ color: "#e74c3c" }}>
                      📅 {intern.deadline}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div
          style={{
            background: "#00274c",
            borderRadius: 16,
            padding: 40,
            textAlign: "center",
            borderTop: "4px solid #ffcb05",
          }}
        >
          <h2
            style={{
              color: "white",
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Ready to Start?
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              marginBottom: 24,
              lineHeight: 1.7,
            }}
          >
            Apply for an internship or book a session with one of our{" "}
            {program.title} mentors today.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => navigate("/internship")}
              style={{
                padding: "12px 28px",
                borderRadius: 24,
                border: "none",
                background: "#ffcb05",
                color: "#00274c",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              🧪 Browse Internships
            </button>
            <button
              onClick={() => navigate("/tutors")}
              style={{
                padding: "12px 28px",
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.3)",
                background: "transparent",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              👩‍🏫 Meet Mentors
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
