import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L, { ensureLeafletDraw } from "../../../lib/leafletDrawSetup";
import api, { saveDagGeometry } from "../../../api";

export default function AdminDrawMap() {
  const mapRef = useRef(null);
  const drawnLayerRef = useRef(null);

  const [dagNo, setDagNo] = useState("");
  const [dagId, setDagId] = useState("");
  const [zilId, setZilId] = useState("");
  const [surveyTypeId, setSurveyTypeId] = useState("");

  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await ensureLeafletDraw();
      console.log("Draw loaded?", !!L.Draw, L);
      setReady(!!L.Draw);
    })();
  }, []);

  // ready হলে তবেই কন্ট্রোল বসাও
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;

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

    map.on(L.Draw.Event.CREATED, (e) => {
      drawnItems.clearLayers();
      drawnItems.addLayer(e.layer);
    });

    return () => {
      // cleanup: কন্ট্রোল/লিসেনার রিমুভ
      map.off(L.Draw.Event.CREATED);
      try {
        map.removeControl(drawControl);
      } catch {
        /* empty */
      }
      try {
        map.removeLayer(drawnItems);
      } catch {
        /* empty */
      }
    };
  }, [ready]);

  const handleClear = () => drawnLayerRef.current?.clearLayers();

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
    if (dagId) return dagId;
    if (!dagNo) {
      alert("Please enter a Dag number (or provide an existing Dag ID).");
      throw new Error("Dag number missing");
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Admin token not found. Please login as admin.");
      throw new Error("Missing token");
    }
    const res = await api.post(
      "/admin/dags",
      {
        zil_id: zilId || null,
        dag_no: dagNo,
        survey_type_id: surveyTypeId || null,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const newId = res?.data?.id;
    if (!newId) throw new Error("Create Dag failed");
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
      const fc = { type: "FeatureCollection", features: [layer.toGeoJSON()] };
      const bbox = computeBBoxFromLayer(layer) || undefined;
      const id = await ensureDagExists();
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
    <div className="w-full h-screen relative z-0">
      {/* Floating form */}
      <div className="absolute z-[1000] bg-white/95 rounded-2xl shadow p-3 space-y-2 w-[330px]">
        <div className="text-sm font-semibold">Admin • Draw Dag Boundary</div>

        <button
          onClick={() => {
            if (!ready || !mapRef.current) return;
            const drawer = new L.Draw.Polygon(mapRef.current, {
              shapeOptions: { color: "#2563eb", weight: 3, fillOpacity: 0.2 },
              showArea: true,
              allowIntersection: false,
            });
            drawer.enable();
          }}
          className="bg-indigo-600 text-white px-3 py-2 rounded w-full"
          disabled={!ready}
          title={!ready ? "Loading draw tools..." : "Start drawing"}
        >
          {ready ? "Start Drawing (Polygon)" : "Loading draw tools..."}
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
            disabled={saving || !ready}
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
          created and geometry saved.
        </p>
      </div>

      {/* Map */}
      {ready && (
        <MapContainer
          className="h-[85vh] w-full rounded"
          center={[23.8041, 90.4152]}
          zoom={7}
          whenCreated={(map) => {
            mapRef.current = map;
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
        </MapContainer>
      )}
    </div>
  );
}
