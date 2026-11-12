import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Plus, ArrowLeft } from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface ClientsHeaderProps {
  onAddPress?: () => void;
  onBackPress?: () => void;
  showBack?: boolean;
}

export const ClientsHeader: React.FC<ClientsHeaderProps> = ({
  onAddPress,
  onBackPress,
  showBack = false,
}) => {
  return (
    <View style={styles.headerContainer}>
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
        <Text style={styles.title}>Clients</Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Add client"
      >
        <Plus size={20} color={colors.white} strokeWidth={2.6} />
      </TouchableOpacity>
    </View>
  );
};

export default ClientsHeader;

const styles = StyleSheet.create({
  headerContainer: {
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
    letterSpacing: -0.6,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
});
