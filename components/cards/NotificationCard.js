import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function NotificationCard({ notification }) {
  return (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.date}>{notification.date}</Text>
      <Text style={styles.title}>{notification.title}</Text>
      <Text style={styles.message}>{notification.message}</Text>
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
  date: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A5F",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: "#4B5563",
  },
});
