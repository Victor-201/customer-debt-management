import cron from "node-cron";
import cronConfig from "../../main/config/cron.config.js";

export function registerCrons({ sendReminderEmailJob }) {
  cron.schedule(cronConfig.SEND_REMINDER, async () => {
    await sendReminderEmailJob.run();
  });
}
