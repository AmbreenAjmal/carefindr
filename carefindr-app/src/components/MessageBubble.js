import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import DoctorCard from './DoctorCard';

function parseDoctors(content) {
  // AI sometimes prefixes JSON with an intro sentence — find the JSON block
  const jsonStart = content.indexOf('{');
  if (jsonStart === -1) return null;
  try {
    const parsed = JSON.parse(content.slice(jsonStart));
    if (parsed.type === 'doctors' && Array.isArray(parsed.items)) {
      return { doctors: parsed.items, intro: content.slice(0, jsonStart).trim() };
    }
  } catch (_) {}
  return null;
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  if (!isUser) {
    const result = parseDoctors(message.content);
    if (result) {
      const { doctors, intro } = result;
      return (
        <View style={styles.doctorWrapper}>
          <Text style={styles.botLabel}>CareFindr AI</Text>
          <Text style={styles.doctorIntro}>{intro || 'Here are some doctors I found for you:'}</Text>
          {doctors.map((doc, i) => <DoctorCard key={i} doctor={doc} />)}
          <Text style={styles.disclaimer}>Tip: Call ahead to confirm availability before visiting.</Text>
        </View>
      );
    }
  }

  return (
    <View style={[styles.wrapper, isUser ? styles.wrapperUser : styles.wrapperBot]}>
      {!isUser && (
        <Text style={styles.botLabel}>CareFindr AI</Text>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
        <Text style={[styles.text, isUser ? styles.textUser : styles.textBot]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  wrapperBot: {
    alignSelf: 'flex-start',
    marginLeft: 12,
  },
  wrapperUser: {
    alignSelf: 'flex-end',
    marginRight: 12,
  },
  doctorWrapper: {
    alignSelf: 'stretch',
    marginVertical: 4,
    marginLeft: 12,
  },
  botLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.teal,
    marginBottom: 3,
    marginLeft: 4,
  },
  doctorIntro: {
    fontSize: 13,
    color: colors.textPrimary,
    marginLeft: 4,
    marginBottom: 6,
  },
  disclaimer: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 16,
    marginTop: 6,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleBot: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  bubbleUser: {
    backgroundColor: colors.navy,
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  textBot: {
    color: colors.textPrimary,
  },
  textUser: {
    color: colors.white,
  },
});
