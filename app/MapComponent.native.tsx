// app/MapComponent.native.tsx
import React from "react";
import MapViewBase, {
  Marker as MarkerBase,
  UrlTile,
  PROVIDER_GOOGLE as RN_PROVIDER_GOOGLE,
} from "react-native-maps";

export const PROVIDER_GOOGLE = RN_PROVIDER_GOOGLE;

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

export const MapView: React.FC<MapViewProps> = (props) => (
  <MapViewBase
    style={props.style}
    initialRegion={props.initialRegion}
    onPress={props.onPress}
    provider={PROVIDER_GOOGLE}
  >
    <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {props.children}
  </MapViewBase>
);

export const Marker: React.FC<MarkerProps> = (props) => (
  <MarkerBase
    coordinate={props.coordinate}
    title={props.title}
    description={props.description}
    pinColor={props.pinColor}
  >
    {props.children}
  </MarkerBase>
);
