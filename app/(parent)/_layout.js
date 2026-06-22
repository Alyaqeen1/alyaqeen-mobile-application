import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import DrawerContent from "../../components/navigation/DrawerContent";
import ProtectedRoute from "../../components/navigation/ProtectedRoute";
import CustomHeader from "../../components/navigation/CustomHeader";
import { useTheme } from "../../contexts";
import AppBackground from "../../components/common/AppBackground";

export default function ParentLayout() {
  const { colors } = useTheme();

  return (
    <ProtectedRoute allowedRoles={["parent"]}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppBackground>
          <Drawer
            drawerContent={(props) => <DrawerContent {...props} />}
            screenOptions={{
              headerShown: true,
              header: (props) => <CustomHeader {...props} />,
              drawerStyle: { backgroundColor: colors.drawerBackground },
              sceneStyle: { backgroundColor: "transparent" },
              drawerActiveTintColor: colors.gold,
              drawerInactiveTintColor: colors.text,
            }}
          >
            <Drawer.Screen
              name="(tabs)"
              options={{
                title: "Parent Portal",
              }}
            />
          </Drawer>
        </AppBackground>
      </GestureHandlerRootView>
    </ProtectedRoute>
  );
}
