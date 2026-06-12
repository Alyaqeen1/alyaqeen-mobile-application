import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { dummyStudents } from "../../../dummy-data/students.js";
import DashboardStatCard from "../../../components/cards/DashboardStatCard.js";
import StudentCard from "../../../components/cards/StudentCard.js";

export default function TeacherDashboardScreen() {
  const stats = [
    { label: "Students", value: "25" },
    { label: "Attendance", value: "88%" },
    { label: "Pending", value: "3" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.greeting}>Welcome, Teacher!</Text>
          <Text style={styles.subtitle}>Here's what's happening in your class</Text>
        </View>

        <View style={styles.statsSection}>
          {stats.map((stat, index) => (
            <DashboardStatCard key={index} stat={stat} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Students</Text>
          {dummyStudents.map((student) => (
            <View key={student.id} style={styles.cardWrapper}>
              <StudentCard student={student} />
            </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F3A32",
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
