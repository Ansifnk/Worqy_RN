import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Check, Sparkles } from 'lucide-react-native';
import { SubscriptionPlan } from '../types';
import { colors } from '../../../utils/colors';

interface PlanCardProps {
  plan: SubscriptionPlan;
  isCurrent: boolean;
  isSubmitting?: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
  hasUsedTrial?: boolean;
  periodText?: string;
}

const getCurrencySymbol = (currency?: string): string => {
  switch (currency?.toUpperCase()) {
    case 'INR':
      return '₹';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    default:
      return '₹';
  }
};

const getDefaultFeatures = (plan: SubscriptionPlan): string[] => {
  if (plan.features && plan.features.length > 0) {
    return plan.features;
  }
  if (plan.isTrial || plan.price === 0) {
    return [
      'Full dashboard access',
      'Basic Client & Project tracking',
      'Generate quotations & invoices',
      'Standard email support',
    ];
  }
  return [
    'Unlimited Invoices & Quotations',
    'Unlimited Projects & Clients',
    'Custom Branding & Logo',
    'Automated Payment Reminders',
    'Priority 24/7 Support',
  ];
};

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isCurrent,
  isSubmitting = false,
  onSelect,
  hasUsedTrial = false,
  periodText = 'Per month',
}) => {
  const isTrial = plan.isTrial || (plan.price === 0 && (plan.trialDays ?? 0) > 0);
  const isTrialDisabled = isTrial && hasUsedTrial && !isCurrent;
  const isFeatured = plan.isPopular;
  const currencySymbol = getCurrencySymbol(plan.currency);
  const features = getDefaultFeatures(plan);

  // Subtitle / tagline matching the reference card design
  const subtitle =
    plan.description ||
    (isTrial
      ? 'For the basics'
      : isFeatured
      ? 'Everything + more'
      : 'And you asked for much more...');

  return (
    <View
      style={[
        styles.card,
        isFeatured ? styles.featuredCard : styles.regularCard,
        isCurrent && !isFeatured && styles.currentBorder,
      ]}
    >
      {/* Top Header: Title & Subtitle (and Sparkle for featured) */}
      <View style={styles.headerRow}>
        <View style={styles.titleColumn}>
          <Text style={[styles.planTitle, isFeatured && styles.featuredText]}>
            {plan.name}
          </Text>
          <Text style={[styles.planSubtitle, isFeatured && styles.featuredSubtitle]}>
            {subtitle}
          </Text>
        </View>

        {isFeatured && (
          <View style={styles.sparkleWrapper}>
            <Sparkles size={24} color={colors.white} strokeWidth={2.2} fill={colors.white} />
          </View>
        )}
      </View>

      {/* Price Section */}
      <View style={styles.priceContainer}>
        {plan.price === 0 ? (
          <Text style={[styles.priceValue, isFeatured && styles.featuredText]}>
            Free
          </Text>
        ) : (
          <Text style={[styles.priceValue, isFeatured && styles.featuredText]}>
            {currencySymbol}
            {plan.price}
          </Text>
        )}
        <Text style={[styles.periodText, isFeatured && styles.featuredSubtitle]}>
          {periodText}
        </Text>
      </View>

      {/* Feature List */}
      <View style={styles.featuresContainer}>
        {features.map((feature, idx) => (
          <View key={`${feature}-${idx}`} style={styles.featureRow}>
            <Check
              size={17}
              color={isFeatured ? colors.white : '#1E293B'}
              strokeWidth={2.8}
            />
            <Text
              style={[
                styles.featureText,
                isFeatured && styles.featuredFeatureText,
              ]}
            >
              {feature}
            </Text>
          </View>
        ))}
      </View>

      {/* Bottom CTA Button */}
      <TouchableOpacity
        style={[
          styles.ctaButton,
          isFeatured ? styles.featuredButton : styles.regularButton,
          isCurrent && styles.currentButton,
          isTrialDisabled && styles.disabledButton,
        ]}
        onPress={() => onSelect(plan)}
        disabled={isCurrent || isTrialDisabled || isSubmitting}
        activeOpacity={0.85}
      >
        {isSubmitting ? (
          <ActivityIndicator
            size="small"
            color={isFeatured ? colors.primary : colors.white}
          />
        ) : (
          <Text
            style={[
              styles.ctaButtonText,
              isFeatured ? styles.featuredButtonText : styles.regularButtonText,
              isCurrent && styles.currentButtonText,
              isTrialDisabled && styles.disabledButtonText,
            ]}
          >
            {isCurrent
              ? 'Current plan'
              : isTrialDisabled
              ? 'Trial already used'
              : 'Get started'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PlanCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  regularCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featuredCard: {
    backgroundColor: colors.primary, // Wyzo brand deep teal #176B67
    borderWidth: 0,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 6,
  },
  currentBorder: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleColumn: {
    flex: 1,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  planSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  sparkleWrapper: {
    marginLeft: 12,
  },
  featuredText: {
    color: colors.white,
  },
  featuredSubtitle: {
    color: 'rgba(255, 255, 255, 0.82)',
  },
  priceContainer: {
    marginBottom: 20,
  },
  priceValue: {
    fontSize: 38,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -1,
  },
  periodText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 26,
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
  featuredFeatureText: {
    color: colors.white,
  },
  ctaButton: {
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regularButton: {
    backgroundColor: colors.primary, // Wyzo primary
  },
  featuredButton: {
    backgroundColor: '#FFFFFF', // Clean white button inside featured card
  },
  currentButton: {
    backgroundColor: '#F1F5F9',
  },
  disabledButton: {
    backgroundColor: '#F1F5F9',
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  regularButtonText: {
    color: colors.white,
  },
  featuredButtonText: {
    color: colors.primary, // Brand teal text on white button
  },
  currentButtonText: {
    color: '#64748B',
  },
  disabledButtonText: {
    color: '#94A3B8',
  },
});
