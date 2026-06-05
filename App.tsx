import 'react-native-gesture-handler';

import { PlatformPressable } from '@react-navigation/elements';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import {
	BottomTabBarProps,
	createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { CardsIcon, ChartIcon } from './src/components/AppIcon';
import { LearningProvider } from './src/context/LearningContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { palette } from './src/theme/palette';

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
		notification: palette.accentStrong,
	},
};

function AppTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
	return (
		<View pointerEvents="box-none" style={tabBarStyles.wrap}>
			<View style={tabBarStyles.bar}>
				{state.routes.map((route, index) => {
					const descriptor = descriptors[route.key];
					const options = descriptor.options;
					const isFocused = state.index === index;
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
						<PlatformPressable
							key={route.key}
							accessibilityLabel={options.tabBarAccessibilityLabel}
							accessibilityRole="tab"
							accessibilityState={isFocused ? { selected: true } : {}}
							onLongPress={onLongPress}
							onPress={onPress}
							style={[
								tabBarStyles.item,
								isFocused && tabBarStyles.itemActive,
								isFocused &&
									(index === 0
										? tabBarStyles.itemActiveLeft
										: tabBarStyles.itemActiveRight),
							]}
							testID={options.tabBarButtonTestID}
						>
							<View style={tabBarStyles.item__content}>
								{options.tabBarIcon?.({ color, focused: isFocused, size: 22 })}
								<Text
									style={[
										tabBarStyles.item__label,
										isFocused && tabBarStyles.item__labelActive,
									]}
								>
									{label}
								</Text>
							</View>
						</PlatformPressable>
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
					tabBar={(props) => <AppTabBar {...props} />}
					screenOptions={({ route }) => ({
						headerShown: false,
						tabBarIcon: ({ color, size }) =>
							route.name === 'Learn' ? (
								<CardsIcon color={color} size={size} />
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
						component={HomeScreen}
						name="Learn"
						options={{ title: 'Карточки' }}
					/>
					<Tab.Screen
						component={StatsScreen}
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
		left: 20,
		right: 20,
		bottom: 14,
	},
	bar: {
		flexDirection: 'row',
		borderWidth: 1,
		borderColor: palette.border,
		borderRadius: 24,
		backgroundColor: palette.footerPanel,
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 12 },
		shadowOpacity: 0.18,
		shadowRadius: 24,
		elevation: 0,
		overflow: 'hidden',
	},
	item: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 14,
	},
	itemActive: {
		backgroundColor: 'rgba(130, 245, 208, 0.08)',
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
});
