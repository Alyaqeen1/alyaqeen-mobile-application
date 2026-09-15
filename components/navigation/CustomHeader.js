import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, Platform, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../contexts";
import useAuth from "../../hooks/useAuth";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import ThemeToggleButton from "../common/ThemeToggleButton";

export default function CustomHeader({ navigation }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, userRole, signOutUser } = useAuth();

  const isPrivilegedRole = ["admin", "teacher", "parent"].includes(userRole);

  const handleLogout = async () => {
    try {
      await signOutUser();
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Logged out successfully!",
      });
      try {
        // Explicitly navigate to login after sign-out to bypass any stale
        // protected-layout render states (ProtectedRoute also redirects, but
        // this guarantees navigation happens even on fast transitions).
        router.replace("/(auth)/login");
      } catch (err) {
        console.warn("Logout redirect failed:", err?.message || err);
        try {
          router.replace("/(public)/(tabs)");
        } catch (innerErr) {
          console.warn("Logout fallback redirect also failed:", innerErr?.message || innerErr);
        }
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Logout Failed",
        text2: error?.message || String(error),
      });
    }
  };

  const handleLogin = () => {
    try {
      // Close drawer first if open to prevent navigation conflicts
      if (navigation?.canGoBack?.()) {
        // noop; proceed to navigation
      }
      navigation?.closeDrawer?.();
      // Use a tiny delay to allow drawer close animation to start
      setTimeout(() => {
        try {
          router.push("/(auth)/login");
        } catch (innerErr) {
          console.warn("Login nav fallback push failed, trying replace:", innerErr?.message || innerErr);
          try {
            router.navigate("/(auth)/login");
          } catch (finalErr) {
            console.error("Login navigation completely failed:", finalErr?.message || finalErr);
            Toast.show({
              type: "error",
              text1: "Navigation Error",
              text2: "Unable to open login screen",
            });
          }
        }
      }, 50);
    } catch (err) {
      console.warn("Login navigation failed:", err?.message || err);
      Toast.show({
        type: "error",
        text1: "Navigation Error",
        text2: "Unable to open login screen",
      });
    }
  };

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + 8,
        },
      ]}
    >
      <View style={styles.leftSection}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
          style={styles.iconButton}
          onPress={() => navigation?.toggleDrawer?.()}
        >
          <Ionicons 
            color={colors.text} 
            name="menu" 
            size={24} 
          />
        </TouchableOpacity>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.headerActions}>
        <ThemeToggleButton style={styles.themeButton} />
        {isPrivilegedRole ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Log out"
            style={styles.iconButton}
            onPress={handleLogout}
          >
            <Ionicons 
              color={colors.text} 
              name="log-out-outline" 
              size={22} 
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Log in"
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Ionicons 
              color={colors.gold} 
              name="log-in-outline" 
              size={20} 
            />
            <Text style={[styles.loginButtonText, { color: colors.gold }]}>
              Login
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    // No backgroundColor, no border, no shadow
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    // Completely transparent - no background, no border
  },
  themeButton: {
    width: 44,
    height: 44,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(201, 162, 39, 0.3)",
    backgroundColor: "rgba(201, 162, 39, 0.08)",
  },
  loginButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
});