

import { CronJob } from 'cron';

// Function to be executed in the routine
const routine = () => {
  console.log('Routine executed!');
  // Add your routine logic here
};

// Cron expression for running the routine every day at 8:00 AM
const dailyCronExpression = '0 8 * * *';

// Cron expression for running the routine every Monday at 9:00 AM
const weeklyCronExpression = '0 9 * * 1';

// Create cron jobs for daily and weekly routines
const dailyJob = new CronJob(dailyCronExpression, routine);
const weeklyJob = new CronJob(weeklyCronExpression, routine);

// Start the cron jobs
dailyJob.start();
weeklyJob.start();

// Optional: Stop the cron jobs after a certain duration
const durationInMilliseconds = 60000; // Stop after 1 minute (adjust as needed)
setTimeout(() => {
  dailyJob.stop();
  weeklyJob.stop();
  console.log('Cron jobs stopped.');
}, durationInMilliseconds);
