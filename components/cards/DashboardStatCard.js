import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../contexts";

export default function DashboardStatCard({ stat }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadowColor,
        },
      ]}
    >
      <Text style={styles.value}>{stat.value}</Text>
      <Text style={[styles.label, { color: colors.textMuted }]}>{stat.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#C9A227",
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    textAlign: "center",
  },
});
