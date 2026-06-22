import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { dummyAnnouncements } from "../../../dummy-data/announcements.js";
import AnnouncementCard from "../../../components/cards/AnnouncementCard.js";
import { useTheme } from "../../../contexts";
import AppBackground from "../../../components/common/AppBackground";

export default function PublicAnnouncementsScreen() {
  const { colors } = useTheme();

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textStrong }]}>
            Announcements
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Latest updates from Alyaqeen Academy
          </Text>
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
    </AppBackground>
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
    marginBottom: 16,
  },
});
