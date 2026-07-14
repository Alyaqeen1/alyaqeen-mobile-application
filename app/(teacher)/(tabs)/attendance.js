import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { dummyStudents } from "../../../dummy-data/attendance.js";
import StudentCard from "../../../components/cards/StudentCard.js";
import { useTheme } from "../../../contexts";

export default function TeacherAttendanceScreen() {
  const { colors } = useTheme();

  return (
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textStrong }]}>Attendance</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Today&apos;s attendance
          </Text>
        </View>
        <FlatList
          data={dummyStudents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <StudentCard student={item} />
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  cardWrapper: {
    marginBottom: 12,
  },
});
