import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PerformanceCard({ performance }) {
  return (
    <View style={styles.card}>
      <Text style={styles.subject}>{performance.subject}</Text>
      <View style={styles.gradeBadge}>
        <Text style={styles.grade}>{performance.grade}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  subject: {
    fontSize: 16,
    color: "#1F3A32",
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
