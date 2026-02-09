declare module "react-native-web-maps" {
  import * as React from "react";
  import { ViewProps } from "react-native";

  export interface MapViewProps extends ViewProps {
    region?: {
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    };
    initialRegion?: MapViewProps["region"];
    onPress?: (event: any) => void;
    children?: React.ReactNode;
  }

  export class MapView extends React.Component<MapViewProps> {}

  export interface MarkerProps extends ViewProps {
    coordinate: {
      latitude: number;
      longitude: number;
    };
    title?: string;
    description?: string;
  }

  export class Marker extends React.Component<MarkerProps> {}
}
