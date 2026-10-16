// Authentication import
import { browserLogin, IBrowserLoginResult } from '../auth/browserLogin';

// CLI import
import { rememberAccountAdminStatus } from '../commands';

const presentBrowserLogin = async (): Promise<IBrowserLoginResult> => {
  const result = await browserLogin({
    onUserCode: code => {
      console.error(`Confirm this code on the sign-in page: ${code}`);
    },
    onAuthorizeUrl: url => {
      console.error(`Open this URL to sign in: ${url}`);
    },
  });

  await rememberAccountAdminStatus();

  return result;
};

export { presentBrowserLogin };
