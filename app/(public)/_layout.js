import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import DrawerContent from "../../components/navigation/DrawerContent";
import CustomHeader from "../../components/navigation/CustomHeader";
import { useTheme } from "../../contexts";

export default function PublicLayout() {
  const { isDark } = useTheme();

  return (
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
        {/* This is the main tab navigator - it will show tabs at the bottom */}
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: "Home",
            drawerLabel: "Home",
          }}
        />
        
        {/* Individual screens that will show without tabs */}
        <Drawer.Screen
          name="about"
          options={{
            title: "About Academy",
            drawerLabel: "About Academy",
          }}
        />
        <Drawer.Screen
          name="vacancies"
          options={{
            title: "Vacancies",
            drawerLabel: "Vacancies",
          }}
        />
        <Drawer.Screen
          name="volunteer-opportunities"
          options={{
            title: "Volunteer Opportunities",
            drawerLabel: "Volunteer Opportunities",
          }}
        />
        <Drawer.Screen
          name="contact"
          options={{
            title: "Contact Us",
            drawerLabel: "Contact Us",
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: "Settings",
            drawerLabel: "Settings",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}