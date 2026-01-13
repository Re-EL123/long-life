import { View, Text } from "react-native";

export default function Unauthorized() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text style={{ fontSize: 20, color: "red" }}>
        You do not have permission to access this page.
      </Text>
    </View>
  );
}
