// hooks/useAuthGuard.js
import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export function useAuthGuard() {
  const { user, userRole, loading, isAuthenticated, roleData, roleError } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Log current state for debugging
    console.log("🔒 Auth Guard State:", {
      user: user?.email || "No user",
      userRole,
      loading,
      isAuthenticated,
      roleData,
      roleError,
      segments: segments.join("/")
    });

    // Wait for auth to finish loading and role to be resolved
    if (loading) {
      console.log("⏳ Auth Guard: Waiting for loading to complete...");
      return;
    }

    const currentRoute = segments.join("/");
    const inAuthGroup = segments[0] === "(auth)";
    const inPublicGroup = segments[0] === "(public)";
    const inParentGroup = segments[0] === "(parent)";
    const inTeacherGroup = segments[0] === "(teacher)";
    const inAdminGroup = segments[0] === "(admin)";

    // If user is not authenticated
    if (!user) {
      console.log("🔒 No user, redirecting to login");
      if (!inAuthGroup && !inPublicGroup) {
        router.replace("/(auth)/login");
      }
      return;
    }

    // If user is authenticated but no role (shouldn't happen)
    if (!userRole) {
      console.log("⚠️ User authenticated but no role, redirecting to public");
      if (!inAuthGroup && !inPublicGroup) {
        router.replace("/(public)/home");
      }
      return;
    }

    const role = userRole.toLowerCase();
    console.log(`✅ User authenticated as: ${role}`);

    // Redirect from auth group to role-specific home
    if (inAuthGroup) {
      console.log(`🔒 Redirecting ${role} to their dashboard`);
      const routes = {
        admin: "/(admin)/dashboard",
        teacher: "/(teacher)/dashboard",
        parent: "/(parent)/dashboard",
        public: "/(public)/home",
      };
      router.replace(routes[role] || "/(public)/home");
      return;
    }

    // Redirect from public group to role-specific home
    if (inPublicGroup) {
      console.log(`🔒 Authenticated user in public group, redirecting to ${role}`);
      const routes = {
        admin: "/(admin)/dashboard",
        teacher: "/(teacher)/dashboard",
        parent: "/(parent)/dashboard",
        public: "/(public)/home",
      };
      router.replace(routes[role] || "/(public)/home");
      return;
    }

    // Prevent users from accessing wrong role's routes
    const roleGroups = {
      admin: inAdminGroup,
      teacher: inTeacherGroup,
      parent: inParentGroup,
    };

    const isInWrongGroup = Object.entries(roleGroups).some(
      ([r, inGroup]) => inGroup && r !== role
    );

    if (isInWrongGroup) {
      console.log(`🔒 ${role} trying to access wrong route, redirecting`);
      const routes = {
        admin: "/(admin)/dashboard",
        teacher: "/(teacher)/dashboard",
        parent: "/(parent)/dashboard",
        public: "/(public)/home",
      };
      router.replace(routes[role] || "/(public)/home");
      return;
    }

  }, [loading, user, userRole, segments, router]);
}