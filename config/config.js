// config.js
import Constants from "expo-constants";

// Development local IP
const DEV_SERVER_IP = "192.168.8.169"; // replace with your PC's LAN IP
const DEV_PORT = "3000";

const SERVER_URL =
  Constants.manifest?.debuggerHost && Constants.manifest?.debuggerHost.includes("localhost")
    ? `http://${DEV_SERVER_IP}:${DEV_PORT}`
    : "https://your-production-server.com"; // replace with your production URL

export default SERVER_URL;
