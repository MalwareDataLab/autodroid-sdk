// CLI import
import { runCli } from './index';

runCli(process.argv.slice(2)).then(code => {
  process.exitCode = code;
});
