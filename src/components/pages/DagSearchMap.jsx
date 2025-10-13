import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import { searchDagGeometry } from "../../api";

function FitTo({ bbox, layerRef }) {
  const map = useMap();
  useEffect(() => {
    if (bbox && bbox.length === 4) {
      const bounds = L.latLngBounds(
        L.latLng(bbox[1], bbox[0]), // [lat,lng] from bbox SW
        L.latLng(bbox[3], bbox[2]) // NE
      );
      map.fitBounds(bounds, { padding: [28, 28] });
    } else if (layerRef.current?.getBounds) {
      map.fitBounds(layerRef.current.getBounds(), { padding: [28, 28] });
    }
  }, [bbox, layerRef, map]);
  return null;
}

export default function DagSearchMap() {
  const [query, setQuery] = useState("");
  const [zilId, setZilId] = useState("");
  const [surveyTypeId, setSurveyTypeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null); // server response
  const layerRef = useRef(null);

  const doSearch = async () => {
    if (!query) {
      setErr("Please enter a Dag number");
      return;
    }
    setLoading(true);
    setErr("");
    setData(null);
    try {
      const res = await searchDagGeometry(query, {
        zil_id: zilId || undefined,
        survey_type_id: surveyTypeId || undefined,
      });
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen relative">
      {/* Search box */}
      <div className="absolute z-[9999] top-3 left-5 bg-black/80 text-white rounded-xl shadow p-3">
        <div className="text-l font-semibold mb-2">User • Search Dag</div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="text-black border bg-white p-1 rounded w-34"
            placeholder=" Dag number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
          />
          <input
            className="text-black border bg-white p-1 rounded w-25"
            placeholder="Zil ID"
            value={zilId}
            onChange={(e) => setZilId(e.target.value)}
          />
          <input
            className="text-black border bg-white p-1 rounded w-34"
            placeholder="Survey Type ID"
            value={surveyTypeId}
            onChange={(e) => setSurveyTypeId(e.target.value)}
          />
          <button
            onClick={doSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1 rounded"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
        {err && <div className="text-xs text-red-600 mt-2">{err}</div>}
      </div>

      {/* Map */}
      <MapContainer
        className="h-[85vh] w-[1280px] top-10 left-10 rounded"
        center={[23.8041, 90.4152]}
        zoom={7}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        {data?.geojson && (
          <>
            <GeoJSON
              data={data.geojson}
              style={{ color: "#e11d48", weight: 3, fillOpacity: 0.25 }}
              onEachFeature={(feature, layer) => {
                const lines = [
                  `Dag: ${data.dag_no}`,
                  data.zil_id ? `Zil: ${data.zil_id}` : "",
                  data.survey_type_id
                    ? `SurveyType: ${data.survey_type_id}`
                    : "",
                ]
                  .filter(Boolean)
                  .join(" | ");
                layer.bindPopup(lines || "Dag boundary");
                // keep a reference to compute bounds if bbox missing
                layerRef.current = layer;
              }}
            />
            <FitTo bbox={data.bbox} layerRef={layerRef} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
