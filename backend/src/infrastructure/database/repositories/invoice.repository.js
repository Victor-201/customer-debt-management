import { Op } from "sequelize";
import Invoice from "../../../domain/entities/Invoice.js";
import { InvoiceStatus } from "../../../domain/value-objects/InvoiceStatus.js";
import InvoiceRepositoryInterface from "../../../application/interfaces/repositories/invoice.repository.interface.js";

export default class InvoiceRepository extends InvoiceRepositoryInterface {
    constructor({ InvoiceModel }) {
        super();
        this.InvoiceModel = InvoiceModel;
    }

    async save(invoice, tx = null) {
        const values = {
            id: invoice.id ?? undefined,
            customer_id: invoice.customer_id,
            invoice_number: invoice.invoice_number,
            issue_date: invoice.issue_date,
            due_date: invoice.due_date,
            total_amount: invoice.total_amount.amount,
            paid_amount: invoice.paid_amount.amount,
            balance_amount: invoice.balance_amount.amount,
            status: invoice.status.value,
            created_by: invoice.created_by ?? null,
        };

        let row;

        if (!invoice.id) {
            row = await this.InvoiceModel.create(values, { transaction: tx });
        } else {
            await this.InvoiceModel.update(
                {
                    ...values,
                    updated_at: new Date(),
                },
                { where: { id: invoice.id }, transaction: tx }
            );

            row = await this.InvoiceModel.findByPk(invoice.id);
        }

        return row ? this._mapRowToEntity(row) : null;
    }

    async findById(id) {
        const row = await this.InvoiceModel.findByPk(id);
        return row ? this._mapRowToEntity(row) : null;
    }

    async findByInvoiceNumber(invoiceNumber) {
        const row = await this.InvoiceModel.findOne({
            where: { invoice_number: invoiceNumber },
        });

        return row ? this._mapRowToEntity(row) : null;
    }

    async findOutstandingByCustomer(customerId) {
        const rows = await this.InvoiceModel.findAll({
            where: {
                customer_id: customerId,
                balance_amount: { [Op.gt]: 0 },
                status: { [Op.in]: ["PENDING", "OVERDUE"] },
            },
            order: [["due_date", "ASC"]],
        });

        return rows.map(row => this._mapRowToEntity(row));
    }

    async findByCustomer(customerId) {
        const rows = await this.InvoiceModel.findAll({
            where: { customer_id: customerId },
            order: [["issue_date", "DESC"]],
        });

        return rows.map(row => this._mapRowToEntity(row));
    }


    async markOverdueInvoices(currentDate = new Date()) {
        await this.InvoiceModel.update(
            {
                status: "OVERDUE",
                updated_at: new Date(),
            },
            {
                where: {
                    status: "PENDING",
                    balance_amount: { [Op.gt]: 0 },
                    due_date: { [Op.lt]: currentDate },
                },
            }
        );

        return { success: true };
    }

    async getAgingReport() {
        const rows = await this.InvoiceModel.findAll({
            attributes: [
                "balance_amount",
                [
                    this.InvoiceModel.sequelize.literal(
                        "CURRENT_DATE - DATE(due_date)"
                    ),
                    "days_overdue",
                ],
            ],
            where: {
                balance_amount: { [Op.gt]: 0 },
                status: { [Op.in]: ["PENDING", "OVERDUE", "PAID"] },
            },
            raw: true,
        });

        const result = {
            current: 0,
            overdue1To30: 0,
            overdue31To60: 0,
            overdue61To90: 0,
            overdue90Plus: 0,
            total: 0,
        };

        for (const r of rows) {
            const days = Number(r.days_overdue);
            const amount = Number(r.balance_amount);
            result.total += amount;

            if (days <= 0) result.current += amount;
            else if (days <= 30) result.overdue1To30 += amount;
            else if (days <= 60) result.overdue31To60 += amount;
            else if (days <= 90) result.overdue61To90 += amount;
            else result.overdue90Plus += amount;
        }

        return result;
    }

    async getOverdueReport() {
        const rows = await this.InvoiceModel.findAll({
            attributes: [
                "customer_id",
                [this.InvoiceModel.sequelize.fn("COUNT", "id"), "overdue_count"],
                [
                    this.InvoiceModel.sequelize.fn("SUM", this.InvoiceModel.sequelize.col("balance_amount")),
                    "total_overdue",
                ],
            ],
            where: {
                status: "OVERDUE",
                balance_amount: { [Op.gt]: 0 },
            },
            group: ["customer_id"],
            raw: true,
        });

        return rows.map(r => ({
            customerId: r.customer_id,
            overdueCount: Number(r.overdue_count),
            totalOverdue: Number(r.total_overdue),
        }));
    }

    async getTotalArReport() {
        const rows = await this.InvoiceModel.findAll({
            attributes: [
                "customer_id",
                [this.InvoiceModel.sequelize.fn("COUNT", "id"), "invoice_count"],
                [
                    this.InvoiceModel.sequelize.fn("SUM", this.InvoiceModel.sequelize.col("balance_amount")),
                    "total_ar",
                ],
            ],
            where: {
                balance_amount: { [Op.gt]: 0 },
            },
            group: ["customer_id"],
            raw: true,
        });

        return rows.map(r => ({
            customerId: r.customer_id,
            invoiceCount: Number(r.invoice_count),
            totalAr: Number(r.total_ar),
        }));
    }

    async Transaction(fn) {
        const tx = await sequelize.transaction();
        try {
            const result = await fn(tx);
            await tx.commit();
        } catch (error) {
            await tx.rollback();
            throw error;
        }
    }

    async findByIdForUpdate(id, tx) {
        const row = await this.InvoiceModel.findByPk(id, {
            transaction: tx,
            lock: tx.LOCK.UPDATE,
        });
        return row ? this._mapRowToEntity(row) : null;
    }


    async findUnpaid() {
        const rows = await this.InvoiceModel.findAll({
            where: {
                balance_amount: { [Op.gt]: 0 },
                status: { [Op.in]: ["PENDING", "OVERDUE"] },
            },
            order: [["due_date", "ASC"]],
        });

        return rows.map(row => this._mapRowToEntity(row));
    }

    _mapRowToEntity(row) {
        return new Invoice({
            id: row.id,
            customer_id: row.customer_id,
            invoice_number: row.invoice_number,
            issue_date: row.issue_date,
            due_date: row.due_date,
            total_amount: row.total_amount,
            paid_amount: row.paid_amount,
            status: InvoiceStatus.fromString(row.status),
            created_by: row.created_by,
            created_at: row.created_at,
            updated_at: row.updated_at,
        });
    }
}
