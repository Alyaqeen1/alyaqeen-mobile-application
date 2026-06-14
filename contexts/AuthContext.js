import React, { createContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase/firebase.config";

export const AuthContext = createContext();

// Helper to map emails to roles (replace with Firestore later)
const getUserRole = (email) => {
  if (!email) return null;
  if (email.includes("admin")) return "admin";
  if (email.includes("teacher")) return "teacher";
  if (email.includes("parent")) return "parent";
  return "public"; // Default
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const signInUser = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const role = getUserRole(userCredential.user.email);
      setUserRole(role);
      return userCredential;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUserRole(null);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed, user:", currentUser);
      setUser(currentUser);
      if (currentUser) {
        const role = getUserRole(currentUser.email);
        console.log("Setting user role:", role);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const authInfo = {
    user,
    userRole,
    loading,
    signInUser,
    signOutUser,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
}
