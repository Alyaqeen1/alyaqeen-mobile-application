import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { router, usePathname } from "expo-router";

export default function DrawerContent({ role = "public", ...props }) {
  const pathname = usePathname();

  const menuItems = {
    public: [
      { label: "About Academy", href: "/(public)/about" },
      { label: "Vacancies", href: "/(public)/vacancies" },
      { label: "Volunteer Opportunities", href: "/(public)/volunteer-opportunities" },
      { label: "Contact Us", href: "/(public)/contact" },
      { label: "Settings", href: "/(public)/settings" },
      { label: "Login", href: "/(auth)/login" },
    ],
    parent: [
      { label: "Dashboard", href: "/(parent)/" },
      { label: "Prayer Timetable", href: "/(parent)/prayer-timetable" },
      { label: "Ramadan Hub", href: "/(parent)/ramadan-hub" },
      { label: "Announcements", href: "/(parent)/announcements" },
      { label: "Events", href: "/(parent)/events" },
      { label: "Contact Us", href: "/(parent)/contact" },
      { label: "Settings", href: "/(parent)/settings" },
      { label: "Logout", href: "/" }, // Changed to root for logout
    ],
    teacher: [
      { label: "Dashboard", href: "/(teacher)/" },
      { label: "Students", href: "/(teacher)/students" },
      { label: "Attendance", href: "/(teacher)/attendance" },
      { label: "Messages", href: "/(teacher)/messages" },
      { label: "Prayer Timetable", href: "/(teacher)/prayer-timetable" },
      { label: "Settings", href: "/(teacher)/settings" },
      { label: "Logout", href: "/" },
    ],
    admin: [
      { label: "Dashboard", href: "/(admin)/" },
      { label: "Academy", href: "/(admin)/academy" },
      { label: "Approvals", href: "/(admin)/approvals" },
      { label: "Alerts", href: "/(admin)/alerts" },
      { label: "Prayer Management", href: "/(admin)/prayer-management" },
      { label: "Announcement Management", href: "/(admin)/announcement-management" },
      { label: "Events", href: "/(admin)/event-management" },
      { label: "Settings", href: "/(admin)/settings" },
      { label: "Logout", href: "/" },
    ],
  };

  const handleNavigation = (href) => {
    router.push(href);
    props.navigation?.closeDrawer();
  };

  const handleLogout = async () => {
    // Add your logout logic here
    // Example: await logoutUser(); // Your logout function
    
    // Close drawer and navigate to login
    props.navigation?.closeDrawer();
    router.replace("/(auth)/login");
  };

  const items = menuItems[role] || menuItems.public;

  return (
    <DrawerContentScrollView {...props}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {role === "public" ? "Alyaqeen Academy" : `${role.charAt(0).toUpperCase() + role.slice(1)} Portal`}
          </Text>
        </View>
        <View style={styles.menu}>
          {items.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            
            // Handle logout separately
            if (item.label === "Logout") {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={handleLogout}
                >
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </TouchableOpacity>
              );
            }
            
            return (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, isActive && styles.activeMenuItem]}
                onPress={() => handleNavigation(item.href)}
              >
                <Text style={[styles.menuItemText, isActive && styles.activeMenuItemText]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3A5F",
  },
  menu: {
    paddingHorizontal: 10,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 2,
  },
  activeMenuItem: {
    backgroundColor: "#C9A22720",
  },
  menuItemText: {
    fontSize: 16,
    color: "#1F3A32",
  },
  activeMenuItemText: {
    color: "#C9A227",
    fontWeight: "600",
  },
});