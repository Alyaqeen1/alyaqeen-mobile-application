// RootLayout.jsx
import React, { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import SplashScreen from "../components/common/SplashScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "../contexts";
import AuthProvider from "../contexts/AuthContext";
import Toast from "react-native-toast-message";
import * as ExpoSplashScreen from "expo-splash-screen";
import "../global.css";

let StripeProvider = null;
if (Platform.OS !== "web") {
  StripeProvider = require("@stripe/stripe-react-native").StripeProvider;
}

let splashCompletedGuard = false;
ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

function ThemedApp() {
  const [isSplashVisible, setIsSplashVisible] = useState(!splashCompletedGuard);
  useEffect(() => {
    ExpoSplashScreen.hideAsync().catch(() => {});
  }, []);

  const handleSplashFinish = () => {
    splashCompletedGuard = true;
    setIsSplashVisible(false);
  };

  if (isSplashVisible) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(public)" options={{ headerShown: false }} />
      <Stack.Screen name="(parent)" options={{ headerShown: false }} />
      <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
    </Stack>
  );
}

function AppShell({ children }) {
  if (Platform.OS !== "web" && StripeProvider) {
    return (
      <StripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}
        merchantIdentifier="merchant.identifier"
        urlScheme="alyaqeen"
      >
        {children}
      </StripeProvider>
    );
  }
  return children;
}

export default function RootLayout() {
  return (
    <AppShell>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <AuthProvider>
            <ThemeProvider>
              <ThemedApp />
              <Toast />
            </ThemeProvider>
          </AuthProvider>
        </Provider>
      </GestureHandlerRootView>
    </AppShell>
  );
}