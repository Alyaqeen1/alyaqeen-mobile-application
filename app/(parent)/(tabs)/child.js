import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { dummyStudents } from "../../../dummy-data/students.js";
import { dummyAttendance } from "../../../dummy-data/attendance.js";
import { dummyPerformance } from "../../../dummy-data/performance.js";
import StudentCard from "../../../components/cards/StudentCard.js";
import AttendanceCard from "../../../components/cards/AttendanceCard.js";
import PerformanceCard from "../../../components/cards/PerformanceCard.js";
import AchievementCard from "../../../components/cards/AchievementCard.js";

export default function ParentChildScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.title}>Your Child</Text>
          {dummyStudents.map((student) => (
            <View key={student.id} style={styles.cardWrapper}>
              <StudentCard student={student} />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance</Text>
          {dummyAttendance.map((record) => (
            <View key={record.id} style={styles.cardWrapper}>
              <AttendanceCard attendance={record} />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          {dummyPerformance.map((record) => (
            <View key={record.id} style={styles.cardWrapper}>
              <PerformanceCard performance={record} />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.cardWrapper}>
            <AchievementCard />
          </View>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3A5F",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F3A32",
    marginBottom: 12,
  },
  cardWrapper: {
    marginBottom: 12,
  },
});
