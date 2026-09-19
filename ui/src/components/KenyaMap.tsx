"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

type City = {
  name: string;
  lat: number;
  lng: number;
  type: "capital" | "major" | "city";
  description?: string;
};

const kenyaCities: City[] = [
  { name: "Nairobi", lat: -1.286389, lng: 36.817223, type: "capital", description: "Capital City" },
  { name: "Mombasa", lat: -4.043477, lng: 39.668206, type: "major", description: "Coastal City & Port" },
  { name: "Kisumu", lat: -0.091702, lng: 34.767956, type: "major", description: "Lakeside City" },
  { name: "Nakuru", lat: -0.303099, lng: 36.080025, type: "major", description: "Rift Valley City" },
  { name: "Eldoret", lat: 0.514277, lng: 35.269779, type: "major", description: "North Rift City" },
  { name: "Thika", lat: -1.033262, lng: 37.069298, type: "city", description: "Industrial Town" },
  { name: "Malindi", lat: -3.219167, lng: 40.116944, type: "city", description: "Beach Town" },
  { name: "Kisii", lat: -0.677334, lng: 34.767956, type: "city", description: "Highlands Town" },
  { name: "Kitale", lat: 0.990170, lng: 35.008333, type: "city", description: "Agricultural Hub" },
  { name: "Garissa", lat: -0.453056, lng: 39.640278, type: "city", description: "North Eastern Town" },
  { name: "Kakamega", lat: 0.281389, lng: 34.752222, type: "city", description: "Western Town" },
  { name: "Nyeri", lat: -0.420556, lng: 36.955, type: "city", description: "Central Highlands" },
  { name: "Meru", lat: 0.046667, lng: 37.648611, type: "city", description: "Mt. Kenya Region" },
  { name: "Lamu", lat: -2.271944, lng: 40.901944, type: "city", description: "Historic Island Town" },
];

export default function KenyaMap() {
  const [mapReady, setMapReady] = useState(false);
  const [MapComponents, setMapComponents] = useState<any>(null);

  useEffect(() => {
    // Dynamically import all map components
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
    ]).then(([reactLeaflet, L]) => {
      // Fix Leaflet default marker icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Custom icon for capital
      const capitalIcon = new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      setMapComponents({
        MapContainer: reactLeaflet.MapContainer,
        TileLayer: reactLeaflet.TileLayer,
        Marker: reactLeaflet.Marker,
        Popup: reactLeaflet.Popup,
        Circle: reactLeaflet.Circle,
        capitalIcon,
      });
      setMapReady(true);
    });
  }, []);

  if (!mapReady || !MapComponents) {
    return (
      <div className="flex h-[600px] items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="mb-4 text-4xl">🗺️</div>
          <p className="text-gray-600 dark:text-gray-400">Loading Kenya Map...</p>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Circle, capitalIcon } = MapComponents;

  // Kenya's center coordinates
  const kenyaCenter: [number, number] = [-0.023559, 37.906193];

  return (
    <div className="relative h-[600px] w-full rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
      <MapContainer
        center={kenyaCenter}
        zoom={6}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        style={{ height: "100%", width: "100%" }}
      >
        {/* OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Kenya Border (approximate circle for visualization) */}
        <Circle
          center={kenyaCenter}
          radius={400000}
          pathOptions={{
            color: "#DC2626",
            fillColor: "#DC2626",
            fillOpacity: 0.05,
            weight: 2,
          }}
        />

        {/* City Markers */}
        {kenyaCities.map((city) => (
          <Marker
            key={city.name}
            position={[city.lat, city.lng]}
            icon={city.type === "capital" ? capitalIcon : undefined}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-lg">
                  {city.name}
                  {city.type === "capital" && " 🏛️"}
                  {city.type === "major" && " 🏙️"}
                </h3>
                <p className="text-sm text-gray-600">{city.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {city.lat.toFixed(4)}, {city.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-[1000] border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-sm mb-2 text-gray-900 dark:text-white">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-red-600">🔴</span>
            <span className="text-gray-700 dark:text-gray-300">Capital City</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600">🔵</span>
            <span className="text-gray-700 dark:text-gray-300">Major Cities</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">⚪</span>
            <span className="text-gray-700 dark:text-gray-300">Towns</span>
          </div>
        </div>
      </div>
    </div>
  );
}
