import 'react-native-gesture-handler';

import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CommandsScreen,
  LearningProvider,
  LearningScreen,
  ProgressScreen,
} from './src/features/learning';
import { CardsIcon, ChartIcon, KeyboardIcon } from './src/shared/components/icons';
import { palette } from './src/shared/theme';

export type RootTabParamList = {
  Commands: undefined;
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
    notification: palette.accentStrong,
  },
};

function AppTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[tabBarStyles.wrap, { bottom: Math.max(insets.bottom, 14) }]}
    >
      <View style={tabBarStyles.bar}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const options = descriptor.options;
          const isFocused = state.index === index;
          const isPrimaryRoute = route.name === 'Learn';
          const isFirstRoute = index === 0;
          const isLastRoute = index === state.routes.length - 1;
          const color = isFocused ? palette.accentStrong : palette.textMuted;
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
                ? options.title
                : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : {}}
              onLongPress={onLongPress}
              onPress={onPress}
              style={[
                isPrimaryRoute ? tabBarStyles.primaryItem : tabBarStyles.item,
                !isPrimaryRoute && isFocused && tabBarStyles.itemActive,
                !isPrimaryRoute &&
                  isFocused &&
                  isFirstRoute &&
                  tabBarStyles.itemActiveLeft,
                !isPrimaryRoute &&
                  isFocused &&
                  isLastRoute &&
                  tabBarStyles.itemActiveRight,
              ]}
              testID={options.tabBarButtonTestID}
            >
              {isPrimaryRoute ? (
                <View style={tabBarStyles.primaryItem__content}>
                  <View
                    style={[
                      tabBarStyles.primaryItem__button,
                      isFocused && tabBarStyles.primaryItem__buttonActive,
                    ]}
                  >
                    {options.tabBarIcon?.({
                      color: isFocused ? palette.background : palette.accentStrong,
                      focused: isFocused,
                      size: 28,
                    })}
                  </View>
                  <Text
                    style={[
                      tabBarStyles.primaryItem__label,
                      isFocused && tabBarStyles.primaryItem__labelActive,
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              ) : (
                <View style={tabBarStyles.item__content}>
                  {options.tabBarIcon?.({ color, focused: isFocused, size: 21 })}
                  <Text
                    style={[
                      tabBarStyles.item__label,
                      isFocused && tabBarStyles.item__labelActive,
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <LearningProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="light" />
        <Tab.Navigator
          initialRouteName="Learn"
          tabBar={(props) => <AppTabBar {...props} />}
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ color, size }) =>
              route.name === 'Learn' ? (
                <CardsIcon color={color} size={size} />
              ) : route.name === 'Commands' ? (
                <KeyboardIcon color={color} size={size} />
              ) : (
                <ChartIcon color={color} size={size} />
              ),
            tabBarHideOnKeyboard: true,
            sceneStyle: {
              backgroundColor: palette.background,
            },
          })}
        >
          <Tab.Screen
            component={CommandsScreen}
            name="Commands"
            options={{ title: 'Команды' }}
          />
          <Tab.Screen
            component={LearningScreen}
            name="Learn"
            options={{ title: 'Карточки' }}
          />
          <Tab.Screen
            component={ProgressScreen}
            name="Stats"
            options={{ title: 'Статистика' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </LearningProvider>
  );
}

const tabBarStyles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 68,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: palette.hairline,
    borderRadius: 30,
    backgroundColor: 'rgba(4, 5, 7, 0.94)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 0,
    overflow: 'visible',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 24,
  },
  itemActive: {
    backgroundColor: 'rgba(130, 245, 208, 0.045)',
  },
  itemActiveLeft: {
    borderRadius: 24,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  itemActiveRight: {
    borderRadius: 24,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  item__content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  item__label: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  item__labelActive: {
    color: palette.accentStrong,
  },
  primaryItem: {
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -26,
  },
  primaryItem__content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  primaryItem__button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 66,
    height: 66,
    borderWidth: 1,
    borderColor: 'rgba(130, 245, 208, 0.38)',
    borderRadius: 999,
    backgroundColor: 'rgba(7, 10, 14, 0.98)',
    shadowColor: '#82f5d0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 0,
  },
  primaryItem__buttonActive: {
    borderColor: palette.accentStrong,
    backgroundColor: palette.accentStrong,
  },
  primaryItem__label: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  primaryItem__labelActive: {
    color: palette.accentStrong,
  },
});
