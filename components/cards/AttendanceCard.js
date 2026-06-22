import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../contexts";

export default function AttendanceCard({ attendance }) {
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
      <Text style={[styles.date, { color: colors.text }]}>{attendance.date}</Text>
      <View style={[styles.statusBadge, attendance.status === "Present" ? styles.present : styles.absent]}>
        <Text style={[styles.statusText, attendance.status === "Present" ? styles.presentText : styles.absentText]}>
          {attendance.status}
        </Text>
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
  date: {
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  present: {
    backgroundColor: "#10B98120",
  },
  absent: {
    backgroundColor: "#EF444420",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  presentText: {
    color: "#10B981",
  },
  absentText: {
    color: "#EF4444",
  },
});
