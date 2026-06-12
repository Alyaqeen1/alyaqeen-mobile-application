import { View, Text } from "react-native";
import { ScreenContainer } from "../../components/common/ScreenContainer";

export default function Screen() {
  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-semibold text-foreground"></Text>
        <Text className="text-muted-foreground">Placeholder UI</Text>
      </View>
    </ScreenContainer>
  );
}
