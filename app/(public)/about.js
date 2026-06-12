import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PublicAboutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>About Alyaqeen Academy</Text>
        <Text style={styles.description}>
          Alyaqeen Academy is an Islamic educational institution dedicated to
          providing quality education with a strong foundation in Islamic values
          and teachings.
        </Text>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.description}>
          To empower students with knowledge, faith, and character to become
          successful individuals and positive contributors to society.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5EE",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3A5F",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F3A32",
    marginTop: 24,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
  },
});
