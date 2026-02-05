import Payment from "../../../domain/entities/Payment.js";
import PaymentRepositoryInterface from "../../../application/interfaces/repositories/payment.repository.interface.js";
import { Op, Transaction } from "sequelize";

export default class PaymentRepository extends PaymentRepositoryInterface {
    constructor({ PaymentModel }) {
        super();
        this.PaymentModel = PaymentModel;
    }

    async save(payment, tx = null) {
        const values = {
            id: payment.id ?? undefined,
            invoice_id: payment.invoice_id,
            payment_date: payment.payment_date,
            amount: payment.amount.amount,
            method: payment.method,
            reference: payment.reference,
            recorded_by: payment.recorded_by ?? null,
        };

        let row;

        if (!payment.id) {
            row = await this.PaymentModel.create(values, { transaction: tx });
        } else {
            await this.PaymentModel.update(values, {
                where: { id: payment.id },
                transaction: tx
            });
            row = await this.PaymentModel.findByPk(payment.id);
        }

        return row ? this._mapRowToEntity(row) : null;
    }

    async findById(id) {
        // console.log(id);
        const row = await this.PaymentModel.findByPk(id);
        // console.log(row);
        return row ? this._mapRowToEntity(row) : null;
    }

    async findByInvoiceId(invoiceId) {
        const rows = await this.PaymentModel.findAll({
            where: { invoice_id: invoiceId },
            order: [
                ["payment_date", "ASC"],
                ["created_at", "ASC"],
            ],
        });
        // console.log(rows);
        return rows.map(row => this._mapRowToEntity(row));
    }

    async sumByInvoiceId(invoiceId, tx) {
        const [result] = await this.PaymentModel.findAll({
            attributes: [
                [
                    this.PaymentModel.sequelize.literal(`
                COALESCE(
                    SUM(
                    CASE
                        WHEN method = 'REVERSAL' THEN -amount
                        ELSE amount
                    END
                    ),
                    0
                )
                `),
                    'total_paid',
                ],
            ],
            where: { invoice_id: invoiceId },
            transaction: tx,
            raw: true,
        });
        // console.log(result);
        return Number(result.total_paid);
    }

