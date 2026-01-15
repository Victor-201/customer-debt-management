

class InvoiceController {
    constructor({
        createInvoiceUseCase,
        updateInvoiceUseCase,
        markInvoicePaidUseCase,
        recalcInvoiceBalanceUseCase,
        updateOverdueInvoicesUseCase,
        validateCreditLimitUseCase,
    }) {
        this.createInvoiceUseCase = createInvoiceUseCase;
        this.updateInvoiceUseCase = updateInvoiceUseCase;
        this.markInvoicePaidUseCase = markInvoicePaidUseCase;
        this.recalcInvoiceBalanceUseCase = recalcInvoiceBalanceUseCase;
        this.updateOverdueInvoicesUseCase = updateOverdueInvoicesUseCase;
        this.validateCreditLimitUseCase = validateCreditLimitUseCase;
    }

    /**
     * POST /invoices
     * body: { customerId, invoiceNumber, issueDate, dueDate, totalAmount, paidAmount?, status? }
     */
    createInvoice = async (req, res) => {
        try {
            const payload = {
                ...req.body,
                createdBy: req.user?.userId ?? req.body.createdBy ?? null,
            };

            // 1) Validate credit limit trước khi tạo (nếu nghiệp vụ của bạn yêu cầu)
            await this.validateCreditLimitUseCase.execute({
                customerId: payload.customerId,
                invoiceTotalAmount: payload.totalAmount,
                invoiceId: null, // tạo mới
            });

            // 2) Create invoice
            const invoice = await this.createInvoiceUseCase.execute(payload);

            res.status(201).json(invoice);
        } catch (error) {
            this.#handleError(res, error);
        }
    };

    /**
     * PUT /invoices/:invoiceId
     * body: partial fields (issueDate/dueDate/totalAmount/paidAmount/status/...)
     */
    updateInvoice = async (req, res) => {
        try {
            const { invoiceId } = req.params;

            // Nếu update có thay đổi totalAmount hoặc customerId => validate credit limit (tuỳ nghiệp vụ)
            if (req.body.customerId || req.body.totalAmount !== undefined) {
                await this.validateCreditLimitUseCase.execute({
                    customerId: req.body.customerId, // nếu không truyền, usecase nên tự lấy theo invoiceId (khuyến nghị)
                    invoiceTotalAmount: req.body.totalAmount, // nếu không truyền, usecase nên ignore
                    invoiceId, // update invoice hiện tại
                });
            }

            const invoice = await this.updateInvoiceUseCase.execute(
                invoiceId,
                req.body,
                req.user?.userId
            );

            res.json(invoice);
        } catch (error) {
            this.#handleError(res, error);
        }
    };

    /**
     * POST /invoices/:invoiceId/mark-paid
     * (Bạn có usecase markInvoicePaid, nên endpoint kiểu action là hợp lý)
     */
    markInvoicePaid = async (req, res) => {
        try {
            const { invoiceId } = req.params;

            const result = await this.markInvoicePaidUseCase.execute(invoiceId);

            res.json(result);
        } catch (error) {
            this.#handleError(res, error);
        }
    };

    /**
     * POST /invoices/:invoiceId/recalc-balance
     * Dùng khi bạn muốn đồng bộ paid_amount/balance_amount theo rule DB
     */
    // recalcInvoiceBalance = async (req, res) => {
    //     try {
    //         const { invoiceId } = req.params;

    //         const result = await this.recalcInvoiceBalanceUseCase.execute(invoiceId);

    //         res.json(result);
    //     } catch (error) {
    //         this.#handleError(res, error);
    //     }
    // };

    /**
     * POST /invoices/update-overdue
     * Dùng để chạy job update các invoice overdue (manual trigger / cron hit)
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
     * body: { customerId, invoiceTotalAmount, invoiceId? }
     * Endpoint này hữu ích cho UI (check trước khi submit)
     */
    validateCreditLimit = async (req, res) => {
        try {
            const result = await this.validateCreditLimitUseCase.execute(req.body);
            res.json(result);
        } catch (error) {
            this.#handleError(res, error);
        }
    };

    #handleError(res, error) {
        if (error?.name === "BusinessRuleError") {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export default InvoiceController;
