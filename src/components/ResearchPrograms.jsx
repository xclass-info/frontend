// src/components/ResearchPrograms.jsx
import { useNavigate } from "react-router-dom";

const programs = [
  {
    id: "ai-cs",
    emoji: "🤖",
    title: "AI & Computer Science",
    description:
      "Explore machine learning, deep learning, computer vision, NLP and cutting-edge AI applications that are reshaping the world.",
    topics: [
      "Machine Learning",
      "Computer Vision",
      "Natural Language Processing",
      "Robotics AI",
      "Data Science",
    ],
    color: "#00274c",
    accent: "#ffcb05",
  },
  {
    id: "public-health",
    emoji: "🏥",
    title: "Public Health",
    description:
      "Investigate disease prevention, health policy, epidemiology and global health challenges that affect millions of lives.",
    topics: [
      "Epidemiology",
      "Health Policy",
      "Disease Prevention",
      "Mental Health",
      "Global Health",
    ],
    color: "#166534",
    accent: "#bbf7d0",
  },
  {
    id: "bioinformatics",
    emoji: "🧬",
    title: "Bioinformatics",
    description:
      "Decode the language of life — from genomics and proteomics to drug discovery using computational biology tools.",
    topics: [
      "Genomics",
      "Proteomics",
      "Drug Discovery",
      "Cancer Research",
      "Precision Medicine",
    ],
    color: "#7c2d12",
    accent: "#fed7aa",
  },
  {
    id: "ee-robotics",
    emoji: "⚡",
    title: "Electrical Engineering & Robotics",
    description:
      "Design intelligent systems, autonomous robots, smart devices and next-generation hardware for real-world impact.",
    topics: [
      "Autonomous Systems",
      "IoT",
      "Signal Processing",
      "Embedded Systems",
      "Smart Devices",
    ],
    color: "#1e1b4b",
    accent: "#c7d2fe",
  },
];

export default function ResearchPrograms() {
  const navigate = useNavigate();

  return (
    <section style={{ padding: "80px 24px", background: "white" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              display: "inline-block",
              background: "#fff8dc",
              color: "#00274c",
              fontSize: 12,
              fontWeight: 700,
              padding: "4px 16px",
              borderRadius: 20,
              border: "1px solid #ffcb05",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Our Programs
          </div>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#00274c",
              marginBottom: 12,
            }}
          >
            🔬 Research Program Areas
          </h2>
          <p
            style={{
              color: "#64748b",
              fontSize: 15,
              maxWidth: 560,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Choose a research area that matches your passion and curiosity. Each
            program is led by PhD mentors from top universities.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 24,
          }}
        >
          {programs.map((program) => (
            <div
              key={program.id}
              onClick={() => navigate(`/programs/${program.id}`)}
              style={{
                background: "white",
                borderRadius: 16,
                padding: 28,
                border: `2px solid #e2e8f0`,
                cursor: "pointer",
                transition: "all 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,39,76,0.12)`;
                e.currentTarget.style.borderColor = "#ffcb05";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              {/* Color bar at top */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: program.color,
                }}
              />

              <div style={{ fontSize: 40, marginBottom: 16, marginTop: 8 }}>
                {program.emoji}
              </div>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#00274c",
                  marginBottom: 10,
                }}
              >
                {program.title}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#64748b",
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                {program.description}
              </p>

              {/* Topic tags */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 20,
                }}
              >
                {program.topics.map((topic) => (
                  <span
                    key={topic}
                    style={{
                      fontSize: 11,
                      background: "#f5f5f0",
                      color: "#00274c",
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontWeight: 600,
                    }}
                  >
                    {topic}
                  </span>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#00274c",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Explore Program <span style={{ color: "#ffcb05" }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
