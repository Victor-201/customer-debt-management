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
            {/* Page Header */}
            <div className="fc-page-header">
                <div className="fc-page-header__breadcrumb">Quản lý / Thanh toán</div>
                <div className="flex justify-between items-end flex-wrap gap-4">
                    <div>
                        <h1 className="fc-page-header__title">Lịch sử thanh toán</h1>
                        <p className="fc-page-header__subtitle">Tổng cộng {pagination.total} phiếu thu</p>
                    </div>
                    <div className="px-5 py-3 bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg">
                        <FiDollarSign />
                        Tổng thu: {formatCurrency(totalAmount)}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Card - Emerald Highlight */}
                <div className="bg-emerald-500 text-white rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="text-sm font-semibold opacity-90">Tổng thu</div>
                        <div className="p-1.5 bg-white/20 rounded-lg">
                            <FiDollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-bold tracking-tight">{formatCurrency(totalAmount)}</div>
                        <div className="text-xs font-medium mt-1 text-emerald-50">{pagination.total} phiếu thu</div>
                    </div>
                </div>

                {/* Method Cards */}
                {PAYMENT_METHOD_OPTIONS.slice(0, 3).map(method => {
                    const methodPayments = payments.filter(p => p.method === method.value);
                    const methodTotal = methodPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

                    return (
                        <div key={method.value} className="glass-card p-5">
                            <div className="text-sm font-medium text-gray-500">{method.label}</div>
                            <div className="mt-4">
                                <div className="text-2xl font-bold text-gray-800">
                                    {formatCurrency(methodTotal)}
                                </div>
                                <div className="text-xs font-medium mt-1 text-gray-400">
                                    {methodPayments.length} phiếu thu
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filter Bar */}
            <div className="glass-card p-4">
                <div className="flex flex-col md:flex-row items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            className="fc-input pl-10"
                            placeholder="Tìm kiếm theo mã phiếu, mã HĐ, khách hàng..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    {/* Payment Method Filter */}
                    <div className="w-full md:w-48">
                        <select
                            className="fc-input"
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
                    </div>

                    {/* Toggle Advanced Filters */}
                    <button
                        className={`fc-btn ${showFilters ? 'fc-btn--primary' : 'fc-btn--secondary'}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter /> Bộ lọc
                    </button>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-600">Từ ngày:</label>
                            <input
                                type="date"
                                className="fc-input"
                                value={filters.startDate || ''}
                                onChange={(e) => handleFilterChange('startDate', e.target.value || null)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-600">Đến ngày:</label>
                            <input
                                type="date"
                                className="fc-input"
                                value={filters.endDate || ''}
                                onChange={(e) => handleFilterChange('endDate', e.target.value || null)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Data Table */}
            <div className="glass-card overflow-hidden" style={{ padding: 0 }}>
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
