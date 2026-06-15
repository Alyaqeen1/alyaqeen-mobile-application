import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { dummyAnnouncements } from "../../../dummy-data/announcements.js";
import AnnouncementCard from "../../../components/cards/AnnouncementCard.js";

export default function PublicAnnouncementsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Announcements</Text>
        <Text style={styles.subtitle}>Latest updates from Alyaqeen Academy</Text>
      </View>
      <FlatList
        data={dummyAnnouncements}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <AnnouncementCard announcement={item} />
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
    marginBottom: 16,
  },
});
