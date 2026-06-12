import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AttendanceCard({ attendance }) {
  return (
    <View style={styles.card}>
      <Text style={styles.date}>{attendance.date}</Text>
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
  date: {
    fontSize: 16,
    color: "#1F3A32",
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
