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
import AppBackground from "../../components/common/AppBackground";
import ThemeToggleButton from "../../components/common/ThemeToggleButton";
import { getDashboardRouteForRole } from "../../utils";

export default function LoginScreen() {
  const { isDark, colors } = useTheme();
  const { user, userRole, signInUser, loading: authLoading } = useAuth();
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

  React.useEffect(() => {
    if (!authLoading && user) {
      router.replace(getDashboardRouteForRole(userRole));
    }
  }, [user, userRole, authLoading]);

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
      <AppBackground>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <ThemeToggleButton
            accessibilityLabel="Toggle app theme on login screen"
            style={styles.themeToggle}
          />
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
                      { color: colors.textStrong },
                    ]}
                  >
                    Welcome back
                  </Text>
                  <Text
                    style={[
                      styles.noorText,
                      { color: colors.textStrong },
                    ]}
                  >
                    to your{" "}
                    <Text style={styles.noorHighlight}>noor.</Text>
                  </Text>
                  <Text
                    style={[
                      styles.descriptionText,
                      { color: colors.textMuted },
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
                            : colors.goldSoft,
                        },
                      ]}
                    >
                      <Ionicons name="mail-outline" size={18} color="#C9A227" />
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.surface,
                          color: colors.text,
                          borderColor: colors.border,
                        },
                      ]}
                      placeholder="parent@alyaqeen.co.uk"
                      placeholderTextColor={colors.textSubtle}
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
                            : colors.goldSoft,
                        },
                      ]}
                    >
                      <Ionicons name="lock-closed-outline" size={18} color="#C9A227" />
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        {
                          backgroundColor: colors.surface,
                          color: colors.text,
                          borderColor: colors.border,
                        },
                      ]}
                      placeholder="••••••••••"
                      placeholderTextColor={colors.textSubtle}
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
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        {rememberMe && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                      </View>
                      <Text
                        style={[
                          styles.rememberText,
                          { color: colors.textMuted },
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
                        { color: colors.textMuted },
                      ]}
                    >
                      New family?{" "}
                    </Text>
                    <TouchableOpacity>
                      <Text style={styles.applyText}>Apply for admission</Text>
                    </TouchableOpacity>
                  </View>

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
      </AppBackground>
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
  themeToggle: {
    position: "absolute",
    top: 12,
    right: 24,
    zIndex: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 24 : 40,
    paddingBottom: 40,
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
