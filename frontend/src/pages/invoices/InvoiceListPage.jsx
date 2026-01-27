import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEye, FiEdit2, FiXCircle, FiDollarSign, FiFilter } from 'react-icons/fi';

import {
    fetchInvoices,
    cancelInvoice,
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

    // Handle cancel (was delete)
    const handleCancel = async () => {
        if (!deleteModal.invoice) return;

        try {
            await dispatch(cancelInvoice(deleteModal.invoice.id)).unwrap();
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
            key: 'invoiceNumber',
            header: 'Mã HĐ',
            sortable: true,
            width: '150px',
            render: (value, row) => (
                <Link
                    to={`/invoices/${row.id}`}
                    className="font-semibold text-[var(--color-primary)] hover:underline"
                >
                    {value || row.id}
                </Link>
            )
        },
        {
            key: 'customerId',
            header: 'Mã KH',
            sortable: true,
            width: '200px',
            render: (value) => (
                <span className="font-mono text-sm">{value}</span>
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
                            <div
                                className="text-xs"
                                style={{ color: aging.bucket.color }}
                            >
                                {aging.label}
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'totalAmount',
            header: 'Tổng tiền',
            sortable: true,
            width: '130px',
            render: (value) => (
                <span className="font-mono font-medium">
                    {formatCurrency(value)}
                </span>
            )
        },
        {
            key: 'balanceAmount',
            header: 'Còn lại',
            sortable: true,
            width: '130px',
            render: (value) => (
                <span className={`font-mono font-semibold ${value > 0 ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]'}`}>
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
                <div className="flex gap-1">
                    <button
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${row.id}`); }}
                        title="Xem chi tiết"
                    >
                        <FiEye className="w-4 h-4" />
                    </button>

                    {row.status !== INVOICE_STATUS.PAID && row.status !== INVOICE_STATUS.CANCELLED && (
                        <>
                            <button
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${row.id}/edit`); }}
                                title="Chỉnh sửa"
                            >
                                <FiEdit2 className="w-4 h-4" />
                            </button>

                            <button
                                className="p-2 rounded-lg hover:bg-green-50 transition-colors text-[var(--color-success)]"
                                onClick={(e) => { e.stopPropagation(); setPaymentModal({ open: true, invoice: row }); }}
                                title="Ghi nhận thanh toán"
                            >
                                <FiDollarSign className="w-4 h-4" />
                            </button>
                        </>
                    )}

                    {row.status !== INVOICE_STATUS.PAID && row.status !== INVOICE_STATUS.CANCELLED && (
                        <button
                            className="p-2 rounded-lg hover:bg-orange-50 transition-colors text-orange-500"
                            onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, invoice: row }); }}
                            title="Hủy hóa đơn"
                        >
                            <FiXCircle className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Danh sách Hóa đơn"
                subtitle={`Tổng cộng ${pagination.total} hóa đơn`}
                actions={
                    <Link to="/invoices/new" className="btn flex items-center gap-2">
                        <FiPlus /> Tạo hóa đơn
                    </Link>
                }
            />

            {/* Filter Bar */}
            <div className="card">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                            placeholder="Tìm kiếm theo mã HĐ, khách hàng..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] min-w-[160px]"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        {INVOICE_STATUS_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Toggle Advanced Filters */}
                    <button
                        className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${showFilters
                            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                            : 'border-gray-300 hover:bg-gray-50'
                            }`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter /> Bộ lọc
                    </button>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-600">Từ ngày:</label>
                            <input
                                type="date"
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                value={filters.startDate || ''}
                                onChange={(e) => handleFilterChange('startDate', e.target.value || null)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-600">Đến ngày:</label>
                            <input
                                type="date"
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                value={filters.endDate || ''}
                                onChange={(e) => handleFilterChange('endDate', e.target.value || null)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Data Table */}
            <div className="card !p-0 overflow-hidden">
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

            {/* Cancel Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, invoice: null })}
                onConfirm={handleCancel}
                title="Hủy hóa đơn"
                message={
                    deleteModal.invoice && (
                        <p>
                            Bạn có chắc chắn muốn hủy hóa đơn <strong>{deleteModal.invoice.id}</strong>?
                            <br />
                            <span className="text-gray-500">Hành động này sẽ chuyển trạng thái sang Đã hủy.</span>
                        </p>
                    )
                }
                confirmText="Hủy bỏ"
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
