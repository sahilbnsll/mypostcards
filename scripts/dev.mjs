/**
 * `npm run dev`: builds the content once, starts Next's dev server, and rebuilds the content
 * whenever you edit a file in content/ or add or change a photo in public/images/. Next then
 * hot-reloads the page. A mistake in your content prints a clear message here and keeps the last
 * good version on screen until you fix it.
 */
import { spawn } from "node:child_process";
import { existsSync, watch } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildContent } from "./build-content.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

try {
  await buildContent();
} catch (error) {
  console.error(`\n${error.message}\n`);
  process.exit(1);
}

const next = spawn(process.execPath, [join(root, "node_modules", "next", "dist", "bin", "next"), "dev", ...process.argv.slice(2)], {
  cwd: root,
  stdio: "inherit",
});
next.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => next.kill(signal));

let timer;
const rebuild = () => {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      await buildContent();
    } catch (error) {
      console.error(`\n${error.message}\n(keeping the last good content until this is fixed)\n`);
    }
  }, 300);
};

for (const dir of [join(root, "content"), join(root, "public", "images")]) {
  if (existsSync(dir)) watch(dir, { recursive: true }, rebuild);
}
