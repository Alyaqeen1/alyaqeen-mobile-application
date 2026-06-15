import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useTheme } from "../../contexts";
import useAuth from "../../hooks/useAuth";
import Toast from "react-native-toast-message";
import { router } from "expo-router";

export default function CustomHeader({ navigation }) {
  const { isDark, toggleTheme } = useTheme();
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
    <View style={[styles.header, { backgroundColor: isDark ? "#0F172A" : "#F8F5EE" }]}>
      <Image
        source={require("../../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerButton} onPress={toggleTheme}>
          <Text style={styles.headerIcon}>{isDark ? "☀️" : "🌙"}</Text>
        </TouchableOpacity>
        {user && (
          <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
            <Text style={styles.headerIcon}>🚪</Text>
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
    paddingTop: 10,
    paddingBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerIcon: {
    fontSize: 24,
  },
});
