import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

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
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
      </View>
      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <Link key={index} href={item.href} asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>{item.label}</Text>
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
  menu: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  menuItemText: {
    fontSize: 16,
    color: "#1F3A32",
  },
});
