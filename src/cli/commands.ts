// Context import
import { getCliConfig, resolveIdToken } from './context';

// SDK import
import { AutoDroidSdk } from '@package';

// Authentication import
import { clearAccount, writeIsAdmin } from './auth/accountStore';
import { signInWithPassword } from './auth/firebaseSession';
import { clearSession, writeSession } from './auth/sessionStore';

let sdk: AutoDroidSdk | undefined;

const getSdk = (): AutoDroidSdk => {
  if (!sdk) {
    const { endpoint } = getCliConfig();
    sdk = new AutoDroidSdk({
      baseUrl: endpoint,
      getAuthToken: resolveIdToken,
    });
  }
  return sdk;
};

const rememberAccountAdminStatus = async (user?: {
  is_admin: boolean;
}): Promise<void> => {
  try {
    const { is_admin: isAdmin } = user ?? (await getSdk().user.getCurrent());
    await writeIsAdmin(isAdmin);
  } catch {
    try {
      await clearAccount();
    } catch {}
  }
};

const login = async (params: { email: string; password: string }) => {
  const { apiKey } = getCliConfig();

  const session = await signInWithPassword({ ...params, apiKey });

  await writeSession(session);
  await rememberAccountAdminStatus();

  return { expiresAt: session.expiresAt };
};

const logout = async (): Promise<void> => {
  await clearSession();
  await clearAccount();
};

export { getSdk, login, logout, rememberAccountAdminStatus };
