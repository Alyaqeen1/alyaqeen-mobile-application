import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DashboardStatCard from "../../../components/cards/DashboardStatCard";

export default function AdminDashboardScreen() {
  const stats = [
    { label: "Students", value: "150" },
    { label: "Teachers", value: "12" },
    { label: "Events", value: "5" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.greeting}>Welcome, Admin!</Text>
          <Text style={styles.subtitle}>Academy overview</Text>
        </View>

        <View style={styles.statsSection}>
          {stats.map((stat, index) => (
            <DashboardStatCard key={index} stat={stat} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5EE",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3A5F",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
