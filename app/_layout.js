// RootLayout.jsx - Keep it exactly like this (no StripeProvider)
import React, { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import SplashScreen from "../components/common/SplashScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "../contexts";
import AuthProvider from "../contexts/AuthContext";
import Toast from "react-native-toast-message";
import * as ExpoSplashScreen from "expo-splash-screen";
import "../global.css";
import { StripeProvider } from '@stripe/stripe-react-native';

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

export default function RootLayout() {
  return (
      <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.identifier" // required for Apple Pay
      urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
    >
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
      {/* Your app code here */}
    </StripeProvider>
  
  );
}