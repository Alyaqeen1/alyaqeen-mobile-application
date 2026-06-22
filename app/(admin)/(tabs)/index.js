import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DashboardStatCard from "../../../components/cards/DashboardStatCard";
import { useTheme } from "../../../contexts";
import AppBackground from "../../../components/common/AppBackground";

export default function AdminDashboardScreen() {
  const { colors } = useTheme();
  const stats = [
    { label: "Students", value: "150" },
    { label: "Teachers", value: "12" },
    { label: "Events", value: "5" },
  ];

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
    paddingBottom: 120,
  },
  section: {
    paddingVertical: 16,
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
