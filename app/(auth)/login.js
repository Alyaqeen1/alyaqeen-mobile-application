import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "../../contexts";
import { LinearGradient } from "expo-linear-gradient";
import useAuth from "../../hooks/useAuth";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

export default function LoginScreen() {
  const { isDark } = useTheme();
  const { signInUser, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const scrollViewRef = useRef();

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "The email address is invalid.";
      case "auth/user-disabled":
        return "This user account has been disabled.";
      case "auth/user-not-found":
        return "No user found with this email.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/invalid-credential":
        return "Invalid credentials. Please check your email and password.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  const getRoleFromEmail = (email) => {
    if (!email) return "public";
    if (email.includes("admin")) return "admin";
    if (email.includes("teacher")) return "teacher";
    if (email.includes("parent")) return "parent";
    return "public";
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields",
      });
      return;
    }

    try {
      await signInUser(email, password);
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Logged in successfully!",
      });

      const role = getRoleFromEmail(email);
      console.log("Login role detected:", role, "Email:", email);
      if (role === "admin") {
        router.replace("/(admin)/(tabs)");
      } else if (role === "teacher") {
        router.replace("/(teacher)/(tabs)");
      } else if (role === "parent") {
        router.replace("/(parent)/(tabs)");
      } else {
        router.replace("/(public)/(tabs)");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: getErrorMessage(error.code),
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={isDark ? ["#0B1220", "#0B1220"] : ["#F8F5EE", "#F8F5EE"]}
        style={{ flex: 1 }}
      >
        {/* Soft Golden Glow at the top */}
        <View pointerEvents="none" style={styles.glowWrap}>
          <LinearGradient
            colors={
              isDark
                ? [
                    "rgba(201, 162, 39, 0.35)",
                    "rgba(201, 162, 39, 0.15)",
                    "rgba(201, 162, 39, 0)",
                  ]
                : [
                    "rgba(201, 162, 39, 0.25)",
                    "rgba(201, 162, 39, 0.1)",
                    "rgba(201, 162, 39, 0)",
                  ]
            }
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.glowGradient}
          />
          {Platform.OS !== "web" && (
            <BlurView
              intensity={40}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          )}
        </View>

        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                  <Image
                    source={require("../../assets/logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>

                {/* Title Section */}
                <View style={styles.titleSection}>
                  <Text style={styles.academyText}>ALYAQEEN ACADEMY</Text>
                  <Text
                    style={[
                      styles.welcomeText,
                      { color: isDark ? "#FFFFFF" : "#1F3A32" }
                    ]}
                  >
                    Welcome back
                  </Text>
                  <Text
                    style={[
                      styles.noorText,
                      { color: isDark ? "#FFFFFF" : "#1F3A32" }
                    ]}
                  >
                    to your{" "}
                    <Text style={styles.noorHighlight}>noor.</Text>
                  </Text>
                  <Text
                    style={[
                      styles.descriptionText,
                      { color: isDark ? "#94A3B8" : "#6B7280" }
                    ]}
                  >
                    Sign in to continue your child's journey of learning and faith.
                  </Text>
                </View>

                {/* Form */}
                <View style={styles.formContainer}>
                  {/* Email Input */}
                  <View style={styles.inputWrapper}>
                    <View
                      style={[
                        styles.inputIcon,
                        {
                          backgroundColor: isDark
                            ? "rgba(148, 163, 184, 0.1)"
                            : "rgba(201, 162, 39, 0.1)",
                        }
                      ]}
                    >
                      <Ionicons name="mail-outline" size={18} color="#C9A227" />
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? "#16243E" : "#FFFFFF",
                          color: isDark ? "#F1F5F9" : "#1F3A32",
                          borderColor: isDark ? "rgba(148,163,184,0.15)" : "#E5E7EB",
                        }
                      ]}
                      placeholder="parent@alyaqeen.co.uk"
                      placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputWrapper}>
                    <View
                      style={[
                        styles.inputIcon,
                        {
                          backgroundColor: isDark
                            ? "rgba(148, 163, 184, 0.1)"
                            : "rgba(201, 162, 39, 0.1)",
                        }
                      ]}
                    >
                      <Ionicons name="lock-closed-outline" size={18} color="#C9A227" />
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        {
                          backgroundColor: isDark ? "#16243E" : "#FFFFFF",
                          color: isDark ? "#F1F5F9" : "#1F3A32",
                          borderColor: isDark ? "rgba(148,163,184,0.15)" : "#E5E7EB",
                        }
                      ]}
                      placeholder="••••••••••"
                      placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#C9A227"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Remember & Forgot */}
                  <View style={styles.rememberContainer}>
                    <TouchableOpacity
                      style={styles.rememberButton}
                      onPress={() => setRememberMe(!rememberMe)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: rememberMe ? "#C9A227" : "transparent",
                            borderWidth: rememberMe ? 0 : 1,
                            borderColor: isDark ? "#475569" : "#D1D5DB",
                          }
                        ]}
                      >
                        {rememberMe && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                      </View>
                      <Text
                        style={[
                          styles.rememberText,
                          { color: isDark ? "#94A3B8" : "#6B7280" }
                        ]}
                      >
                        Remember me
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={styles.forgotText}>Forgot?</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Login Button */}
                  <TouchableOpacity
                    style={[styles.loginButton, { opacity: authLoading ? 0.7 : 1 }]}
                    onPress={handleLogin}
                    disabled={authLoading}
                  >
                    <LinearGradient
                      colors={["#C9A227", "#E0BE4D"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.loginGradient}
                    >
                      {authLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <View style={styles.loginButtonContent}>
                          <Text style={styles.loginText}>Sign in</Text>
                          <Ionicons
                            name="arrow-forward"
                            size={18}
                            color="#FFFFFF"
                            style={{ marginLeft: 8 }}
                          />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Sign Up Link */}
                  <View style={styles.signupContainer}>
                    <Text
                      style={[
                        styles.signupText,
                        { color: isDark ? "#94A3B8" : "#6B7280" }
                      ]}
                    >
                      New family?{" "}
                    </Text>
                    <TouchableOpacity>
                      <Text style={styles.applyText}>Apply for admission</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Back to Home */}
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.replace("/(public)/(tabs)")}
                  >
                    <Text style={styles.backText}>← Back to Public Home</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  keyboardView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 20 : 40,
    paddingBottom: 40,
  },
  glowWrap: {
    position: "absolute",
    top: -120,
    left: -80,
    right: -80,
    height: 500,
    borderRadius: 300,
    overflow: "hidden",
    zIndex: 0,
  },
  glowGradient: {
    flex: 1,
  },
  logoContainer: {
    alignItems: "flex-start",
    marginBottom: 32,
    marginTop: 20,
  },
  logo: {
    width: 96,
    height: 96,
  },
  titleSection: {
    marginBottom: 40,
  },
  academyText: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 3,
    color: "#C9A227",
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 42,
  },
  noorText: {
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 42,
    marginBottom: 12,
  },
  noorHighlight: {
    color: "#C9A227",
    fontStyle: "italic",
    fontWeight: "800",
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    marginTop: 8,
  },
  formContainer: {
    gap: 16,
  },
  inputWrapper: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    top: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  input: {
    height: 64,
    borderRadius: 20,
    paddingLeft: 60,
    paddingRight: 20,
    fontSize: 15,
    borderWidth: 1,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 0,
    height: 64,
    justifyContent: "center",
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 8,
  },
  rememberButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  rememberText: {
    fontSize: 14,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C9A227",
  },
  loginButton: {
    borderRadius: 40,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#C9A227",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginGradient: {
    paddingVertical: 18,
    alignItems: "center",
  },
  loginButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signupText: {
    fontSize: 15,
  },
  applyText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#C9A227",
  },
  backButton: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C9A227",
  },
});