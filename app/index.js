import { useEffect } from "react";
import { router } from "expo-router";
import useAuth from "../hooks/useAuth";

export default function Index() {
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/(public)/(tabs)");
      } else if (userRole === "admin") {
        router.replace("/(admin)/(tabs)");
      } else if (userRole === "teacher") {
        router.replace("/(teacher)/(tabs)");
      } else if (userRole === "parent") {
        router.replace("/(parent)/(tabs)");
      } else {
        router.replace("/(public)/(tabs)");
      }
    }
  }, [user, userRole, loading]);
  return null;
}
