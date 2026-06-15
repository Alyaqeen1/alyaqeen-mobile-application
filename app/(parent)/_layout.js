import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import DrawerContent from "../../components/navigation/DrawerContent";
import ProtectedRoute from "../../components/navigation/ProtectedRoute";
import CustomHeader from "../../components/navigation/CustomHeader";
import { useTheme } from "../../contexts";

export default function ParentLayout() {
  const { isDark } = useTheme();

  return (
    <ProtectedRoute allowedRoles={["parent"]}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          drawerContent={(props) => <DrawerContent {...props} />}
          screenOptions={{
            headerShown: true,
            header: (props) => <CustomHeader {...props} />,
            drawerStyle: { backgroundColor: isDark ? "#0F172A" : "#F8F5EE" },
            drawerActiveTintColor: "#C9A227",
            drawerInactiveTintColor: isDark ? "#FFFFFF" : "#1F3A32",
          }}
        >
          <Drawer.Screen
            name="(tabs)"
            options={{
              title: "Parent Portal",
            }}
          />
        </Drawer>
      </GestureHandlerRootView>
    </ProtectedRoute>
  );
}
