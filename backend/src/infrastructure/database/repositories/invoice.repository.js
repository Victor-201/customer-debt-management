import { Op } from "sequelize";
import Invoice from "../../../domain/entities/Invoice.js";
import InvoiceItem from "../../../domain/entities/InvoiceItem.js";
import { InvoiceStatus } from "../../../domain/value-objects/InvoiceStatus.js";
import InvoiceRepositoryInterface from "../../../application/interfaces/repositories/invoice.repository.interface.js";

export default class InvoiceRepository extends InvoiceRepositoryInterface {
    constructor({ InvoiceModel, InvoiceItemModel, CustomerModel }) {
        super();
        this.InvoiceModel = InvoiceModel;
        this.InvoiceItemModel = InvoiceItemModel;
        this.CustomerModel = CustomerModel;
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

        const itemValues = invoice.items.map(item => ({
            id: item.id ?? undefined,
            invoice_id: invoice.id, // Will be set after invoice creation if new
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice.amount,
            total_price: item.totalPrice.amount,
        }));

        let row;

        if (!invoice.id) {
            // New Invoice
            row = await this.InvoiceModel.create(values, { transaction: tx });

            // Assign new invoice ID to items
            const newItemValues = itemValues.map(iv => ({ ...iv, invoice_id: row.id }));
            await this.InvoiceItemModel.bulkCreate(newItemValues, { transaction: tx });

        } else {
            // Update Invoice
            await this.InvoiceModel.update(
                {
                    ...values,
                    updated_at: new Date(),
                },
                { where: { id: invoice.id }, transaction: tx }
            );

            // Replace items (Simplest strategy for document-like edit)
            await this.InvoiceItemModel.destroy({ where: { invoice_id: invoice.id }, transaction: tx });
            const newItemValues = itemValues.map(iv => ({ ...iv, id: undefined, invoice_id: invoice.id })); // Reset item IDs to gen new ones
            await this.InvoiceItemModel.bulkCreate(newItemValues, { transaction: tx });

            row = await this.InvoiceModel.findByPk(invoice.id, {
                include: [{ model: this.InvoiceItemModel, as: 'items' }]
            });
        }

        return row ? this._mapRowToEntity(row) : null;
    }

    async findById(id) {
        // Build include array
        const include = [{ model: this.InvoiceItemModel, as: 'items' }];
        
        // Include customer if available
        if (this.CustomerModel) {
            include.push({ 
                model: this.CustomerModel, 
                as: 'customer',
                attributes: ['id', 'name', 'email', 'phone']
            });
        }
        
        const row = await this.InvoiceModel.findByPk(id, { include });
        return row ? this._mapRowToEntityWithCustomer(row) : null;
    }

    async findByInvoiceNumber(invoiceNumber) {
        const row = await this.InvoiceModel.findOne({
            where: { invoice_number: invoiceNumber },
        });

        return row ? this._mapRowToEntity(row) : null;
    }

