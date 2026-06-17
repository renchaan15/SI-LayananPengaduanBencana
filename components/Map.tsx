"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, LayersControl, useMap } from "react-leaflet";
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

// ─── DATA SAMPEL GEOJSON (Zona Merah) ───
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
            [100.640, -1.040], // [Longitude, Latitude]
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

// ─── KOMPONEN KHUSUS: HEATMAP LAYER ───
function HeatmapLayer({ data }: { data: LaporanBencana[] }) {
  const map = useMap();

  useEffect(() => {
    let heatLayer: any = null;

    // Load plugin leaflet.heat secara dinamis agar tidak error di Next.js SSR
    import("leaflet.heat").then(() => {
      // Pastikan ada data untuk dipetakan
      if (!data || data.length === 0) return;

      // Format data array ke bentuk [lat, lng, intensitas]
      const points = data
        .filter((item) => item.koordinat && item.koordinat.lat && item.koordinat.lng)
        .map((item) => [item.koordinat.lat, item.koordinat.lng, 1]); // Intensitas = 1 per titik

      // Opsi konfigurasi Heatmap (Mirip analisis kernel density QGIS)
      const options = {
        radius: 35,          // Radius persebaran panas
        blur: 25,            // Kehalusan gradasi
        maxZoom: 15,         // Zoom di mana titik panas mencapai intensitas maksimum
        gradient: {
          0.4: "blue",
          0.6: "cyan",
          0.7: "lime",
          0.8: "yellow",
          1.0: "red",        // Merah = Paling padat (Banyak kejadian)
        },
      };

      // @ts-ignore - Menggunakan plugin tambahan di atas tipe bawaan Leaflet
      heatLayer = L.heatLayer(points, options).addTo(map);
    });

    // Cleanup layer saat komponen dilepas/refresh
    return () => {
      if (heatLayer && map) {
        map.removeLayer(heatLayer);
      }
    };
  }, [data, map]);

  return null; // Komponen ini hanya merender logika ke dalam peta induk
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
    fillOpacity: 0.2,      
  };

  return (
    <div className="w-full h-full z-0 relative rounded-xl overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* ─── KONTROL LAYER GIS (Tombol sakelar di kanan atas) ─── */}
        <LayersControl position="topright">
          
          {/* PETA DASAR */}
          <LayersControl.BaseLayer checked name="Mode Jalan (OSM)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          {/* LAYER 1: PETA PANAS (HEATMAP) */}
          {/* Default diceklis, akan menampilkan kepadatan bencana */}
          <LayersControl.Overlay checked name="🔥 Peta Kepadatan (Heatmap)">
            <HeatmapLayer data={data} />
          </LayersControl.Overlay>

          {/* LAYER 2: TITIK LOKASI (MARKER) */}
          <LayersControl.Overlay checked name="📍 Titik Kejadian">
            {data.map((item) => (
              <Marker
                key={item.id}
                position={[item.koordinat.lat, item.koordinat.lng]}
              >
                <Popup>
                  <div className="text-sm font-sans min-w-[200px]">
                    <p className="font-bold text-slate-800 mb-1">{item.jenis_bencana}</p>
                    <p className="text-xs text-slate-600 mb-2 line-clamp-2">{item.deskripsi}</p>
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${
                      item.status === 'Menunggu' ? 'bg-red-100 text-red-600' :
                      item.status === 'Diproses' ? 'bg-amber-100 text-amber-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </LayersControl.Overlay>

          {/* LAYER 3: GEOJSON ZONA RAWAN */}
          <LayersControl.Overlay checked name="⚠️ Poligon Zona Bahaya">
            <GeoJSON
              data={zonaRawanBencana}
              style={geoJsonStyle}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.nama) {
                  layer.bindPopup(
                    `<b>${feature.properties.nama}</b><br/>Status: <span style="color:red; font-weight:bold;">${feature.properties.level}</span>`
                  );
                }
              }}
            />
          </LayersControl.Overlay>

        </LayersControl>
      </MapContainer>
    </div>
  );
}