import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sparkles, FileText, CheckSquare, Users, HelpCircle } from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface EmptyChatWelcomeProps {
  userName?: string;
}

export const EmptyChatWelcome: React.FC<EmptyChatWelcomeProps> = ({
  userName = 'there',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.greetingTitle}>Hi {userName} 👋</Text>
        <Text style={styles.greetingSubtitle}>
          I'm your Wyzo AI Assistant. Ask me anything about your tasks, clients,
          invoices, and productivity.
        </Text>
      </View>

    </View>
  );
};

export default EmptyChatWelcome;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  heroCard: {
    alignItems: 'center',
    padding: 24,
    width: '100%',
    marginBottom: 24,
  },

  greetingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  suggestionsHeader: {
    alignSelf: 'flex-start',
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  chipsContainer: {
    width: '100%',
    gap: 10,
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
