import "react-native-gesture-handler";

import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";

import { LearningProvider } from "./src/context/LearningContext";
import { HomeScreen } from "./src/screens/HomeScreen";
import { StatsScreen } from "./src/screens/StatsScreen";
import { palette } from "./src/theme/palette";

export type RootTabParamList = {
  Learn: undefined;
  Stats: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.background,
    card: palette.panel,
    border: palette.border,
    primary: palette.accent,
    text: palette.textPrimary,
    notification: palette.accentStrong
  }
};

export default function App() {
  return (
    <LearningProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            headerStyle: {
              backgroundColor: palette.panel
            },
            headerTintColor: palette.textPrimary,
            headerShadowVisible: false,
            tabBarStyle: {
              backgroundColor: palette.footerPanel,
              borderTopColor: palette.border,
              height: 72,
              paddingBottom: 10,
              paddingTop: 10
            },
            tabBarActiveTintColor: palette.accentStrong,
            tabBarInactiveTintColor: palette.textMuted,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "700"
            },
            sceneStyle: {
              backgroundColor: palette.background
            }
          }}
        >
          <Tab.Screen
            component={HomeScreen}
            name="Learn"
            options={{ title: "Карточки" }}
          />
          <Tab.Screen
            component={StatsScreen}
            name="Stats"
            options={{ headerShown: true, title: "Статистика" }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </LearningProvider>
  );
}
