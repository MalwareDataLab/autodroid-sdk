import yargs from 'yargs';

// Context import
import { isNotAuthenticatedError } from './context';

// Data import
import { version } from '../../package.json';

// Authentication import
import { readIsAdmin } from './auth/accountStore';
import { resolvePassword } from './auth/resolvePassword';

// UI import
import { color } from './ui/color';
import { presentBrowserLogin } from './ui/presentBrowserLogin';
import { withSpinner } from './ui/withSpinner';

// CLI import
import { login, logout } from './commands';
import { toErrorMessage } from './errorMessage';
import { startMcpServer } from './mcp/server';
import { registerOperationCommands } from './operationCommands';

const reportError = (error: unknown, argv: string[]): number => {
  const json = argv.some(arg => arg === '--json' || arg === '--json=true');
  const message = toErrorMessage(error);
  console.error(json ? message : color.red(message));
  return 1;
};

const parseArgv = async (argv: string[]): Promise<void> => {
  const showAdmin = await readIsAdmin();
  const program = yargs(argv)
    .scriptName('autodroid')
    .version(version)
    .exitProcess(false)
    .option('json', {
      type: 'boolean',
      default: false,
      describe: 'Output raw JSON instead of a formatted table.',
    })
    .command(
      'login',
      'Authenticate with an AutoDroid account. Omit --email to sign in through the browser.',
      builder =>
        builder
          .option('email', { type: 'string' })
          .option('password', { type: 'string' }),
      async args => {
        let expiresAt: number;

        if (args.email) {
          const password = await resolvePassword({
            flagValue: args.password,
          });
          ({ expiresAt } = await withSpinner('Logging in...', () =>
            login({ email: args.email as string, password }),
          ));
        } else {
          ({ expiresAt } = await presentBrowserLogin());
        }

        const message = `Logged in. Session valid until ${new Date(expiresAt).toISOString()}.`;
        console.log(args.json ? message : color.green(message));
      },
    )
    .command('logout', 'Discard the stored session.', {}, async args => {
      await logout();
      console.log(args.json ? 'Logged out.' : color.green('Logged out.'));
    })
    .command(
      'mcp',
      'Serve AutoDroid tools to an MCP host over stdio.',
      {},
      async () => {
        await startMcpServer();
      },
    );

  registerOperationCommands(program, { showAdmin });

  await program
    .demandCommand(1)
    .strict()
    .help()
    .fail((message, error) => {
      throw error ?? new Error(message);
    })
    .parseAsync();
};

const runCli = async (argv: string[]): Promise<number> => {
  try {
    await parseArgv(argv);
    return 0;
  } catch (error) {
    if (isNotAuthenticatedError(error) && process.stdout.isTTY) {
      try {
        await presentBrowserLogin();
        await parseArgv(argv);
        return 0;
      } catch (retryError) {
        return reportError(retryError, argv);
      }
    }

    return reportError(error, argv);
  }
};

export { runCli };
