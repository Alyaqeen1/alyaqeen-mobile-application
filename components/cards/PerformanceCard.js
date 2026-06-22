import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../contexts";

export default function PerformanceCard({ performance }) {
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
      <Text style={[styles.subject, { color: colors.text }]}>{performance.subject}</Text>
      <View style={styles.gradeBadge}>
        <Text style={styles.grade}>{performance.grade}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  subject: {
    fontSize: 16,
    fontWeight: "500",
  },
  gradeBadge: {
    backgroundColor: "#C9A227",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  grade: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
