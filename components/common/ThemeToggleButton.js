import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts";

export default function ThemeToggleButton({
  style,
  iconSize = 22,
  accessibilityLabel,
}) {
  const { isDark, colors, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ||
        `Switch to ${isDark ? "light" : "dark"} mode`
      }
      activeOpacity={0.85}
      onPress={toggleTheme}
      style={[
        styles.button,
        {
          backgroundColor: colors.toggleBackground,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Ionicons
        color={colors.gold}
        name={isDark ? "sunny-outline" : "moon-outline"}
        size={iconSize}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
