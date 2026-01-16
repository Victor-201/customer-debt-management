import Payment from "../../../domain/entities/Payment.js";
import PaymentRepositoryInterface from "../../../application/interfaces/repositories/payment.repository.interface.js";
import { Op } from "sequelize";

export default class PaymentRepository extends PaymentRepositoryInterface {
    constructor({ PaymentModel }) {
        super();
        this.PaymentModel = PaymentModel;
    }

    async save(payment) {
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
            row = await this.PaymentModel.create(values);
        } else {
            await this.PaymentModel.update(values, {
                where: { id: payment.id },
            });
            row = await this.PaymentModel.findByPk(payment.id);
        }

        return row ? this._mapRowToEntity(row) : null;
    }

    async findById(id) {
        const row = await this.PaymentModel.findByPk(id);
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

        return rows.map(row => this._mapRowToEntity(row));
    }

    async sumByInvoiceId(invoiceId) {
        const total = await this.PaymentModel.sum("amount", {
            where: { invoice_id: invoiceId },
        });

        return Number(total || 0);
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
