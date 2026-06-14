import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import useAuth from "../../hooks/useAuth";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        router.replace("/(auth)/login");
      } else if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Logged in but not authorized, redirect to public home
        router.replace("/(public)/(tabs)");
      }
    }
  }, [user, userRole, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C9A227" />
      </View>
    );
  }

  if (!user || (allowedRoles && !allowedRoles.includes(userRole))) {
    // Don't render anything while redirecting
    return null;
  }

  return children;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F5EE",
  },
});
