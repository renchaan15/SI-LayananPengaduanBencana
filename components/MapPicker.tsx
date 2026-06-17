"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ─── MEMPERBAIKI BUG IKON LEAFLET ───
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// ─── DATA ZONA RAWAN (Sama dengan Peta Admin) ───
const zonaRawanBencana: any = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { nama: "Zona Bahaya Aliran Sungai", level: "Kritis" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [100.640, -1.040], [100.655, -1.045], [100.660, -1.060],
            [100.645, -1.065], [100.635, -1.050], [100.640, -1.040],
          ],
        ],
      },
    },
  ],
};

interface MapPickerProps {
  position: { lat: number; lng: number } | null;
  setPosition: (pos: { lat: number; lng: number }) => void;
}

// ─── FUNGSI KLIK UNTUK PIN LOKASI ───
function LocationMarker({ position, setPosition }: MapPickerProps) {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position ? (
    <Marker position={[position.lat, position.lng]}>
      <Popup>
        <span className="font-bold text-red-600">Titik Kejadian Bencana</span>
        <br />
        <span className="text-xs text-slate-500">Koordinat telah dikunci.</span>
      </Popup>
    </Marker>
  ) : null;
}

export default function MapPicker({ position, setPosition }: MapPickerProps) {
  const defaultCenter: [number, number] = [-1.050, 100.650]; // Titik default Nagari

  return (
    <div className="w-full h-full z-0 relative">
      <MapContainer
        center={position ? [position.lat, position.lng] : defaultCenter}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Menampilkan Area Merah (Edukasi Spasial Warga) */}
        <GeoJSON
          data={zonaRawanBencana}
          style={{ color: "#ef4444", weight: 2, fillColor: "#ef4444", fillOpacity: 0.15 }}
        />

        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
    </div>
  );
}