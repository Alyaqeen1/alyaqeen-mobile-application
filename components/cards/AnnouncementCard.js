import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../contexts";
import { htmlToPlainText } from "../../utils/html";

export default function AnnouncementCard({ announcement }) {
  const { colors } = useTheme();

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
      <Text style={[styles.date, { color: colors.textMuted }]}>
        {announcement.date}
      </Text>
      <Text style={[styles.title, { color: colors.textStrong }]}>
        {announcement.title}
      </Text>
      <Text style={[styles.description, { color: colors.textMuted }]}>
        {htmlToPlainText(announcement.description)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    width: "100%",
    alignSelf: "stretch",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  date: {
    fontSize: 12,
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
});
