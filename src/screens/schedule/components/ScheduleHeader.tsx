import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import {
  Plus,
  ArrowLeft,
  Calendar,
  Search,
  X,
  ChevronDown,
} from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface ScheduleHeaderProps {
  onAddPress: () => void;
  onBackPress?: () => void;
  showBack?: boolean;
  currentMonthDisplay?: string;
  onDatePickerPress?: () => void;
  isSearchOpen?: boolean;
  onToggleSearch?: () => void;
  searchQuery?: string;
  onChangeSearchQuery?: (q: string) => void;
  totalEventsCount?: number;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  onAddPress,
  onBackPress,
  showBack = false,
  currentMonthDisplay,
  onDatePickerPress,
  isSearchOpen = false,
  onToggleSearch,
  searchQuery = '',
  onChangeSearchQuery,
  totalEventsCount,
}) => {
  return (
    <View style={styles.container}>
      {/* Main Top Bar */}
      <View style={styles.mainRow}>
        <View style={styles.leftGroup}>
          {showBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={19} color={colors.text} strokeWidth={2.4} />
            </TouchableOpacity>
          )}

          <View style={styles.titleWithMonth}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Schedule</Text>
              {typeof totalEventsCount === 'number' && totalEventsCount > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{totalEventsCount}</Text>
                </View>
              )}
            </View>

            {currentMonthDisplay && onDatePickerPress && (
              <TouchableOpacity
                style={styles.monthPickerChip}
                onPress={onDatePickerPress}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Select month, current is ${currentMonthDisplay}`}
              >
                <Calendar size={13} color={colors.primary} strokeWidth={2.2} />
                <Text style={styles.monthPickerText}>{currentMonthDisplay}</Text>
                <ChevronDown size={13} color={colors.primary} strokeWidth={2.2} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Right Action Icons */}
        <View style={styles.rightGroup}>
          {onToggleSearch && (
            <TouchableOpacity
              style={[
                styles.iconButton,
                isSearchOpen && styles.iconButtonActive,
              ]}
              onPress={onToggleSearch}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Toggle search"
            >
              <Search
                size={18}
                color={isSearchOpen ? colors.primary : colors.text}
                strokeWidth={2.2}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Add new schedule event"
          >
            <Plus size={18} color={colors.white} strokeWidth={2.6} />
            <Text style={styles.addButtonLabel}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expandable Search Bar */}
      {isSearchOpen && (
        <View style={styles.searchBarContainer}>
          <Search size={16} color={colors.textSecondary} strokeWidth={2.2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, clients, projects..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={onChangeSearchQuery}
            autoFocus
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onChangeSearchQuery?.('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={16} color={colors.textSecondary} strokeWidth={2.2} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default ScheduleHeader;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  titleWithMonth: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.6,
  },
  countBadge: {
    backgroundColor: '#EAF4F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  monthPickerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF4F2',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  monthPickerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.1,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    borderColor: colors.primary,
    backgroundColor: '#F3FAF8',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  addButtonLabel: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginTop: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
});
