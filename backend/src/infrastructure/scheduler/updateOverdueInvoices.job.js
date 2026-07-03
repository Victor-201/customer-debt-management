import UpdateOverdueInvoicesUseCase from "../../application/use-cases/invoice/updateOverdueInvoices.usecase.js";

export default class UpdateOverdueInvoicesJob {
    constructor({ invoiceRepository }) {
        this.updateOverdueInvoicesUseCase = new UpdateOverdueInvoicesUseCase({ invoiceRepository });
    }

    async run() {
        try {
            const result = await this.updateOverdueInvoicesUseCase.execute();
            console.log("[JOB] Updated overdue invoices:", result);
            return result;
        } catch (error) {
            console.error("[JOB] Error updating overdue invoices:", error);
            throw error;
        }
    }
}
