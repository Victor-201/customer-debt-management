

export default class SendReminderEmailJob {
  constructor({
    invoiceRepository,
    customerRepository,
    sendReminderEmailUseCase,
  }) {
    this.invoiceRepository = invoiceRepository;
    this.customerRepository = customerRepository;
    this.sendReminderEmailUseCase = sendReminderEmailUseCase;
  }

  async run(today = new Date()) {
    console.log(`[JOB] Starting SendReminderEmailJob at ${today.toISOString()}`);
    const results = await this.sendReminderEmailUseCase.execute({ today });
    console.log(`[JOB] Finished. Processed ${results.length} reminders.`);
  }
}
