import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VolunteerCard from "../../components/cards/VolunteerCard.js";

export default function PublicVolunteerOpportunitiesScreen() {
  const dummyOpportunities = [
    { id: 1, title: "Event Helper", description: "Help organize upcoming Eid celebration", date: "2024-06-20" },
    { id: 2, title: "Tutor", description: "Help students with homework", date: "2024-06-25" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Volunteer Opportunities</Text>
      </View>
      <FlatList
        data={dummyOpportunities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <VolunteerCard volunteer={item} />
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
    paddingBottom: 20,
  },
  cardWrapper: {
    marginBottom: 12,
  },
});
