/* eslint-disable no-empty */
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api, { saveDagGeometry } from "../../../api";

export default function AdminDrawMap() {
  // Map refs/layers
  const mapRef = useRef(null);
  const polygonLayerRef = useRef(null);
  const markerPreviewRef = useRef(null);
  const linePreviewRef = useRef(null);

  // Business fields
  const [dagNo, setDagNo] = useState("");
  const [khatianNo, setKhatianNo] = useState("");
  const [surveyTypeId, setSurveyTypeId] = useState("");

  // Per-input coordinate fields (typed separately)
  const [lng, setLng] = useState("");
  const [lat, setLat] = useState("");
  const [points, setPoints] = useState([]); // [{lng,lat}, ...]

  const [saving, setSaving] = useState(false);

  // ---------- helpers ----------
  const isValidLng = (v) => v >= -180 && v <= 180;
  const isValidLat = (v) => v >= -90 && v <= 90;

  // Build a Polygon FeatureCollection from points (auto-close ring)
  const buildGeoJSON = () => {
    if (points.length < 3) return null;
    const ringLngLat = points.map((p) => [p.lng, p.lat]); // [lng,lat]
    const first = ringLngLat[0];
    const last = ringLngLat[ringLngLat.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      ringLngLat.push([first[0], first[1]]); // close ring
    }
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            dag_no: dagNo || null,
            khatian_no: khatianNo || null,
            survey_type_id: surveyTypeId || null,
            source: "manual-points",
          },
          geometry: {
            type: "Polygon",
            coordinates: [ringLngLat],
          },
        },
      ],
    };
  };

  const bboxFromGeoJSON = (gj) => {
    try {
      const b = L.geoJSON(gj).getBounds();
      if (!b.isValid()) return null;
      return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]; // [minLng,minLat,maxLng,maxLat]
    } catch {
      return null;
    }
  };

  // Ensure a Dag exists (returns id). Adjust payload to match your backend rules.
  const ensureDagExists = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Missing admin token.");
    if (!dagNo) throw new Error("Please enter a Dag number.");

    const res = await api.post(
      "/admin/dags",
      {
        dag_no: dagNo,
        khatian_no: khatianNo || null,
        survey_type_id: surveyTypeId || null,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const id = res?.data?.id;
    if (!id) throw new Error("Create Dag failed");
    return String(id);
  };

  // ---------- live preview while typing single lng/lat ----------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // remove previous temp marker
    if (markerPreviewRef.current) {
      try {
        map.removeLayer(markerPreviewRef.current);
      } catch {}
      markerPreviewRef.current = null;
    }

    const lngNum = Number(lng);
    const latNum = Number(lat);
    if (Number.isNaN(lngNum) || Number.isNaN(latNum)) return;
    if (!isValidLng(lngNum) || !isValidLat(latNum)) return;

    const m = L.marker([latNum, lngNum]).addTo(map);
    markerPreviewRef.current = m;
    // optional pan for better feedback
    map.panTo([latNum, lngNum], { animate: true });
  }, [lng, lat]);

  // ---------- preview: marker (1pt), line (2pt), polygon (3+) ----------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // clear old preview layers
    if (polygonLayerRef.current) {
      try {
        map.removeLayer(polygonLayerRef.current);
      } catch {}
      polygonLayerRef.current = null;
    }
    if (linePreviewRef.current) {
      try {
        map.removeLayer(linePreviewRef.current);
      } catch {}
      linePreviewRef.current = null;
    }

    if (points.length === 0) return;

    if (points.length === 1) {
      const { lat, lng } = points[0];
      const marker = L.marker([lat, lng]).addTo(map);
      polygonLayerRef.current = marker;
      map.flyTo([lat, lng], Math.max(map.getZoom(), 14));
      return;
    }

    if (points.length === 2) {
      const latlngs = points.map((p) => [p.lat, p.lng]);
      const line = L.polyline(latlngs, { weight: 3 }).addTo(map);
      linePreviewRef.current = line;
      map.fitBounds(line.getBounds().pad(0.2));
      return;
    }

    // 3+ points → polygon
    const fc = buildGeoJSON();
    if (!fc) return;
    const layer = L.geoJSON(fc, {
      style: { color: "#2563eb", weight: 3, fillOpacity: 0.2 },
    }).addTo(map);
    polygonLayerRef.current = layer;
    const b = layer.getBounds();
    if (b.isValid()) map.fitBounds(b.pad(0.15));
  }, [points, dagNo, khatianNo, surveyTypeId]);

  // ---------- actions ----------
  const addPoint = () => {
    const lngNum = Number(lng);
    const latNum = Number(lat);
    if (Number.isNaN(lngNum) || Number.isNaN(latNum)) {
      alert("Please enter numeric longitude and latitude.");
      return;
    }
    if (!isValidLng(lngNum) || !isValidLat(latNum)) {
      alert(
        "Longitude must be between -180..180 and Latitude between -90..90."
      );
      return;
    }
    setPoints((prev) => [...prev, { lng: lngNum, lat: latNum }]);
    setLng("");
    setLat("");
  };

  const removePoint = (idx) => {
    setPoints((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearAll = () => {
    setPoints([]);
    setLng("");
    setLat("");
  };

  const handleSave = async () => {
    try {
      if (points.length < 3) {
        alert("Add at least 3 points to form a polygon.");
        return;
      }
      setSaving(true);

      const geojson = buildGeoJSON();
      const bbox = bboxFromGeoJSON(geojson) || undefined;
      const id = await ensureDagExists();

      await saveDagGeometry(id, { geojson, bbox });
      alert("Geometry saved ✅");
    } catch (e) {
      console.error(e);
      alert(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full h-screen ">
      {/* Control panel */}
      <div className="absolute left-52 z-[9999] bg-black/80 text-white rounded-2xl shadow p-4 w-[330px] space-y-3">
        <div className="text-sm font-semibold">
          Admin • Set Land Boundary (Manual Inputs)
        </div>

        {/* Business fields */}
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <label className="text-xs font-semibold">Dag Number</label>
            <input
              className="border p-2 rounded w-full"
              value={dagNo}
              onChange={(e) => setDagNo(e.target.value)}
              placeholder="e.g. 12345"
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Khatian Number</label>
            <input
              className="border p-2 rounded w-full"
              value={khatianNo}
              onChange={(e) => setKhatianNo(e.target.value)}
              placeholder="e.g. 67890"
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Survey Type</label>
            <input
              className="border p-2 rounded w-full"
              value={surveyTypeId}
              onChange={(e) => setSurveyTypeId(e.target.value)}
              placeholder="e.g. 2"
            />
          </div>
        </div>

        {/* Separate inputs for one coordinate */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold">Longitude (lng)</label>
            <input
              className="border p-2 rounded w-full"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="e.g. 90.4152"
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Latitude (lat)</label>
            <input
              className="border p-2 rounded w-full"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="e.g. 23.8041"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={addPoint}
            className="bg-indigo-600 text-white px-3 py-2 rounded"
          >
            Add point
          </button>
          <button
            onClick={clearAll}
            className="bg-gray-200 text-gray-800 px-3 py-2 rounded"
          >
            Clear all
          </button>
        </div>

        {/* Current points list */}
        <div className="max-h-32 overflow-auto border rounded p-2 text-xs">
          {points.length === 0 && (
            <div className="text-gray-500">No points added yet</div>
          )}
          {points.map((p, i) => (
            <div key={i} className="flex items-center justify-between">
              <span>
                #{i + 1}: [ {p.lng.toFixed(6)}, {p.lat.toFixed(6)} ]
              </span>
              <button
                onClick={() => removePoint(i)}
                className="text-red-600 hover:underline"
              >
                remove
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving || points.length < 3}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-3 py-2 rounded w-full"
        >
          {saving ? "Saving..." : "Save Boundary"}
        </button>

        <p className="text-[11px] text-gray-600">
          Add longitude/latitude pairs one by one. The polygon ring will
          auto-close and be saved as GeoJSON.
        </p>
      </div>

      {/* Map + live preview */}
      <MapContainer
        className="z-1 h-[85vh] w-[780px] left-52 rounded"
        center={[23.8041, 90.4152]}
        zoom={7}
        whenCreated={(m) => {
          mapRef.current = m;
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
