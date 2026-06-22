import { View, Text } from "react-native";
import { ScreenContainer } from "../../components/common/ScreenContainer";

export default function PublicRamadanHubScreen() {
  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-semibold text-foreground">
          Ramadan Hub
        </Text>
        <Text className="text-muted-foreground">
          Ramadan resources and information
        </Text>
      </View>
    </ScreenContainer>
  );
}
