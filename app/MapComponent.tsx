// app/MapComponent.tsx
// Universal Map Component - Works on iOS, Android, and Web
// Uses: react-native-maps (native) + Leaflet via WebView (native web fallback) + Leaflet DOM (web)
// 100% FREE - OpenStreetMap tiles, no API keys needed

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Platform,
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";

// ============================================
// TYPES
// ============================================
export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface SafeMapMarker {
  id: string;
  coordinate: Coordinate;
  title?: string;
  description?: string;
  type: "pickup" | "dropoff" | "driver" | "child" | "school" | "custom";
  selected?: boolean;
  heading?: number;
  color?: string;
}

export interface SafeMapRoute {
  coordinates: Coordinate[];
  color?: string;
  width?: number;
}

export interface SafeMapProps {
  region: MapRegion;
  markers?: SafeMapMarker[];
  routes?: SafeMapRoute[];
  onMapPress?: (coordinate: Coordinate) => void;
  onMarkerPress?: (markerId: string) => void;
  onRegionChange?: (region: MapRegion) => void;
  showUserLocation?: boolean;
  style?: any;
  children?: React.ReactNode;
}

// ============================================
// NATIVE MAP IMPORTS (conditional)
// ============================================
let RNMapView: any = null;
let RNMarker: any = null;
let RNPolyline: any = null;
let RNCircle: any = null;
let PROVIDER_DEFAULT: any = null;

if (Platform.OS !== "web") {
  try {
    const Maps = require("react-native-maps");
    RNMapView = Maps.default;
    RNMarker = Maps.Marker;
    RNPolyline = Maps.Polyline;
    RNCircle = Maps.Circle;
    PROVIDER_DEFAULT = Maps.PROVIDER_DEFAULT;
  } catch (e) {
    console.warn("[MapComponent] react-native-maps not available:", e);
  }
}

// ============================================
// MARKER CONFIGURATION
// ============================================
const MARKER_CONFIG: Record<
  string,
  { icon: string; emoji: string; color: string; bgColor: string }
> = {
  pickup: {
    icon: "location",
    emoji: "📍",
    color: "#00C853",
    bgColor: "#E8F5E9",
  },
  dropoff: {
    icon: "flag",
    emoji: "🏁",
    color: "#FF5252",
    bgColor: "#FFEBEE",
  },
  driver: {
    icon: "car",
    emoji: "🚗",
    color: "#7E2EFF",
    bgColor: "#F3E5F5",
  },
  child: {
    icon: "person",
    emoji: "👤",
    color: "#FF9800",
    bgColor: "#FFF3E0",
  },
  school: {
    icon: "school",
    emoji: "🏫",
    color: "#2196F3",
    bgColor: "#E3F2FD",
  },
  custom: {
    icon: "pin",
    emoji: "📌",
    color: "#666666",
    bgColor: "#F5F5F5",
  },
};

// ============================================
// FREE TILE PROVIDERS
// ============================================
const TILE_PROVIDERS = {
  osmStandard: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    name: "OpenStreetMap",
  },
  cartoVoyager: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "© CartoDB © OSM contributors",
    name: "CartoDB Voyager",
  },
  cartoLight: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "© CartoDB © OSM contributors",
    name: "CartoDB Light",
  },
  cartoDark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "© CartoDB © OSM contributors",
    name: "CartoDB Dark",
  },
};

// Default tile provider
const DEFAULT_TILES = TILE_PROVIDERS.cartoVoyager;

// ============================================
// NATIVE MARKER ICON COMPONENT
// ============================================
const NativeMarkerIcon: React.FC<{
  type: SafeMapMarker["type"];
  selected?: boolean;
  heading?: number;
}> = ({ type, selected, heading }) => {
  let Ionicons: any;
  try {
    Ionicons = require("@expo/vector-icons").Ionicons;
  } catch {
    // Fallback if vector icons not available
    const config = MARKER_CONFIG[type] || MARKER_CONFIG.custom;
    return (
      <View
        style={[
          nativeMarkerStyles.container,
          {
            backgroundColor: selected ? config.color : config.bgColor,
            borderColor: config.color,
          },
        ]}
      >
        <Text style={{ fontSize: 18 }}>{config.emoji}</Text>
      </View>
    );
  }

  const config = MARKER_CONFIG[type] || MARKER_CONFIG.custom;

  return (
    <View
      style={[
        nativeMarkerStyles.container,
        {
          backgroundColor: selected ? config.color : config.bgColor,
          borderColor: config.color,
          transform: heading ? [{ rotate: `${heading}deg` }] : [],
        },
      ]}
    >
      <Ionicons
        name={config.icon as any}
        size={type === "driver" ? 22 : 20}
        color={selected ? "#fff" : config.color}
      />
    </View>
  );
};

