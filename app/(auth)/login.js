import { View, Text } from "react-native";
import { ScreenContainer } from "../../components/common/ScreenContainer";

export default function LoginScreen() {
  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-bold mb-8 text-foreground">
          Alyaqeen Academy
        </Text>
        <Text className="text-2xl font-semibold mb-2 text-foreground text-navy px-4 py-2 rounded-md">Login</Text>
        <Text className="text-muted-foreground">Placeholder UI</Text>
      </View>
    </ScreenContainer>
  );
}
