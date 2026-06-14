import React from "react";
import { View, Text, FlatList, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { dummyAnnouncements } from "../../../dummy-data/announcements.js";
import { dummyEvents } from "../../../dummy-data/events.js";
import { dummyPrayerTimes } from "../../../dummy-data/prayerTimes.js";
import AnnouncementCard from "../../../components/cards/AnnouncementCard.js";
import EventCard from "../../../components/cards/EventCard.js";
import { useTheme } from "../../../contexts";

export default function PublicHomeScreen() {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0F172A" : "#F8F5EE" }]}>
      {/* Theme Toggle */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.themeToggle}
          onPress={toggleTheme}
        >
          <Text style={{ fontSize: 24 }}>{isDark ? "☀️" : "🌙"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#1E3A5F" }]}>
            Welcome to Alyaqeen Academy
          </Text>
          <Text style={[styles.sectionSubtitle, { color: isDark ? "#94A3B8" : "#6B7280" }]}>
            Empowering minds with Islamic education
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: isDark ? "#F1F5F9" : "#1F3A32" }]}>
            Latest Announcements
          </Text>
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
          <Text style={[styles.sectionHeader, { color: isDark ? "#F1F5F9" : "#1F3A32" }]}>
            Upcoming Events
          </Text>
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 10
  },
  themeToggle: {
    padding: 8
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  cardWrapper: {
    marginRight: 12,
  },
});
