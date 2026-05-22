import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { colors } from '../theme/colors';
import LogoIcon from '../components/LogoIcon';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoBox}>
          <View style={styles.logoIcon}>
            <LogoIcon size={48} onDark={true} />
          </View>
        </View>

        {/* Wordmark */}
        <Text style={styles.appName}>
          Care<Text style={styles.appNameAccent}>Findr</Text>
        </Text>
        <Text style={styles.tagline}>Find care. Feel better.</Text>

        {/* Description */}
        <Text style={styles.description}>
          Describe your symptoms and let AI help you find the right doctor near you in Pakistan.
        </Text>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Not a substitute for professional medical advice.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoBox: {
    marginBottom: 24,
  },
  logoIcon: {
    width: 80,
    height: 80,
    backgroundColor: colors.teal,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 40,
    fontWeight: '500',
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  appNameAccent: {
    color: colors.teal,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 40,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  button: {
    backgroundColor: colors.teal,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 24,
  },
  buttonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
  },
});