const nativeMarkerStyles = StyleSheet.create({
  container: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      default: {},
    }),
  },
});

// ============================================
// LEAFLET HTML GENERATOR (for WebView on native)
// ============================================
function generateLeafletHTML(
  region: MapRegion,
  markers: SafeMapMarker[],
  routes: SafeMapRoute[],
  tileProvider: typeof DEFAULT_TILES
): string {
  const zoom = Math.round(
    Math.log2(360 / Math.max(region.latitudeDelta, 0.001)) + 1
  );

  const markersJS = markers
    .map((m) => {
      const config = MARKER_CONFIG[m.type] || MARKER_CONFIG.custom;
      const bgColor = m.selected ? config.color : "#fff";
      const iconColor = m.selected ? "#fff" : config.color;
      const borderColor = config.color;
      const size = m.selected ? 44 : 40;

      return `
      (function() {
        var icon = L.divIcon({
          className: 'custom-marker',
          html: '<div style="background:${bgColor};border:3px solid ${borderColor};border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;${m.heading ? `transform:rotate(${m.heading}deg);` : ""}">${config.emoji}</div>',
          iconSize: [${size}, ${size}],
          iconAnchor: [${size / 2}, ${size}],
          popupAnchor: [0, -${size}]
        });
        var marker = L.marker([${m.coordinate.latitude}, ${m.coordinate.longitude}], {icon: icon}).addTo(map);
        ${
          m.title
            ? `marker.bindPopup('<div style="font-family:sans-serif;min-width:150px;"><strong>${(m.title || "").replace(/'/g, "\\'").replace(/\n/g, "<br/>")}</strong>${m.description ? `<br/><small>${m.description.replace(/'/g, "\\'").replace(/\n/g, "<br/>")}</small>` : ""}</div>');`
            : ""
        }
        marker.on('click', function() {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'marker', id:'${m.id}'}));
        });
      })();
    `;
    })
    .join("\n");

  const routesJS = routes
    .map((route, idx) => {
      if (!route.coordinates || route.coordinates.length < 2) return "";
      const latLngs = route.coordinates
        .map((c) => `[${c.latitude}, ${c.longitude}]`)
        .join(",");
      return `
      L.polyline([${latLngs}], {
        color: '${route.color || "#7E2EFF"}',
        weight: ${route.width || 4},
        opacity: 0.85,
        smoothFactor: 1,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
    `;
    })
    .join("\n");

  // Fit bounds if multiple markers
  let fitBoundsJS = "";
  if (markers.length >= 2) {
    const boundsCoords = markers
      .map((m) => `[${m.coordinate.latitude}, ${m.coordinate.longitude}]`)
      .join(",");
    fitBoundsJS = `
      try {
        var bounds = L.latLngBounds([${boundsCoords}]);
        map.fitBounds(bounds, {padding: [50, 50], maxZoom: 16});
      } catch(e) {}
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .custom-marker { background: transparent !important; border: none !important; }
    .leaflet-control-attribution { font-size: 10px !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: true,
      attributionControl: true
    }).setView([${region.latitude}, ${region.longitude}], ${zoom});

    L.tileLayer('${tileProvider.url}', {
      attribution: '${tileProvider.attribution}',
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Routes
    ${routesJS}

    // Markers
    ${markersJS}

    // Fit bounds
    ${fitBoundsJS}

    // Map click handler
    map.on('click', function(e) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'mapPress',
          latitude: e.latlng.lat,
          longitude: e.latlng.lng
        }));
      }
    });

    // Map move handler
    map.on('moveend', function() {
      var center = map.getCenter();
      var bounds = map.getBounds();
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'regionChange',
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: bounds.getNorth() - bounds.getSouth(),
          longitudeDelta: bounds.getEast() - bounds.getWest()
        }));
      }
    });
  </script>
