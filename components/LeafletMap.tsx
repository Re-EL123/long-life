import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

});

interface LeafletMapProps {
  center: [number, number];
  zoom: number;
  onMapClick: (latitude: number, longitude: number) => void;
  selectedLocation: { latitude: number; longitude: number };
  drivers?: any[];
}

const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  zoom,
  onMapClick,
  selectedLocation,
  drivers = []
}) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapClickHandler onMapClick={onMapClick} />
      
      {selectedLocation && (
        <Marker position={[selectedLocation.latitude, selectedLocation.longitude]}>
          <Popup>Selected Location</Popup>
        </Marker>
      )}

      {drivers.map((driver) => (
        <Marker
          key={driver.driverId}
          position={[driver.latitude, driver.longitude]}
          icon={L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })}
        >
          <Popup>
            <div>
              <h3>{driver.name} {driver.surname}</h3>
              <p><strong>Registration:</strong> {driver.registrationNumber}</p>
              <p><strong>Vehicle:</strong> {driver.carBrand} {driver.carModel}</p>
              <p><strong>Seats:</strong> {driver.seats}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LeafletMap;
