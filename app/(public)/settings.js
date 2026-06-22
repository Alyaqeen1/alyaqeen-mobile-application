import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts";
import AppBackground from "../../components/common/AppBackground";

export default function PublicSettingsScreen() {
  const { colors } = useTheme();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = React.useState(true);

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.textStrong }]}>Settings</Text>

          <View style={styles.section}>
            <View
              style={[
                styles.settingItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.shadowColor,
                },
              ]}
            >
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Enable Notifications
              </Text>
              <Switch
                value={isNotificationsEnabled}
                onValueChange={setIsNotificationsEnabled}
                trackColor={{ false: "#E5E7EB", true: "#C9A227" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

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
            <Text style={[styles.menuItemText, { color: colors.text }]}>About App</Text>
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
              Privacy Policy
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
              Terms of Service
            </Text>
          </TouchableOpacity>
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  section: {
    marginBottom: 16,
  },
  settingItem: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  menuItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
  },
  menuItemText: {
    fontSize: 16,
  },
});
