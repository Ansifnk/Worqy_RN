import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Users, Calendar, FileText, CheckSquare } from 'lucide-react-native';
import { colors } from '../../utils/colors';

interface TabIconProps {
  name: string;
  focused: boolean;
  color: string;
  size?: number;
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused, color, size = 22 }) => {
  const strokeWidth = focused ? 2.4 : 1.8;

  switch (name) {
    case 'Home':
      return <Home size={size} color={color} strokeWidth={strokeWidth} fill={focused ? color : 'none'} />;
    case 'Clients':
    case 'Explore':
      return <Users size={size} color={color} strokeWidth={strokeWidth} fill={focused ? color : 'none'} />;
    case 'Schedule':
    case 'Bookings':
      return <Calendar size={size} color={color} strokeWidth={strokeWidth} />;
    case 'Tasks':
      return <CheckSquare size={size} color={color} strokeWidth={strokeWidth} />;
    case 'Invoices':
    case 'Pages':
    case 'Profile':
      return <FileText size={size} color={color} strokeWidth={strokeWidth} />;
    default:
      return <Home size={size} color={color} strokeWidth={strokeWidth} />;
  }
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
  insets: propInsets,
}) => {
  const safeAreaInsets = useSafeAreaInsets();
  const bottomInset = Math.max(propInsets?.bottom ?? 0, safeAreaInsets.bottom);

  return (
    <View style={[styles.barWrapper, { paddingBottom: Math.max(bottomInset, Platform.OS === 'ios' ? 14 : 10) }]}>
      <View style={styles.barContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          if (
            typeof options.tabBarStyle === 'object' &&
            options.tabBarStyle !== null &&
            'display' in options.tabBarStyle &&
            options.tabBarStyle.display === 'none'
          ) {
            return null;
          }

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const labelText = typeof label === 'string' ? label : route.name;
          const activeColor = colors.primary;
          const inactiveColor = colors.textSecondary;
          const currentColor = isFocused ? activeColor : inactiveColor;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const badge = options.tabBarBadge;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? labelText}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                {/* Active indicator dot placed subtly above icon */}
                <View style={styles.indicatorContainer}>
                  {isFocused && (
                    <View style={[styles.topActiveDot, { backgroundColor: activeColor }]} />
                  )}
                </View>

                <View style={styles.iconWrapper}>
                  {options.tabBarIcon ? (
                    options.tabBarIcon({
                      focused: isFocused,
                      color: currentColor,
                      size: 22,
                    })
                  ) : (
                    <TabIcon
                      name={route.name}
                      focused={isFocused}
                      color={currentColor}
                      size={22}
                    />
                  )}

                  {/* Badge */}
                  {badge !== undefined && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {typeof badge === 'number' && badge > 99 ? '99+' : badge}
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  style={[
                    styles.tabLabel,
                    isFocused ? styles.tabLabelFocused : styles.tabLabelUnfocused,
                    { color: currentColor },
                  ]}
                  numberOfLines={1}
                >
                  {labelText}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default CustomTabBar;

const styles = StyleSheet.create({
  barWrapper: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  indicatorContainer: {
    height: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  topActiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
  },
  iconWrapper: {
    width: 28,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    letterSpacing: -0.1,
  },
  tabLabelFocused: {
    fontWeight: '700',
  },
  tabLabelUnfocused: {
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
});