    /**
     * Update an invoice
     */
    async update(id, data) {
        const row = await this.InvoiceModel.findByPk(id);
        if (!row) {
            return null;
        }
        
        // Map camelCase to snake_case for database
        const dbData = {};
        if (data.status !== undefined) dbData.status = data.status;
        if (data.paidAmount !== undefined) dbData.paid_amount = data.paidAmount;
        if (data.balanceAmount !== undefined) dbData.balance_amount = data.balanceAmount;
        if (data.dueDate !== undefined) dbData.due_date = data.dueDate;
        if (data.issueDate !== undefined) dbData.issue_date = data.issueDate;
        if (data.totalAmount !== undefined) dbData.total_amount = data.totalAmount;
        
        await row.update(dbData);
        
        // Refetch with items to return complete entity
        const updatedRow = await this.InvoiceModel.findByPk(id, {
            include: [{ model: this.InvoiceItemModel, as: 'items' }]
        });
        
        return updatedRow ? this._mapRowToEntity(updatedRow) : null;
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

    /**
     * Find all invoices with pagination, filtering, and sorting
     */
    async findAll({ status, search, sortBy, sortOrder, page, limit, customerId }) {
        const where = {};

        // Filter by status
        if (status) {
            where.status = status;
        }

        // Filter by customer
        if (customerId) {
            where.customer_id = customerId;
        }

        // Search by invoice number
        if (search) {
            where.invoice_number = { [Op.iLike]: `%${search}%` };
        }

        // Map frontend sortBy to database columns
        const sortFieldMap = {
            createdAt: 'created_at',
            issueDate: 'issue_date',
            dueDate: 'due_date',
            totalAmount: 'total_amount',
            balanceAmount: 'balance_amount',
            invoiceNumber: 'invoice_number',
        };

        const orderField = sortFieldMap[sortBy] || 'created_at';
        const orderDirection = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const offset = (page - 1) * limit;

        // Build include array conditionally based on CustomerModel availability
        const include = [];
        if (this.CustomerModel) {
            include.push({
                model: this.CustomerModel,
                as: 'customer',
                attributes: ['id', 'name', 'email', 'phone']
            });
        }

        const { count, rows } = await this.InvoiceModel.findAndCountAll({
            where,
            include,
            order: [[orderField, orderDirection]],
            limit,
            offset,
        });

        return {
            data: rows.map(row => this._mapRowToEntityWithCustomer(row)),
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
        };
    }


    /**
     * Get invoice summary statistics
     */
    async getSummary() {
        try {
            const [result] = await this.InvoiceModel.sequelize.query(`
                SELECT 
                    COUNT(*) as total_count,
                    COUNT(*) FILTER (WHERE status = 'PENDING') as pending_count,
                    COUNT(*) FILTER (WHERE status = 'PAID') as paid_count,
                    COUNT(*) FILTER (WHERE status = 'OVERDUE') as overdue_count,
                    COALESCE(SUM(total_amount), 0) as total_amount,
                    COALESCE(SUM(paid_amount), 0) as total_paid,
                    COALESCE(SUM(balance_amount), 0) as total_balance,
                    COALESCE(SUM(balance_amount) FILTER (WHERE status = 'OVERDUE'), 0) as overdue_amount
                FROM invoices
            `);

            const summary = result[0] || {};

            return {
                totalCount: parseInt(summary.total_count || 0, 10),
                pendingCount: parseInt(summary.pending_count || 0, 10),
                paidCount: parseInt(summary.paid_count || 0, 10),
                overdueCount: parseInt(summary.overdue_count || 0, 10),
                totalAmount: parseFloat(summary.total_amount || 0),
                totalPaid: parseFloat(summary.total_paid || 0),
                totalBalance: parseFloat(summary.total_balance || 0),
                overdueAmount: parseFloat(summary.overdue_amount || 0),
            };
        } catch (error) {
            console.error('Invoice summary query error:', error);
            throw error;
        }
    }

    _mapRowToEntity(row) {
        const items = row.items ? row.items.map(i => ({
            id: i.id,
            invoiceId: i.invoice_id,
            description: i.description,
            quantity: i.quantity,
            unitPrice: Number(i.unit_price),
            totalPrice: Number(i.total_price),
            createdAt: i.created_at,
            updatedAt: i.updated_at
        })) : [];

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
            items: items.map(i => new InvoiceItem(i))
        });
    }

    /**
     * Map row to entity with customer data included
     * Used for list views where customer name needs to be displayed
     */
    _mapRowToEntityWithCustomer(row) {
        const invoice = this._mapRowToEntity(row);
        const json = invoice.toJSON();

        // Add customer data if available from the join
        if (row.customer) {
            json.customerName = row.customer.name;
            json.customerEmail = row.customer.email;
            json.customerPhone = row.customer.phone;
        }

        return json;
    }
}

