import RecordPaymentUseCase from "../../application/use-cases/payment/recordPayment.usecase.js";
import ReversePaymentUseCase from "../../application/use-cases/payment/reversePayment.usecase.js";
import GetPaymentByInvoiceId from "../../application/use-cases/payment/getPaymentByInvoice.usecase.js";

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
    }

    
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
