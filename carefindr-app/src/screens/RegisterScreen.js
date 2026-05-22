import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import LogoIcon from '../components/LogoIcon';
import { register, setAuthToken } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await register(name.trim(), email.trim(), password);
      const data = res.data;
      setAuthToken(data.token);
      login(data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail[0]?.msg || 'Registration failed. Please try again.');
      } else {
        setError(detail || 'Registration failed. Please try again.');
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

          {/* Title */}
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Sign up to find doctors near you</Text>

          {/* Full name */}
          <Text style={styles.label}>Full name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ambreen Ajmal"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

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
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Submit */}
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.buttonText}>Create account</Text>}
          </TouchableOpacity>

          {/* Sign in link */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Sign in</Text>
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
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32 },
  logoBox: {
    width: 32, height: 32, backgroundColor: colors.teal,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  brandName: { fontSize: 18, fontWeight: '500', color: colors.navy },
  brandAccent: { color: colors.teal },
  title: { fontSize: 28, fontWeight: '600', color: colors.navy, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 28 },
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
