/**
 * Shared setup for the live maps: OpenStreetMap data through MapLibre GL and OpenFreeMap, the same
 * combination as the author's portfolio. No account or API key is needed. The library is loaded
 * on demand, so pages without a live map never download it.
 */

// OpenFreeMap's "positron" is a pale, low-contrast base, so the routes and postcards stand out.
export const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

export const hasWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

export async function loadMapLibre() {
  const lib = await import("maplibre-gl");
  // The bundler cannot find the library's worker on its own, so point it at the file.
  lib.setWorkerUrl(new URL("../../../../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);
  return lib;
}

/** A photograph through the image optimiser, so a 2000 px picture is not downloaded for a 56 px marker. */
export const thumbUrl = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=128&q=75`;
