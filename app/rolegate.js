import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import WelcomeScreen from "."; // 👈 rename your index screen

export default function RoleGate() {
  const [checked, setChecked] = useState(false);
  const [hasRole, setHasRole] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const role = await AsyncStorage.getItem("role");

      if (role) {
        setHasRole(true);

        if (role === "admin") {
          router.replace("/admin");
        } else if (role === "driver") {
          router.replace("/driver");
        } else {
          router.replace("/user");
        }
      }

      setChecked(true);
    };

    checkRole();
  }, []);

  if (!checked) return null;

  // If NO ROLE — show welcome screen
  if (!hasRole) {
    return <index />;
  }

  return null;
}
