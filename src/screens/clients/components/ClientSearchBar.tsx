import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface ClientSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export const ClientSearchBar: React.FC<ClientSearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search clients...',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Search size={18} color="#9C958F" strokeWidth={2.2} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9C958F"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="never"
        />
        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              onChangeText('');
              if (onClear) onClear();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <View style={styles.clearCircle}>
              <X size={12} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ClientSearchBar;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.searchBackground || '#F0ECE7',
    borderRadius: 24,
    height: 46,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    color: '#1A1817',
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    paddingHorizontal: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 6,
  },
  clearCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#9C958F',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
