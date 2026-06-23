import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, Platform } from "react-native";
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
  const { user, signOutUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOutUser();
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Logged out successfully!",
      });
      router.replace("/(public)/(tabs)");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Logout Failed",
        text2: error.message,
      });
    }
  };

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + 8,
          // Make sure no background is applied
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
        {user && (
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
});