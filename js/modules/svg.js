/**
 * SVG Loader & Cache Utility
 * Fetches SVG files from assets/svgs/ and caches them for fast inline rendering
 */

const svgCache = new Map();

export async function getSvg(path) {
  if (!path) return "";
  if (svgCache.has(path)) return svgCache.get(path);

  try {
    const res = await fetch(path);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const svgText = await res.text();
    svgCache.set(path, svgText);
    return svgText;
  } catch (err) {
    console.error(`Error loading SVG from ${path}:`, err);
    return "";
  }
}
