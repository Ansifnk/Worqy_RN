import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface ClientsHeaderProps {
  onAddPress?: () => void;
}

export const ClientsHeader: React.FC<ClientsHeaderProps> = ({ onAddPress }) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Clients</Text>
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#141416',
    letterSpacing: -0.6,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.darkButton || '#2B1223',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2B1223',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
});
