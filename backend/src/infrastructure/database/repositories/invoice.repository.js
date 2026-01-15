import { Op, QueryTypes } from "sequelize";
import InvoiceRepositoryInterface from "../../../application/interfaces/repositories/invoice.repository.interface.js";
import Invoice from "../../../domain/entities/Invoice.js";
import { InvoiceStatus } from "../../../domain/value-objects/InvoiceStatus.js";

export default class InvoiceRepository extends InvoiceRepositoryInterface {
    constructor({ InvoiceModel }) {
        super();
        if (!InvoiceModel) throw new Error("InvoiceRepository requires InvoiceModel");
        this.InvoiceModel = InvoiceModel;
        this.sequelize = InvoiceModel.sequelize;
    }

    async findById(id) {
        const row = await this.InvoiceModel.findByPk(id, { raw: true });
        return row ? this.#map(row) : null;
    }

    async findByInvoiceNumber(invoiceNumber) {
        const row = await this.InvoiceModel.findOne({
            where: { invoice_number: invoiceNumber },
            raw: true,
        });
        return row ? this.#map(row) : null;
    }

    async findOutstandingByCustomer(customerId) {
        const rows = await this.InvoiceModel.findAll({
            where: {
                customer_id: customerId,
                balance_amount: { [Op.gt]: 0 },
                status: { [Op.in]: ["PENDING", "OVERDUE"] },
            },
            order: [["due_date", "ASC"]],
            raw: true,
        });
        return (rows || []).map((r) => this.#map(r));
    }

    async create(invoice) {
        // hỗ trợ cả VO Money lẫn number
        const payload = {
            customer_id: invoice.customer_id,
            invoice_number: invoice.invoice_number,
            issue_date: invoice.issue_date,
            due_date: invoice.due_date,
            total_amount: invoice.total_amount?.amount ?? invoice.total_amount,
            paid_amount: invoice.paid_amount?.amount ?? invoice.paid_amount,
            balance_amount: invoice.balance_amount?.amount ?? invoice.balance_amount,
            status: invoice.status?.value ?? invoice.status,
            created_by: invoice.created_by ?? null,
        };

        const created = await this.InvoiceModel.create(payload);
        const row = created.get({ plain: true });
        return this.#map(row);
    }

    async update(id, payload = {}) {
        const updatePayload = {};

        if (payload.invoiceNumber !== undefined) updatePayload.invoice_number = payload.invoiceNumber;
        if (payload.issueDate !== undefined) updatePayload.issue_date = payload.issueDate;
        if (payload.dueDate !== undefined) updatePayload.due_date = payload.dueDate;

        if (payload.totalAmount !== undefined) updatePayload.total_amount = payload.totalAmount;
        if (payload.paidAmount !== undefined) updatePayload.paid_amount = payload.paidAmount;
        if (payload.balanceAmount !== undefined) updatePayload.balance_amount = payload.balanceAmount;
        if (payload.status !== undefined) updatePayload.status = payload.status;

        if (Object.keys(updatePayload).length === 0) return this.findById(id);

        updatePayload.updated_at = new Date();

        await this.InvoiceModel.update(updatePayload, { where: { id } });
        return this.findById(id);
    }

    async markOverdueInvoices(currentDate = new Date()) {
        // đổi các invoice quá hạn
        await this.InvoiceModel.update(
            { status: "OVERDUE", updated_at: new Date() },
            {
                where: {
                    status: "PENDING",
                    balance_amount: { [Op.gt]: 0 },
                    due_date: { [Op.lt]: currentDate },
                },
            }
        );
    }

    async getAgingReport() {
        // ✅ chỉ tính outstanding (PENDING/OVERDUE)
        const query = `
            WITH diffs AS (
                SELECT
                    balance_amount,
                    (CURRENT_DATE - due_date::date) AS days_overdue
                FROM invoices
                WHERE balance_amount > 0 AND status IN ('PENDING', 'OVERDUE')
            )
            SELECT
                SUM(CASE WHEN days_overdue <= 0 THEN balance_amount ELSE 0 END) as coming_due,
                SUM(CASE WHEN days_overdue > 0 AND days_overdue <= 30 THEN balance_amount ELSE 0 END) as range_0_30,
                SUM(CASE WHEN days_overdue > 30 AND days_overdue <= 60 THEN balance_amount ELSE 0 END) as range_31_60,
                SUM(CASE WHEN days_overdue > 60 AND days_overdue <= 90 THEN balance_amount ELSE 0 END) as range_61_90,
                SUM(CASE WHEN days_overdue > 90 THEN balance_amount ELSE 0 END) as range_90_plus,
                SUM(balance_amount) as total_outstanding
            FROM diffs;
        `;

        const rows = await this.sequelize.query(query, { type: QueryTypes.SELECT });
        const row = rows?.[0] ?? {};

        return {
            current: Number(row.coming_due || 0),
            overdue1To30: Number(row.range_0_30 || 0),
            overdue31To60: Number(row.range_31_60 || 0),
            overdue61To90: Number(row.range_61_90 || 0),
            overdue90Plus: Number(row.range_90_plus || 0),
            total: Number(row.total_outstanding || 0),
        };
    }

    async getOverdueReport() {
        const query = `
            SELECT
                c.id, c.name, c.email,
                COUNT(i.id) as overdue_count,
                SUM(i.balance_amount) as total_overdue
            FROM invoices i
                     JOIN customers c ON i.customer_id = c.id
            WHERE i.status = 'OVERDUE' AND i.balance_amount > 0
            GROUP BY c.id, c.name, c.email
            ORDER BY total_overdue DESC;
        `;

        const rows = await this.sequelize.query(query, { type: QueryTypes.SELECT });

        return (rows || []).map((r) => ({
            customerId: r.id,
            name: r.name,
            email: r.email,
            overdueCount: Number(r.overdue_count),
            totalOverdue: Number(r.total_overdue),
        }));
    }

    async getTotalArReport() {
        const query = `
            SELECT
                c.id, c.name, c.email,
                COUNT(i.id) as invoice_count,
                SUM(i.balance_amount) as total_ar
            FROM invoices i
                     JOIN customers c ON i.customer_id = c.id
            WHERE i.balance_amount > 0
            GROUP BY c.id, c.name, c.email
            ORDER BY total_ar DESC;
        `;

        const rows = await this.sequelize.query(query, { type: QueryTypes.SELECT });

        return (rows || []).map((r) => ({
            customerId: r.id,
            name: r.name,
            email: r.email,
            invoiceCount: Number(r.invoice_count),
            totalAr: Number(r.total_ar),
        }));
    }

    #map(row) {
        const total = Number(row.total_amount);
        const paid = Number(row.paid_amount);
        const balance = Number(row.balance_amount);

        return new Invoice({
            id: row.id,
            customer_id: row.customer_id,
            invoice_number: row.invoice_number,
            issue_date: row.issue_date,
            due_date: row.due_date,
            total_amount: Number.isFinite(total) ? total : 0,
            paid_amount: Number.isFinite(paid) ? paid : 0,
            balance_amount: Number.isFinite(balance) ? balance : 0,
            status: InvoiceStatus.fromString(row.status),
            created_by: row.created_by,
            created_at: row.created_at,
            updated_at: row.updated_at,
        });
    }
}
