import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Plus, ArrowLeft } from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface ScheduleHeaderProps {
  onAddPress: () => void;
  onBackPress?: () => void;
  showBack?: boolean;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  onAddPress,
  onBackPress,
  showBack = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleGroup}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color={colors.text} strokeWidth={2.4} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Schedule</Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Add new schedule"
      >
        <Plus size={22} color={colors.white} strokeWidth={2.4} />
      </TouchableOpacity>
    </View>
  );
};

export default ScheduleHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
});
