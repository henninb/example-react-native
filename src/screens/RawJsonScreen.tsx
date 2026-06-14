import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {fetchPublicIp, fetchUrl, WEATHER_ALPHA_HOST, WEATHER_HOST} from '../services/weatherService';
import {PX_APP_ID} from '../config/appId';

const COLORS = {
  bg: '#0F1923',
  card: '#1A2A3A',
  border: '#2A3A4A',
  accent: '#4FC3F7',
  text: '#E8EDF2',
  muted: '#8899AA',
  error: '#EF5350',
  checkBg: '#0F1923',
  hint: '#556677',
  code: '#CCDDEE',
};

interface Endpoint {
  id: string;
  label: string;
  url: string;
  description: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    id: 'weather',
    label: 'Weather (demo)',
    url: `https://${WEATHER_HOST}/api/weather`,
    description: 'Station observation JSON from bhenning.com.',
  },
  {
    id: 'sample',
    label: 'Sample post (JSONPlaceholder)',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    description: 'Stable fake REST API — no key required.',
  },
];

interface Props {
  onBack: () => void;
}

export default function RawJsonScreen({onBack}: Props) {
  const [selected, setSelected] = useState<Endpoint>(ENDPOINTS[0]!);
  const [customUrl, setCustomUrl] = useState('');
  const [spoofUa, setSpoofUa] = useState(false);
  const [useAlphaHost, setUseAlphaHost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [publicIp, setPublicIp] = useState<string | null>(null);
  const [ipLoading, setIpLoading] = useState(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  const loadPublicIp = async () => {
    setIpLoading(true);
    try {
      const ip = await fetchPublicIp();
      setPublicIp(ip);
    } catch {
      setPublicIp('—');
    } finally {
      setIpLoading(false);
    }
  };

  const runFetch = async () => {
    const raw = customUrl.trim() || selected.url;
    const target = useAlphaHost
      ? raw.replace(WEATHER_HOST, WEATHER_ALPHA_HOST)
      : raw;
    if (customUrl.trim()) {
      try {
        new URL(customUrl.trim());
      } catch {
        setFetchError('Enter a valid https:// URL');
        return;
      }
    }
    setLoading(true);
    setFetchError(null);
    setResult(null);
    try {
      const data = await fetchUrl(target, spoofUa);
      setResult(JSON.stringify(data, null, 2));
      await loadPublicIp();
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Raw API</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>App ID</Text>
          <Text style={styles.infoValue}>{PX_APP_ID}</Text>
        </View>

        <View style={[styles.infoCard, {marginTop: 12}]}>
          <Text style={styles.infoLabel}>Public IP (ipify)</Text>
          <Text style={styles.infoValue}>
            {ipLoading ? '…' : publicIp ?? '—'}
          </Text>
          {publicIp && (
            <Text style={styles.infoCaption}>
              From api.ipify.org — may differ from server-reported IP on cellular/CGNAT.
            </Text>
          )}
        </View>

        <Text style={styles.helpText}>
          Select a preset endpoint or enter a custom URL, then tap GET to fetch JSON.
        </Text>

        <Text style={styles.fieldLabel}>Preset</Text>
        <View style={styles.pickerCard}>
          {ENDPOINTS.map(ep => (
            <Pressable
              key={ep.id}
              style={[styles.pickerOption, selected.id === ep.id && styles.pickerOptionSelected]}
              onPress={() => setSelected(ep)}>
              <View style={styles.pickerRadio}>
                {selected.id === ep.id && <View style={styles.pickerRadioDot} />}
              </View>
              <Text style={styles.pickerOptionText}>{ep.label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.endpointDesc}>{selected.description}</Text>

        <Text style={styles.fieldLabel}>Custom URL (optional, overrides preset)</Text>
        <TextInput
          style={styles.urlInput}
          value={customUrl}
          onChangeText={setCustomUrl}
          placeholder="https://your-api.com/…"
          placeholderTextColor={COLORS.hint}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.toggleRow}>
          <Switch
            value={spoofUa}
            onValueChange={setSpoofUa}
            trackColor={{false: COLORS.border, true: COLORS.accent}}
            thumbColor={COLORS.text}
          />
          <Text style={styles.toggleLabel}>UA: PhantomJS/react-native/brian (test)</Text>
        </View>

        <View style={styles.toggleRow}>
          <Switch
            value={useAlphaHost}
            onValueChange={setUseAlphaHost}
            trackColor={{false: COLORS.border, true: COLORS.accent}}
            thumbColor={COLORS.text}
          />
          <Text style={styles.toggleLabel}>Override: {WEATHER_ALPHA_HOST}</Text>
        </View>

        <TouchableOpacity style={styles.fetchButton} onPress={runFetch} disabled={loading}>
          <Text style={styles.fetchButtonText}>
            {loading ? 'Fetching…' : '⬇  GET JSON'}
          </Text>
        </TouchableOpacity>

        {fetchError && <Text style={styles.errorText}>{fetchError}</Text>}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={COLORS.accent} size="large" />
          </View>
        )}

        {result && !loading && (
          <View style={styles.resultCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <Text style={styles.resultText}>{result}</Text>
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  backIcon: {
    fontSize: 32,
    color: COLORS.text,
    fontWeight: '600',
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  scroll: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  infoCaption: {
    fontSize: 11,
    color: COLORS.muted,
    lineHeight: 15,
    marginTop: 4,
  },
  helpText: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 6,
    fontWeight: '500',
  },
  pickerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 6,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(79,195,247,0.08)',
  },
  pickerRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.muted,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  pickerOptionText: {
    fontSize: 14,
    color: COLORS.text,
  },
  endpointDesc: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 16,
  },
  urlInput: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    fontSize: 13,
    color: COLORS.text,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    color: '#CCDDEE',
    fontFamily: 'monospace',
    flex: 1,
  },
  toggleCaption: {
    fontSize: 11,
    fontFamily: 'System',
    color: '#8899AA',
  },
  fetchButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  fetchButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.bg,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 12,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginTop: 8,
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.code,
    lineHeight: 18,
  },
});
