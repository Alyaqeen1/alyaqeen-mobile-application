import { View, Text } from "react-native";
import { ScreenContainer } from "../../components/common/ScreenContainer";

export default function PublicIslamicCalendarScreen() {
  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-semibold text-foreground">
          Islamic Calendar
        </Text>
        <Text className="text-muted-foreground">Hijri calendar and dates</Text>
      </View>
    </ScreenContainer>
  );
}
