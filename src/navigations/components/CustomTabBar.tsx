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
import { Home, Users, Calendar, FileText, CheckSquare, Sparkles, FolderKanban } from 'lucide-react-native';
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
    case 'Projects':
      return <FolderKanban size={size} color={color} strokeWidth={strokeWidth} />;
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
    case 'AIChat':
    case 'AIChatTab':
      return <Sparkles size={24} color={colors.white} strokeWidth={2.2} />;
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
    <View
      style={[
        styles.barWrapper,
        {
          paddingBottom: Math.max(
            bottomInset,
            Platform.OS === 'ios' ? 14 : 10,
          ),
        },
      ]}
    >
      <View style={styles.barContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isAIChat = route.name === 'AIChat' || route.name === 'AIChatTab';

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
            if (isAIChat) {
              const parent = navigation.getParent();
              if (parent) {
                (parent as any).navigate('AIChat');
              } else {
                (navigation as any).navigate('AIChat');
              }
              return;
            }

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

          // Bulged Primary Center Tab for AI Chat
          if (isAIChat) {
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={
                  options.tabBarAccessibilityLabel ?? 'AI Chat'
                }
                testID={options.tabBarButtonTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.bulgedTabButton}
                activeOpacity={0.85}
              >
                <View style={styles.bulgedButtonWrapper}>
                  <View
                    style={[
                      styles.bulgedButtonInner,
                      isFocused && styles.bulgedButtonInnerFocused,
                    ]}
                  >
                    <Sparkles size={25} color={colors.white} strokeWidth={2.2} />
                  </View>

                  <Text
                    style={[
                      styles.tabLabel,
                      styles.bulgedTabLabel,
                      isFocused
                        ? styles.tabLabelFocused
                        : styles.tabLabelUnfocused,
                      { color: currentColor },
                    ]}
                    numberOfLines={1}
                  >
                    {labelText === 'AIChat' || labelText === 'AIChatTab' ? 'AI' : labelText}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }

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
                    <View
                      style={[
                        styles.topActiveDot,
                        { backgroundColor: activeColor },
                      ]}
                    />
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
                        {typeof badge === 'number' && badge > 99
                          ? '99+'
                          : badge}
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  style={[
                    styles.tabLabel,
                    isFocused
                      ? styles.tabLabelFocused
                      : styles.tabLabelUnfocused,
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
    overflow: 'visible',
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    overflow: 'visible',
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
  bulgedTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    overflow: 'visible',
  },
  bulgedButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  bulgedButtonInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  bulgedButtonInnerFocused: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 1.05 }],
  },
  bulgedTabLabel: {
    marginTop: 2,
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
