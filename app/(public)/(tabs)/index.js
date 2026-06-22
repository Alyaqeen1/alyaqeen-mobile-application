import React from "react";
import { View, Text, FlatList, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { dummyAnnouncements } from "../../../dummy-data/announcements.js";
import { dummyEvents } from "../../../dummy-data/events.js";
import { dummyPrayerTimes } from "../../../dummy-data/prayerTimes.js";
import AnnouncementCard from "../../../components/cards/AnnouncementCard.js";
import EventCard from "../../../components/cards/EventCard.js";
import { useTheme } from "../../../contexts";
import AppBackground from "../../../components/common/AppBackground";

export default function PublicHomeScreen() {
  const { colors } = useTheme();
  
  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textStrong }]}>
              Welcome to Alyaqeen Academy
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              Empowering minds with Islamic education
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>
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
            <Text style={[styles.sectionHeader, { color: colors.text }]}>
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
