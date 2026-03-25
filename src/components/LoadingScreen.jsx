import { useEffect, useState } from "react";
import styles from "./LoadingScreen.module.css";

export default function LoadingScreen() {
  const [hiding, setHiding] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHiding(true), 1800);
    const t2 = setTimeout(() => setGone(true), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div className={`${styles.screen} ${hiding ? styles.hide : ""}`}>
      <div className={styles.logo}>💻 Xclass</div>
      <div className={styles.dots}>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
