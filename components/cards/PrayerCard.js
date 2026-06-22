import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../contexts";

export default function PrayerCard({ prayer }) {
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
      <View style={styles.prayerInfo}>
        <Text style={[styles.prayerName, { color: colors.textStrong }]}>
          {prayer.name}
        </Text>
      </View>
      <View style={[styles.prayerTime, { backgroundColor: colors.goldSoft }]}>
        <Text style={styles.timeText}>{prayer.time}</Text>
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
  prayerInfo: {
    flex: 1,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: "600",
  },
  prayerTime: {
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
