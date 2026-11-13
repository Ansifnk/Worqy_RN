import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Compass,
  Home,
  FolderKanban,
  Users,
  CheckSquare,
  Calendar,
  Sparkles,
  Receipt,
  FileText,
} from 'lucide-react-native';
import { colors } from '../utils/colors';
import { BottomSheet } from './BottomSheet';

interface GlobalQuickSwitcherProps {
  currentRoute?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideFloatingTrigger?: boolean;
}

// Feature flag: Quotations hidden for now, can be re-enabled later
const SHOW_QUOTATIONS = false;

export const GlobalQuickSwitcher: React.FC<GlobalQuickSwitcherProps> = ({
  currentRoute,
  isOpen: controlledIsOpen,
  onOpenChange,
  hideFloatingTrigger = false,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  let activeRouteName = currentRoute;
  try {
    const route = useRoute();
    if (!activeRouteName && route?.name) {
      activeRouteName = route.name;
    }
  } catch {
    // In case hook is used outside direct screen context
  }

  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const isSheetOpen = controlledIsOpen !== undefined ? controlledIsOpen : uncontrolledIsOpen;

  const handleOpen = () => {
    if (onOpenChange) {
      onOpenChange(true);
    } else {
      setUncontrolledIsOpen(true);
    }
  };

  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    } else {
      setUncontrolledIsOpen(false);
    }
  };

  const navigateTo = (screenName: string, params?: any) => {
    handleClose();
    setTimeout(() => {
      if (screenName === 'Main' || screenName === 'Home') {
        if (activeRouteName === 'Main' || activeRouteName === 'Home') {
          return;
        }
        navigation.navigate('Main');
      } else {
        navigation.navigate(screenName, params);
      }
    }, 150);
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      subtext: 'Overview & Hub',
      icon: Home,
      route: 'Main',
      color: colors.primary,
      bg: '#E6F4F1',
    },
    {
      id: 'projects',
      label: 'Projects',
      subtext: 'Manage & track',
      icon: FolderKanban,
      route: 'Projects',
      color: colors.primary,
      bg: '#E6F4F1',
    },
    {
      id: 'clients',
      label: 'Clients',
      subtext: 'Contacts & CRM',
      icon: Users,
      route: 'Clients',
      color: '#059669',
      bg: '#ECFDF5',
    },
    {
      id: 'tasks',
      label: 'Tasks',
      subtext: 'To-do list',
      icon: CheckSquare,
      route: 'Tasks',
      color: '#6366F1',
      bg: '#EEF2FF',
    },
    {
      id: 'schedule',
      label: 'Schedule',
      subtext: 'Calendar & meetings',
      icon: Calendar,
      route: 'Schedule',
      color: '#0284C7',
      bg: '#F0F9FF',
    },
    {
      id: 'invoices',
      label: 'Invoices',
      subtext: 'Billing & paid',
      icon: Receipt,
      route: 'Invoices',
      color: '#D97706',
      bg: '#FFFBEB',
    },
    ...(SHOW_QUOTATIONS
      ? [
        {
          id: 'quotations',
          label: 'Quotes',
          subtext: 'Estimates & offers',
          icon: FileText,
          route: 'Quotations',
          color: '#EA580C',
          bg: '#FFF7ED',
        },
      ]
      : []),
    {
      id: 'ai',
      label: 'AI Copilot',
      subtext: 'Assistant',
      icon: Sparkles,
      route: 'AIChat',
      color: colors.accent,
      bg: '#134E4A',
      isDark: true,
      fullWidth: !SHOW_QUOTATIONS,
    },
  ];

  const quickActions = [
    {
      id: 'task',
      label: 'New Task',
      icon: CheckSquare,
      color: '#6366F1',
      onPress: () => navigateTo('TaskDetail', { isNew: true }),
    },
    {
      id: 'invoice',
      label: 'New Invoice',
      icon: Receipt,
      color: '#D97706',
      onPress: () => navigateTo('AddEditInvoice', { isEdit: false }),
    },
    {
      id: 'project',
      label: 'New Project',
      icon: FolderKanban,
      color: colors.primary,
      onPress: () => navigateTo('AddEditProject'),
    },
    {
      id: 'chat',
      label: 'Ask AI',
      icon: Sparkles,
      color: colors.primaryDark,
      onPress: () => navigateTo('AIChat'),
    },
  ];

  return (
    <>
      {/* Floating Pill Trigger */}
      {!hideFloatingTrigger && (
        <TouchableOpacity
          style={[
            styles.floatingTrigger,
            { bottom: Math.max(insets.bottom + 16, 24) },
          ]}
          onPress={handleOpen}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Open Quick Switcher"
        >
          <Compass size={20} color={colors.white} strokeWidth={2.4} />
          <Text style={styles.floatingTriggerText}>Switch</Text>
        </TouchableOpacity>
      )}

      {/* Quick Switcher Bottom Sheet */}
      <BottomSheet
        visible={isSheetOpen}
        onClose={handleClose}
        title="Workspace Quick Switcher"
        subtitle="Jump directly to any module or action"
        maxHeightRatio={0.88}
      >
        <View style={styles.sheetContainer}>
          {/* Section 1: Navigation modules */}
          <Text style={styles.groupHeading}>WORKSPACES</Text>
          <View style={styles.navGrid}>
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive =
                activeRouteName === item.route ||
                (item.route === 'Main' && activeRouteName === 'Home');

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.navCard,
                    item.fullWidth && styles.navCardFullWidth,
                    isActive && styles.navCardActive,
                    item.isDark && styles.navCardDark,
                  ]}
                  onPress={() => navigateTo(item.route)}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: item.bg },
                      item.isDark && { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
                    ]}
                  >
                    <IconComp
                      size={18}
                      color={item.isDark ? colors.accent : item.color}
                      strokeWidth={2.2}
                    />
                  </View>
                  <View style={styles.navCardTextWrapper}>
                    <Text
                      style={[
                        styles.navCardTitle,
                        item.isDark && { color: colors.white },
                        isActive && { color: colors.primary, fontWeight: '800' },
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.navCardSubtitle,
                        item.isDark && { color: 'rgba(255, 255, 255, 0.7)' },
                      ]}
                      numberOfLines={1}
                    >
                      {item.subtext}
                    </Text>
                  </View>
                  {isActive && <View style={styles.activeDot} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Section 2: Fast creation shortcuts */}
          <Text style={[styles.groupHeading, { marginTop: 20 }]}>QUICK CREATE</Text>
          <View style={styles.actionsRow}>
            {quickActions.map((action) => {
              const IconComp = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionBtn}
                  onPress={action.onPress}
                  activeOpacity={0.75}
                >
                  <View style={[styles.actionIconBox, { borderColor: action.color }]}>
                    <IconComp size={18} color={action.color} strokeWidth={2.2} />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </BottomSheet>
    </>
  );
};

export default GlobalQuickSwitcher;

const styles = StyleSheet.create({
  floatingTrigger: {
    position: 'absolute',
    right: 20,
    backgroundColor: colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  floatingTriggerText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sheetContainer: {
    padding: 8,
    paddingBottom: 20,
  },
  groupHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  navCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    position: 'relative',
  },
  navCardFullWidth: {
    width: '80%',
  },
  navCardDark: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primary,
  },
  navCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0F9F8',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navCardTextWrapper: {
    flex: 1,
  },
  navCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  navCardSubtitle: {
    fontSize: 10.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});

