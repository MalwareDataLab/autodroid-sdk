// Authentication import
import { NotAuthenticatedError } from './notAuthenticatedError';

const IDENTITY_TOOLKIT_URL =
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword';
const IDENTITY_TOOLKIT_CUSTOM_TOKEN_URL =
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken';
const SECURE_TOKEN_URL = 'https://securetoken.googleapis.com/v1/token';

class FirebaseAuthenticationError extends Error {}

const RENEWAL_WINDOW_MILLISECONDS = 5 * 60 * 1000;

const REFUSED_REFRESH_CREDENTIAL_CODES = [
  'TOKEN_EXPIRED',
  'INVALID_REFRESH_TOKEN',
  'USER_DISABLED',
  'USER_NOT_FOUND',
  'MISSING_REFRESH_TOKEN',
];

interface IFirebaseSession {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

type IFirebaseResponse<Success> = (
  | Success
  | { [Key in keyof Success]?: undefined }
) & { error?: { message?: string } };

type ISignInResponse = IFirebaseResponse<{
  idToken: string;
  refreshToken: string;
}>;

type IRefreshResponse = IFirebaseResponse<{
  id_token: string;
  refresh_token: string;
}>;

const parseFirebaseResponse = async <Body>(
  response: Response,
): Promise<Body> => {
  try {
    return await response.json();
  } catch {
    throw new Error(
      `Firebase request failed with status ${response.status} and a non-JSON response body.`,
    );
  }
};

const decodeTokenExpiration = (idToken: string): number => {
  const [, payload] = idToken.split('.');

  if (!payload) throw new Error('Malformed Firebase token.');

  let claims: { exp?: number };

  try {
    claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    throw new Error('Malformed Firebase token.');
  }

  if (typeof claims.exp !== 'number')
    throw new Error('Firebase token has no expiration claim.');

  return claims.exp * 1000;
};

const signInWithPassword = async (params: {
  email: string;
  password: string;
  apiKey: string;
}): Promise<IFirebaseSession> => {
  const { email, password, apiKey } = params;

  const response = await fetch(`${IDENTITY_TOOLKIT_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  const data = await parseFirebaseResponse<ISignInResponse>(response);

  if (!data.idToken)
    throw new Error(`Firebase sign in failed. ${data.error?.message}`);

  return {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresAt: decodeTokenExpiration(data.idToken),
  };
};

const signInWithCustomToken = async (params: {
  customToken: string;
  apiKey: string;
}): Promise<IFirebaseSession> => {
  const { customToken, apiKey } = params;

  const response = await fetch(
    `${IDENTITY_TOOLKIT_CUSTOM_TOKEN_URL}?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    },
  );

  const data = await parseFirebaseResponse<ISignInResponse>(response);

  if (!data.idToken)
    throw new FirebaseAuthenticationError(
      `Firebase custom token sign in failed. ${data.error?.message}`,
    );

  return {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresAt: decodeTokenExpiration(data.idToken),
  };
};

const refreshSession = async (params: {
  refreshToken: string;
  apiKey: string;
}): Promise<IFirebaseSession> => {
  const { refreshToken, apiKey } = params;

  const response = await fetch(`${SECURE_TOKEN_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
  });

  const data = await parseFirebaseResponse<IRefreshResponse>(response);

  if (!data.id_token) {
    const message = `Firebase token refresh failed. ${data.error?.message}`;
    const errorCode = data.error?.message?.split(' ')[0] ?? '';

    throw REFUSED_REFRESH_CREDENTIAL_CODES.includes(errorCode)
      ? new NotAuthenticatedError(message)
      : new Error(message);
  }

  return {
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresAt: decodeTokenExpiration(data.id_token),
  };
};

const getValidSession = async (params: {
  session: IFirebaseSession;
  apiKey: string;
  now: number;
}): Promise<IFirebaseSession> => {
  const { session, apiKey, now } = params;

  if (session.expiresAt - now > RENEWAL_WINDOW_MILLISECONDS) return session;

  return refreshSession({ refreshToken: session.refreshToken, apiKey });
};

export {
  decodeTokenExpiration,
  FirebaseAuthenticationError,
  getValidSession,
  refreshSession,
  signInWithCustomToken,
  signInWithPassword,
};
export type { IFirebaseSession };
