import {Platform} from 'react-native';
import type {HumanFetchResult as NativeHumanFetchResult} from './humanSecurity.native';

export type HumanFetchResult = NativeHumanFetchResult;

const impl =
  Platform.OS === 'web'
    ? require('./humanSecurity.web')
    : require('./humanSecurity.native');

export const ensureHumanSdkStarted: () => Promise<void> = impl.ensureHumanSdkStarted;
export const fetchWithHumanChallenge: (
  url: string,
  extraHeaders?: Record<string, string>,
  signal?: AbortSignal,
) => Promise<HumanFetchResult> = impl.fetchWithHumanChallenge;
