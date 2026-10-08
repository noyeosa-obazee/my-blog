import styles from "./StatePanel.module.css";

const StatePanel = ({ variant = "empty", title, message, action }) => (
  <section
    className={`${styles.panel} ${styles[variant]}`}
    role={variant === "error" ? "alert" : "status"}
    aria-live={variant === "error" ? "assertive" : "polite"}
  >
    {variant === "loading" && (
      <span className={styles.spinner} aria-hidden="true" />
    )}
    <div className={styles.copy}>
      <h2 className={styles.title}>{title}</h2>
      {message && <p className={styles.message}>{message}</p>}
    </div>
    {action && <div className={styles.action}>{action}</div>}
  </section>
);

export default StatePanel;
