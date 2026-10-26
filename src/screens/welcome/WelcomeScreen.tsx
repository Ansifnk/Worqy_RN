import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  // TouchableOpacity,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigations/AppNav';
import { colors } from '../../utils/colors';
import { ArrowUpRight } from 'lucide-react-native';
import {
  WorkspaceDeskIcon,
  BriefcaseIcon,
  CommunityIcon,
  CoffeeIcon,
  LocationPinIcon,
  CalendarBookingIcon,
  SparkleIcon,
} from './components/WelcomeIcons';
import Button from '../../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Responsive scale factor based on standard 390px iPhone width
const SCALE = Math.min(Math.max(SCREEN_WIDTH / 390, 0.85), 1.15);

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const handleGetStarted = () => {
    // navigation.navigate('Signup'); // Commented out for now (No separate signup, login handles both)
    navigation.navigate('Login');
  };

  /*
  const handleSignIn = () => {
    navigation.navigate('Login');
  };
  */

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Subtle ambient decorative gradient circles for background depth */}
      <View style={styles.ambientTopGlow} pointerEvents="none" />
      <View style={styles.ambientBottomGlow} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingTop: Math.max(insets.top, 14),
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <Text style={styles.brandPrimary}>
            Worqy <Text style={styles.brandAccent}>Spaces</Text>
          </Text>
        </View>

        {/* Floating Themed Icons Bubble Cluster */}
        <View style={styles.bubblesArea}>
          {/* Top-Right Bubble - Community / Team */}
          <View style={[styles.bubble, styles.bubbleTopRight]}>
            <CommunityIcon color={colors.primary} />
          </View>

          {/* Top-Left Bubble - Briefcase / Work */}
          <View style={[styles.bubble, styles.bubbleTopLeft]}>
            <BriefcaseIcon color={colors.white} />
          </View>

          {/* Top-Center Small Bubble - Coffee / Amenities */}
          <View style={[styles.bubble, styles.bubbleTopCenter]}>
            <CoffeeIcon color={colors.text} />
          </View>

          {/* Middle-Left Bubble - Location / Spaces */}
          <View style={[styles.bubble, styles.bubbleMidLeft]}>
            <LocationPinIcon color={colors.primary} />
          </View>

          {/* Middle-Right Bubble - Calendar / Booking */}
          <View style={[styles.bubble, styles.bubbleMidRight]}>
            <CalendarBookingIcon color={colors.white} />
          </View>

          {/* Hero Center Bubble - Workspace / Modern Desk */}
          <View style={[styles.bubble, styles.bubbleCenterHero]}>
            <WorkspaceDeskIcon color={colors.white} />
          </View>

          {/* Bottom-Right Bubble - Sparkle / Verified Quality */}
          <View style={[styles.bubble, styles.bubbleBottomRight]}>
            <SparkleIcon color={colors.primary} />
          </View>
        </View>

        {/* Bottom Content Area */}
        <View style={styles.contentArea}>
          {/* Main Headline with Highlighted Two-Tone Emphasis */}
          <View style={styles.headingBlock}>
            <Text style={styles.titleLine}>
              Find Your <Text style={styles.highlightText}>First</Text>
            </Text>
            <Text style={styles.titleLine}>
              <Text style={styles.highlightText}>Perfect</Text> Workspace
            </Text>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Join us and connect with top-rated workspaces designed for your workflow
          </Text>

          {/* CTA Actions */}
          <View style={styles.actionsContainer}>
            {/* Get Started Pill Button with Left Arrow Badge */}
            <Button
              style={styles.getStartedButton}
              onPress={handleGetStarted}
              activeOpacity={0.88}
            >
              <View style={styles.arrowBadge}>
                <ArrowUpRight size={22} color={colors.primary} strokeWidth={2.6} />
              </View>
              <Text style={styles.getStartedText}>Get Started</Text>
            </Button>


          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  // Ambient background glows
  ambientTopGlow: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.highlight,
    opacity: 0.5,
  },
  ambientBottomGlow: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.surfaceSecondary,
    opacity: 0.45,
  },

  // Brand Header
  header: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 4,
    zIndex: 20,
  },
  brandPrimary: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  brandAccent: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 22,
  },

  // Floating Bubbles Area
  bubblesArea: {
    width: '100%',
    height: Math.round(350 * SCALE),
    position: 'relative',
    marginVertical: 4,
  },
  bubble: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 1. Center Hero Bubble (Workspace Desk)
  bubbleCenterHero: {
    width: Math.round(154 * SCALE),
    height: Math.round(154 * SCALE),
    borderRadius: Math.round(77 * SCALE),
    backgroundColor: colors.primary,
    top: Math.round(136 * SCALE),
    left: Math.round((SCREEN_WIDTH - 40 - 154 * SCALE) / 2),
    zIndex: 10,
  },

  // 2. Top-Left Bubble (Briefcase)
  bubbleTopLeft: {
    width: Math.round(112 * SCALE),
    height: Math.round(112 * SCALE),
    borderRadius: Math.round(56 * SCALE),
    backgroundColor: colors.secondary,
    top: Math.round(22 * SCALE),
    left: Math.round(12 * SCALE),
    zIndex: 4,
  },

  // 3. Top-Right Bubble (Community)
  bubbleTopRight: {
    width: Math.round(122 * SCALE),
    height: Math.round(122 * SCALE),
    borderRadius: Math.round(61 * SCALE),
    backgroundColor: colors.surfaceSecondary,
    top: Math.round(6 * SCALE),
    right: Math.round(10 * SCALE),
    zIndex: 5,
  },

  // 4. Top-Center Bubble (Coffee)
  bubbleTopCenter: {
    width: Math.round(64 * SCALE),
    height: Math.round(64 * SCALE),
    borderRadius: Math.round(32 * SCALE),
    backgroundColor: colors.accent,
    top: Math.round(82 * SCALE),
    left: Math.round((SCREEN_WIDTH - 40) / 2 - 2 * SCALE),
    zIndex: 6,
  },

  // 5. Middle-Left Bubble (Location Pin)
  bubbleMidLeft: {
    width: Math.round(96 * SCALE),
    height: Math.round(96 * SCALE),
    borderRadius: Math.round(48 * SCALE),
    backgroundColor: colors.highlight,
    top: Math.round(152 * SCALE),
    left: Math.round(-18 * SCALE),
    zIndex: 7,
  },

  // 6. Middle-Right Bubble (Calendar Booking)
  bubbleMidRight: {
    width: Math.round(114 * SCALE),
    height: Math.round(114 * SCALE),
    borderRadius: Math.round(57 * SCALE),
    backgroundColor: colors.primary,
    top: Math.round(98 * SCALE),
    right: Math.round(-18 * SCALE),
    zIndex: 7,
  },

  // 7. Bottom-Right Bubble (Sparkle / Star)
  bubbleBottomRight: {
    width: Math.round(86 * SCALE),
    height: Math.round(86 * SCALE),
    borderRadius: Math.round(43 * SCALE),
    backgroundColor: colors.surface,
    top: Math.round(230 * SCALE),
    right: Math.round(18 * SCALE),
    zIndex: 8,
  },

  // Content Area
  contentArea: {
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 8,
  },
  headingBlock: {
    alignItems: 'center',
    marginBottom: 12,
  },
  titleLine: {
    fontSize: Math.round(30 * Math.min(SCALE, 1)),
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: Math.round(38 * Math.min(SCALE, 1)),
    letterSpacing: -0.5,
  },
  highlightText: {
    color: colors.primary,
  },
  subtitle: {
    fontSize: 14.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 20,
    marginBottom: 26,
  },

  // Actions
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30
  },
  getStartedButton: {
    width: '100%',
    maxWidth: 360,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  arrowBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginTop: -1,
    marginLeft: 1,
  },
  getStartedText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16.5,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.2,
    marginRight: 44, // Perfectly balances the left badge so text is centered in button
  },

  // Footer Link
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 4,
  },
  footerPrompt: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
