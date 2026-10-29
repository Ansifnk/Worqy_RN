import React, { useState, useMemo } from 'react';
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
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ChevronLeft, LogOut } from 'lucide-react-native';
import { useSubscription } from '../../hooks/useSubscription';
import { useAppContext } from '../../context/AppContext';
import { PlanCard } from './components/PlanCard';
import { SubscriptionPlan } from './types';
import { colors } from '../../utils/colors';

type RouteParams = {
  SubscriptionPlans?: {
    isMandatory?: boolean;
  };
};

export const SubscriptionPlansScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'SubscriptionPlans'>>();
  const isMandatory = Boolean(route.params?.isMandatory);

  const { user, signOutUser } = useAppContext();
  const {
    plans,
    subscription,
    plansLoading,
    subscribe,
    refresh,
  } = useSubscription();

  const [isYearly, setIsYearly] = useState(false);
  const [submittingPlanId, setSubmittingPlanId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const currentPlanId = subscription?.subscriptionPlanId || user?.subscriptionPlanId;

  // Filter or match plans based on the Switch
  const filteredPlans = useMemo(() => {
    const targetCycle = isYearly ? 'YEARLY' : 'MONTHLY';
    const matching = plans.filter((p) => p.billingCycle === targetCycle);
    // If no specific yearly plans exist in the database, fall back to showing all active plans
    if (matching.length > 0) {
      return matching;
    }
    return plans;
  }, [plans, isYearly]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    const isTrial = plan.isTrial || (plan.price === 0 && (plan.trialDays ?? 0) > 0);
    const title = isTrial ? `Start ${plan.name} Trial?` : `Choose ${plan.name}?`;
    const message = isTrial
      ? `You will get instant access to ${plan.name} with free trial benefits.`
      : `Select ${plan.name} for ${plan.currency} ${plan.price}${plan.billingCycle ? ` (${plan.billingCycle.toLowerCase()})` : ''}.`;

    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: isTrial ? 'Start Trial' : 'Confirm',
        style: 'default',
        onPress: async () => {
          try {
            setSubmittingPlanId(plan.id);
            await subscribe(plan.id);

            Alert.alert(
              'Subscription Activated! 🎉',
              `You are now subscribed to ${plan.name}.`,
              [
                {
                  text: 'Continue',
                  onPress: () => {
                    if (isMandatory) {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Main' }],
                      });
                    } else {
                      navigation.goBack();
                    }
                  },
                },
              ]
            );
          } catch (err: any) {
            Alert.alert('Subscription Failed', err?.message || 'Failed to activate plan.');
          } finally {
            setSubmittingPlanId(null);
          }
        },
      },
    ]);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOutUser();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        {!isMandatory ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color="#0F172A" strokeWidth={2.4} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}

        {isMandatory && (
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <LogOut size={16} color="#DC2626" strokeWidth={2.2} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        )}
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
        {/* Main Headline Section (matching reference design) */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>PLANS FOR{'\n'}YOU</Text>
          <Text style={styles.subtitle}>
            Choose your plan and make your life easy
          </Text>

          {/* Toggle Switch Row (matching reference design) */}
          {/* <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, !isYearly && styles.toggleLabelActive]}>
              Monthly billing
            </Text>

            <Switch
              value={isYearly}
              onValueChange={(val) => setIsYearly(val)}
              trackColor={{ false: '#E2E8F0', true: colors.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E2E8F0"
              style={styles.switchControl}
            />

            <Text style={[styles.toggleLabel, isYearly && styles.toggleLabelActive]}>
              Switch to yearly
            </Text>
          </View> */}
        </View>

        {/* Plan Cards List */}
        {plansLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading plans...</Text>
          </View>
        ) : filteredPlans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No plans found</Text>
            <Text style={styles.emptyText}>
              There are currently no active plans available for this cycle.
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              activeOpacity={0.8}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={Boolean(currentPlanId && currentPlanId === plan.id)}
              isSubmitting={submittingPlanId === plan.id}
              hasUsedTrial={user?.hasUsedTrial}
              periodText={
                plan.billingCycle === 'YEARLY' || isYearly
                  ? 'Per year'
                  : 'Per month'
              }
              onSelect={handleSelectPlan}
            />
          ))
        )}

        {/* Footer Payment & Security Assurance */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>Secure 256-bit SSL encrypted checkout</Text>
          <View style={styles.paymentMethodsRow}>
            <Text style={styles.paymentBadge}>PayPal</Text>
            <Text style={styles.paymentBadge}>afterpay</Text>
            <Text style={styles.paymentBadge}>VISA</Text>
            <Text style={styles.paymentBadge}>Mastercard</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SubscriptionPlansScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Crisp, clean light background matching the image
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
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF2F2',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  signOutText: {
    color: '#DC2626',
    fontSize: 12.5,
    fontWeight: '600',
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  toggleLabel: {
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '500',
  },
  toggleLabelActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  switchControl: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
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
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 10,
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
});
