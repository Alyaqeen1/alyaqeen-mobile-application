import { View, Text } from "react-native";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { Link } from "expo-router";

export default function PublicHomeScreen() {
  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center px-6 gap-4">
        <Text className="text-2xl font-bold text-foreground">Public Home</Text>
        <Link href="/(auth)/login" className="text-gold font-semibold">
          Go to Login
        </Link>
      </View>
    </ScreenContainer>
  );
}
