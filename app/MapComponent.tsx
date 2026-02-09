// mobile/app/MapComponent.tsx
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

type WebMapProps = {
  initialRegion: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
  onPress?: (latlng: { latitude: number; longitude: number }) => void;
  children?: React.ReactNode;
};

export const WebMap: React.FC<WebMapProps> = ({ 
  initialRegion, 
  onPress, 
  children 
}) => {
  if (Platform.OS !== 'web') {
    return (
      <WebView
        style={styles.map}
        source={{ html: getOsmHtml(initialRegion, onPress) }}
        javaScriptEnabled
        domStorageEnabled
        scalesPageToFit={false}
        scrollEnabled={false}
        bounces={false}
      />
    );
  }

  // Web: use react-leaflet (previous fixes)
  return <View style={styles.map} />; 
};

// Local HTML with Leaflet OSM
const getOsmHtml = (region: any, onPress?: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>html,body,#map {width:100%;height:100%;margin:0;padding:0;}</style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${region.latitude}, ${region.longitude}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    ${onPress ? `map.on('click', function(e) {
      window.ReactNativeWebView.postMessage(JSON.stringify({latitude: e.latlng.lat, longitude: e.latlng.lng}));
    });` : ''}
  </script>
</body>
</html>
`;

const styles = StyleSheet.create({
  map: { flex: 1 }
});
