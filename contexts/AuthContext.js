// contexts/AuthContext.jsx
import React, { createContext, useEffect, useState, useRef } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import { useGetRoleQuery } from "../redux/features/role/roleApi";

export const AuthContext = createContext();

// Only use fallback if API fails or returns no role
// Returns null when no email pattern matches — do NOT invent "public"
// for authenticated users (that would cause bogus public-role redirects).
const getFallbackRole = (email) => {
  if (!email) return null;
  if (email.includes("admin")) return "admin";
  if (email.includes("teacher")) return "teacher";
  if (email.includes("parent")) return "parent";
  return null;
};

export default function AuthProvider({ children }) {
  // ===== STATE =====
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [resolvedRole, setResolvedRole] = useState(null);
  const [fallbackRoleApplied, setFallbackRoleApplied] = useState(false);
  const timeoutRef = useRef(null);
  const isMounted = useRef(true);

  // ===== ROLE QUERY =====
  const {
    data: roleData,
    isLoading: roleLoading,
    isFetching: roleFetching,
    isUninitialized: roleUninitialized,
    isError: roleError,
  } = useGetRoleQuery(user?.email, {
    skip: !user?.email,
  });

  // ===== DEBUG LOGS =====
  useEffect(() => {
    if (user?.email) {
      console.log("👤 User email:", user.email);
      console.log("🔑 Role data from API:", roleData);
      console.log("⏳ Role loading:", roleLoading);
      console.log("⏳ Role fetching:", roleFetching);
      console.log("⏳ Role uninitialized:", roleUninitialized);
    }
  }, [user, roleData, roleLoading, roleFetching, roleUninitialized]);

  // ===== RESOLVE ROLE IN USEEFFECT (FIXED) =====
  useEffect(() => {
    // If no user, reset everything
    if (!user?.email) {
      setResolvedRole(null);
      setFallbackRoleApplied(false);
      return;
    }

    // 1. If role data is available from API
    if (roleData?.role) {
      console.log("✅ Role from API (direct):", roleData.role);
      setResolvedRole(roleData.role);
      setFallbackRoleApplied(false);
      return;
    }

    // 2. If role data is available from nested
    if (roleData?.data?.role) {
      console.log("✅ Role from API (nested):", roleData.data.role);
      setResolvedRole(roleData.data.role);
      setFallbackRoleApplied(false);
      return;
    }

    // 3. If API has errored or completed with no role, use fallback
    if (roleError || (!roleLoading && !roleFetching && !roleUninitialized && roleData === undefined)) {
      const fallback = getFallbackRole(user?.email);
      if (fallback) {
        console.log("⚠️ Using fallback role:", fallback);
        setResolvedRole(fallback);
        setFallbackRoleApplied(true);
      } else {
        // No role hint available — mark fallback pass done so loading can end,
        // but keep resolvedRole as null (don't fabricate a "public" role).
        console.log("⚠️ Fallback: no role hint, marking fallback pass complete");
        setFallbackRoleApplied(true);
      }
      return;
    }

    // 4. If API is still loading, keep role as null
    console.log("⏳ Waiting for role from API...");
    // Don't set resolvedRole here - keep it as is

  }, [user, roleData, roleLoading, roleFetching, roleUninitialized, roleError]);

  // ===== LOADING STATE =====
  const isLoading = (() => {
    // If logging out, don't show loading
    if (isLoggingOut) return false;
    
    // If auth is still loading
    if (authLoading) return true;
    
    // If not initialized yet
    if (!isInitialized) return true;
    
    // If user exists and role is not yet resolved, stay loading
    if (user?.email && !resolvedRole && !fallbackRoleApplied) {
      return true;
    }
    
    return false;
  })();

  // ===== TIMEOUT PROTECTION: Force resolve after 8 seconds =====
  useEffect(() => {
    if (user?.email && isLoading && isMounted.current) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set a timeout to force resolve after 8 seconds
      timeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          console.log("⏰ Force resolving role after timeout");
          const fallback = getFallbackRole(user?.email);
          if (fallback) {
            console.log("⏰ Timeout applying fallback role:", fallback);
            setResolvedRole(fallback);
          } else {
            // No email-pattern hint. Don't fabricate a "public" role for
            // authenticated users; just end loading so callers can proceed
            // and wait for the real API response.
            console.log("⏰ Timeout: no fallback role hint; marking fallback pass complete");
          }
          // Mark fallback pass done so `isLoading` can resolve to false
          setFallbackRoleApplied(true);
          // Do NOT touch authLoading / isInitialized here — they are owned
          // by the onAuthStateChanged listener and mutating them here causes
          // cascading state churn and spurious redirect loops.
        }
      }, 8000);
    } else {
      // Clear timeout if loading is done
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [user, isLoading]);

  // ===== AUTHENTICATION STATUS =====
  const isAuthenticated = !!user;

  // ===== LOGGING =====
  useEffect(() => {
    if (!authLoading && isInitialized) {
      console.log("✅ Auth initialized. User:", user?.email || "No user");
      console.log("✅ Resolved Role:", resolvedRole);
      console.log("✅ Loading state:", isLoading);
      console.log("✅ Is Authenticated:", isAuthenticated);
      console.log("✅ Fallback applied:", fallbackRoleApplied);
    }
  }, [authLoading, isInitialized, resolvedRole, isLoading, isAuthenticated, fallbackRoleApplied]);

  // ===== SIGN IN =====
  const signInUser = async (email, password) => {
    console.log("🔐 Signing in...");
    setAuthLoading(true);
    setIsLoggingOut(false);
    setFallbackRoleApplied(false);
    setResolvedRole(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Sign in successful");
      return userCredential;
    } catch (error) {
      console.error("❌ Sign in error:", error);
      setAuthLoading(false);
      throw error;
    }
  };

  // ===== SIGN OUT =====
  const signOutUser = async () => {
    console.log("🔴 Logging out...");
    setIsLoggingOut(true);
    // Do NOT reset isInitialized — that flag means "we have heard from Firebase
    // auth at least once", and remains true after sign-out. Resetting it flips
    // `isLoading` back to true, which freezes ProtectedRoute layouts on the
    // loading spinner after logout (breaking all navigation/redirects).
    setAuthLoading(false);
    setFallbackRoleApplied(false);
    setResolvedRole(null);
    
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    try {
      await signOut(auth);
      setUser(null);
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
      setIsLoggingOut(false);
      throw error;
    } finally {
      setTimeout(() => {
        setIsLoggingOut(false);
        setAuthLoading(false);
        console.log("✅ Logout complete, loading reset");
      }, 500);
    }
  };

  // ===== AUTH STATE LISTENER =====
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("🔐 Auth state changed, user:", currentUser?.email || "No user");
      setUser(currentUser);
      setAuthLoading(false);
      setIsInitialized(true);
      
      if (!currentUser) {
        console.log("🔴 User logged out");
        setFallbackRoleApplied(false);
        setResolvedRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // ===== CLEANUP =====
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ===== CONTEXT VALUE =====
  const authInfo = {
    // User & Role
    user,
    userRole: resolvedRole,
    
    // Status
    loading: isLoading,
    isAuthenticated,
    isLoggingOut,
    isInitialized,
    
    // Functions
    signInUser,
    signOutUser,
    
    // Debug helpers
    roleData,
    roleLoading,
    roleError,
    fallbackRoleApplied,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
}