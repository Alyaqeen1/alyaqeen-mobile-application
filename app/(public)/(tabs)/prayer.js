import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { dummyPrayerTimes } from "../../../dummy-data/prayerTimes.js";
import PrayerCard from "../../../components/cards/PrayerCard.js";

export default function PublicPrayerScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prayer Timetable</Text>
        <Text style={styles.subtitle}>Today's Prayer Times</Text>
      </View>
      <FlatList
        data={dummyPrayerTimes}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <PrayerCard prayer={item} />
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
    backgroundColor: "#F8F5EE",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  cardWrapper: {
    marginBottom: 12,
  },
});
