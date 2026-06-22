import { View, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AppBackground from "./AppBackground";
import ThemeToggleButton from "./ThemeToggleButton";

export function ScreenContainer({ children, className = "" }) {
  const insets = useSafeAreaInsets();

  return (
    <AppBackground>
      <SafeAreaView
        className="flex-1"
        style={[styles.safeArea, { backgroundColor: "transparent" }]}
      >
        <ThemeToggleButton
          accessibilityLabel="Toggle app theme"
          style={[styles.themeToggle, { top: insets.top + 12 }]}
        />
        <View
          className={`flex-1 ${className}`}
          style={[
            styles.content,
            {
              paddingTop: insets.top + 72,
              paddingBottom: insets.bottom + 16,
              backgroundColor: "transparent",
            },
          ]}
        >
          {children}
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  themeToggle: {
    position: "absolute",
    top: 12,
    right: 20,
    zIndex: 20,
  },
});
