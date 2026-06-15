import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { dummyNotifications } from "../../../dummy-data/notifications.js";
import NotificationCard from "../../../components/cards/NotificationCard.js";

export default function AdminAlertsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
      </View>
      <FlatList
        data={dummyNotifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <NotificationCard notification={item} />
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  cardWrapper: {
    marginBottom: 12,
  },
});
