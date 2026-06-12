import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function DashboardStatCard({ stat }) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{stat.value}</Text>
      <Text style={styles.label}>{stat.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#C9A227",
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
});
