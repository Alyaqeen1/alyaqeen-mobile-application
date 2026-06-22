import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { dummyNotifications } from "../../../dummy-data/notifications.js";
import { dummyStudents } from "../../../dummy-data/students.js";
import NotificationCard from "../../../components/cards/NotificationCard.js";
import StudentCard from "../../../components/cards/StudentCard.js";
import DashboardStatCard from "../../../components/cards/DashboardStatCard.js";
import { useTheme } from "../../../contexts";
import AppBackground from "../../../components/common/AppBackground";

export default function ParentDashboardScreen() {
  const { colors } = useTheme();
  const stats = [
    { label: "Attendance", value: "85%" },
    { label: "Performance", value: "A-" },
    { label: "Achievements", value: "3" },
  ];

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.greeting, { color: colors.textStrong }]}>
              Welcome, Parent!
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Here's what's happening at Alyaqeen Academy
            </Text>
          </View>

          <View style={styles.statsSection}>
            {stats.map((stat, index) => (
              <DashboardStatCard key={index} stat={stat} />
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Child
            </Text>
            {dummyStudents.map((student) => (
              <View key={student.id} style={styles.cardWrapper}>
                <StudentCard student={student} />
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Latest Notifications
            </Text>
            {dummyNotifications.slice(0, 3).map((notification) => (
              <View key={notification.id} style={styles.cardWrapper}>
                <NotificationCard notification={notification} />
              </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cardWrapper: {
    marginBottom: 12,
  },
});
