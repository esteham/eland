import { useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";
import api, { saveDagGeometry } from "../../../api";

export default function AdminDrawMap() {
  const mapRef = useRef(null);
  const drawnLayerRef = useRef(null);

  // Form state
  const [dagNo, setDagNo] = useState("");
  const [dagId, setDagId] = useState(""); // optional: if existing Dag already created
  const [zilId, setZilId] = useState("");
  const [surveyTypeId, setSurveyTypeId] = useState("");

  const [saving, setSaving] = useState(false);

  // Initialize Leaflet Draw controls
  const initDrawControls = (map) => {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnLayerRef.current = drawnItems;

    const drawControl = new L.Control.Draw({
      position: "topleft",
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          metric: true,
          shapeOptions: { color: "#2563eb", weight: 3, fillOpacity: 0.2 },
        },
        marker: false,
        circle: false,
        circlemarker: false,
        rectangle: false,
        polyline: false,
      },
      edit: { featureGroup: drawnItems },
    });
    map.addControl(drawControl);

    // Ensure only one polygon at a time
    map.on(L.Draw.Event.CREATED, (e) => {
      drawnItems.clearLayers();
      drawnItems.addLayer(e.layer);
    });
  };

  const handleClear = () => {
    const fg = drawnLayerRef.current;
    if (fg) fg.clearLayers();
  };

  // Compute a simple bbox from a drawn polygon layer
  const computeBBoxFromLayer = (layer) => {
    const ring = layer.getLatLngs()?.[0] || [];
    const lats = ring.map((p) => p.lat);
    const lngs = ring.map((p) => p.lng);
    if (!lats.length || !lngs.length) return null;
    return [
      Math.min(...lngs),
      Math.min(...lats),
      Math.max(...lngs),
      Math.max(...lats),
    ];
  };

  const ensureDagExists = async () => {
    // If dagId is given, use it; else create a minimal Dag on server
    if (dagId) return dagId;

    if (!dagNo) {
      alert("Please enter a Dag number (or provide an existing Dag ID).");
      throw new Error("Dag number missing");
    }

    // Create a minimal Dag via your existing Admin Dag resource
    // POST /api/admin/dags  (resource already registered in your routes)
    const payload = {
      zil_id: zilId || null,
      dag_no: dagNo,
      survey_type_id: surveyTypeId || null,
      // other optional fields can be omitted
    };

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Admin token not found. Please login as admin.");
      throw new Error("Missing token");
    }

    const res = await api.post("/admin/dags", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const newId = res?.data?.id;
    if (!newId) {
      alert("Dag create failed. Check server response/logs.");
      throw new Error("Create Dag failed");
    }
    setDagId(String(newId));
    return String(newId);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const fg = drawnLayerRef.current;
      if (!fg || fg.getLayers().length === 0) {
        alert("Please draw a polygon for the Dag boundary.");
        return;
      }
      const layer = fg.getLayers()[0];

      // Build GeoJSON FeatureCollection
      const feature = layer.toGeoJSON(); // Feature (Polygon)
      const fc = { type: "FeatureCollection", features: [feature] };

      // Compute bbox (server will also compute/validate)
      const bbox = computeBBoxFromLayer(layer) || undefined;

      // 1) Ensure a Dag record exists (create if needed)
      const id = await ensureDagExists();

      // 2) Save geometry to your dedicated endpoint
      await saveDagGeometry(id, { geojson: fc, bbox });

      alert("Geometry saved ✅");
    } catch (err) {
      console.error(err);
      alert("Save failed. See console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full h-screen">
      {/* Floating form */}
      <div className="absolute top-22 left-83 bg-white/95 rounded-2xl shadow p-3 space-y-2 w-[330px]">
        <div className="text-sm font-semibold">Admin • Draw Dag Boundary</div>
        <button
          onClick={() => {
            const map = mapRef.current;
            if (!map) return;
            const drawer = new L.Draw.Polygon(map, {
              shapeOptions: { color: "#2563eb", weight: 3, fillOpacity: 0.2 },
              showArea: true,
              allowIntersection: false,
            });
            drawer.enable(); // ← ড্র-মোড অন
          }}
          className="bg-indigo-600 text-white px-3 py-2 rounded w-full"
        >
          Start Drawing (Polygon)
        </button>
        <div className="grid grid-cols-2 gap-2">
          <input
            className="border p-2 rounded"
            placeholder="Dag number"
            value={dagNo}
            onChange={(e) => setDagNo(e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Existing Dag ID (optional)"
            value={dagId}
            onChange={(e) => setDagId(e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Zil ID (optional)"
            value={zilId}
            onChange={(e) => setZilId(e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Survey Type ID (optional)"
            value={surveyTypeId}
            onChange={(e) => setSurveyTypeId(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded w-full"
          >
            {saving ? "Saving..." : "Save Boundary"}
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded"
            title="Clear drawn polygon"
          >
            Clear
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Draw a polygon on the map. If no Dag ID provided, a Dag record will be
          created using the Dag number (and optional Zil/Survey IDs), then the
          geometry will be saved.
        </p>
      </div>

      {/* Map */}
      <MapContainer
        className="h-[85vh] w-[800px] left-82 rounded"
        center={[23.8041, 90.4152]}
        zoom={7}
        whenCreated={(map) => {
          mapRef.current = map;
          initDrawControls(map);
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
      </MapContainer>
    </div>
  );
}
