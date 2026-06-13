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

const WEATHER_URL = 'https://vercel.bhenning.com/api/weather';

// OkHttp strips User-Agent set from JS. Instead we send this sentinel header;
// UserAgentInterceptor.kt swaps it for the real PhantomJS UA at the native layer.
const SPOOF_UA_SENTINEL = 'X-RN-Spoof-UA';

function makeAbortSignal(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

export async function fetchWeather(spoofUserAgent = false): Promise<Record<string, unknown>> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (spoofUserAgent) {
    headers[SPOOF_UA_SENTINEL] = '1';
  }

  const response = await fetch(WEATHER_URL, {headers, signal: makeAbortSignal(30_000)});

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

export async function fetchUrl(
  url: string,
  spoofUserAgent = false,
): Promise<Record<string, unknown>> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (spoofUserAgent) {
    headers[SPOOF_UA_SENTINEL] = '1';
  }

  const response = await fetch(url, {headers, signal: makeAbortSignal(30_000)});

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const text = await response.text();
  try {
    const parsed = JSON.parse(text) as unknown;
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
