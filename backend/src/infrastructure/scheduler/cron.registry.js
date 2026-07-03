import cron from "node-cron";
import cronConfig from "../../main/config/cron.config.js";

export function registerCrons({ sendReminderEmailJob, updateOverdueInvoicesJob }) {
  // Send reminder emails (configurable schedule)
  cron.schedule(cronConfig.SEND_REMINDER, async () => {
    await sendReminderEmailJob.run();
  });

  // Update overdue invoices daily at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("[JOB] Starting UpdateOverdueInvoices at", new Date().toISOString());
    await updateOverdueInvoicesJob.run();
    console.log("[JOB] Finished UpdateOverdueInvoices");
  });
}
