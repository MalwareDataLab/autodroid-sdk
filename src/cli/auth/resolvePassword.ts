import { isCancel, password as promptPassword } from '@clack/prompts';

const resolvePassword = async (params: {
  flagValue?: string;
}): Promise<string> => {
  const { flagValue } = params;

  if (flagValue) return flagValue;
  if (process.env.AUTODROID_CLI_PASSWORD)
    return process.env.AUTODROID_CLI_PASSWORD;

  if (!process.stdin.isTTY)
    throw new Error(
      'Password is required. Pass --password, set AUTODROID_CLI_PASSWORD, or run interactively.',
    );

  const answer = await promptPassword({ message: 'Password' });

  if (isCancel(answer)) throw new Error('Login cancelled.');

  return answer;
};

export { resolvePassword };
