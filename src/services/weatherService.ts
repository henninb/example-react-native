import {fetchWithHumanChallenge} from './humanSecurity';

export interface Observation {
  temp?: number;
  windChill?: number;
  pressure?: number;
  humidity?: number;
  windSpeed?: number;
  precipitation?: number;
  weatherCode: number;
  obsTimeLocal?: string;
}

export const WEATHER_HOST = 'vercel.bhenning.com';
export const WEATHER_ALPHA_HOST = 'nextjs-website-alpha-weld.vercel.app';

export interface WeatherFetchResult {
  status: number;
  ok: boolean;
  url: string;
  contentType: string | null;
  bodyText: string;
  data: Record<string, unknown> | null;
  parseError: string | null;
}

function weatherUrl(useAlphaHost = false): string {
  const host = useAlphaHost ? WEATHER_ALPHA_HOST : WEATHER_HOST;
  return `https://${host}/api/weather`;
}

// OkHttp strips User-Agent set from JS. Instead we send this sentinel header;
// UserAgentInterceptor.kt swaps it for the real PhantomJS UA at the native layer.
const SPOOF_UA_SENTINEL = 'X-RN-Spoof-UA';

function makeAbortSignal(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

export async function fetchWeather(
  spoofUserAgent = false,
  useAlphaHost = false,
): Promise<WeatherFetchResult> {
  const headers: Record<string, string> = {};
  if (spoofUserAgent) {
    headers[SPOOF_UA_SENTINEL] = '1';
  }

  const url = weatherUrl(useAlphaHost);
  const fetched = await fetchWithHumanChallenge(url, headers, makeAbortSignal(30_000));

  let data: Record<string, unknown> | null = null;
  let parseError: string | null = null;

  try {
    const parsed = JSON.parse(fetched.bodyText) as unknown;
    if (Array.isArray(parsed)) {
      data = {_list: parsed};
    } else if (typeof parsed === 'object' && parsed !== null) {
      data = parsed as Record<string, unknown>;
    } else {
      data = {_value: parsed};
    }
  } catch {
    parseError = 'Response is not valid JSON';
  }

  return {
    status: fetched.status,
    ok: fetched.ok,
    url,
    contentType: 'application/json',
    bodyText: fetched.bodyText,
    data,
    parseError,
  };
}

export async function fetchUrl(
  url: string,
  spoofUserAgent = false,
): Promise<Record<string, unknown>> {
  const headers: Record<string, string> = {};
  if (spoofUserAgent) {
    headers[SPOOF_UA_SENTINEL] = '1';
  }

  const fetched = await fetchWithHumanChallenge(url, headers, makeAbortSignal(30_000));

  if (!fetched.ok) {
    throw new Error(`HTTP ${fetched.status}`);
  }

  try {
    const parsed = JSON.parse(fetched.bodyText) as unknown;
    if (Array.isArray(parsed)) {
      return {_list: parsed};
    }
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, unknown>;
    }
    return {_value: parsed};
  } catch {
    throw new Error('Response is not valid JSON');
  }
}

export async function fetchPublicIp(): Promise<string> {
  const response = await fetch('https://api.ipify.org?format=json', {
    signal: makeAbortSignal(10_000),
  });
  if (!response.ok) {
    throw new Error(`IP lookup HTTP ${response.status}`);
  }
  const data = (await response.json()) as {ip?: string};
  if (!data.ip) {
    throw new Error('IP lookup returned empty response');
  }
  return data.ip;
}

export function formatWeatherPayload(result: WeatherFetchResult): string {
  if (result.data) {
    return JSON.stringify(result.data, null, 2);
  }
  return result.bodyText;
}

export function parseObservation(data: Record<string, unknown>): Observation | null {
  const observations = data.observations as Array<Record<string, unknown>> | undefined;
  if (!observations || observations.length === 0) {
    return null;
  }
  const obs = observations[0]!;
  const imperial = (obs.imperial as Record<string, unknown>) ?? {};
  return {
    temp: imperial.temp as number | undefined,
    windChill: imperial.windChill as number | undefined,
    pressure: imperial.pressure as number | undefined,
    humidity: obs.humidity as number | undefined,
    windSpeed: obs.windSpeed as number | undefined,
    precipitation: obs.precipitation as number | undefined,
    weatherCode: (obs.weatherCode as number) ?? 0,
    obsTimeLocal: obs.obsTimeLocal as string | undefined,
  };
}
