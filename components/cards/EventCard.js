import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function EventCard({ event }) {
  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.dateBadge}>
        <Text style={styles.dateBadgeText}>{event.date}</Text>
      </View>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.location}>{event.location}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    width: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dateBadge: {
    backgroundColor: "#C9A227",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  dateBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E3A5F",
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: "#4B5563",
  },
});
