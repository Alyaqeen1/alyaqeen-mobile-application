import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import DrawerContent from "../../components/navigation/DrawerContent";

export default function AdminLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <DrawerContent role="admin" {...props} />}
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
            title: "Admin Portal",
            headerTitle: "Admin Portal",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
