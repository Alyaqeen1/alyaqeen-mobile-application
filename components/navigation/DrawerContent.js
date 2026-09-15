import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { router, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../contexts";
import Toast from "react-native-toast-message";
import ThemeToggleButton from "../common/ThemeToggleButton";

export default function DrawerContent(props) {
  const pathname = usePathname();
  const { user, userRole, signOutUser } = useAuth();
  const { isDark, colors } = useTheme();
  
  const isPrivilegedRole = ["admin", "teacher", "parent"].includes(userRole);
  const currentRole = isPrivilegedRole ? userRole : "public";

  const menuItems = {
    public: [
      { label: "Home", href: "/(public)/(tabs)" },
      { label: "About Academy", href: "/(public)/about" },
      { label: "Vacancies", href: "/(public)/vacancies" },
      { label: "Volunteer Opportunities", href: "/(public)/volunteer-opportunities" },
      { label: "Contact Us", href: "/(public)/contact" },
      { label: "Settings", href: "/(public)/settings" },
      { label: "Login", href: "/(auth)/login" },
    ],
    parent: [
      { label: "Dashboard", href: "/(parent)/(tabs)" },
      { label: "Fees & Payments", href: "/(parent)/(tabs)/fees" },
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
    if (!href) return;
    try {
      // Close drawer first to prevent navigation conflicts between groups
      props.navigation?.closeDrawer?.();
      // Use tiny delay to let drawer close animation begin
      setTimeout(() => {
        try {
          router.push(href);
        } catch (innerErr) {
          console.warn("Drawer nav push failed for:", href, "trying navigate:", innerErr?.message || innerErr);
          try {
            router.navigate(href);
          } catch (finalErr) {
            console.error("Drawer navigation completely failed for:", href, finalErr?.message || finalErr);
            Toast.show({
              type: "error",
              text1: "Navigation Error",
              text2: "Unable to navigate",
            });
          }
        }
      }, 50);
    } catch (err) {
      console.warn("Drawer navigation failed for:", href, err?.message || err);
      Toast.show({
        type: "error",
        text1: "Navigation Error",
        text2: "Unable to navigate",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Logged out successfully!",
      });
      props.navigation?.closeDrawer?.();
      // Explicitly navigate to login after sign-out to bypass any stale
      // protected-layout render states.
      setTimeout(() => {
        try {
          router.replace("/(auth)/login");
        } catch (err) {
          console.warn("Drawer logout redirect to login failed, trying public:", err?.message || err);
          try {
            router.replace("/(public)/(tabs)");
          } catch (innerErr) {
            console.error("Drawer logout redirect completely failed:", innerErr?.message || innerErr);
            Toast.show({
              type: "error",
              text1: "Navigation Error",
              text2: "Please restart the app",
            });
          }
        }
      }, 50);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Logout Failed",
        text2: error?.message || String(error),
      });
    }
  };

  const items = menuItems[currentRole] || menuItems.public;

  return (
    <DrawerContentScrollView {...props}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.drawerBackground }]}
      >
        <View
          style={[
            styles.header,
            { borderBottomColor: colors.border },
          ]}
        >
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerActions}>
            <ThemeToggleButton style={styles.headerButton} />
            {isPrivilegedRole && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Log out"
                style={[
                  styles.logoutButton,
                  {
                    backgroundColor: colors.surfaceSoft,
                    borderColor: colors.border,
                  },
                ]}
                onPress={handleLogout}
              >
                <Ionicons color={colors.gold} name="log-out-outline" size={22} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.menu}>
          {items.map((item, index) => {
            if (!item || !item.label) return null;

            // Skip any synthetic items without a real href (e.g. Logout placeholder)
            if (!item.href) return null;

            const isActive =
              !!item.href &&
              (pathname === item.href || pathname.startsWith(item.href + "/"));

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  {
                    borderColor: colors.border,
                    backgroundColor: isActive ? colors.goldSoft : "transparent",
                  },
                ]}
                onPress={() => handleNavigation(item.href)}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    { color: isDark ? colors.textStrong : colors.text },
                    isActive && styles.activeMenuItemText,
                  ]}
                >
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  headerButton: {
    width: 44,
    height: 44,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  menu: {
    paddingHorizontal: 10,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 2,
    borderWidth: 1,
  },
  menuItemText: {
    fontSize: 16,
  },
  activeMenuItemText: {
    color: "#C9A227",
    fontWeight: "600",
  },
});
