import { useEffect } from "react";
import { router } from "expo-router";
import useAuth from "../hooks/useAuth";
import { getDashboardRouteForRole } from "../utils";

export default function Index() {
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/(public)/(tabs)");
      return;
    }

    // Only redirect authenticated users when we have a real dashboard role.
    // If userRole is null/empty/"public" for a logged-in user, we send them to
    // the public home for now (the public layout will redirect them as soon
    // as the real role arrives from the API / via ProtectedRoute gate).
    if (userRole && ["admin", "teacher", "parent"].includes(userRole)) {
      router.replace(getDashboardRouteForRole(userRole));
    } else {
      router.replace("/(public)/(tabs)");
    }
  }, [user, userRole, loading]);
  return null;
}
