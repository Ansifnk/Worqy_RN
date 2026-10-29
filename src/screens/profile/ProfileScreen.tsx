import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  Camera,
  SquarePen,
  FileText,
  LogOut,
  Trash2,
  Sparkles,
} from 'lucide-react-native';
import { useAppContext } from '../../context/AppContext';
import { useSubscription } from '../../hooks/useSubscription';
import { colors } from '../../utils/colors';
import EditProfileModal from './components/EditProfileModal';
import DeleteAccountModal from './components/DeleteAccountModal';

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, signOutUser } = useAppContext();
  const { subscription } = useSubscription();

  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Logout', 'Are you sure you want to log out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOutUser();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Failed to sign out');
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalVisible(true);
  };

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have no unread notifications.');
  };

  const handleAvatarChange = () => {
    Alert.alert(
      'Profile Photo',
      'Change profile picture functionality will be available in the upcoming update.',
      [{ text: 'OK' }]
    );
  };

  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'A';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Dark / Brand Themed Header Section */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16) }]}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.navIconButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={22} color={colors.white} strokeWidth={2.4} />
          </TouchableOpacity>

          <Text style={styles.navTitle}>Account</Text>

          <TouchableOpacity
            style={styles.navIconButton}
            onPress={handleNotificationPress}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Bell size={20} color={colors.white} strokeWidth={2.2} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Profile Avatar & Info */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>

            <TouchableOpacity
              style={styles.cameraBadge}
              onPress={handleAvatarChange}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Change profile picture"
            >
              <Camera size={14} color={colors.white} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName} numberOfLines={1}>
            {user?.name || 'Ansif'}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user?.email || 'ansif@wyzo.io'}
          </Text>
        </View>
      </View>

      {/* White Rounded Bottom Sheet Content */}
      <View style={styles.sheetContainer}>
        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={[
            styles.sheetContent,
            { paddingBottom: Math.max(insets.bottom + 24, 40) },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Subscription Banner Card */}
          <TouchableOpacity
            style={styles.subscriptionBanner}
            onPress={() => {
              if (subscription?.isSubscribed) {
                navigation.navigate('SubscriptionDetail');
              } else {
                navigation.navigate('SubscriptionPlans', { isMandatory: false });
              }
            }}
            activeOpacity={0.8}
          >
            <View style={styles.subBannerLeft}>
              <View style={styles.subIconWrapper}>
                <Sparkles size={20} color={colors.white} strokeWidth={2.4} />
              </View>
              <View style={styles.subTextWrapper}>
                <View style={styles.subTitleRow}>
                  <Text style={styles.subPlanTitle}>
                    {subscription?.plan?.name || user?.subscriptionPlan?.name || 'No Active Plan'}
                  </Text>
                  <View
                    style={[
                      styles.subStatusBadge,
                      {
                        backgroundColor: subscription?.isSubscribed ? '#DCFCE7' : '#FEF3C7',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.subStatusBadgeText,
                        {
                          color: subscription?.isSubscribed ? '#15803D' : '#B45309',
                        },
                      ]}
                    >
                      {subscription?.subscriptionStatus || 'INACTIVE'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.subPlanSubtitle}>
                  {subscription?.isSubscribed
                    ? subscription?.daysRemaining !== undefined && subscription.daysRemaining !== null
                      ? `${subscription.daysRemaining} days remaining · Tap to view details`
                      : 'Active subscription · Tap to manage'
                    : 'Tap to choose a plan and unlock all features'}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} strokeWidth={2.2} />
          </TouchableOpacity>

          {/* Main Actions Card (Edit Profile & Terms) */}
          <View style={styles.cardGroup}>
            {/* Edit Profile Item */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => setIsEditProfileVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconWrapper}>
                  <SquarePen size={19} color={colors.primary} strokeWidth={2.2} />
                </View>
                <Text style={styles.menuTitle}>Edit Profile</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} strokeWidth={2.2} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* Terms and Conditions Item */}
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconWrapper}>
                  <FileText size={19} color={colors.primary} strokeWidth={2.2} />
                </View>
                <Text style={styles.menuTitle}>Terms and Conditions</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Logout Card */}
          <TouchableOpacity
            style={styles.logoutCard}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={styles.logoutIconWrapper}>
                <LogOut size={18} color="#EF4444" strokeWidth={2.2} />
              </View>
              <Text style={styles.logoutTitle}>Logout</Text>
            </View>
            <ChevronRight size={20} color="#F87171" strokeWidth={2.2} />
          </TouchableOpacity>

          {/* Delete Account Card */}
          <TouchableOpacity
            style={styles.deleteAccountCard}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={styles.deleteIconWrapper}>
                <Trash2 size={18} color="#DC2626" strokeWidth={2.2} />
              </View>
              <Text style={styles.deleteTitle}>Delete Account</Text>
            </View>
            <ChevronRight size={20} color="#F87171" strokeWidth={2.2} />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={isEditProfileVisible}
        onClose={() => setIsEditProfileVisible(false)}
      />

      {/* Delete Account Modal (Password Re-authentication) */}
      <DeleteAccountModal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
      />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#134E4A', // Wyzo deep primaryDark tone
  },
  headerContainer: {
    backgroundColor: '#134E4A',
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.3,
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#134E4A',
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#176B67',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarInitial: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.5,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 21,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.72)',
    letterSpacing: -0.2,
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  sheetScroll: {
    flex: 1,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  cardGroup: {
    backgroundColor: '#F7FAF9',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E6ECE9',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E8F3EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#E6ECE9',
    marginLeft: 72,
    marginRight: 16,
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 18,
  },
  logoutIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#EF4444',
    letterSpacing: -0.2,
  },
  deleteAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  deleteIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#DC2626',
    letterSpacing: -0.2,
  },
  subscriptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  subBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  subIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subTextWrapper: {
    flex: 1,
  },
  subTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subPlanTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  subStatusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  subStatusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subPlanSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 3,
  },
});
