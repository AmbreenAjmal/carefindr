import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import LogoIcon from './LogoIcon';
import { useAuth } from '../context/AuthContext';
import { getUserSessions, setAuthToken } from '../api/client';

export default function DrawerContent({ visible, onSelectSession, onNewChat }) {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (visible) fetchSessions();
  }, [visible]);

  const fetchSessions = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await getUserSessions();
      setSessions(res.data.sessions);
    } catch (err) {
      console.error('Failed to fetch sessions:', err?.response?.data || err?.message);
      setFetchError('Could not load conversations.');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    logout();
  };

  return (
    <View style={styles.container}>
      {/* Logo + Brand */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <LogoIcon size={20} onDark={true} />
          </View>
          <Text style={styles.brandName}>Care<Text style={styles.brandAccent}>Findr</Text></Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* New Chat */}
      <TouchableOpacity style={styles.newChatBtn} onPress={onNewChat} activeOpacity={0.85}>
        <Text style={styles.newChatText}>+ New Chat</Text>
      </TouchableOpacity>

      {/* Chat history */}
      <Text style={styles.sectionLabel}>Past conversations</Text>
      <ScrollView style={styles.sessionList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.teal} style={{ marginTop: 16 }} />
        ) : fetchError ? (
          <Text style={styles.empty}>{fetchError}</Text>
        ) : sessions.length === 0 ? (
          <Text style={styles.empty}>No conversations yet</Text>
        ) : (
          sessions.map((s) => (
            <TouchableOpacity
              key={s.session_id}
              style={styles.sessionItem}
              onPress={() => onSelectSession(s.session_id)}
              activeOpacity={0.7}
            >
              <Text style={styles.sessionTitle} numberOfLines={1}>{s.title}</Text>
              <Text style={styles.sessionDate}>{s.created_at}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    backgroundColor: colors.navy,
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  logoBox: {
    width: 30, height: 30, backgroundColor: colors.teal,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  brandName: { fontSize: 16, fontWeight: '500', color: colors.white },
  brandAccent: { color: colors.teal },
  userName: { fontSize: 16, fontWeight: '600', color: colors.white, marginBottom: 2 },
  userEmail: { fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  newChatBtn: {
    margin: 16,
    backgroundColor: colors.teal,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  newChatText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sessionList: { flex: 1, paddingHorizontal: 12 },
  sessionItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  sessionTitle: { fontSize: 13, color: colors.navy, fontWeight: '500', marginBottom: 2 },
  sessionDate: { fontSize: 11, color: colors.textSecondary },
  empty: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 20 },
  logoutBtn: {
    margin: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: { fontSize: 14, color: colors.navy, fontWeight: '500' },
});
