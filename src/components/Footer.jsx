import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <a href='#' className={styles.logo}>
        Happy Programming
      </a>
      <p>© 2026 Happy Programming · Falls Church, VA</p>
      <div className={styles.links}>
        {["#courses", "#pricing", "#private", "#about", "#faq", "#contact"].map(
          (href) => (
            <a key={href} href={href}>
              {href.replace("#", "")}
            </a>
          ),
        )}
      </div>
    </footer>
  );
}
