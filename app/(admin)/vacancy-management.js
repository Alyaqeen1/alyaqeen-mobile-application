import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminVacancyManagementScreen() {
  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Vacancy Management</Text>
        <Text style={styles.subtitle}>Manage job postings and applications</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5EE",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3A5F",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
});
