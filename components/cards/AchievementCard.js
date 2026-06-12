import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function AchievementCard({ achievement = null }) {
  const dummyAchievement = {
    title: "Quran Memorization",
    description: "Completed 5 Juz",
    date: "2024-06-10",
  };
  const item = achievement || dummyAchievement;

  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>🏆</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#C9A22720",
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
    color: "#1E3A5F",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
  },
});
