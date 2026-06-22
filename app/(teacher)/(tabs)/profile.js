import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../contexts";
import AppBackground from "../../../components/common/AppBackground";

export default function TeacherProfileScreen() {
  const { colors } = useTheme();

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>T</Text>
            </View>
            <Text style={[styles.name, { color: colors.textStrong }]}>
              Teacher Name
            </Text>
            <Text style={[styles.email, { color: colors.textMuted }]}>
              teacher@alyaqeen.co.uk
            </Text>
          </View>

          <View style={styles.menu}>
            <TouchableOpacity
              style={[
                styles.menuItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.shadowColor,
                },
              ]}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.menuItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.shadowColor,
                },
              ]}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Settings
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.menuItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.shadowColor,
                },
              ]}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Help & Support
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.menuItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.shadowColor,
                },
              ]}
            >
              <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </AppBackground>
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
  profileHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#C9A227",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  menu: {
    gap: 4,
  },
  menuItem: {
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
  },
  menuItemText: {
    fontSize: 16,
  },
  logoutText: {
    color: "#EF4444",
  },
});
