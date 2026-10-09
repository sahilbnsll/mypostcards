import Link from "next/link";
import { PageHead } from "@/components/ui/PageHead";

export default function NotFound() {
  return (
    <PageHead title="Lost in the post" lede="That page was not delivered. It may have moved, or it was never sent.">
      <p style={{ marginTop: "var(--s-5)" }}>
        <Link href="/" className="text-link">
          Back to the start
        </Link>
      </p>
    </PageHead>
  );
}
