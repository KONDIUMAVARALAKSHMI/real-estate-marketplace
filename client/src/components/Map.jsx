import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Resolve Vite asset resolution issues for default Leaflet marker assets
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function Map({ latitude, longitude, title, zoom = 14, interactive = true, onMarkerDragEnd }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize and update map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const latVal = parseFloat(latitude);
    const lngVal = parseFloat(longitude);
    if (isNaN(latVal) || isNaN(lngVal)) return;

    // Check if map is not initialized yet
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: interactive,
        dragging: interactive,
        touchZoom: interactive,
        doubleClickZoom: interactive,
        scrollWheelZoom: false, // Prevents page scrolling issues
      }).setView([latVal, lngVal], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    } else {
      mapRef.current.setView([latVal, lngVal], zoom);
    }

    // Set or move marker
    if (markerRef.current) {
      markerRef.current.setLatLng([latVal, lngVal]);
    } else {
      markerRef.current = L.marker([latVal, lngVal], {
        draggable: interactive && !!onMarkerDragEnd,
      }).addTo(mapRef.current);

      if (title) {
        markerRef.current.bindPopup(`<div style="font-weight: 600; font-family: sans-serif;">${title}</div>`);
      }

      if (onMarkerDragEnd) {
        markerRef.current.on('dragend', (event) => {
          const position = event.target.getLatLng();
          onMarkerDragEnd(position.lat, position.lng);
        });
      }
    }
  }, [latitude, longitude, zoom, title, interactive, onMarkerDragEnd]);

  // Handle map removal on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[350px] rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      style={{ zIndex: 1 }}
    />
  );
}

export default Map;
