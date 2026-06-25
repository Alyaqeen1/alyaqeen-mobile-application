import React, { createContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import { useGetRoleQuery } from "../redux/features/role/roleApi";

export const AuthContext = createContext();

const getFallbackRole = (email) => {
  if (!email) return null;
  if (email.includes("admin")) return "admin";
  if (email.includes("teacher")) return "teacher";
  if (email.includes("parent")) return "parent";
  return "public"; // Default
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const {
    data: roleData,
    isLoading: roleLoading,
    isFetching: roleFetching,
    isUninitialized: roleUninitialized,
  } = useGetRoleQuery(user?.email, {
    skip: !user?.email,
  });

  const result = useGetRoleQuery(user?.email, {
  skip: !user?.email,
});



  const resolvedRole =
    roleData?.role || roleData?.data?.role || getFallbackRole(user?.email);
  const loading =
    authLoading ||
    (!!user?.email && (roleLoading || roleFetching || roleUninitialized));

  const signInUser = async (email, password) => {
    setAuthLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      setAuthLoading(false);
      throw error;
    }
  };

  const signOutUser = async () => {
    setAuthLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      setAuthLoading(false);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed, user:", currentUser);
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const authInfo = {
    user,
    userRole: user ? resolvedRole : null,
    loading,
    signInUser,
    signOutUser,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
}
