// src/components/Skeleton.jsx
import styles from "./Skeleton.module.css";

export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.avatar} />
      <div className={styles.line} style={{ width: "60%", marginBottom: 8 }} />
      <div className={styles.line} style={{ width: "90%", marginBottom: 6 }} />
      <div className={styles.line} style={{ width: "80%", marginBottom: 6 }} />
      <div className={styles.line} style={{ width: "40%" }} />
    </div>
  );
}

export function SkeletonClassCard() {
  return (
    <div className={styles.card}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div className={styles.badge} />
        <div className={styles.badge} />
      </div>
      <div
        className={styles.line}
        style={{ width: "70%", height: 22, marginBottom: 10 }}
      />
      <div className={styles.line} style={{ width: "100%", marginBottom: 6 }} />
      <div className={styles.line} style={{ width: "85%", marginBottom: 16 }} />
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div className={styles.line} style={{ width: "30%" }} />
        <div className={styles.line} style={{ width: "30%" }} />
        <div className={styles.line} style={{ width: "30%" }} />
      </div>
      <div className={styles.btn} />
    </div>
  );
}

export function SkeletonDashboardCard() {
  return (
    <div className={styles.card}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div className={styles.line} style={{ width: "50%", height: 20 }} />
        <div className={styles.badge} />
      </div>
      <div className={styles.line} style={{ width: "90%", marginBottom: 8 }} />
      <div className={styles.line} style={{ width: "60%", marginBottom: 16 }} />
      <div className={styles.btn} />
    </div>
  );
}
