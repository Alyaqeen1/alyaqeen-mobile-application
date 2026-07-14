import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useTheme } from "../../../contexts";

const menuItems = [
  { label: "Prayer Timetable", href: "/(public)/prayer-timetable" },
  { label: "Jumuah Timetable", href: "/(public)/jumuah-timetable" },
  { label: "Ramadan Hub", href: "/(public)/ramadan-hub" },
  { label: "Islamic Calendar", href: "/(public)/islamic-calendar" },
  { label: "About Academy", href: "/(public)/about" },
  { label: "Vacancies", href: "/(public)/vacancies" },
  { label: "Volunteer Opportunities", href: "/(public)/volunteer-opportunities" },
  { label: "Contact Us", href: "/(public)/contact" },
  { label: "Settings", href: "/(public)/settings" },
];

export default function PublicMoreScreen() {
  const { colors } = useTheme();

  return (
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textStrong }]}>More</Text>
        </View>
        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href} asChild>
              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: colors.divider }]}
              >
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
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
  menu: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 16,
  },
});
