import RecordPaymentUseCase from "../../application/use-cases/payment/recordPayment.usecase.js";
import ReversePaymentUseCase from "../../application/use-cases/payment/reversePayment.usecase.js";
import GetPaymentByInvoiceId from "../../application/use-cases/payment/getPaymentByInvoice.usecase.js";
import GetAllPaymentsUseCase from "../../application/use-cases/payment/getAllPayments.usecase.js";
import GetRecentPaymentsUseCase from "../../application/use-cases/payment/getRecentPayments.usecase.js";
import GetPaymentSummaryUseCase from "../../application/use-cases/payment/getPaymentSummary.usecase.js";

class PaymentController {
    constructor(paymentRepository, invoiceRepository) {
        this.recordPaymentUseCase = new RecordPaymentUseCase(
            paymentRepository,
            invoiceRepository
        );

        this.reversePaymentUseCase = new ReversePaymentUseCase(
            paymentRepository,
            invoiceRepository
        );

        this.getPaymentByInvoiceIdUseCase = new GetPaymentByInvoiceId(paymentRepository);
        this.getAllPaymentsUseCase = new GetAllPaymentsUseCase(paymentRepository);
        this.getRecentPaymentsUseCase = new GetRecentPaymentsUseCase(paymentRepository);
        this.getPaymentSummaryUseCase = new GetPaymentSummaryUseCase(paymentRepository);
    }

    /**
     * GET /payments
     */
    getAllPayments = async (req, res) => {
        try {
            const result = await this.getAllPaymentsUseCase.execute(req.query);
            res.json(result);
        } catch (error) {
            this.#handleError(res, error);
        }
    };

    /**
     * GET /payments/recent
     */
    getRecentPayments = async (req, res) => {
        try {
            const limit = req.query.limit || 10;
            const payments = await this.getRecentPaymentsUseCase.execute(limit);
            res.json(payments);
        } catch (error) {
            this.#handleError(res, error);
        }
    };

    /**
     * GET /payments/summary
     */
    getPaymentSummary = async (req, res) => {
        try {
            const summary = await this.getPaymentSummaryUseCase.execute(req.query);
            res.json(summary);
        } catch (error) {
            this.#handleError(res, error);
        }
    };

    recordPayment = async (req, res) => {
        try {
            const payload = {
                ...req.body,
                recorded_by: req.user?.userId ?? null,
            };

            const payment = await this.recordPaymentUseCase.execute(payload);

            res.status(201).json(payment);
        } catch (error) {
            this.#handleError(res, error);
        }
    };

   
    reversePayment = async (req, res) => {
        try {
            const { paymentId } = req.params;

            const result = await this.reversePaymentUseCase.execute({
                paymentId,
                reversedBy: req.user?.userId ?? null,
                reference: req.body?.reference,
            });

            res.json(result);
        } catch (error) {
            this.#handleError(res, error);
        }
    };

    getPaymentByInvoiceId = async (req, res) => {
        try {
            const { invoiceId } = req.params;
            const result = await this.getPaymentByInvoiceIdUseCase.execute(invoiceId);

            res.json(result);
        } catch (error) {
            this.#handleError(res, error);
        }
    }

    #handleError(res, error) {
        if (error?.name === "BusinessRuleError") {
            return res.status(400).json({ error: error.message });
        }

        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export default PaymentController;
