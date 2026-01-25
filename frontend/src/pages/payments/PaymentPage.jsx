import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiFilter, FiExternalLink } from 'react-icons/fi';

import {
    fetchPayments,
    deletePayment,
    setFilters,
    selectPayments,
    selectPaymentsLoading,
    selectPaymentsFilters,
    selectPaymentsPagination
} from '../../store/payment.slice.js';

import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/DataTable.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';

import { formatCurrency } from '../../utils/money.util.js';
import { formatDate } from '../../utils/date.util.js';
import { PAYMENT_METHOD_OPTIONS, getPaymentMethodLabel } from '../../constants/paymentTerms.js';

/**
 * PaymentPage
 * Displays list of all payments with filtering
 */
const PaymentPage = () => {
    const dispatch = useDispatch();

    const payments = useSelector(selectPayments);
    const loading = useSelector(selectPaymentsLoading);
    const filters = useSelector(selectPaymentsFilters);
    const pagination = useSelector(selectPaymentsPagination);

    // Local state
    const [deleteModal, setDeleteModal] = useState({ open: false, payment: null });
    const [showFilters, setShowFilters] = useState(false);

    // Fetch payments on mount and when filters change
    useEffect(() => {
        dispatch(fetchPayments({
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
        dispatch(fetchPayments({
            ...filters,
            page: newPage,
            limit: pagination.limit
        }));
    };

    // Handle delete (reverse payment)
    const handleDelete = async () => {
        if (!deleteModal.payment) return;

        try {
            await dispatch(deletePayment(deleteModal.payment.id)).unwrap();
            setDeleteModal({ open: false, payment: null });
            dispatch(fetchPayments({
                ...filters,
                page: pagination.page,
                limit: pagination.limit
            }));
        } catch (error) {
            alert('Lỗi: ' + error);
        }
    };

    // Calculate total amount
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Table columns
    const columns = [
        {
            key: 'id',
            header: 'Mã phiếu thu',
            sortable: true,
            width: '200px',
            render: (value) => (
                <span className="font-mono text-sm">{value}</span>
            )
        },
        {
            key: 'invoiceId',
            header: 'Mã HĐ',
            sortable: true,
            width: '200px',
            render: (value) => (
                <Link
                    to={`/invoices/${value}`}
                    className="text-[var(--color-primary)] hover:underline flex items-center gap-1 font-mono text-sm"
                >
                    {value} <FiExternalLink className="w-3 h-3" />
                </Link>
            )
        },
        {
            key: 'paymentDate',
            header: 'Ngày thanh toán',
            sortable: true,
            width: '130px',
            render: (value) => formatDate(value)
        },
        {
            key: 'method',
            header: 'Phương thức',
            width: '130px',
            render: (value) => (
                <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {getPaymentMethodLabel(value)}
                </span>
            )
        },
        {
            key: 'amount',
            header: 'Số tiền',
            sortable: true,
            width: '150px',
            render: (value) => (
                <span className="font-mono font-semibold text-[var(--color-success)]">
                    +{formatCurrency(value)}
                </span>
            )
        },
        {
            key: 'reference',
            header: 'Tham chiếu',
            width: '150px',
            render: (value) => (
                <span className="text-gray-500 text-sm">
                    {value || '-'}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Lịch sử thanh toán"
                subtitle={`Tổng cộng ${pagination.total} phiếu thu`}
                actions={
                    <div className="px-4 py-2 bg-[var(--color-success)] text-white rounded-lg font-semibold flex items-center gap-2">
                        <FiDollarSign />
                        Tổng thu: {formatCurrency(totalAmount)}
                    </div>
                }
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PAYMENT_METHOD_OPTIONS.map(method => {
                    const methodPayments = payments.filter(p => p.method === method.value);
                    const methodTotal = methodPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

                    return (
                        <div key={method.value} className="card">
                            <p className="text-sm text-gray-500 mb-1">{method.label}</p>
                            <p className="text-xl font-bold font-mono">
                                {formatCurrency(methodTotal)}
                            </p>
                            <p className="text-sm text-gray-400">{methodPayments.length} phiếu thu</p>
                        </div>
                    );
                })}
            </div>

            {/* Filter Bar */}
            <div className="card">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            placeholder="Tìm kiếm theo mã phiếu, mã HĐ, khách hàng..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    {/* Payment Method Filter */}
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] min-w-[160px]"
                        value={filters.paymentMethod || ''}
                        onChange={(e) => handleFilterChange('paymentMethod', e.target.value || null)}
                    >
                        <option value="">Tất cả phương thức</option>
                        {PAYMENT_METHOD_OPTIONS.map(option => (
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
                    data={payments}
                    loading={loading}
                    emptyMessage="Chưa có phiếu thu nào"
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
                onClose={() => setDeleteModal({ open: false, payment: null })}
                onConfirm={handleDelete}
                title="Hủy phiếu thu"
                message={
                    deleteModal.payment && (
                        <p>
                            Bạn có chắc chắn muốn hủy phiếu thu <strong>{deleteModal.payment.id}</strong>?
                            <br />
                            <span className="text-gray-500">
                                Số tiền {formatCurrency(deleteModal.payment.amount)} sẽ được hoàn lại vào số dư hóa đơn.
                            </span>
                        </p>
                    )
                }
                confirmText="Hủy phiếu thu"
                variant="danger"
            />
        </div>
    );
};

export default PaymentPage;
