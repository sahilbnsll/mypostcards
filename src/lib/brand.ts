import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** The logo colours, for places that cannot read the theme (share images). */
export const BRAND = {
  green: "#264a3a",
  clay: "#b35a31",
  ink: "#4b3e38",
  cream: "#f4eee0",
} as const;

const svgUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

/** The full mark (stamp, camera, postmark waves) in the brand colours, as a data URI. */
export async function logoDataUri(): Promise<string> {
  return svgUri(await readFile(join(process.cwd(), "public", "brand", "logo.svg"), "utf8"));
}

/** The small stamp-and-camera mark, as a data URI. */
export function stampMarkDataUri(): string {
  const holes: string[] = [];
  for (let i = 0; i < 8; i++) holes.push(`<circle cx="${4 + i * 8}" cy="0" r="2.6"/><circle cx="${4 + i * 8}" cy="78" r="2.6"/>`);
  for (let i = 0; i < 10; i++) holes.push(`<circle cx="0" cy="${4 + i * 8}" r="2.6"/><circle cx="64" cy="${4 + i * 8}" r="2.6"/>`);
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 78"><defs><mask id="m"><rect width="64" height="78" fill="#fff"/><g fill="#000">${holes.join("")}</g></mask></defs>` +
      `<rect width="64" height="78" fill="${BRAND.green}" mask="url(#m)"/>` +
      `<g fill="none" stroke="${BRAND.cream}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><rect x="13" y="31" width="38" height="25" rx="5"/><path d="M22.5 31 25 25h14l2.5 6"/><circle cx="32" cy="43.5" r="7"/></g>` +
      `<circle cx="32" cy="43.5" r="2.6" fill="${BRAND.clay}"/></svg>`,
  );
}
