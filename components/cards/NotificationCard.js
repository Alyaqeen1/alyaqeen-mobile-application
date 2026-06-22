import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../contexts";

export default function NotificationCard({ notification }) {
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
        {notification.date}
      </Text>
      <Text style={[styles.title, { color: colors.textStrong }]}>
        {notification.title}
      </Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>
        {notification.message}
      </Text>
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
  date: {
    fontSize: 12,
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
  },
});
