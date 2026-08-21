import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

const pin = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function Recenter({ lat, lng, zoom = 14 }) {
  const map = useMap();
  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, zoom, map]);
  return null;
}

function ClickCatch({ onPick }) {
  useMapEvents({
    click(e) {
      onPick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapFeed({
  center,
  posts = [],
  pickable = false,
  picked,
  onPick,
  height = '420px',
}) {
  const lat = center?.lat ?? 28.6139;
  const lng = center?.lng ?? 77.209;

  return (
    <div className="overflow-hidden rounded-xl border border-black/10 shadow-sm" style={{ height }}>
      <MapContainer center={[lat, lng]} zoom={14} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter lat={lat} lng={lng} />
        {pickable && <ClickCatch onPick={onPick} />}

        <Marker position={[lat, lng]} icon={pin}>
          <Popup>You are here</Popup>
        </Marker>

        {picked && (
          <Marker position={[picked.lat, picked.lng]} icon={pin}>
            <Popup>Issue location</Popup>
          </Marker>
        )}

        {posts.map((post) => {
          const [plng, plat] = post.location?.coordinates || [];
          if (!Number.isFinite(plat) || !Number.isFinite(plng)) return null;
          return (
            <Marker key={post._id} position={[plat, plng]} icon={pin}>
              <Popup>
                <div className="min-w-40">
                  <strong>{post.title}</strong>
                  <p className="m-0 text-xs">{post.upvoteCount} upvotes</p>
                  <Link to={`/posts/${post._id}`}>Open issue</Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
