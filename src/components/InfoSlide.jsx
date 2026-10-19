// A one-glance visual summary ("slide") for a research/project detail
// page - synthesized entirely from the post's own fields (title,
// idea/description, grade level, deliverable, schedule), not a separate
// downloadable file. Sits above the detailed Idea/Impact/Schedule sections.
import { TopicIcon } from "../utils/topicIcons";
import { LESSON_STRUCTURE_LABEL } from "../utils/format";
import { locationLabel } from "../utils/schedule";

function FactChip({ label, value }) {
  if (!value) return null;
  return (
    <div
      style={{
        background: "white",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "8px 14px",
        minWidth: 120,
      }}
    >
      <p
        style={{
          margin: "0 0 2px",
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--muted)",
        }}
      >
        {label}
      </p>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
        {value}
      </p>
    </div>
  );
}

export default function InfoSlide({ kind, item }) {
  const summary = kind === "research" ? item.idea : item.description;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, var(--primary-soft), white)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 28,
        marginBottom: 28,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <TopicIcon seed={item.id} size={56} />
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--accent)",
            }}
          >
            {kind === "research" ? "Research Overview" : "Project Overview"}
          </p>
          <h2
            style={{
              margin: "2px 0 0",
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: 24,
              color: "var(--text)",
            }}
          >
            {item.title}
          </h2>
        </div>
      </div>

      {summary && (
        <p style={{ margin: 0, fontSize: 15, color: "var(--muted)", lineHeight: 1.6 }}>
          {summary}
        </p>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <FactChip label="Grade Level" value={item.gradeLevel} />
        <FactChip label="You'll Produce" value={item.deliverable} />
        <FactChip label="Format" value={LESSON_STRUCTURE_LABEL} />
        {item.scheduleLocation && (
          <FactChip label="Location" value={locationLabel(item.scheduleLocation)} />
        )}
      </div>
    </div>
  );
}
