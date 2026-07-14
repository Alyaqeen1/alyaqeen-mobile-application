import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts";

export default function PublicAboutScreen() {
  const { colors } = useTheme();

  return (
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.textStrong }]}>
            About Alyaqeen Academy
          </Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            Alyaqeen Academy is an Islamic educational institution dedicated to
            providing quality education with a strong foundation in Islamic values
            and teachings.
          </Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Our Mission
          </Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
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
    backgroundColor: "transparent",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
});
