import HumanSecurity, {
  HSBotDefenderChallengeResult,
} from '@humansecurity/react-native-sdk';
import {PX_APP_ID} from '../config/appId';

let started = false;

const WEB_ROOT_DOMAINS = {
  [PX_APP_ID]: ['vercel.bhenning.com', 'bookkeeper.bhenning.com'],
};

export async function ensureHumanSdkStarted(): Promise<void> {
  if (started) {
    return;
  }

  await HumanSecurity.startWithAppId(PX_APP_ID, {
    hybridAppPolicy: {
      webRootDomains: WEB_ROOT_DOMAINS,
    },
  });
  started = true;
}

export interface HumanFetchResult {
  status: number;
  ok: boolean;
  bodyText: string;
  challengeHandled: boolean;
  challengeResult?: HSBotDefenderChallengeResult;
}

export async function fetchWithHumanChallenge(
  url: string,
  extraHeaders: Record<string, string> = {},
  signal?: AbortSignal,
): Promise<HumanFetchResult> {
  await ensureHumanSdkStarted();

  const request = async (): Promise<HumanFetchResult> => {
    const pxHeaders = await HumanSecurity.BD.headersForURLRequest(PX_APP_ID);
    await HumanSecurity.AD.registerOutgoingUrlRequest(url, PX_APP_ID).catch(() => {});

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...pxHeaders,
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
  };

  let result = await request();

  if (HumanSecurity.BD.canHandleResponse(result.bodyText)) {
    const challengeResult = await HumanSecurity.BD.handleResponse(result.bodyText);
    if (challengeResult === HSBotDefenderChallengeResult.SOLVED) {
      result = await request();
      return {...result, challengeHandled: true, challengeResult};
    }
    return {...result, challengeHandled: true, challengeResult};
  }

  return result;
}
