import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

export async function ensureLeafletDraw() {
  if (L.Draw) return;
  if (typeof window !== "undefined") {
    window.L = L;
  }
  await import("leaflet-draw");
}

export default L;
