import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiDollarSign, FiFilter } from 'react-icons/fi';

import {
    fetchInvoices,
    deleteInvoice,
    setFilters,
    selectInvoices,
    selectInvoicesLoading,
    selectInvoicesFilters,
    selectInvoicesPagination
} from '../../store/invoice.slice.js';

import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/DataTable.jsx';
import StatusTag from '../../components/StatusTag.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import PaymentModal from '../../components/PaymentModal.jsx';

import { formatCurrency } from '../../utils/money.util.js';
import { formatDate } from '../../utils/date.util.js';
import { getAgingInfo } from '../../utils/aging.util.js';
import { INVOICE_STATUS, INVOICE_STATUS_OPTIONS } from '../../constants/invoiceStatus.js';

/**
 * InvoiceListPage
 * Displays list of all invoices with filtering and actions
 */
const InvoiceListPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const invoices = useSelector(selectInvoices);
    const loading = useSelector(selectInvoicesLoading);
    const filters = useSelector(selectInvoicesFilters);
    const pagination = useSelector(selectInvoicesPagination);

    // Local state
    const [deleteModal, setDeleteModal] = useState({ open: false, invoice: null });
    const [paymentModal, setPaymentModal] = useState({ open: false, invoice: null });
    const [showFilters, setShowFilters] = useState(false);

    // Fetch invoices on mount and when filters change
    useEffect(() => {
        dispatch(fetchInvoices({
            ...filters,
            page: pagination.page,
            limit: pagination.limit
        }));
    }, [dispatch, filters, pagination.page]);

    // Handle filter change
    const handleFilterChange = (key, value) => {
        dispatch(setFilters({ [key]: value }));
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        dispatch(fetchInvoices({
            ...filters,
            page: newPage,
            limit: pagination.limit
        }));
    };

    // Handle delete
    const handleDelete = async () => {
        if (!deleteModal.invoice) return;

        try {
            await dispatch(deleteInvoice(deleteModal.invoice.id)).unwrap();
            setDeleteModal({ open: false, invoice: null });
        } catch (error) {
            alert('Lỗi: ' + error);
        }
    };

    // Handle payment success
    const handlePaymentSuccess = () => {
        // Refresh the list
        dispatch(fetchInvoices({
            ...filters,
            page: pagination.page,
            limit: pagination.limit
        }));
    };

    // Table columns
    const columns = [
        {
            key: 'id',
            header: 'Mã HĐ',
            sortable: true,
            width: '120px',
            render: (value, row) => (
                <Link
                    to={`/invoices/${row.id}`}
                    style={{ fontWeight: 600, color: 'var(--color-primary)' }}
                >
                    {value}
                </Link>
            )
        },
        {
            key: 'customerName',
            header: 'Khách hàng',
            sortable: true,
            render: (value) => (
                <span style={{ fontWeight: 500 }}>{value}</span>
            )
        },
        {
            key: 'issueDate',
            header: 'Ngày tạo',
            sortable: true,
            width: '110px',
            render: (value) => formatDate(value)
        },
        {
            key: 'dueDate',
            header: 'Hạn TT',
            sortable: true,
            width: '110px',
            render: (value, row) => {
                const aging = getAgingInfo(value);
                return (
                    <div>
                        <span>{formatDate(value)}</span>
                        {row.status !== INVOICE_STATUS.PAID && row.status !== INVOICE_STATUS.CANCELLED && aging.isOverdue && (
                            <div style={{ fontSize: 'var(--font-size-xs)', color: aging.bucket.color }}>
                                {aging.label}
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'total',
            header: 'Tổng tiền',
            sortable: true,
            width: '130px',
            render: (value) => (
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                    {formatCurrency(value)}
                </span>
            )
        },
        {
            key: 'balance',
            header: 'Còn lại',
            sortable: true,
            width: '130px',
            render: (value, row) => (
                <span
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        color: value > 0 ? 'var(--color-danger)' : 'var(--color-success)'
                    }}
                >
                    {formatCurrency(value)}
                </span>
            )
        },
        {
            key: 'status',
            header: 'Trạng thái',
            sortable: true,
            width: '140px',
            render: (value) => <StatusTag status={value} size="small" />
        },
        {
            key: 'actions',
            header: 'Thao tác',
            width: '150px',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: 'var(--spacing-1)' }}>
                    <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${row.id}`); }}
                        title="Xem chi tiết"
                    >
                        <FiEye />
                    </button>

                    {row.status !== INVOICE_STATUS.PAID && row.status !== INVOICE_STATUS.CANCELLED && (
                        <>
                            <button
                                className="btn btn-ghost btn-icon btn-sm"
                                onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${row.id}/edit`); }}
                                title="Chỉnh sửa"
                            >
                                <FiEdit2 />
                            </button>

                            <button
                                className="btn btn-ghost btn-icon btn-sm"
                                onClick={(e) => { e.stopPropagation(); setPaymentModal({ open: true, invoice: row }); }}
                                title="Ghi nhận thanh toán"
                                style={{ color: 'var(--color-success)' }}
                            >
                                <FiDollarSign />
                            </button>
                        </>
                    )}

                    {row.paidAmount === 0 && row.status !== INVOICE_STATUS.CANCELLED && (
                        <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, invoice: row }); }}
                            title="Xóa"
                            style={{ color: 'var(--color-danger)' }}
                        >
                            <FiTrash2 />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div>
            <PageHeader
                title="Danh sách Hóa đơn"
                subtitle={`Tổng cộng ${pagination.total} hóa đơn`}
                actions={
                    <Link to="/invoices/new" className="btn btn-primary">
                        <FiPlus /> Tạo hóa đơn
                    </Link>
                }
            />

            {/* Filter Bar */}
            <div className="card mb-6">
                <div className="filter-bar">
                    {/* Search */}
                    <div className="filter-group" style={{ flex: 1 }}>
                        <input
                            type="text"
                            className="form-input search-input"
                            placeholder="Tìm kiếm theo mã HĐ, khách hàng..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="filter-group">
                        <select
                            className="form-select"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            style={{ minWidth: '160px' }}
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            {INVOICE_STATUS_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Toggle Advanced Filters */}
                    <button
                        className={`btn btn-secondary ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter /> Bộ lọc
                    </button>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div style={{
                        display: 'flex',
                        gap: 'var(--spacing-4)',
                        marginTop: 'var(--spacing-4)',
                        paddingTop: 'var(--spacing-4)',
                        borderTop: '1px solid var(--color-border-light)'
                    }}>
                        <div className="filter-group">
                            <label className="form-label" style={{ marginBottom: 0 }}>Từ ngày:</label>
                            <input
                                type="date"
                                className="form-input"
                                value={filters.startDate || ''}
                                onChange={(e) => handleFilterChange('startDate', e.target.value || null)}
                            />
                        </div>
                        <div className="filter-group">
                            <label className="form-label" style={{ marginBottom: 0 }}>Đến ngày:</label>
                            <input
                                type="date"
                                className="form-input"
                                value={filters.endDate || ''}
                                onChange={(e) => handleFilterChange('endDate', e.target.value || null)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Data Table */}
            <div className="card" style={{ padding: 0 }}>
                <DataTable
                    columns={columns}
                    data={invoices}
                    loading={loading}
                    onRowClick={(row) => navigate(`/invoices/${row.id}`)}
                    emptyMessage="Chưa có hóa đơn nào"
                    pagination={{
                        page: pagination.page,
                        limit: pagination.limit,
                        total: pagination.total,
                        onPageChange: handlePageChange
                    }}
                />
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, invoice: null })}
                onConfirm={handleDelete}
                title="Xóa hóa đơn"
                message={
                    deleteModal.invoice && (
                        <p>
                            Bạn có chắc chắn muốn xóa hóa đơn <strong>{deleteModal.invoice.id}</strong>?
                            <br />
                            <span className="text-secondary">Hành động này không thể hoàn tác.</span>
                        </p>
                    )
                }
                confirmText="Xóa"
                variant="danger"
            />

            {/* Payment Modal */}
            <PaymentModal
                isOpen={paymentModal.open}
                onClose={() => setPaymentModal({ open: false, invoice: null })}
                invoice={paymentModal.invoice}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default InvoiceListPage;
