import { spinner } from '@clack/prompts';

const withSpinner = async <T>(
  label: string,
  task: () => Promise<T>,
): Promise<T> => {
  if (!process.stdout.isTTY) return task();

  const indicator = spinner();
  indicator.start(label);

  try {
    const result = await task();
    indicator.stop(label);
    return result;
  } catch (error) {
    indicator.stop(label, 2);
    throw error;
  }
};

export { withSpinner };
