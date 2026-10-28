import React from 'react';
import { Text, StyleSheet, Platform, TextStyle, StyleProp } from 'react-native';
import { colors } from '../../../utils/colors';

interface ChatMarkdownTextProps {
  content: string;
  style?: StyleProp<TextStyle>;
  isUser?: boolean;
}

const TOKEN_PATTERN = /(\*\*\*[\s\S]+?\*\*\*|\*\*[\s\S]+?\*\*|__[\s\S]+?__|\*[^\s*][^*]*?\*|_[^\s_][^_]*?_|`[^`]+`)/g;

/**
 * Parses and renders basic markdown styles (bold, italic, inline code, bullets, headings)
 * within React Native Text elements while preserving full font inheritance and inline wrapping.
 */
export const ChatMarkdownText: React.FC<ChatMarkdownTextProps> = ({
  content,
  style,
  isUser = false,
}) => {
  if (!content) return null;

  // Convert leading bullet markers (- or *) to clean bullet points (•)
  const normalized = content.replace(/^(\s*)[-*]\s+/gm, '$1• ');
  const lines = normalized.split('\n');

  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) {
      elements.push('\n');
    }

    const isHeading = /^#{1,4}\s+/.test(line);
    const cleanLine = isHeading ? line.replace(/^#{1,4}\s+/, '') : line;
    const parts = cleanLine.split(TOKEN_PATTERN);

    const lineElements = parts.map((part, partIdx) => {
      if (!part) return null;

      const key = `${lineIdx}-${partIdx}`;

      // Bold + Italic: ***text***
      if (part.startsWith('***') && part.endsWith('***') && part.length >= 6) {
        return (
          <Text
            key={key}
            style={[styles.boldItalic, isUser && styles.userBold]}
          >
            {part.slice(3, -3)}
          </Text>
        );
      }

      // Bold: **text** or __text__
      if (
        ((part.startsWith('**') && part.endsWith('**')) ||
          (part.startsWith('__') && part.endsWith('__'))) &&
        part.length >= 4
      ) {
        return (
          <Text
            key={key}
            style={[styles.bold, isUser && styles.userBold]}
          >
            {part.slice(2, -2)}
          </Text>
        );
      }

      // Italic: *text* or _text_
      if (
        ((part.startsWith('*') && part.endsWith('*')) ||
          (part.startsWith('_') && part.endsWith('_'))) &&
        part.length >= 2
      ) {
        return (
          <Text key={key} style={styles.italic}>
            {part.slice(1, -1)}
          </Text>
        );
      }

      // Inline code: `text`
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <Text
            key={key}
            style={[styles.code, isUser && styles.userCode]}
          >
            {part.slice(1, -1)}
          </Text>
        );
      }

      return part;
    });

    if (isHeading) {
      elements.push(
        <Text
          key={`heading-${lineIdx}`}
          style={[styles.heading, isUser && styles.userBold]}
        >
          {lineElements}
        </Text>,
      );
    } else {
      elements.push(...lineElements);
    }
  });

  return <Text style={style}>{elements}</Text>;
};

const styles = StyleSheet.create({
  bold: {
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
  boldItalic: {
    fontWeight: '700',
    fontStyle: 'italic',
  },
  heading: {
    fontWeight: '700',
    fontSize: 16,
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13.5,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  userBold: {
    fontWeight: '700',
    color: colors.white,
  },
  userCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 4,
    borderRadius: 4,
    color: colors.white,
  },
});

export default ChatMarkdownText;
