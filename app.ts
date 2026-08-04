import cron from 'node-cron';
import { cronSchedule, isFeatureEnabled } from './src/config';
import actualAi from './src/container';
import { formatError } from './src/utils/error-utils';

async function classify(): Promise<void> {
  try {
    await actualAi.classify();
  } catch (error) {
    console.error('Classification failed:', formatError(error));
    process.exitCode = 1;
  }
}

if (!isFeatureEnabled('classifyOnStartup') && !cron.validate(cronSchedule)) {
  console.error('classifyOnStartup not set or invalid cron schedule:', cronSchedule);
  process.exit(1);
}

if (cron.validate(cronSchedule)) {
  cron.schedule(cronSchedule, async () => {
    await classify();
  });
}

console.log('Application started');
if (isFeatureEnabled('classifyOnStartup')) {
  void classify();
} else {
  console.log('Application started, waiting for cron schedule:', cronSchedule);
}
