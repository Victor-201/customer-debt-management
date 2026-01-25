import Payment from "../../../domain/entities/Payment.js";
import PaymentRepositoryInterface from "../../../application/interfaces/repositories/payment.repository.interface.js";
import { Op, Transaction } from "sequelize";

export default class PaymentRepository extends PaymentRepositoryInterface {
    constructor( {PaymentModel} ) {
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
    async findAll({ search, page, limit, invoiceId, startDate, endDate }) {
        const where = {};

        if (invoiceId) {
            where.invoice_id = invoiceId;
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

        const [result] = await this.PaymentModel.sequelize.query(`
            SELECT 
                COUNT(*) FILTER (WHERE method != 'REVERSAL') as total_count,
                COALESCE(SUM(CASE WHEN method = 'REVERSAL' THEN -amount ELSE amount END), 0) as net_amount,
                COALESCE(SUM(amount) FILTER (WHERE method != 'REVERSAL'), 0) as total_received,
                COALESCE(SUM(amount) FILTER (WHERE method = 'REVERSAL'), 0) as total_reversed,
                COUNT(*) FILTER (WHERE method = 'BANK_TRANSFER') as bank_transfer_count,
                COUNT(*) FILTER (WHERE method = 'CASH') as cash_count,
                COUNT(*) FILTER (WHERE method = 'CHECK') as check_count,
                COUNT(*) FILTER (WHERE method = 'CREDIT_CARD') as credit_card_count
            FROM payments
            ${dateFilter}
        `);

        const summary = result[0];

        return {
            totalCount: parseInt(summary.total_count, 10),
            netAmount: parseFloat(summary.net_amount),
            totalReceived: parseFloat(summary.total_received),
            totalReversed: parseFloat(summary.total_reversed),
            byMethod: {
                bankTransfer: parseInt(summary.bank_transfer_count, 10),
                cash: parseInt(summary.cash_count, 10),
                check: parseInt(summary.check_count, 10),
                creditCard: parseInt(summary.credit_card_count, 10),
            },
        };
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
