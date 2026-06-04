"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LaporanBencana } from "@/types/disaster";

// ─── MEMPERBAIKI BUG IKON LEAFLET DI NEXT.JS ───
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// ─── DATA SAMPEL GEOJSON (Bisa diganti dengan hasil eksport QGIS/ArcGIS) ───
// Contoh: Poligon area rawan bencana (Zona Merah)
const zonaRawanBencana: any = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        nama: "Zona Bahaya Aliran Sungai",
        level: "Kritis",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [100.640, -1.040], // Format: [Longitude, Latitude]
            [100.655, -1.045],
            [100.660, -1.060],
            [100.645, -1.065],
            [100.635, -1.050],
            [100.640, -1.040],
          ],
        ],
      },
    },
  ],
};

interface MapProps {
  data?: LaporanBencana[];
}

export default function Map({ data = [] }: MapProps) {
  // Koordinat default (Area Sumatera Barat / Solok / Padang)
  const defaultCenter: [number, number] = [-1.050, 100.650];

  // Styling untuk layer GeoJSON
  const geoJsonStyle = {
    color: "#ef4444",      // Garis luar merah
    weight: 2,
    opacity: 0.8,
    fillColor: "#ef4444",  // Isian merah
    fillOpacity: 0.2,      // Transparan agar peta dasar tetap terlihat
  };

  return (
    <div className="w-full h-full z-0 relative rounded-xl overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Layer Peta Dasar (OpenStreetMap) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ── LAYER 1: POLYGON SPASIAL (GEOJSON) ── */}
        <GeoJSON
          data={zonaRawanBencana}
          style={geoJsonStyle}
          onEachFeature={(feature, layer) => {
            if (feature.properties && feature.properties.nama) {
              layer.bindPopup(
                `<b>${feature.properties.nama}</b><br/>Status: <span style="color:red;">${feature.properties.level}</span>`
              );
            }
          }}
        />

        {/* ── LAYER 2: TITIK KOORDINAT (MARKER) DARI FIRESTORE ── */}
        {data.map((item) => (
          <Marker
            key={item.id}
            position={[item.koordinat.lat, item.koordinat.lng]}
          >
            <Popup>
              <div className="text-sm font-sans">
                <p className="font-bold text-slate-800 mb-1">{item.jenis_bencana}</p>
                <p className="text-xs text-slate-600 mb-2">{item.deskripsi}</p>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${item.status === 'Menunggu' ? 'bg-red-100 text-red-600' :
                    item.status === 'Diproses' ? 'bg-amber-100 text-amber-600' :
                      'bg-emerald-100 text-emerald-600'
                  }`}>
                  {item.status}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}