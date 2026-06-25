import { useEffect } from "react";
import { router } from "expo-router";
import useAuth from "../hooks/useAuth";
import { getDashboardRouteForRole } from "../utils";

export default function Index() {
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? getDashboardRouteForRole(userRole) : "/(public)/(tabs)");
    }
  }, [user, userRole, loading]);
  return null;
}
