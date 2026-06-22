import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { dummyPrayerTimes } from "../../../dummy-data/prayerTimes.js";
import PrayerCard from "../../../components/cards/PrayerCard.js";
import { useTheme } from "../../../contexts";
import AppBackground from "../../../components/common/AppBackground";

export default function PublicPrayerScreen() {
  const { colors } = useTheme();

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textStrong }]}>
            Prayer Timetable
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Today's Prayer Times
          </Text>
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
    marginBottom: 12,
  },
});
