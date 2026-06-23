import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import DashboardStatCard from "../../../components/cards/DashboardStatCard";
import { useTheme } from "../../../contexts";

export default function AdminDashboardScreen() {
  const { colors } = useTheme();
  
  const stats = [
    { label: "Students", value: "150" },
    { label: "Teachers", value: "12" },
    { label: "Events", value: "5" },
  ];

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={[styles.greeting, { color: colors.textStrong }]}>
          Welcome, Admin!
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Academy overview
        </Text>
      </View>

      <View style={styles.statsSection}>
        {stats.map((stat, index) => (
          <DashboardStatCard key={index} stat={stat} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20, // Just a small top padding
    paddingBottom: 120,
  },
  section: {
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    gap: 10,
  },
});