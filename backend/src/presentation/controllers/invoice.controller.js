import CreateInvoiceUseCase from "../../application/use-cases/invoice/createInvoice.usecase.js";
import UpdateInvoiceUseCase from "../../application/use-cases/invoice/updateInvoice.usecase.js";
import RecalcInvoiceBalanceUseCase from "../../application/use-cases/invoice/recalcInvoiceBalance.usecase.js";
import MarkInvoicePaidUseCase from "../../application/use-cases/invoice/markInvoicePaid.usecase.js";
import UpdateOverdueInvoicesUseCase from "../../application/use-cases/invoice/updateOverdueInvoices.usecase.js";
import ValidateCreditLimitUseCase from "../../application/use-cases/invoice/validateCreditLimit.usecase.js";
import GetInvoiceUseCase from "../../application/use-cases/invoice/getInvoice.usecase.js";
import GetInvoicesByCustomerUseCase from "../../application/use-cases/invoice/GetInvoicesByCustomer.usecase.js";

class InvoiceController {
    constructor(invoiceRepository, paymentRepository, customerRepository) {
        this.createInvoiceUseCase = new CreateInvoiceUseCase(invoiceRepository);
        this.updateInvoiceUseCase = new UpdateInvoiceUseCase(invoiceRepository);

        this.recalcInvoiceBalanceUseCase = new RecalcInvoiceBalanceUseCase(invoiceRepository, paymentRepository);

        this.markInvoicePaidUseCase = new MarkInvoicePaidUseCase(invoiceRepository);

        this.updateOverdueInvoicesUseCase = new UpdateOverdueInvoicesUseCase(invoiceRepository);

        this.validateCreditLimitUseCase = new ValidateCreditLimitUseCase(customerRepository, invoiceRepository);

        this.getInvoiceUseCase = new GetInvoiceUseCase(invoiceRepository);
        this.getInvoicesByCustomerUseCase = new GetInvoicesByCustomerUseCase(invoiceRepository);
    }

    /**
     * POST /invoices
     */
    createInvoice = async (req, res) => {
        try {
            const payload = {
                ...req.body,
                createdBy: req.user?.userId ?? null,
            };

            await this.validateCreditLimitUseCase.execute({
                customerId: payload.customerId,
                invoiceTotalAmount: payload.totalAmount,
                invoiceId: null,
            });

            const invoice = await this.createInvoiceUseCase.execute(payload);

            res.status(201).json(invoice);
        } catch (error) {
            this.#handleError(res, error);
        }
    };

    /**
     * PUT /invoices/:invoiceId
     * Không cho update paidAmount / status
     */
    updateInvoice = async (req, res) => {
        try {
            const { invoiceId } = req.params;

            if ("paidAmount" in req.body || "status" in req.body) {
                return res.status(400).json({
                    error: "paidAmount and status cannot be updated directly",
                });
            }

            if (req.body.customerId || req.body.totalAmount !== undefined) {
                await this.validateCreditLimitUseCase.execute({
                    customerId: req.body.customerId,
                    invoiceId,
                    newTotalAmount: req.body.totalAmount
                });

            }

            const invoice = await this.updateInvoiceUseCase.execute(
                invoiceId,
                req.body,
                req.user?.userId ?? null
            );

            res.json(invoice);
        } catch (error) {
            this.#handleError(res, error);
        }
    };

    /**
     * POST /invoices/:invoiceId/mark-paid
     * Admin override only
     */
    markInvoicePaid = async (req, res) => {
        try {
            const { invoiceId } = req.params;

            const invoice = await this.markInvoicePaidUseCase.execute(
                invoiceId,
                req.user?.userId ?? null
            );

            res.json(invoice);
        } catch (error) {
            this.#handleError(res, error);
        }
    };

    /**
     * POST /invoices/update-overdue
     */
    updateOverdueInvoices = async (req, res) => {
        try {
            const result = await this.updateOverdueInvoicesUseCase.execute();
            res.json(result);
        } catch (error) {
            this.#handleError(res, error);
        }
    };

    /**
     * POST /invoices/validate-credit-limit
     */
    validateCreditLimit = async (req, res) => {
        try {
            const result = await this.validateCreditLimitUseCase.execute(req.body);
            res.json(result);
        } catch (error) {
            this.#handleError(res, error);
        }
    };

    getInvoicesByCustomer = async (req, res) => {
        try {
            const { customerId } = req.params;

            const invoices = await this.getInvoicesByCustomerUseCase.execute(customerId);

            res.json(invoices);
        } catch (error) {
            this.#handleError(res, error);
        }
    };

    getInvoice = async (req, res) => {
        try {
            const { invoiceId } = req.params;

            const invoice = await this.getInvoiceUseCase.execute(invoiceId);

            res.json(invoice);
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

export default InvoiceController;
