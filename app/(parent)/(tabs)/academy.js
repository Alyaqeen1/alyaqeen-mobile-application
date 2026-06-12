import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { dummyAnnouncements } from "../../../dummy-data/announcements.js";
import { dummyEvents } from "../../../dummy-data/events.js";
import AnnouncementCard from "../../../components/cards/AnnouncementCard.js";
import EventCard from "../../../components/cards/EventCard.js";

export default function ParentAcademyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.title}>Academy</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Announcements</Text>
          {dummyAnnouncements.map((item) => (
            <View key={item.id} style={styles.cardWrapper}>
              <AnnouncementCard announcement={item} />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {dummyEvents.map((item) => (
            <View key={item.id} style={styles.cardWrapper}>
              <EventCard event={item} />
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3A5F",
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
