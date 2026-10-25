import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface ScheduleHeaderProps {
  onAddPress: () => void;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ onAddPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule</Text>
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
