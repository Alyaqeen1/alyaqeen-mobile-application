import React, { useState, useEffect } from "react";
import { Stack, useNavigationContainerRef } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import SplashScreen from "../components/common/SplashScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, useTheme } from "../contexts";
import AuthProvider from "../contexts/AuthContext";
import Toast from "react-native-toast-message";
import "../global.css";

function ThemedApp() {
  const { isDark } = useTheme();
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
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AuthProvider>
          <ThemeProvider>
            <ThemedApp />
          </ThemeProvider>
        </AuthProvider>
      </Provider>
      <Toast />
    </GestureHandlerRootView>
  );
}