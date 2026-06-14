export async function ensureHumanSdkStarted(): Promise<void> {}

export interface HumanFetchResult {
  status: number;
  ok: boolean;
  bodyText: string;
  challengeHandled: boolean;
  challengeResult?: number;
}

export async function fetchWithHumanChallenge(
  url: string,
  extraHeaders: Record<string, string> = {},
  signal?: AbortSignal,
): Promise<HumanFetchResult> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...extraHeaders,
    },
    signal,
  });
  const bodyText = await response.text();

  return {
    status: response.status,
    ok: response.ok,
    bodyText,
    challengeHandled: false,
  };
}
