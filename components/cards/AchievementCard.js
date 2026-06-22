import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../contexts";

export default function AchievementCard({ achievement = null }) {
  const { colors } = useTheme();
  const dummyAchievement = {
    title: "Quran Memorization",
    description: "Completed 5 Juz",
    date: "2024-06-10",
  };
  const item = achievement || dummyAchievement;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadowColor,
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: colors.goldSoft }]}>
        <Text style={styles.iconText}>🏆</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.textStrong }]}>{item.title}</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          {item.description}
        </Text>
        <Text style={[styles.date, { color: colors.textMuted }]}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
});
