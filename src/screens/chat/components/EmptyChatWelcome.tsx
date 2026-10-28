import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sparkles, FileText, CheckSquare, Users, HelpCircle } from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface EmptyChatWelcomeProps {
  onSelectPrompt: (prompt: string) => void;
  userName?: string;
}

const PROMPT_SUGGESTIONS = [
  {
    icon: FileText,
    title: 'Draft an invoice',
    subtitle: 'Generate a new invoice for a client',
    prompt: 'Help me draft an invoice for a client',
  },
  {
    icon: CheckSquare,
    title: 'Summarize pending tasks',
    subtitle: 'Review high priority to-dos',
    prompt: 'Can you summarize my high priority tasks?',
  },
  {
    icon: Users,
    title: 'Client management tips',
    subtitle: 'Best practices for organizing clients',
    prompt: 'How should I categorize my new clients?',
  },
  {
    icon: HelpCircle,
    title: 'What can Wyzo AI do?',
    subtitle: 'Learn about features and capabilities',
    prompt: 'What can you help me with in Wyzo?',
  },
];

export const EmptyChatWelcome: React.FC<EmptyChatWelcomeProps> = ({
  onSelectPrompt,
  userName = 'there',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.iconCircle}>
          <Sparkles size={28} color={colors.primary} />
        </View>

        <Text style={styles.greetingTitle}>Hi {userName} 👋</Text>
        <Text style={styles.greetingSubtitle}>
          I'm your Wyzo AI Assistant. Ask me anything about your tasks, clients,
          invoices, and productivity.
        </Text>
      </View>

      <Text style={styles.suggestionsHeader}>Quick Suggestions</Text>

      <View style={styles.chipsContainer}>
        {PROMPT_SUGGESTIONS.map((item, index) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={index}
              style={styles.promptCard}
              activeOpacity={0.7}
              onPress={() => onSelectPrompt(item.prompt)}
            >
              <View style={styles.cardIconBox}>
                <Icon size={18} color={colors.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
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
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 24,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.highlight,
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
