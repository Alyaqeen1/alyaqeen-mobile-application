import React from "react";
import { View, Text, FlatList, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { dummyAnnouncements } from "../../../dummy-data/announcements.js";
import { dummyEvents } from "../../../dummy-data/events.js";
import { dummyPrayerTimes } from "../../../dummy-data/prayerTimes.js";
import AnnouncementCard from "../../../components/cards/AnnouncementCard.js";
import EventCard from "../../../components/cards/EventCard.js";

export default function PublicHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Welcome to Alyaqeen Academy</Text>
          <Text style={styles.sectionSubtitle}>Empowering minds with Islamic education</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Latest Announcements</Text>
          <FlatList
            data={dummyAnnouncements}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <AnnouncementCard announcement={item} />
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Upcoming Events</Text>
          <FlatList
            data={dummyEvents}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <EventCard event={item} />
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3A5F",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F3A32",
    marginBottom: 12,
  },
  cardWrapper: {
    marginRight: 12,
  },
});