    /**
     * Find all payments with pagination and filtering
     */
    async findAll({ search, page, limit, invoiceId, paymentMethod, startDate, endDate }) {
        const where = {};

        if (invoiceId) {
            where.invoice_id = invoiceId;
        }

        if (paymentMethod) {
            where.method = paymentMethod;
        }

        if (search) {
            where[Op.or] = [
                { reference: { [Op.iLike]: `%${search}%` } },
            ];
        }

        if (startDate) {
            where.payment_date = { ...where.payment_date, [Op.gte]: startDate };
        }

        if (endDate) {
            where.payment_date = { ...where.payment_date, [Op.lte]: endDate };
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await this.PaymentModel.findAndCountAll({
            where,
            order: [['payment_date', 'DESC'], ['created_at', 'DESC']],
            limit,
            offset,
        });

        return {
            data: rows.map(row => this._mapRowToEntity(row)),
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
        };
    }

    /**
     * Find recent payments
     */
    async findRecent(limit = 10) {
        const rows = await this.PaymentModel.findAll({
            where: {
                method: { [Op.ne]: 'REVERSAL' },
            },
            order: [['payment_date', 'DESC'], ['created_at', 'DESC']],
            limit,
        });

        return rows.map(row => this._mapRowToEntity(row));
    }

    /**
     * Get payment summary statistics
     */
    async getSummary({ startDate, endDate }) {
        let dateFilter = '';
        if (startDate && endDate) {
            dateFilter = `WHERE payment_date >= '${startDate}' AND payment_date <= '${endDate}'`;
        } else if (startDate) {
            dateFilter = `WHERE payment_date >= '${startDate}'`;
        } else if (endDate) {
            dateFilter = `WHERE payment_date <= '${endDate}'`;
        }

        const query = `
            SELECT 
                COUNT(*) FILTER (WHERE method != 'REVERSAL') as total_count,
                COALESCE(SUM(CASE WHEN method = 'REVERSAL' THEN -amount ELSE amount END), 0) as net_amount,
                COALESCE(SUM(amount) FILTER (WHERE method != 'REVERSAL'), 0) as total_received,
                COALESCE(SUM(amount) FILTER (WHERE method = 'REVERSAL'), 0) as total_reversed,
                COUNT(*) FILTER (WHERE method = 'BANK_TRANSFER') as bank_transfer_count,
                COUNT(*) FILTER (WHERE method = 'CASH') as cash_count,
                COUNT(*) FILTER (WHERE method = 'CREDIT_CARD') as credit_card_count,
                COUNT(*) FILTER (WHERE method = 'REVERSAL') as reversal_count,
                COALESCE(SUM(amount) FILTER (WHERE method = 'CASH'), 0) as cash_amount,
                COALESCE(SUM(amount) FILTER (WHERE method = 'BANK_TRANSFER'), 0) as bank_transfer_amount,
                COALESCE(SUM(amount) FILTER (WHERE method = 'CREDIT_CARD'), 0) as credit_card_amount
            FROM payments
            ${dateFilter}
        `;

        // Query for this month's payments
        const monthlyQuery = `
            SELECT 
                COALESCE(SUM(CASE WHEN method = 'REVERSAL' THEN -amount ELSE amount END), 0) as total_this_month
            FROM payments
            WHERE payment_date >= date_trunc('month', CURRENT_DATE)
              AND payment_date < date_trunc('month', CURRENT_DATE) + interval '1 month'
        `;

        // Query for expected this month (sum of unpaid invoice amounts due this month)
        const expectedQuery = `
            SELECT 
                COALESCE(SUM(total_amount - paid_amount), 0) as expected_this_month
            FROM invoices
            WHERE status IN ('PENDING', 'OVERDUE')
              AND due_date >= date_trunc('month', CURRENT_DATE)
              AND due_date < date_trunc('month', CURRENT_DATE) + interval '1 month'
        `;

        try {
            const [result] = await this.PaymentModel.sequelize.query(query);
            const [monthlyResult] = await this.PaymentModel.sequelize.query(monthlyQuery);
            const [expectedResult] = await this.PaymentModel.sequelize.query(expectedQuery);

            const summary = result[0] || {};
            const monthly = monthlyResult[0] || {};
            const expected = expectedResult[0] || {};

            return {
                totalCount: parseInt(summary.total_count || 0, 10),
                netAmount: parseFloat(summary.net_amount || 0),
                totalReceived: parseFloat(summary.total_received || 0),
                totalReversed: parseFloat(summary.total_reversed || 0),
                byMethod: {
                    bankTransfer: parseInt(summary.bank_transfer_count || 0, 10),
                    cash: parseInt(summary.cash_count || 0, 10),
                    creditCard: parseInt(summary.credit_card_count || 0, 10),
                    reversal: parseInt(summary.reversal_count || 0, 10),
                },
                amountByMethod: {
                    cash: parseFloat(summary.cash_amount || 0),
                    bankTransfer: parseFloat(summary.bank_transfer_amount || 0),
                    creditCard: parseFloat(summary.credit_card_amount || 0),
                },
                // Dashboard stats
                totalThisMonth: parseFloat(monthly.total_this_month || 0),
                expectedThisMonth: parseFloat(expected.expected_this_month || 1), // Default 1 to avoid division by zero
            };
        } catch (error) {
            console.error('Payment summary query error:', error);
            throw error;
        }
    }

    _mapRowToEntity(row) {
        return new Payment({
            id: row.id,
            invoice_id: row.invoice_id,
            payment_date: row.payment_date,
            amount: row.amount,
            method: row.method,
            reference: row.reference,
            recorded_by: row.recorded_by,
            created_at: row.created_at,
        });
    }
}
