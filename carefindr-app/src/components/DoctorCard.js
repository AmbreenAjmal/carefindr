import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

function getInitials(name) {
  return name
    .replace('Dr.', '')
    .trim()
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

export default function DoctorCard({ doctor }) {
  const openMaps = () => {
    const query = encodeURIComponent(`${doctor.name} ${doctor.clinic} ${doctor.address}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const callDoctor = () => {
    if (doctor.phone) Linking.openURL(`tel:${doctor.phone}`);
  };

  return (
    <View style={styles.card}>
      {/* Navy header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(doctor.name)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{doctor.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{doctor.designation}</Text>
          </View>
        </View>
      </View>

      {/* White body */}
      <View style={styles.body}>
        {doctor.clinic ? (
          <View style={styles.detailRow}>
            <Ionicons name="business-outline" size={14} color={colors.textSecondary} style={styles.icon} />
            <Text style={styles.detailText}>{doctor.clinic}</Text>
          </View>
        ) : null}

        {doctor.address ? (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} style={styles.icon} />
            <Text style={styles.detailText}>{doctor.address}</Text>
          </View>
        ) : null}

        {doctor.timings ? (
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} style={styles.icon} />
            <Text style={styles.detailText}>{doctor.timings}</Text>
          </View>
        ) : null}

        {doctor.phone ? (
          <TouchableOpacity style={styles.detailRow} onPress={callDoctor}>
            <Ionicons name="call-outline" size={14} color={colors.teal} style={styles.icon} />
            <Text style={[styles.detailText, styles.phoneText]}>{doctor.phone}</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.mapsBtn} onPress={openMaps} activeOpacity={0.8}>
          <Ionicons name="navigate-outline" size={15} color={colors.white} />
          <Text style={styles.mapsBtnText}>Find on Google Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  header: {
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerInfo: { flex: 1 },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 7,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(20,184,166,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.45)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.teal,
  },
  body: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 9,
  },
  icon: {
    marginRight: 10,
    marginTop: 1,
    width: 16,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 19,
  },
  phoneText: {
    color: colors.teal,
    fontWeight: '500',
  },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    marginTop: 6,
    backgroundColor: colors.teal,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  mapsBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
