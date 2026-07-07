import { MapContainer, TileLayer, CircleMarker, Popup, Marker, useMapEvents } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { STATUS_META } from "../constants";

// Default Leaflet marker images don't resolve correctly through Vite's bundler,
// so the "pick a location" pin uses a hand-built SVG divIcon instead.
const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 26 16 26s16-15 16-26C32 7.2 24.8 0 16 0z" fill="#f2c230" stroke="#16161a" stroke-width="1.5"/>
    <circle cx="16" cy="16" r="6" fill="#16161a"/>
  </svg>`,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
});

const MUMBAI_CENTER = [19.076, 72.8777];

function ClickHandler({ onSelectPosition }) {
  useMapEvents({
    click(e) {
      onSelectPosition(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Shared map used by:
 * - Public homepage (reports=[...], onMarkerClick navigates to detail)
 * - Report form (selectable=true, for manual pin-drop when GPS is denied)
 * - Admin dashboard (reports=[...] with admin popups)
 */
export default function MapView({
  reports = [],
  center,
  zoom = 13,
  selectable = false,
  selectedPosition,
  onSelectPosition,
  renderPopup,
  height = "100%",
}) {
  const navigate = useNavigate();
  const mapCenter = center || (selectedPosition ? [selectedPosition.lat, selectedPosition.lng] : MUMBAI_CENTER);

  return (
    <div style={{ height, width: "100%" }}>
      <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {reports.map((r) => (
          <CircleMarker
            key={r.id}
            center={[r.latitude, r.longitude]}
            radius={9}
            pathOptions={{
              color: "#16161a",
              weight: 2,
              fillColor: STATUS_META[r.status]?.color || "#999",
              fillOpacity: 0.9,
            }}
            eventHandlers={{
              click: () => {
                if (!renderPopup) navigate(`/reports/${r.id}`);
              },
            }}
          >
            {renderPopup ? <Popup minWidth={200}>{renderPopup(r)}</Popup> : null}
          </CircleMarker>
        ))}

        {selectable && (
          <>
            <ClickHandler onSelectPosition={onSelectPosition} />
            {selectedPosition && (
              <Marker position={[selectedPosition.lat, selectedPosition.lng]} icon={pinIcon} />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
}
