import { StampArt } from "./StampArt";

/** The small mark for the header: the logo's stamp on its own. Colours are fixed; it is decorative. */
export function StampMark({ className }: { className?: string }) {
  return <StampArt className={className} />;
}
