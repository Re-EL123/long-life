import React from "react";
import { View, StyleSheet } from "react-native";
import {
  MapContainer,
  TileLayer,
  Marker as LeafletMarker,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ---------- Types ----------
type LatLng = { latitude: number; longitude: number };
type Region = LatLng & { latitudeDelta: number; longitudeDelta: number };

type MapViewProps = {
  style?: any;
  initialRegion: Region;
  onPress?: (e: { nativeEvent: { coordinate: LatLng } }) => void;
  children?: React.ReactNode;
};

type MarkerProps = {
  coordinate: LatLng;
  title?: string;
  children?: React.ReactNode;
};

// ---------- Constants ----------
export const PROVIDER_GOOGLE = "osm";

// ---------- Map ----------
export const MapView: React.FC<MapViewProps> = ({
  initialRegion,
  onPress,
  children,
  style,
}) => {
  const center: [number, number] = [
    initialRegion.latitude,
    initialRegion.longitude,
  ];

  const ClickHandler = () => {
    useMapEvents({
      click(e) {
        onPress?.({
          nativeEvent: {
            coordinate: {
              latitude: e.latlng.lat,
              longitude: e.latlng.lng,
            },
          },
        });
      },
    });
    return null;
  };

  return (
    <View style={[styles.container, style]}>
      <MapContainer center={center} zoom={15} style={styles.map}>
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler />
        {children}
      </MapContainer>
    </View>
  );
};

// ---------- Marker ----------
export const Marker: React.FC<MarkerProps> = ({
  coordinate,
  title,
  children,
}) => {
  return (
    <LeafletMarker
      position={[coordinate.latitude, coordinate.longitude]}
      title={title}
    >
      {children}
    </LeafletMarker>
  );
};

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
