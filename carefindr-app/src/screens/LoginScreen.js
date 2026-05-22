import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import LogoIcon from '../components/LogoIcon';
import { loginApi, setAuthToken } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await loginApi(email.trim(), password);
      const data = res.data;
      setAuthToken(data.token);
      login(data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail[0]?.msg || 'Login failed. Please try again.');
      } else {
        setError(detail || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <LogoIcon size={20} onDark={true} />
            </View>
            <Text style={styles.brandName}>Care<Text style={styles.brandAccent}>Findr</Text></Text>
          </View>

          {/* Welcome card */}
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeEmoji}>Welcome back</Text>
            <Text style={styles.welcomeTitle}>Sign in to CareFindr</Text>
            <Text style={styles.welcomeTagline}>Find care. Feel better.</Text>
          </View>

          <Text style={styles.subtitle}>Sign in to continue</Text>

          {/* Email */}
          <Text style={styles.label}>Email address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Submit */}
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.buttonText}>Sign in</Text>}
          </TouchableOpacity>

          {/* Sign up link */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.iceBlue },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  logoBox: {
    width: 32, height: 32, backgroundColor: colors.teal,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  brandName: { fontSize: 18, fontWeight: '500', color: colors.navy },
  brandAccent: { color: colors.teal },
  welcomeCard: {
    backgroundColor: colors.navy, borderRadius: 14,
    padding: 20, marginBottom: 24,
  },
  welcomeEmoji: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  welcomeTitle: { fontSize: 22, fontWeight: '700', color: colors.white, marginBottom: 4 },
  welcomeTagline: { fontSize: 13, color: colors.teal },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '500', color: colors.navy, marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, paddingHorizontal: 12, marginBottom: 18,
    backgroundColor: colors.white,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 46, fontSize: 14, color: colors.navy },
  button: {
    backgroundColor: colors.navy, borderRadius: 10,
    height: 50, alignItems: 'center', justifyContent: 'center',
    marginTop: 4, marginBottom: 24,
  },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  bottomText: { fontSize: 13, color: colors.textSecondary },
  link: { fontSize: 13, color: colors.teal, fontWeight: '600' },
  errorText: {
    fontSize: 13,
    color: '#E53935',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
});
