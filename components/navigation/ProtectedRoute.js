import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../contexts";
import AppBackground from "../common/AppBackground";
import { getDashboardRouteForRole } from "../../utils";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, userRole, loading } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/(auth)/login");
      } else if (allowedRoles && !allowedRoles.includes(userRole)) {
        router.replace(getDashboardRouteForRole(userRole));
      }
    }
  }, [user, userRole, loading]);

  if (loading) {
    return (
      <AppBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </AppBackground>
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
  },
});
