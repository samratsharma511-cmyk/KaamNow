import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';

const customerIcon = new L.DivIcon({
  className: 'custom-customer-marker',
  html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9999px;background:#1e3a8a;border:3px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.3);color:#ffffff;font-weight:700;font-size:12px;">🏠</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const workerIcon = new L.DivIcon({
  className: 'custom-worker-marker',
  html: `<div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9999px;background:#f59e0b;border:3px solid #ffffff;box-shadow:0 4px 14px rgba(245,158,11,0.5);color:#0f172a;font-weight:800;font-size:16px;">🛵</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function MapClickHandler({ onSelectLocation }) {
  useMapEvents({
    click(e) {
      if (onSelectLocation) {
        onSelectLocation({
          latitude: Number(e.latlng.lat.toFixed(6)),
          longitude: Number(e.latlng.lng.toFixed(6)),
        });
      }
    },
  });
  return null;
}

function MapBoundsUpdater({ customerLocation, workerLocation }) {
  const map = useMap();

  useEffect(() => {
    if (
      customerLocation?.latitude &&
      customerLocation?.longitude &&
      workerLocation?.latitude &&
      workerLocation?.longitude
    ) {
      const bounds = L.latLngBounds([
        [customerLocation.latitude, customerLocation.longitude],
        [workerLocation.latitude, workerLocation.longitude],
      ]);
      map.fitBounds(bounds, { padding: [55, 55], maxZoom: 16 });
    } else if (customerLocation?.latitude && customerLocation?.longitude) {
      map.setView([customerLocation.latitude, customerLocation.longitude], 14);
    } else if (workerLocation?.latitude && workerLocation?.longitude) {
      map.setView([workerLocation.latitude, workerLocation.longitude], 14);
    }
  }, [
    map,
    customerLocation?.latitude,
    customerLocation?.longitude,
    workerLocation?.latitude,
    workerLocation?.longitude,
  ]);

  return null;
}

export default function MapView({
  customerLocation,
  workerLocation,
  customerLabel = 'Customer Service Location',
  workerLabel = 'KaamSaathi Live Location',
  onSelectLocation = null,
  heightClass = 'h-80',
}) {
  const centerLat =
    workerLocation?.latitude || customerLocation?.latitude || 12.9716;
  const centerLng =
    workerLocation?.longitude || customerLocation?.longitude || 77.6412;

  const hasBothPoints =
    customerLocation?.latitude &&
    customerLocation?.longitude &&
    workerLocation?.latitude &&
    workerLocation?.longitude;

  return (
    <div className={`w-full ${heightClass} rounded-xl overflow-hidden border border-slate-200 shadow-inner relative`}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsUpdater
          customerLocation={customerLocation}
          workerLocation={workerLocation}
        />

        {onSelectLocation && (
          <MapClickHandler onSelectLocation={onSelectLocation} />
        )}

        {customerLocation?.latitude && customerLocation?.longitude && (
          <Marker
            position={[customerLocation.latitude, customerLocation.longitude]}
            icon={customerIcon}
          >
            <Popup>
              <div className="text-xs font-semibold text-slate-900">
                {customerLabel}
              </div>
              <div className="text-[11px] text-slate-500">
                {customerLocation.latitude.toFixed(4)}, {customerLocation.longitude.toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}

        {workerLocation?.latitude && workerLocation?.longitude && (
          <Marker
            position={[workerLocation.latitude, workerLocation.longitude]}
            icon={workerIcon}
          >
            <Popup>
              <div className="text-xs font-semibold text-slate-900">
                {workerLabel}
              </div>
              <div className="text-[11px] text-slate-500">
                Live GPS: {workerLocation.latitude.toFixed(4)}, {workerLocation.longitude.toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}

        {hasBothPoints && (
          <Polyline
            positions={[
              [workerLocation.latitude, workerLocation.longitude],
              [customerLocation.latitude, customerLocation.longitude],
            ]}
            pathOptions={{
              color: '#1e3a8a',
              weight: 4,
              dashArray: '8, 8',
              opacity: 0.85,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
