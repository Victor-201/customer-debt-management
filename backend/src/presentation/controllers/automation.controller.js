export default class AutomationController {
    constructor({ sendReminderEmailUseCase }) {
        this.sendReminderEmailUseCase = sendReminderEmailUseCase;
    }

    runReminders = async (req, res, next) => {
        try {
            const results = await this.sendReminderEmailUseCase.execute();
            return res.json({
                message: "Automated reminders execution completed",
                summary: {
                    totalProcessed: results.length,
                    sent: results.filter(r => r.status === 'SENT').length,
                    failed: results.filter(r => r.status === 'FAILED').length,
                },
                details: results
            });
        } catch (err) {
            next(err);
        }
    };
}
