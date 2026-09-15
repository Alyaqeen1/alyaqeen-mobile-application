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
    // Run redirect logic even while loading if state allows it.
    // After sign-out, `loading` briefly stays true (because role was cleared).
    // If we wait for `!loading` with a stale ProtectedRoute mounted, we lock
    // the user into an unmountable loading spinner and navigation can't escape.
    if (!user) {
      router.replace("/(auth)/login");
      return;
    }
    if (!loading && allowedRoles && !allowedRoles.includes(userRole)) {
      router.replace(getDashboardRouteForRole(userRole));
    }
  }, [user, userRole, loading]);

  // Show loading spinner only when user exists (so we're waiting for their role)
  // and still loading. If no user, return null immediately; redirect effect above
  // will take us to login cleanly without rendering a spinner.
  if (user && loading) {
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
