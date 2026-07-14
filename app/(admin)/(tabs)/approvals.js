import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../contexts";

export default function AdminApprovalsScreen() {
  const { colors } = useTheme();

  return (
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.textStrong }]}>Approvals</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Pending requests
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
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
});
