import Invoice from "../../../domain/entities/Invoice.js";
import { InvoiceStatus } from "../../../domain/value-objects/InvoiceStatus.js";

class InvoiceRepository {
    constructor({ execute }) {
        this.execute = execute;
    }

    async save(invoice) {
        const query = `
            INSERT INTO invoices (
                id, customer_id, invoice_number, issue_date, due_date,
                total_amount, paid_amount, balance_amount, status, created_by
            )
            VALUES (
                       COALESCE($1, gen_random_uuid()),
                       $2, $3, $4, $5,
                       $6, $7, $8, $9, $10
                   )
                ON CONFLICT (id)
      DO UPDATE SET
                customer_id    = EXCLUDED.customer_id,
                             invoice_number = EXCLUDED.invoice_number,
                             issue_date     = EXCLUDED.issue_date,
                             due_date       = EXCLUDED.due_date,
                             total_amount   = EXCLUDED.total_amount,
                             paid_amount    = EXCLUDED.paid_amount,
                             balance_amount = EXCLUDED.balance_amount,
                             status         = EXCLUDED.status,
                             updated_at     = CURRENT_TIMESTAMP
                             RETURNING *;
        `;

        const values = [
            invoice.id ?? null,
            invoice.customer_id,
            invoice.invoice_number,
            invoice.issue_date,
            invoice.due_date,

            invoice.total_amount.amount,
            invoice.paid_amount.amount,
            invoice.balance_amount.amount,

            // status is value-object
            invoice.status.value, // hoặc invoice.status.toString()

            invoice.created_by ?? null,
        ];

        const rows = await this.execute(query, values);
        return rows?.[0] ? this._mapRowToEntity(rows[0]) : null;
    }

    async findById(id) {
        const rows = await this.execute(`SELECT * FROM invoices WHERE id = $1`, [id]);
        return rows?.[0] ? this._mapRowToEntity(rows[0]) : null;
    }

    async findByInvoiceNumber(invoiceNumber) {
        const rows = await this.execute(
            `SELECT * FROM invoices WHERE invoice_number = $1`,
            [invoiceNumber]
        );
        return rows?.[0] ? this._mapRowToEntity(rows[0]) : null;
    }

    async findOutstandingByCustomer(customerId) {
        const rows = await this.execute(
            `
                SELECT * FROM invoices
                WHERE customer_id = $1
                  AND balance_amount > 0
                  AND status IN ('PENDING', 'OVERDUE')
                ORDER BY due_date ASC
            `,
            [customerId]
        );

        return (rows ?? []).map((r) => this._mapRowToEntity(r));
    }

    async markOverdueInvoices(currentDate = new Date()) {
        await this.execute(
            `
                UPDATE invoices
                SET status = 'OVERDUE', updated_at = CURRENT_TIMESTAMP
                WHERE status = 'PENDING'
                  AND balance_amount > 0
                  AND due_date < $1
            `,
            [currentDate]
        );
        return { success: true };
    }

    async getAgingReport() {
        // Postgres query to bucket by intervals
        // Intervals: 0-30, 31-60, 61-90, 90+
        // Based on due_date vs current_date
        const query = `
            WITH diffs AS (
                SELECT
                    balance_amount,
                    CURRENT_DATE - due_date::date AS days_overdue
                FROM invoices
                WHERE balance_amount > 0 AND status IN ('PENDING', 'OVERDUE', 'PAID')
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

        const rows = await this.execute(query);
        const row = rows[0];

        return {
            current: Number(row.coming_due || 0),
            overdue1To30: Number(row.range_0_30 || 0),
            overdue31To60: Number(row.range_31_60 || 0),
            overdue61To90: Number(row.range_61_90 || 0),
            overdue90Plus: Number(row.range_90_plus || 0),
            total: Number(row.total_outstanding || 0)
        };
    }

    async getOverdueReport() {
        // Find customers with overdue balance
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
        const rows = await this.execute(query);
        return rows.map(r => ({
            customerId: r.id,
            name: r.name,
            email: r.email,
            overdueCount: Number(r.overdue_count),
            totalOverdue: Number(r.total_overdue)
        }));
    }

    async getTotalArReport() {
        // All outstanding balance
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
        const rows = await this.execute(query);
        return rows.map(r => ({
            customerId: r.id,
            name: r.name,
            email: r.email,
            invoiceCount: Number(r.invoice_count),
            totalAr: Number(r.total_ar)
        }));
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

export default InvoiceRepository;
