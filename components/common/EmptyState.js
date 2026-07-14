import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts";

export default function EmptyState({
  title = "Nothing here yet",
  message = "We couldn't find anything to show right now.",
  icon = "folder-open-outline",
}) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Ionicons color={colors.gold} name={icon} size={32} />
      <Text style={[styles.title, { color: colors.textStrong }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  title: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
});
