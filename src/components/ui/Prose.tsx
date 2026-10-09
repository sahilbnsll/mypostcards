import styles from "./Prose.module.css";

/**
 * Renders long-form text stored as plain strings: paragraphs separated by a blank line, and a
 * line starting with "## " as a subheading. No markdown parser needed.
 */
export function Prose({ text }: { text: string }) {
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className={styles.prose}>
      {blocks.map((block, index) =>
        block.startsWith("## ") ? (
          <h2 key={index}>{block.slice(3)}</h2>
        ) : (
          <p key={index}>{block}</p>
        ),
      )}
    </div>
  );
}
