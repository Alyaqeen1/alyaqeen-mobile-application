import React, { useState } from "react";
import { Stack } from "expo-router";
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {isSplashVisible ? (
        <SplashScreen onFinish={() => setIsSplashVisible(false)} />
      ) : (
        <>
          <Provider store={store}>
            <AuthProvider>
              <ThemeProvider>
                <ThemedApp />
              </ThemeProvider>
            </AuthProvider>
          </Provider>
          <Toast />
        </>
      )}
    </GestureHandlerRootView>
  );
}