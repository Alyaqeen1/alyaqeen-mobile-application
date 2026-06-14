import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import DrawerContent from "../../components/navigation/DrawerContent";
import ProtectedRoute from "../../components/navigation/ProtectedRoute";

export default function TeacherLayout() {
  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          drawerContent={(props) => <DrawerContent {...props} />}
          screenOptions={{
            headerShown: true,
            headerStyle: { backgroundColor: "#F8F5EE" },
            headerTintColor: "#1E3A5F",
            drawerStyle: { backgroundColor: "#F8F5EE" },
          }}
        >
          <Drawer.Screen
            name="(tabs)"
            options={{
              title: "Teacher Portal",
              headerTitle: "Teacher Portal",
            }}
          />
        </Drawer>
      </GestureHandlerRootView>
    </ProtectedRoute>
  );
}
