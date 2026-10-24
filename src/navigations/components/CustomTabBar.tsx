import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

interface TabIconProps {
  name: string;
  focused: boolean;
  color: string;
}

// Built-in vector icons rendered with pure React Native primitives
const DefaultTabIcon: React.FC<TabIconProps> = ({ name, focused, color }) => {
  switch (name) {
    case 'Home':
      return (
        <View style={iconStyles.container}>
          <View
            style={[
              iconStyles.homeRoof,
              { borderBottomColor: color },
            ]}
          />
          <View
            style={[
              iconStyles.homeBase,
              focused ? iconStyles.homeBaseFocused : iconStyles.homeBaseUnfocused,
              { borderColor: color },
              focused && { backgroundColor: color },
            ]}
          >
            {focused && <View style={iconStyles.homeDoor} />}
          </View>
        </View>
      );

    case 'Explore':
      return (
        <View style={iconStyles.container}>
          <View
            style={[
              iconStyles.exploreCircle,
              focused ? iconStyles.exploreFocused : iconStyles.exploreUnfocused,
              { borderColor: color },
            ]}
          >
            <View style={[iconStyles.exploreCompassPin, { backgroundColor: color }]} />
          </View>
          <View style={[iconStyles.exploreHandle, { backgroundColor: color }]} />
        </View>
      );

    case 'Bookings':
      return (
        <View style={iconStyles.container}>
          <View
            style={[
              iconStyles.calendarBody,
              focused ? iconStyles.calendarFocused : iconStyles.calendarUnfocused,
              { borderColor: color },
            ]}
          >
            <View style={[iconStyles.calendarHeader, { backgroundColor: color }]} />
            <View style={iconStyles.calendarDotsRow}>
              <View style={[iconStyles.calendarDot, { backgroundColor: color }]} />
              <View style={[iconStyles.calendarDot, { backgroundColor: color }]} />
            </View>
          </View>
        </View>
      );

    case 'Profile':
      return (
        <View style={iconStyles.container}>
          <View
            style={[
              iconStyles.profileHead,
              { borderColor: color },
              focused && { backgroundColor: color },
            ]}
          />
          <View
            style={[
              iconStyles.profileBody,
              { borderColor: color },
              focused && { backgroundColor: color },
            ]}
          />
        </View>
      );

    default:
      return (
        <View style={iconStyles.container}>
          <View
            style={[
              iconStyles.defaultDot,
              focused ? iconStyles.defaultDotFocused : iconStyles.defaultDotUnfocused,
              { backgroundColor: color },
            ]}
          />
        </View>
      );
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
    <View style={[styles.barWrapper, { paddingBottom: Math.max(bottomInset, 12) }]}>
      <View style={styles.barContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Check if tab is explicitly hidden
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
          const activeColor = '#38BDF8';
          const inactiveColor = '#64748B';
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
              <View style={[styles.pillContainer, isFocused && styles.pillActive]}>
                <View style={styles.iconWrapper}>
                  {options.tabBarIcon ? (
                    options.tabBarIcon({
                      focused: isFocused,
                      color: currentColor,
                      size: 22,
                    })
                  ) : (
                    <DefaultTabIcon
                      name={route.name}
                      focused={isFocused}
                      color={currentColor}
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

                {/* Active indicator dot */}
                {isFocused && <View style={styles.activeDot} />}
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
    backgroundColor: '#0F172A',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1E293B',
    paddingTop: 8,
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
    paddingVertical: 4,
  },
  pillContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    minHeight: 48,
  },
  pillActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  iconWrapper: {
    width: 26,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
    letterSpacing: 0.2,
  },
  tabLabelFocused: {
    fontWeight: '600',
  },
  tabLabelUnfocused: {
    fontWeight: '500',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#38BDF8',
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});

const iconStyles = StyleSheet.create({
  container: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  homeBase: {
    width: 14,
    height: 10,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  homeBaseFocused: {
    backgroundColor: '#38BDF8',
  },
  homeBaseUnfocused: {
    backgroundColor: 'transparent',
  },
  homeDoor: {
    width: 4,
    height: 5,
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  exploreCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exploreFocused: {
    borderWidth: 2.5,
  },
  exploreUnfocused: {
    borderWidth: 2,
  },
  exploreCompassPin: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  exploreHandle: {
    position: 'absolute',
    width: 2,
    height: 5,
    bottom: 0,
    right: 2,
    transform: [{ rotate: '-45deg' }],
    borderRadius: 1,
  },
  calendarBody: {
    width: 16,
    height: 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  calendarFocused: {
    borderWidth: 2,
  },
  calendarUnfocused: {
    borderWidth: 1.5,
  },
  calendarHeader: {
    height: 4,
    width: '100%',
  },
  calendarDotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 2,
  },
  calendarDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.5,
  },
  profileHead: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5,
    marginBottom: 2,
  },
  profileBody: {
    width: 16,
    height: 7,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1.5,
    borderBottomWidth: 0,
  },
  defaultDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  defaultDotFocused: {
    opacity: 1,
  },
  defaultDotUnfocused: {
    opacity: 0.6,
  },
});
