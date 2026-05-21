"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

import MapController from "@/components/maps/map-controller";
import MapZoomControls from "@/components/maps/map-zoom-controls";

const position: [number, number] = [28.6139, 77.209];

const MarkerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function LiveMap() {
  return (
    <MapContainer
      center={position}
      zoom={13}
      className="h-full w-full rounded-2xl"
      style={{ height: "100%", width: "100%", minHeight: 320 }}
      dragging
      touchZoom
      scrollWheelZoom
      doubleClickZoom
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={position} icon={MarkerIcon}>
        <Popup>Your pickup area</Popup>
      </Marker>

      <MapController />
      <MapZoomControls />
    </MapContainer>
  );
}