</body>
</html>
  `;
}

// ============================================
// WEB LEAFLET MAP (DOM-based, for Platform.OS === 'web')
// ============================================
const WebLeafletMap: React.FC<SafeMapProps> = ({
  region,
  markers = [],
  routes = [],
  onMapPress,
  onMarkerPress,
  onRegionChange,
  style,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const routesLayerRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!mapContainerRef.current) return;

    let cancelled = false;

    const initMap = async () => {
      try {
        // Load Leaflet CSS if not loaded
        if (!document.getElementById("safe-leaflet-css")) {
          const link = document.createElement("link");
          link.id = "safe-leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          link.integrity =
            "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
          link.crossOrigin = "";
          document.head.appendChild(link);

          // Wait for CSS to load
          await new Promise((resolve) => {
            link.onload = resolve;
            setTimeout(resolve, 2000); // fallback timeout
          });
        }

        if (cancelled) return;

        const L = await import("leaflet");

        if (cancelled) return;

        // Clean up existing map
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        if (!mapContainerRef.current) return;

        // Fix Leaflet default icon paths
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const zoom = Math.round(
          Math.log2(360 / Math.max(region.latitudeDelta, 0.001)) + 1
        );

        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView([region.latitude, region.longitude], Math.min(zoom, 18));

        // Add tile layer (FREE - CartoDB Voyager)
        L.tileLayer(DEFAULT_TILES.url, {
          attribution: DEFAULT_TILES.attribution,
          maxZoom: 19,
          subdomains: "abcd",
        } as any).addTo(map);

        // Create layer groups
        markersLayerRef.current = L.layerGroup().addTo(map);
        routesLayerRef.current = L.layerGroup().addTo(map);

        // Map click handler
        map.on("click", (e: any) => {
          onMapPress?.({
            latitude: e.latlng.lat,
            longitude: e.latlng.lng,
          });
        });

        // Map move handler
        map.on("moveend", () => {
          const center = map.getCenter();
          const bounds = map.getBounds();
          onRegionChange?.({
            latitude: center.lat,
            longitude: center.lng,
            latitudeDelta: bounds.getNorth() - bounds.getSouth(),
            longitudeDelta: bounds.getEast() - bounds.getWest(),
          });
        });

        mapInstanceRef.current = map;
        setLoaded(true);
        setError(null);
      } catch (err: any) {
        console.error("[WebLeafletMap] Init error:", err);
        setError(err.message || "Failed to load map");
      }
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Only init once

  // Update markers
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const L = require("leaflet");
    const layer = markersLayerRef.current;
    layer.clearLayers();

    markers.forEach((m) => {
      const config = MARKER_CONFIG[m.type] || MARKER_CONFIG.custom;
      const bgColor = m.selected ? config.color : "#fff";
      const borderColor = config.color;
      const size = m.selected ? 44 : 40;

      const icon = L.divIcon({
        className: "safe-custom-marker",
        html: `
          <div style="
            background: ${bgColor};
            border: 3px solid ${borderColor};
            border-radius: 50%;
            width: ${size}px;
            height: ${size}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: all 0.2s ease;
            ${m.heading ? `transform: rotate(${m.heading}deg);` : ""}
          ">${config.emoji}</div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
      });

      const marker = L.marker(
        [m.coordinate.latitude, m.coordinate.longitude],
        { icon }
      );

      if (m.title) {
        const popupContent = `
          <div style="font-family: -apple-system, sans-serif; min-width: 150px; padding: 4px;">
            <strong style="color: #1A1A1A; font-size: 14px;">${m.title}</strong>
            ${m.description ? `<br/><span style="color: #666; font-size: 12px; margin-top: 4px; display: block;">${m.description}</span>` : ""}
          </div>
        `;
        marker.bindPopup(popupContent);
      }

      marker.on("click", () => {
        onMarkerPress?.(m.id);
      });

      layer.addLayer(marker);
    });

    // Fit bounds if multiple markers
    if (markers.length >= 2) {
      try {
        const bounds = L.latLngBounds(
          markers.map((m) => [m.coordinate.latitude, m.coordinate.longitude])
        );
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [60, 60],
          maxZoom: 16,
        });
      } catch (e) {
        // ignore bounds errors
      }
    }
  }, [markers, onMarkerPress]);

  // Update routes
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!mapInstanceRef.current || !routesLayerRef.current) return;

    const L = require("leaflet");
    const layer = routesLayerRef.current;
    layer.clearLayers();

    routes.forEach((route) => {
      if (!route.coordinates || route.coordinates.length < 2) return;

      const latLngs = route.coordinates.map((c) => [
        c.latitude,
        c.longitude,
      ]);

      const polyline = L.polyline(latLngs, {
        color: route.color || "#7E2EFF",
        weight: route.width || 4,
        opacity: 0.85,
        smoothFactor: 1,
        lineCap: "round",
        lineJoin: "round",
      });

      layer.addLayer(polyline);
    });
  }, [routes]);

  // Update center when region changes significantly
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!mapInstanceRef.current || !loaded) return;

    const map = mapInstanceRef.current;
    const currentCenter = map.getCenter();
    const dist = Math.sqrt(
      Math.pow(currentCenter.lat - region.latitude, 2) +
        Math.pow(currentCenter.lng - region.longitude, 2)
    );

    // Only pan if significant change
    if (dist > 0.01) {
      const zoom = Math.round(
        Math.log2(360 / Math.max(region.latitudeDelta, 0.001)) + 1
      );
      map.setView([region.latitude, region.longitude], Math.min(zoom, 18), {
        animate: true,
      });
    }
  }, [region.latitude, region.longitude]);

  if (error) {
    return (
      <View style={[webStyles.placeholder, style]}>
        <Text style={webStyles.errorText}>⚠️ Map Error</Text>
        <Text style={webStyles.errorSubtext}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[{ flex: 1 }, style]}>
      {!loaded && (
        <View style={webStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#7E2EFF" />
          <Text style={webStyles.loadingText}>Loading map...</Text>
        </View>
      )}
      <div
        ref={mapContainerRef as any}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 0,
          overflow: "hidden",
        }}
      />
    </View>
  );
};

