import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Camera, Building2, User } from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import { ClientType } from '../types';

interface ClientAvatarPickerProps {
  clientType: ClientType;
  value?: string;
  onChange?: (val: string) => void;
}

export const ClientAvatarPicker: React.FC<ClientAvatarPickerProps> = ({
  clientType,
}) => {
  const isCompany = clientType === 'Company';

  const handlePress = () => {
    Alert.alert(
      isCompany ? 'Upload Company Logo' : 'Upload Profile Photo',
      'Image upload functionality will be connected in an upcoming update.',
      [{ text: 'Got it' }]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.avatarCircle}
        onPress={handlePress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={isCompany ? 'Upload Company Logo' : 'Upload Profile Photo'}
      >
        <View style={styles.iconContainer}>
          {isCompany ? (
            <Building2 size={30} color={colors.primary} strokeWidth={1.8} />
          ) : (
            <User size={30} color={colors.primary} strokeWidth={1.8} />
          )}
        </View>

        {/* Small badge at bottom right */}
        <View style={styles.plusBadge}>
          <Camera size={12} color={colors.white} strokeWidth={2.4} />
        </View>
      </TouchableOpacity>

      <Text style={styles.hintText}>
        {isCompany ? 'Add Company Logo' : 'Add Profile Photo'}
      </Text>
    </View>
  );
};

export default ClientAvatarPicker;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  avatarCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#EEF6F3',
    borderWidth: 2,
    borderColor: '#D4E8DF',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 8,
  },
});
