import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {fetchWeather, parseObservation, type Observation} from '../services/weatherService';
import {getWmoInfo} from '../models/wmoCodes';

const COLORS = {
  bg: '#0F1923',
  card: '#1A2A3A',
  border: '#2A3A4A',
  accent: '#4FC3F7',
  text: '#E8EDF2',
  muted: '#8899AA',
  error: '#EF5350',
  checkBg: '#0F1923',
};

interface Props {
  onNavigateToRaw: () => void;
}

type LoadState = 'idle' | 'loading' | 'success' | 'error';

export default function HomeScreen({onNavigateToRaw}: Props) {
  const [spoofUserAgent, setSpoofUserAgent] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [observation, setObservation] = useState<Observation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (spoof: boolean) => {
    setLoadState('loading');
    setError(null);
    try {
      const data = await fetchWeather(spoof);
      const obs = parseObservation(data);
      setObservation(obs);
      setLoadState('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    load(spoofUserAgent);
  }, []);

  const handleToggleSpoof = () => {
    const next = !spoofUserAgent;
    setSpoofUserAgent(next);
    load(next);
  };

  const handleRefresh = () => load(spoofUserAgent);

  const wmoInfo = observation ? getWmoInfo(observation.weatherCode) : null;
  const timeDisplay =
    observation?.obsTimeLocal ? observation.obsTimeLocal.split('T')[1] ?? '' : '';

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.titleRow}>
          <Text style={styles.titleIcon}>🛡️</Text>
          <Text style={styles.title}>Weather</Text>
        </View>
        <View style={styles.domainRow}>
          <Text style={styles.domainCheck}>✓</Text>
          <Text style={styles.domainLabel}>nextjs-website-alpha-weld.vercel.app</Text>
        </View>
        <Text style={styles.subtitle}>
          Live station observation
        </Text>

        <View style={styles.toggleCard}>
          <Pressable style={styles.toggleRow} onPress={handleToggleSpoof}>
            <View style={[styles.checkbox, spoofUserAgent && styles.checkboxChecked]}>
              {spoofUserAgent && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.toggleLabel}>UA: PhantomJS/react-native/brian (test)</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>☁️</Text>
          <Text style={styles.sectionTitle}>Station Observation</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshIcon}>↻</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {loadState === 'loading' && (
            <View style={styles.centered}>
              <ActivityIndicator color={COLORS.accent} size="small" />
            </View>
          )}
          {loadState === 'error' && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          {loadState === 'success' && observation && wmoInfo && (
            <>
              <View style={styles.obsMain}>
                <Text style={[styles.weatherEmoji, {color: wmoInfo.dayColor}]}>
                  {wmoInfo.dayEmoji}
                </Text>
                <View style={styles.tempBlock}>
                  <Text style={styles.tempText}>
                    {observation.temp != null ? `${observation.temp}°F` : '--°F'}
                  </Text>
                  <Text style={styles.conditionText}>{wmoInfo.description}</Text>
                </View>
                {timeDisplay ? (
                  <Text style={styles.timeText}>{timeDisplay}</Text>
                ) : null}
              </View>

              <View style={styles.detailRow}>
                <DetailCell
                  label="Feels Like"
                  value={observation.windChill != null ? `${observation.windChill}°F` : '--'}
                />
                <DetailCell
                  label="Humidity"
                  value={observation.humidity != null ? `${observation.humidity}%` : '--'}
                />
                <DetailCell
                  label="Wind"
                  value={observation.windSpeed != null ? `${observation.windSpeed} mph` : '--'}
                />
              </View>
              <View style={styles.detailRow}>
                <DetailCell
                  label="Pressure"
                  value={observation.pressure != null ? `${observation.pressure} in` : '--'}
                />
                <DetailCell
                  label="Precip"
                  value={observation.precipitation != null ? `${observation.precipitation} in` : '--'}
                />
                <View style={styles.detailCell} />
              </View>
            </>
          )}
          {loadState === 'success' && !observation && (
            <Text style={styles.mutedText}>No observations available</Text>
          )}
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity style={styles.fab} onPress={onNavigateToRaw}>
          <Text style={styles.fabIcon}>⚙️</Text>
          <Text style={styles.fabLabel}>Raw API</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailCell({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.detailCell}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    padding: 20,
    paddingTop: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  domainCheck: {
    fontSize: 14,
    fontWeight: '700',
    color: '#22c55e',
    marginRight: 6,
  },
  domainLabel: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: COLORS.accent,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
    marginBottom: 20,
  },
  toggleCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.muted,
    backgroundColor: COLORS.checkBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  checkmark: {
    color: COLORS.checkBg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  toggleLabel: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#CCDDEE',
    flex: 1,
  },
  toggleCaption: {
    fontSize: 11,
    fontFamily: 'System',
    color: '#8899AA',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  refreshButton: {
    padding: 4,
  },
  refreshIcon: {
    fontSize: 20,
    color: COLORS.accent,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    minHeight: 80,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 13,
  },
  obsMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherEmoji: {
    fontSize: 36,
    marginRight: 12,
  },
  tempBlock: {
    flex: 1,
  },
  tempText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 32,
  },
  conditionText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailCell: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  spacer: {
    height: 24,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  fabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
});
