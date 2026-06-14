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
import useAuth from "../../hooks/useAuth";
import Toast from "react-native-toast-message";

export default function DrawerContent(props) {
  const pathname = usePathname();
  const { user, userRole, signOutUser } = useAuth();
  
  // Use userRole if available, otherwise default to public
  const currentRole = userRole || "public";

  const menuItems = {
    public: [
      { label: "Home", href: "/(public)/(tabs)" },
      { label: "About Academy", href: "/(public)/about" },
      { label: "Vacancies", href: "/(public)/vacancies" },
      { label: "Volunteer Opportunities", href: "/(public)/volunteer-opportunities" },
      { label: "Contact Us", href: "/(public)/contact" },
      { label: "Settings", href: "/(public)/settings" },
      user ? { label: "Logout", href: null } : { label: "Login", href: "/(auth)/login" },
    ],
    parent: [
      { label: "Dashboard", href: "/(parent)/(tabs)" },
      { label: "Prayer Timetable", href: "/(parent)/prayer-timetable" },
      { label: "Ramadan Hub", href: "/(parent)/ramadan-hub" },
      { label: "Announcements", href: "/(parent)/announcements" },
      { label: "Events", href: "/(parent)/events" },
      { label: "Contact Us", href: "/(parent)/contact" },
      { label: "Settings", href: "/(parent)/settings" },
      { label: "Logout", href: null },
    ],
    teacher: [
      { label: "Dashboard", href: "/(teacher)/(tabs)" },
      { label: "Students", href: "/(teacher)/students" },
      { label: "Attendance", href: "/(teacher)/attendance" },
      { label: "Messages", href: "/(teacher)/messages" },
      { label: "Prayer Timetable", href: "/(teacher)/prayer-timetable" },
      { label: "Settings", href: "/(teacher)/settings" },
      { label: "Logout", href: null },
    ],
    admin: [
      { label: "Dashboard", href: "/(admin)/(tabs)" },
      { label: "Academy", href: "/(admin)/academy" },
      { label: "Approvals", href: "/(admin)/approvals" },
      { label: "Alerts", href: "/(admin)/alerts" },
      { label: "Prayer Management", href: "/(admin)/prayer-management" },
      { label: "Announcement Management", href: "/(admin)/announcement-management" },
      { label: "Events", href: "/(admin)/event-management" },
      { label: "Settings", href: "/(admin)/settings" },
      { label: "Logout", href: null },
    ],
  };

  const handleNavigation = (href) => {
    router.push(href);
    props.navigation?.closeDrawer();
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Logged out successfully!",
      });
      props.navigation?.closeDrawer();
      router.replace("/(public)/(tabs)");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Logout Failed",
        text2: error.message,
      });
    }
  };

  const items = menuItems[currentRole] || menuItems.public;

  return (
    <DrawerContentScrollView {...props}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {currentRole === "public" ? "Alyaqeen Academy" : `${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Portal`}
          </Text>
          {user && (
            <Text style={styles.userEmail} numberOfLines={1}>
              {user.email}
            </Text>
          )}
        </View>
        <View style={styles.menu}>
          {items.map((item, index) => {
            if (!item) return null;
            const isActive = item.href && (pathname === item.href || pathname.startsWith(item.href + "/"));
            
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
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
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
