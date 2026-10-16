// Authentication import
import { getValidSession } from './auth/firebaseSession';
import { NotAuthenticatedError } from './auth/notAuthenticatedError';
import { readSession, writeSession } from './auth/sessionStore';

interface ICliConfig {
  endpoint: string;
  apiKey: string;
}

const isNotAuthenticatedError = (error: unknown): boolean =>
  error instanceof NotAuthenticatedError ||
  (error as { networkError?: unknown })?.networkError instanceof
    NotAuthenticatedError;

const DEFAULT_API_URL = 'https://mdl-api.unihacker.club/graphql';
const DEFAULT_FIREBASE_WEB_API_KEY = 'AIzaSyBt-FkToQznrkXvSHYF2fM3G4XajCsgihs';
const DEFAULT_WEB_URL = 'https://mdl.unihacker.club';

const getCliConfig = (): ICliConfig => ({
  endpoint: process.env.AUTODROID_CLI_API_URL || DEFAULT_API_URL,
  apiKey:
    process.env.AUTODROID_CLI_FIREBASE_WEB_API_KEY ||
    DEFAULT_FIREBASE_WEB_API_KEY,
});

const getWebUrl = (): string =>
  process.env.AUTODROID_CLI_WEB_URL || DEFAULT_WEB_URL;

const resolveIdToken = async (): Promise<string> => {
  const { apiKey } = getCliConfig();
  const stored = await readSession();

  if (!stored)
    throw new NotAuthenticatedError(
      'Not authenticated. Run `autodroid login` first.',
    );

  const session = await getValidSession({
    session: stored,
    apiKey,
    now: Date.now(),
  });

  if (session !== stored) await writeSession(session);

  return session.idToken;
};

export {
  getCliConfig,
  getWebUrl,
  isNotAuthenticatedError,
  NotAuthenticatedError,
  resolveIdToken,
};
