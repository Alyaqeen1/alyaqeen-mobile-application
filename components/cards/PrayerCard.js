import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PrayerCard({ prayer }) {
  return (
    <View style={styles.card}>
      <View style={styles.prayerInfo}>
        <Text style={styles.prayerName}>{prayer.name}</Text>
      </View>
      <View style={styles.prayerTime}>
        <Text style={styles.timeText}>{prayer.time}</Text>
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
  prayerInfo: {
    flex: 1,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E3A5F",
  },
  prayerTime: {
    backgroundColor: "#C9A22720",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  timeText: {
    color: "#C9A227",
    fontSize: 16,
    fontWeight: "600",
  },
});