const webStyles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF5252",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
});

// ============================================
// NATIVE WEBVIEW MAP (for iOS/Android when react-native-maps unavailable)
// ============================================
const NativeWebViewMap: React.FC<SafeMapProps> = ({
  region,
  markers = [],
  routes = [],
  onMapPress,
  onMarkerPress,
  onRegionChange,
  style,
}) => {
  let WebView: any;
  try {
    WebView = require("react-native-webview").WebView;
  } catch {
    return (
      <View style={[fallbackStyles.container, style]}>
        <Text style={fallbackStyles.text}>
          Map requires react-native-webview
        </Text>
      </View>
    );
  }

  const html = generateLeafletHTML(region, markers, routes, DEFAULT_TILES);

  const handleMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.type === "mapPress" && onMapPress) {
          onMapPress({
            latitude: data.latitude,
            longitude: data.longitude,
          });
        } else if (data.type === "marker" && onMarkerPress) {
          onMarkerPress(data.id);
        } else if (data.type === "regionChange" && onRegionChange) {
          onRegionChange({
            latitude: data.latitude,
            longitude: data.longitude,
            latitudeDelta: data.latitudeDelta,
            longitudeDelta: data.longitudeDelta,
          });
        }
      } catch (e) {
        console.error("[NativeWebViewMap] Message parse error:", e);
      }
    },
    [onMapPress, onMarkerPress, onRegionChange]
  );

  return (
    <WebView
      style={[{ flex: 1 }, style]}
      source={{ html }}
      javaScriptEnabled
      domStorageEnabled
      scalesPageToFit={false}
      scrollEnabled={false}
      bounces={false}
      onMessage={handleMessage}
      originWhitelist={["*"]}
      mixedContentMode="compatibility"
    />
  );
};

const fallbackStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
  },
  text: {
    fontSize: 14,
    color: "#999",
  },
});

// ============================================
// MAIN SAFEMAP COMPONENT
// ============================================
const SafeMap: React.FC<SafeMapProps> = (props) => {
  const {
    region,
    markers = [],
    routes = [],
    onMapPress,
    onMarkerPress,
    onRegionChange,
    showUserLocation = false,
    style,
    children,
  } = props;

  const mapRef = useRef<any>(null);

  // ============================================
  // WEB PLATFORM
  // ============================================
  if (Platform.OS === "web") {
    return <WebLeafletMap {...props} />;
  }

  // ============================================
  // NATIVE PLATFORM WITH react-native-maps
  // ============================================
  if (RNMapView) {
    return (
      <RNMapView
        ref={mapRef}
        style={[mapStyles.map, style]}
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={showUserLocation}
        onPress={(e: any) => {
          if (e.nativeEvent?.coordinate) {
            onMapPress?.(e.nativeEvent.coordinate);
          }
        }}
        onRegionChangeComplete={(r: any) => {
          onRegionChange?.(r);
        }}
      >
        {/* Routes */}
        {routes.map((route, index) => {
          if (!route.coordinates || route.coordinates.length < 2) return null;
          return (
            <RNPolyline
              key={`route-${index}`}
              coordinates={route.coordinates}
              strokeColor={route.color || "#7E2EFF"}
              strokeWidth={route.width || 4}
              lineDashPattern={[0]}
              lineCap="round"
              lineJoin="round"
            />
          );
        })}

        {/* Markers */}
        {markers.map((marker) => (
          <RNMarker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            onPress={() => onMarkerPress?.(marker.id)}
          >
            <NativeMarkerIcon
              type={marker.type}
              selected={marker.selected}
              heading={marker.heading}
            />
          </RNMarker>
        ))}

        {children}
      </RNMapView>
    );
  }

  // ============================================
  // NATIVE PLATFORM WITHOUT react-native-maps (WebView fallback)
  // ============================================
  return <NativeWebViewMap {...props} />;
};

const mapStyles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

// ============================================
// LEGACY EXPORTS (backward compatibility)
// ============================================
export const MapView = RNMapView;
export const Marker = RNMarker;
export const Polyline = RNPolyline;
export const Circle = RNCircle;
export const PROVIDER_GOOGLE = PROVIDER_DEFAULT;

// New exports
export { SafeMap, TILE_PROVIDERS, MARKER_CONFIG, DEFAULT_TILES };
export type { SafeMapProps as MapProps };
export default SafeMap;