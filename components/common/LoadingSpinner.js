import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "../../contexts";

export default function LoadingSpinner({ label = "Loading..." }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.gold} size="large" />
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  label: {
    marginTop: 12,
    fontSize: 15,
    textAlign: "center",
  },
});
