import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VacancyCard from "../../components/cards/VacancyCard.js";
import { useTheme } from "../../contexts";

export default function PublicVacanciesScreen() {
  const { colors } = useTheme();
  const dummyVacancies = [
    { id: 1, title: "Quran Teacher", description: "Part-time position available", date: "2024-06-15" },
    { id: 2, title: "Islamic Studies Teacher", description: "Full-time position", date: "2024-06-18" },
  ];

  return (
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textStrong }]}>Vacancies</Text>
        </View>
        <FlatList
          data={dummyVacancies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <VacancyCard vacancy={item} />
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardWrapper: {
    marginBottom: 12,
  },
});
