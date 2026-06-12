import { View, Text } from "react-native";
import { ScreenContainer } from "../../components/common/ScreenContainer";

export default function ForgotPasswordScreen() {
  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-semibold mb-2 text-foreground">Forgot Password</Text>
        <Text className="text-muted-foreground">Placeholder UI</Text>
      </View>
    </ScreenContainer>
  );
}
