import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Svg, { Path } from 'react-native-svg';
import {
  Home,
  Users,
  Calendar,
  FileText,
  CheckSquare,
  Sparkles,
  FolderKanban,
  CalendarCheck,
  Receipt,
} from 'lucide-react-native';
import { colors } from '../../utils/colors';

const BULGE_HEIGHT = 25;
const R_DOME = 36;
const R_FILLET = 18;
const Y_PEAK = 1.5;

const getBulgePaths = (
  width: number,
  height: number,
  centerRatio = 0.5,
  bulgeHeight = BULGE_HEIGHT,
  rDome = R_DOME,
  rFillet = R_FILLET,
  yPeak = Y_PEAK,
) => {
  const cX = width * centerRatio;
  const yBar = bulgeHeight;
  const yC = yPeak + rDome;
  const yF = yBar - rFillet;
  const dy = yF - yC;
  const dist = rDome + rFillet;

  if (Math.abs(dy) >= dist) {
    return {
      topBorderPath: `M 0 ${yBar} L ${width} ${yBar}`,
      fillPath: `M 0 ${yBar} L ${width} ${yBar} L ${width} ${yBar + height} L 0 ${yBar + height} Z`,
    };
  }

  const dx = Math.sqrt(dist * dist - dy * dy);
  const xFLeft = cX - dx;
  const xFRight = cX + dx;
  const tLeftX = cX + (xFLeft - cX) * (rDome / dist);
  const tLeftY = yC + (yF - yC) * (rDome / dist);
  const tRightX = cX + (xFRight - cX) * (rDome / dist);
  const tRightY = yC + (yF - yC) * (rDome / dist);

  const topBorderPath = [
    `M 0 ${yBar.toFixed(2)}`,
    `L ${xFLeft.toFixed(2)} ${yBar.toFixed(2)}`,
    `A ${rFillet} ${rFillet} 0 0 0 ${tLeftX.toFixed(2)} ${tLeftY.toFixed(2)}`,
    `A ${rDome} ${rDome} 0 0 1 ${tRightX.toFixed(2)} ${tRightY.toFixed(2)}`,
    `A ${rFillet} ${rFillet} 0 0 0 ${xFRight.toFixed(2)} ${yBar.toFixed(2)}`,
    `L ${width.toFixed(2)} ${yBar.toFixed(2)}`,
  ].join(' ');

  const totalH = yBar + height;
  const fillPath = [
    topBorderPath,
    `L ${width.toFixed(2)} ${totalH.toFixed(2)}`,
    `L 0 ${totalH.toFixed(2)}`,
    'Z',
  ].join(' ');

  return { topBorderPath, fillPath };
};

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
    case 'Work':
    case 'Projects':
      return <FolderKanban size={size} color={color} strokeWidth={strokeWidth} />;
    case 'Clients':
    case 'Explore':
      return <Users size={size} color={color} strokeWidth={strokeWidth} fill={focused ? color : 'none'} />;
    case 'Planner':
    case 'Schedule':
    case 'Bookings':
      return <CalendarCheck size={size} color={color} strokeWidth={strokeWidth} />;
    case 'Tasks':
      return <CheckSquare size={size} color={color} strokeWidth={strokeWidth} />;
    case 'Finance':
    case 'Invoices':
      return <Receipt size={size} color={color} strokeWidth={strokeWidth} />;
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
  const { width: windowWidth } = useWindowDimensions();
  const bottomInset = Math.max(propInsets?.bottom ?? 0, safeAreaInsets.bottom);
  const estimatedHeight = 56 + Math.max(bottomInset, Platform.OS === 'ios' ? 14 : 10);

  const [barLayout, setBarLayout] = useState({
    width: windowWidth,
    height: estimatedHeight,
  });

  const aiTabIndex = state.routes.findIndex(
    (r) => r.name === 'AIChat' || r.name === 'AIChatTab'
  );
  const centerRatio =
    aiTabIndex >= 0 ? (aiTabIndex + 0.5) / state.routes.length : 0.5;

  const { topBorderPath, fillPath } = useMemo(() => {
    return getBulgePaths(barLayout.width, barLayout.height, centerRatio);
  }, [barLayout.width, barLayout.height, centerRatio]);

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
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width > 0 && height > 0) {
          setBarLayout((prev) =>
            prev.width === width && prev.height === height
              ? prev
              : { width, height }
          );
        }
      }}
    >
      {/* Seamless Bulged Bar Background */}
      <View
        style={[
          styles.svgWrapper,
          {
            top: -BULGE_HEIGHT,
            width: barLayout.width,
            height: barLayout.height + BULGE_HEIGHT,
          },
        ]}
        pointerEvents="none"
      >
        <Svg
          width={barLayout.width}
          height={barLayout.height + BULGE_HEIGHT}
        >
          <Path d={fillPath} fill={colors.surface} />
          <Path
            d={topBorderPath}
            fill="none"
            stroke={colors.border}
            strokeWidth={1}
          />
        </Svg>
      </View>

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
    paddingTop: 6,
    overflow: 'visible',
    position: 'relative',
    ...Platform.select({
      ios: {
        backgroundColor: 'transparent',
      },
      android: {
        backgroundColor: colors.surface,
        elevation: 8,
      },
    }),
  },
  svgWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
    }),
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
