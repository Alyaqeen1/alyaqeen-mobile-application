import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function VacancyCard({ vacancy = null }) {
  const dummy = {
    title: "Quran Teacher",
    description: "Part-time position available",
    date: "2024-06-15",
  };
  const item = vacancy || dummy;

  return (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.date}>{item.date}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
