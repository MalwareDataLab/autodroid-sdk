import { createHash, randomBytes, randomInt } from 'node:crypto';

// Context import
import { getCliConfig, getWebUrl } from '../context';

// Authentication import
import { signInWithCustomToken } from './firebaseSession';
import { writeSession } from './sessionStore';

// UI import
import { openBrowser } from '../ui/openBrowser';

const POLL_INTERVAL_MILLISECONDS = 2000;
const POLL_TIMEOUT_MILLISECONDS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MILLISECONDS = 10000;

const USER_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTVWXYZ23456789';
const USER_CODE_LENGTH = 8;

interface IBrowserLoginParams {
  onAuthorizeUrl?: (url: string) => void;
  onUserCode?: (code: string) => void;
}

interface IBrowserLoginResult {
  expiresAt: number;
  authorizeUrl: string;
}

const createChallengePair = (): { verifier: string; challenge: string } => {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
};

const createUserCode = (): string =>
  Array.from({ length: USER_CODE_LENGTH }, () =>
    USER_CODE_ALPHABET.charAt(randomInt(USER_CODE_ALPHABET.length)),
  ).join('');

const getRestBaseUrl = (endpoint: string): string =>
  endpoint.replace(/\/graphql\/?$/, '');

const sleep = (milliseconds: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });

const fetchWithTimeout = async <T>(
  url: string,
  options: RequestInit,
  onResponse: (response: Response) => Promise<T>,
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MILLISECONDS,
  );

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return await onResponse(response);
  } finally {
    clearTimeout(timeoutId);
  }
};

const registerChallenge = async (params: {
  restBaseUrl: string;
  challenge: string;
  userCode: string;
}): Promise<void> => {
  const { restBaseUrl, challenge, userCode } = params;

  await fetchWithTimeout(
    `${restBaseUrl}/cli-auth/register`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code_challenge: challenge, user_code: userCode }),
    },
    async response => {
      if (!response.ok)
        throw new Error(
          `Failed to register the sign-in request with status ${response.status}.`,
        );
    },
  );
};

const pollForToken = async (params: {
  restBaseUrl: string;
  verifier: string;
  deadline: number;
}): Promise<string> => {
  const { restBaseUrl, verifier, deadline } = params;

  /* eslint-disable no-await-in-loop */
  while (Date.now() < deadline) {
    const token = await fetchWithTimeout(
      `${restBaseUrl}/cli-auth/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code_verifier: verifier }),
      },
      async response => {
        if (response.ok) {
          const data = await response.json();
          return data.token as string;
        }

        if (response.status !== 404)
          throw new Error(
            `Browser sign-in failed with status ${response.status}.`,
          );

        return null;
      },
    );

    if (token) return token;

    await sleep(POLL_INTERVAL_MILLISECONDS);
  }
  /* eslint-enable no-await-in-loop */

  throw new Error('Browser sign-in timed out. Run `autodroid login` again.');
};

const runBrowserLogin = async (
  params: IBrowserLoginParams,
): Promise<IBrowserLoginResult> => {
  const { apiKey, endpoint } = getCliConfig();
  const webUrl = getWebUrl();
  const restBaseUrl = getRestBaseUrl(endpoint);

  const { verifier, challenge } = createChallengePair();
  const userCode = createUserCode();
  const authorizeUrl = `${webUrl}/cli/authorize`;

  await registerChallenge({ restBaseUrl, challenge, userCode });

  params.onUserCode?.(userCode);
  params.onAuthorizeUrl?.(authorizeUrl);
  openBrowser(authorizeUrl);

  const customToken = await pollForToken({
    restBaseUrl,
    verifier,
    deadline: Date.now() + POLL_TIMEOUT_MILLISECONDS,
  });

  const session = await signInWithCustomToken({ customToken, apiKey });
  await writeSession(session);

  return { expiresAt: session.expiresAt, authorizeUrl };
};

let inFlightLogin: Promise<IBrowserLoginResult> | null = null;

const browserLogin = (
  params: IBrowserLoginParams = {},
): Promise<IBrowserLoginResult> => {
  if (!inFlightLogin) {
    inFlightLogin = runBrowserLogin(params).finally(() => {
      inFlightLogin = null;
    });
  }
  return inFlightLogin;
};

export { browserLogin };
export type { IBrowserLoginResult };
