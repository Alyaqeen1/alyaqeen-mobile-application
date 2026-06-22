import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../contexts";

export default function VacancyCard({ vacancy = null }) {
  const { colors } = useTheme();
  const dummy = {
    title: "Quran Teacher",
    description: "Part-time position available",
    date: "2024-06-15",
  };
  const item = vacancy || dummy;

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
      <Text style={[styles.title, { color: colors.textStrong }]}>{item.title}</Text>
      <Text style={[styles.description, { color: colors.textMuted }]}>
        {item.description}
      </Text>
      <Text style={[styles.date, { color: colors.textMuted }]}>{item.date}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
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
