"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitVisitorCard, type CardFormState } from "@/app/visitors/actions";
import { CARD_COLORS, KINDS, LIMITS, type CardColor, type CardKind, type Stroke } from "@/content/visitors-shared";
import { DrawingPad } from "./DrawingPad";
import styles from "./CardComposer.module.css";

const initial: CardFormState = { status: "idle" };

const COLOR_LABEL: Record<CardColor, string> = {
  paper: "White",
  sky: "Sky",
  rose: "Rose",
  sun: "Sun",
  mint: "Mint",
};

/**
 * The guest desk form: pick what the card is about, write, draw, or both, choose a paper colour
 * and send. The card is held for approval before it appears on the wall.
 */
export function CardComposer() {
  // Bumping this remounts the form, which is how "send another" starts from a clean card.
  const [round, setRound] = useState(0);
  return <ComposerForm key={round} onAnother={() => setRound((r) => r + 1)} />;
}

function ComposerForm({ onAnother }: { onAnother: () => void }) {
  const [state, action, pending] = useActionState(submitVisitorCard, initial);
  const [kind, setKind] = useState<CardKind>("hello");
  const [color, setColor] = useState<CardColor>("paper");
  const [message, setMessage] = useState("");
  // Controlled, because React clears uncontrolled fields after every submit, even a failed one.
  const [name, setName] = useState("");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [drawing, setDrawing] = useState(false);
  const mountedAt = useRef(0);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);
  const elapsed = useRef<HTMLInputElement>(null);

  const prompt = KINDS.find((k) => k.id === kind)?.prompt ?? "";
  const left = LIMITS.message - message.length;

  if (state.status === "success") {
    return (
      <div className={styles.thanks} role="status">
        <h2 className={styles.thanksTitle}>Your card is in the post</h2>
        <p>Thank you. It will appear on the wall once I have had a look at it.</p>
        <button type="button" className={styles.again} onClick={onAnother}>
          Write another
        </button>
      </div>
    );
  }

  return (
    <form
      className={styles.form}
      action={action}
      data-color={color}
      onSubmit={() => {
        // How long the card took to write. A script fills a form in instantly.
        if (elapsed.current) elapsed.current.value = String(Date.now() - mountedAt.current);
      }}
    >
      <fieldset className={styles.kinds}>
        <legend className={styles.legend}>What is your card about?</legend>
        {KINDS.map((k) => (
          <label key={k.id} className={styles.chip}>
            <input type="radio" name="kind" value={k.id} checked={kind === k.id} onChange={() => setKind(k.id)} />
            <span>{k.label}</span>
          </label>
        ))}
      </fieldset>

      <div className={styles.field}>
        <label htmlFor="card-message" className={styles.label}>
          Write something <span className={styles.optional}>(optional if you draw)</span>
        </label>
        <textarea
          id="card-message"
          name="message"
          className={styles.message}
          rows={4}
          maxLength={LIMITS.message}
          placeholder={prompt}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          aria-describedby="card-count"
        />
        <p id="card-count" className={styles.count} data-low={left < 30 || undefined}>
          {left} characters left
        </p>
      </div>

      <div className={styles.field}>
        <button type="button" className={styles.toggle} aria-expanded={drawing} aria-controls="card-drawing" onClick={() => setDrawing((d) => !d)}>
          {drawing ? "Hide the drawing pad" : strokes.length > 0 ? "Show your drawing" : "Or draw something"}
        </button>
        <div id="card-drawing" hidden={!drawing}>
          <DrawingPad strokes={strokes} onChange={setStrokes} />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="card-name" className={styles.label}>
            Your name <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="card-name"
            name="name"
            className={styles.input}
            type="text"
            maxLength={LIMITS.name}
            autoComplete="given-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <fieldset className={styles.colors}>
          <legend className={styles.label}>Paper</legend>
          <div className={styles.swatches}>
            {CARD_COLORS.map((name) => (
              <label key={name} className={styles.swatch} data-color={name}>
                <input type="radio" name="color" value={name} checked={color === name} onChange={() => setColor(name)} />
                <span className="visually-hidden">{COLOR_LABEL[name]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Not for people: a field only a script fills in. */}
      <div className={styles.trap} aria-hidden>
        <label>
          Leave this empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input ref={elapsed} type="hidden" name="elapsed" defaultValue="0" />
      <input type="hidden" name="drawing" value={strokes.length > 0 ? JSON.stringify(strokes) : ""} />

      {state.status === "error" && (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      )}

      <div className={styles.submitRow}>
        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? "Sending…" : "Send the card"}
        </button>
        <p className={styles.privacy}>
          Cards are read before they appear. I keep your card and the name you give, plus a one-day anonymous code used only to limit spam. Please leave links out.
        </p>
      </div>
    </form>
  );
}
