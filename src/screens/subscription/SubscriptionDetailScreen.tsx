import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Clock,
  Check,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Layers,
  Users,
  Briefcase,
  FileSpreadsheet,
} from 'lucide-react-native';
import dayjs from 'dayjs';
import { useSubscription } from '../../hooks/useSubscription';
import { colors } from '../../utils/colors';

export const SubscriptionDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { subscription, loading, cancel, refresh } = useSubscription();
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const plan = subscription?.plan;
  const isSubscribed = Boolean(subscription?.isSubscribed);
  const status = subscription?.subscriptionStatus || 'NONE';
  const isTrial = status === 'TRIALING';
  const isExpired = status === 'EXPIRED';

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your current subscription?',
      [
        { text: 'Keep Plan', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              await cancel();
              Alert.alert('Subscription Cancelled', 'Your plan has been cancelled.');
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to cancel subscription.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const currencySymbol = plan?.currency?.toUpperCase() === 'USD' ? '$' : '₹';
  const formattedEndDate = subscription?.subscriptionEndsAt
    ? dayjs(subscription.subscriptionEndsAt).format('MMMM D, YYYY')
    : null;

  const defaultFeatures =
    plan?.features && plan.features.length > 0
      ? plan.features
      : isTrial
      ? [
          'Full dashboard access',
          'Basic Client & Project tracking',
          'Generate quotations & invoices',
          'Standard email support',
        ]
      : [
          'Unlimited Invoices & Quotations',
          'Unlimited Projects & Clients',
          'Custom Branding & Logo',
          'Automated Payment Reminders',
          'Priority 24/7 Support',
        ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color="#0F172A" strokeWidth={2.4} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('SubscriptionPlans')}
          activeOpacity={0.7}
        >
          <Text style={styles.switchPlanLink}>All plans</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 28, 48) },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Main Title Section */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>YOUR{'\n'}SUBSCRIPTION</Text>
          <Text style={styles.subtitle}>
            Manage your active plan, benefits and renewal timeline
          </Text>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading subscription...</Text>
          </View>
        ) : (
          <>
            {/* Warning if expired or unsubscribed */}
            {(!isSubscribed || isExpired) && (
              <View style={styles.warningCard}>
                <AlertTriangle size={20} color="#B91C1C" strokeWidth={2.2} />
                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>Subscription Inactive</Text>
                  <Text style={styles.warningText}>
                    Select an active plan to continue enjoying unlimited features.
                  </Text>
                </View>
              </View>
            )}

            {/* Hero Active Plan Card (styled like PlanCard's featured card) */}
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroTitleColumn}>
                  <Text style={styles.heroPlanTitle}>
                    {plan?.name || (isSubscribed ? 'Active Plan' : 'No Active Plan')}
                  </Text>
                  <Text style={styles.heroPlanSubtitle}>
                    {plan?.description || (isTrial ? 'Free Trial Period' : 'Full access unlocked')}
                  </Text>
                </View>

                <View style={styles.heroBadgeRow}>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{status}</Text>
                  </View>
                  <Sparkles size={22} color="#FFFFFF" strokeWidth={2.2} fill="#FFFFFF" />
                </View>
              </View>

              {/* Price Row */}
              <View style={styles.heroPriceContainer}>
                {plan && plan.price > 0 ? (
                  <View style={styles.priceRow}>
                    <Text style={styles.heroPriceValue}>
                      {currencySymbol}
                      {plan.price}
                    </Text>
                    <Text style={styles.heroPeriodText}>
                      / {plan.billingCycle?.toLowerCase() || 'month'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.priceRow}>
                    <Text style={styles.heroPriceValue}>Free</Text>
                    {isTrial && <Text style={styles.heroPeriodText}>trial</Text>}
                  </View>
                )}
              </View>

              {/* Validity Pill */}
              {formattedEndDate && (
                <View style={styles.validityContainer}>
                  <Clock size={15} color="rgba(255, 255, 255, 0.9)" strokeWidth={2.4} />
                  <Text style={styles.validityText}>
                    {subscription?.daysRemaining !== undefined && subscription.daysRemaining !== null
                      ? `${subscription.daysRemaining} days left · Renews on ${formattedEndDate}`
                      : `Valid until ${formattedEndDate}`}
                  </Text>
                </View>
              )}
            </View>

            {/* Resource Usage & Plan Limits Card */}
            {subscription?.usage && plan && (
              <View style={styles.whiteSectionCard}>
                <Text style={styles.sectionHeading}>Plan Entitlements</Text>
                <Text style={styles.sectionSubheading}>Your current usage vs plan limits</Text>

                <View style={styles.usageGrid}>
                  <View style={styles.usageTile}>
                    <View style={styles.usageIconCircle}>
                      <Users size={16} color={colors.primary} strokeWidth={2.4} />
                    </View>
                    <Text style={styles.usageTileLabel}>Clients</Text>
                    <Text style={styles.usageTileValue}>
                      {subscription.usage.clients}{' '}
                      <Text style={styles.usageTileLimit}>
                        / {plan.maxClients && plan.maxClients > 0 ? plan.maxClients : '∞'}
                      </Text>
                    </Text>
                  </View>

                  <View style={styles.usageTile}>
                    <View style={styles.usageIconCircle}>
                      <Briefcase size={16} color={colors.primary} strokeWidth={2.4} />
                    </View>
                    <Text style={styles.usageTileLabel}>Projects</Text>
                    <Text style={styles.usageTileValue}>
                      {subscription.usage.projects}{' '}
                      <Text style={styles.usageTileLimit}>
                        / {plan.maxProjects && plan.maxProjects > 0 ? plan.maxProjects : '∞'}
                      </Text>
                    </Text>
                  </View>

                  <View style={styles.usageTile}>
                    <View style={styles.usageIconCircle}>
                      <Layers size={16} color={colors.primary} strokeWidth={2.4} />
                    </View>
                    <Text style={styles.usageTileLabel}>Tasks</Text>
                    <Text style={styles.usageTileValue}>
                      {subscription.usage.tasks}{' '}
                      <Text style={styles.usageTileLimit}>
                        / {plan.maxTasks && plan.maxTasks > 0 ? plan.maxTasks : '∞'}
                      </Text>
                    </Text>
                  </View>

                  <View style={styles.usageTile}>
                    <View style={styles.usageIconCircle}>
                      <FileSpreadsheet size={16} color={colors.primary} strokeWidth={2.4} />
                    </View>
                    <Text style={styles.usageTileLabel}>Invoices</Text>
                    <Text style={styles.usageTileValue}>
                      {subscription.usage.invoices}{' '}
                      <Text style={styles.usageTileLimit}>
                        / {plan.maxInvoices && plan.maxInvoices > 0 ? plan.maxInvoices : '∞'}
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Included Features Card */}
            <View style={styles.whiteSectionCard}>
              <Text style={styles.sectionHeading}>Included Features</Text>
              <Text style={styles.sectionSubheading}>What comes with your current plan</Text>

              <View style={styles.featuresList}>
                {defaultFeatures.map((feature, idx) => (
                  <View key={`${feature}-${idx}`} style={styles.featureRow}>
                    <Check size={17} color="#1E293B" strokeWidth={2.8} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* CTA Button: Change or Upgrade Plan */}
            <TouchableOpacity
              style={styles.primaryPillButton}
              onPress={() => navigation.navigate('SubscriptionPlans')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryPillButtonText}>Change or Upgrade Plan</Text>
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>

            {/* Cancel Button */}
            {isSubscribed && status !== 'CANCELLED' && (
              <TouchableOpacity
                style={styles.cancelTextButton}
                onPress={handleCancelSubscription}
                disabled={cancelling}
                activeOpacity={0.7}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <Text style={styles.cancelTextButtonLabel}>Cancel subscription</Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default SubscriptionDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  switchPlanLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerSection: {
    paddingVertical: 12,
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 27,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.6,
    lineHeight: 33,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 8,
    lineHeight: 19,
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B91C1C',
  },
  warningText: {
    fontSize: 12.5,
    color: '#991B1B',
    marginTop: 2,
    lineHeight: 17,
  },
  heroCard: {
    backgroundColor: colors.primary, // Wyzo brand deep teal #176B67
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroTitleColumn: {
    flex: 1,
  },
  heroPlanTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  heroPlanSubtitle: {
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: 4,
    fontWeight: '500',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  heroPriceContainer: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  heroPriceValue: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  heroPeriodText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.82)',
    fontWeight: '500',
    marginLeft: 6,
  },
  validityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  validityText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  whiteSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sectionSubheading: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 16,
  },
  usageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  usageTile: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  usageIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E6F4F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageTileLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  usageTileValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 3,
  },
  usageTileLimit: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
  },
  featuresList: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    flex: 1,
    lineHeight: 19,
  },
  primaryPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingVertical: 15,
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryPillButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  cancelTextButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelTextButtonLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#DC2626',
  },
});
