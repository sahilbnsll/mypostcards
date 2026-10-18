import { Children } from "react";
import type { ReactNode } from "react";
import styles from "./StoryGrid.module.css";

/** The stories page: the first story as a wide lead, the rest as covers beside and below it. */
export function StoryGrid({ children }: { children: ReactNode }) {
  return (
    <ul role="list" className={styles.grid}>
      {Children.map(children, (child, index) => (
        <li key={index}>{child}</li>
      ))}
    </ul>
  );
}
