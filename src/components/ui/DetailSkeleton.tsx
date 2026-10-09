import styles from "./DetailSkeleton.module.css";

/** Shown while a trip, place, café or story resolves its URL data. Shaped like the real header. */
export function DetailSkeleton() {
  return (
    <div className="wrap" aria-busy="true">
      <div className={styles.head}>
        <span className={`${styles.bar} ${styles.small}`} />
        <span className={`${styles.bar} ${styles.title}`} />
        <span className={`${styles.bar} ${styles.lede}`} />
      </div>
      <div className={styles.cover} />
      <p className="visually-hidden" role="status">
        Loading
      </p>
    </div>
  );
}
