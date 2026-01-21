// mobile/app/MapComponent.tsx
import React from "react";

// Dummy MapView component (renders nothing for now)
export const MapView: React.ComponentType<any> | null = (props: any) => null;

// Dummy Marker component so `<Marker />` is valid JSX
export const Marker: React.ComponentType<any> = (props: any) => null;

// Not used in dummy mode, but exported to satisfy imports
export const PROVIDER_GOOGLE = null;
