import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function ScreenContainer({ children, className = "" }) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className={`flex-1 ${className}`}>{children}</View>
    </SafeAreaView>
  );
}
