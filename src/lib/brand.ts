import { COLORS } from "@/components/brand/stampGeometry";
import { stampSvg } from "@/components/brand/stampSvg";

/** The site's own colours, for places that cannot read the theme (share images). */
export const BRAND = {
  ink: COLORS.ink,
  inkSoft: "#3a465a",
  red: COLORS.red,
  blue: COLORS.blue,
  paper: "#eceeea",
  card: COLORS.paper,
} as const;

const svgUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

/** The full mark (the stamp with its cancellation waves), as a data URI. */
export async function logoDataUri(): Promise<string> {
  return svgUri(stampSvg({ waves: true, wavesColor: COLORS.ink }));
}

/** The stamp on its own, as a data URI. */
export function stampMarkDataUri(): string {
  return svgUri(stampSvg());
}
