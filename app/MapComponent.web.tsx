// app/MapComponent.web.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { MapContainer, TileLayer, Marker as RLMarker, useMapEvents } from "react-leaflet";

export const PROVIDER_GOOGLE = "osm";

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
  description?: string;
  pinColor?: string;
  children?: React.ReactNode;
};

export const MapView: React.FC<MapViewProps> = (props) => {
  const center: [number, number] = [
    props.initialRegion.latitude,
    props.initialRegion.longitude,
  ];

  const ClickHandler: React.FC = () => {
    useMapEvents({
      click(e) {
        props.onPress?.({
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
    <View style={[styles.webContainer, props.style]}>
      <MapContainer center={center} zoom={15} style={styles.webMap}>
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler />
        {props.children}
      </MapContainer>
    </View>
  );
};

export const Marker: React.FC<MarkerProps> = (props) => (
  <RLMarker
    position={[props.coordinate.latitude, props.coordinate.longitude]}
    title={props.title as any}
  >
    {props.children as any}
  </RLMarker>
);

const styles = StyleSheet.create({
  webContainer: { flex: 1 },
  webMap: { width: "100%", height: "100%" },
});
