import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "../../contexts";
import { LinearGradient } from "expo-linear-gradient";
import useAuth from "../../hooks/useAuth";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const { isDark, toggleTheme } = useTheme();
  const { signInUser, loading: authLoading, userRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      
      // Navigate based on role
      if (userRole === "admin") {
        router.replace("/(admin)/(tabs)");
      } else if (userRole === "teacher") {
        router.replace("/(teacher)/(tabs)");
      } else if (userRole === "parent") {
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
    <LinearGradient
      colors={isDark ? ["#0F172A", "#1E293B", "#0F172A"] : ["#F8F5EE", "#FFFFFF", "#F8F5EE"]}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.container}>
        {/* Theme Toggle */}
        <TouchableOpacity
          style={styles.themeToggle}
          onPress={toggleTheme}
        >
          <Text style={{ fontSize: 24 }}>{isDark ? "☀️" : "🌙"}</Text>
        </TouchableOpacity>

        {/* Background Decorations */}
        <View style={styles.topCircle} />
        <View style={styles.bottomCircle} />

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
          <View style={styles.titleContainer}>
            <Text style={[styles.subtitle, { color: isDark ? "#C9A227" : "#C9A227" }]}>
              ALYAQEEN ACADEMY
            </Text>
            <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#1F3A32" }]}>
              Welcome back
            </Text>
            <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#1F3A32" }]}>
              to your <Text style={{ color: "#C9A227" }}>noor.</Text>
            </Text>
            <Text style={[styles.description, { color: isDark ? "#94A3B8" : "#6B7280" }]}>
              Sign in to continue your child's journey of learning and faith.
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <View style={[styles.inputIcon, { backgroundColor: isDark ? "rgba(148, 163, 184, 0.1)" : "rgba(201, 162, 39, 0.1)" }]}>
                <Text style={{ fontSize: 18 }}>✉️</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                    color: isDark ? "#F1F5F9" : "#1F3A32",
                    borderColor: isDark ? "#334155" : "#E5E7EB"
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
              <View style={[styles.inputIcon, { backgroundColor: isDark ? "rgba(148, 163, 184, 0.1)" : "rgba(201, 162, 39, 0.1)" }]}>
                <Text style={{ fontSize: 18 }}>🔒</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                    color: isDark ? "#F1F5F9" : "#1F3A32",
                    borderColor: isDark ? "#334155" : "#E5E7EB",
                    paddingRight: 60
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
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={[styles.passwordToggleText, { color: "#C9A227" }]}>
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Remember & Forgot */}
            <View style={styles.rememberContainer}>
              <TouchableOpacity style={styles.checkboxContainer}>
                <View style={[styles.checkbox, { backgroundColor: "#C9A227" }]}>
                  <Text style={{ color: "white", fontSize: 12 }}>✓</Text>
                </View>
                <Text style={[styles.rememberText, { color: isDark ? "#94A3B8" : "#6B7280" }]}>
                  Remember me
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={[styles.forgotText, { color: "#C9A227" }]}>
                  Forgot?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, { opacity: authLoading ? 0.7 : 1 }]}
              onPress={handleLogin}
              disabled={authLoading}
            >
              <LinearGradient
                colors={["#C9A227", "#D4AF37"]}
                style={styles.loginButtonGradient}
              >
                {authLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.loginButtonText}>Sign in</Text>
                    <Text style={{ fontSize: 16, marginLeft: 8 }}>→</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: isDark ? "#94A3B8" : "#6B7280" }]}>
                New family?{" "}
              </Text>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Apply for admission</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Back to Home */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(public)/(tabs)")}
          >
            <Text style={[styles.backButtonText, { color: "#C9A227" }]}>
              ← Back to Public Home
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "transparent"
  },
  themeToggle: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 100,
    padding: 12,
    borderRadius: 50
  },
  topCircle: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(201, 162, 39, 0.1)"
  },
  bottomCircle: {
    position: "absolute",
    bottom: -80,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(201, 162, 39, 0.1)"
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60
  },
  logoContainer: {
    alignItems: "flex-start",
    marginBottom: 32
  },
  logo: {
    width: 140,
    height: 70
  },
  titleContainer: {
    marginBottom: 32
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: 8
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    lineHeight: 44
  },
  description: {
    fontSize: 16,
    marginTop: 12,
    lineHeight: 24
  },
  formContainer: {
    gap: 16
  },
  inputWrapper: {
    position: "relative"
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    top: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10
  },
  input: {
    height: 64,
    paddingLeft: 60,
    paddingRight: 20,
    borderRadius: 20,
    fontSize: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  passwordToggle: {
    position: "absolute",
    right: 20,
    top: 20
  },
  passwordToggleText: {
    fontSize: 16
  },
  rememberContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center"
  },
  rememberText: {
    fontSize: 14
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "600"
  },
  loginButton: {
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 16,
    shadowColor: "#C9A227",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  loginButtonGradient: {
    paddingVertical: 18,
    alignItems: "center"
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center"
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700"
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32
  },
  signupText: {
    fontSize: 15
  },
  signupLink: {
    fontSize: 15,
    color: "#C9A227",
    fontWeight: "700"
  },
  backButton: {
    alignItems: "center",
    marginTop: 24
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600"
  }
});
