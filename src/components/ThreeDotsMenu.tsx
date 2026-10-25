import React, { forwardRef, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  StyleProp,
  ViewStyle,
  ColorValue,
} from 'react-native';
import {
  MenuView,
  MenuComponentRef,
  MenuAction,
  NativeActionEvent,
} from '@react-native-menu/menu';
import { MoreVertical, MoreHorizontal } from 'lucide-react-native';
import { colors } from '../utils/colors';

export interface ActionMenuItem {
  id: string;
  title: string;
  subtitle?: string;
  destructive?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  state?: 'off' | 'on' | 'mixed';
  /**
   * System icon or SF Symbol name on iOS, drawable resource name on Android.
   * If omitted, a preset matching the id (e.g. 'edit', 'delete', 'view') is used.
   */
  image?: string;
  imageColor?: ColorValue | number;
  titleColor?: ColorValue | number;
  subactions?: ActionMenuItem[];
  /**
   * Dedicated callback invoked when this action is tapped.
   */
  onPress?: () => void;
}

export interface ThreeDotsMenuProps {
  /** List of actions to show in the native menu */
  actions: ActionMenuItem[];
  /** Callback invoked when any action is chosen, receives the action's id */
  onSelect?: (actionId: string) => void;
  /** Menu title header (supported on iOS) */
  title?: string;
  /** Orientation of the three-dots icon: 'vertical' (default) or 'horizontal' */
  orientation?: 'vertical' | 'horizontal';
  /** Size of the three-dots icon (default: 18) */
  iconSize?: number;
  /** Color of the three-dots icon (default: colors.textSecondary) */
  iconColor?: string;
  /** Outer container style */
  style?: StyleProp<ViewStyle>;
  /** Inner trigger button container style */
  buttonStyle?: StyleProp<ViewStyle>;
  /** Hit slop area for touch target */
  hitSlop?: { top: number; bottom: number; left: number; right: number };
  /** Whether the popup is anchored to the right side on Android (default: true) */
  isAnchoredToRight?: boolean;
  /** Whether the menu opens on long press instead of tap (default: false) */
  shouldOpenOnLongPress?: boolean;
  /** Optional theme variant ('light' | 'dark' | 'unspecified') on iOS */
  themeVariant?: 'light' | 'dark' | 'unspecified';
  /** Optional custom trigger view replacing the default 3-dots icon */
  children?: React.ReactNode;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  /** Test identifier */
  testID?: string;
  /** Callback fired when the menu opens */
  onOpenMenu?: () => void;
  /** Callback fired when the menu closes */
  onCloseMenu?: () => void;
}

/**
 * Returns default system icons for common action keywords
 */
const getDefaultIconForAction = (
  id: string,
  destructive?: boolean
): string | undefined => {
  const normalizedId = id.toLowerCase();
  if (destructive || normalizedId.includes('delete') || normalizedId.includes('remove')) {
    return Platform.select({ ios: 'trash', android: 'ic_menu_delete' });
  }
  if (normalizedId.includes('edit') || normalizedId.includes('modify')) {
    return Platform.select({ ios: 'square.and.pencil', android: 'ic_menu_edit' });
  }
  if (normalizedId.includes('view') || normalizedId.includes('detail')) {
    return Platform.select({ ios: 'eye', android: 'ic_menu_view' });
  }
  if (normalizedId.includes('share')) {
    return Platform.select({ ios: 'square.and.arrow.up', android: 'ic_menu_share' });
  }
  if (normalizedId.includes('copy') || normalizedId.includes('duplicate')) {
    return Platform.select({ ios: 'doc.on.doc', android: 'ic_menu_save' });
  }
  if (normalizedId.includes('complete') || normalizedId.includes('done') || normalizedId.includes('check')) {
    return Platform.select({ ios: 'checkmark.circle', android: 'ic_menu_send' });
  }
  if (normalizedId.includes('status') || normalizedId.includes('tag')) {
    return Platform.select({ ios: 'tag', android: 'ic_menu_agenda' });
  }
  return undefined;
};

/**
 * Transforms higher-level ActionMenuItem definitions into @react-native-menu/menu MenuAction objects.
 */
const mapToMenuAction = (item: ActionMenuItem): MenuAction => {
  const image = item.image ?? getDefaultIconForAction(item.id, item.destructive);
  const titleColor =
    item.titleColor ??
    (item.destructive && Platform.OS === 'android' ? colors.error : undefined);

  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    state: item.state,
    image,
    imageColor: item.imageColor,
    titleColor,
    attributes: {
      destructive: item.destructive,
      disabled: item.disabled,
      hidden: item.hidden,
    },
    subactions: item.subactions ? item.subactions.map(mapToMenuAction) : undefined,
  };
};

export const ThreeDotsMenu = forwardRef<MenuComponentRef, ThreeDotsMenuProps>(
  (
    {
      actions,
      onSelect,
      title,
      orientation = 'vertical',
      iconSize = 18,
      iconColor = colors.textSecondary,
      style,
      buttonStyle,
      hitSlop = { top: 10, bottom: 10, left: 10, right: 10 },
      isAnchoredToRight = true,
      shouldOpenOnLongPress = false,
      themeVariant,
      children,
      accessibilityLabel = 'More options',
      testID,
      onOpenMenu,
      onCloseMenu,
    },
    ref
  ) => {
    // Map of action IDs to their individual onPress handlers
    const actionCallbackMap = useMemo(() => {
      const map = new Map<string, () => void>();

      const register = (items: ActionMenuItem[]) => {
        items.forEach((item) => {
          if (item.onPress) {
            map.set(item.id, item.onPress);
          }
          if (item.subactions) {
            register(item.subactions);
          }
        });
      };

      register(actions);
      return map;
    }, [actions]);

    // Convert actions for MenuView
    const menuActions = useMemo(() => {
      return actions.map(mapToMenuAction);
    }, [actions]);

    const handlePressAction = useCallback(
      ({ nativeEvent }: NativeActionEvent) => {
        const actionId = nativeEvent.event;
        const callback = actionCallbackMap.get(actionId);
        if (callback) {
          callback();
        }
        if (onSelect) {
          onSelect(actionId);
        }
      },
      [actionCallbackMap, onSelect]
    );

    const IconComponent = orientation === 'horizontal' ? MoreHorizontal : MoreVertical;

    return (
      <MenuView
        ref={ref}
        title={title}
        actions={menuActions}
        onPressAction={handlePressAction}
        isAnchoredToRight={isAnchoredToRight}
        shouldOpenOnLongPress={shouldOpenOnLongPress}
        themeVariant={themeVariant}
        hitSlop={hitSlop}
        onOpenMenu={onOpenMenu}
        onCloseMenu={onCloseMenu}
        style={[styles.menuWrapper, style]}
        testID={testID}
      >
        {children ? (
          children
        ) : (
          <View
            style={[styles.defaultButton, buttonStyle]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
          >
            <IconComponent size={iconSize} color={iconColor} />
          </View>
        )}
      </MenuView>
    );
  }
);

ThreeDotsMenu.displayName = 'ThreeDotsMenu';

export default ThreeDotsMenu;

const styles = StyleSheet.create({
  menuWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
