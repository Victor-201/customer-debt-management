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
            // Refresh list
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
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    // Table columns
    const columns = [
        {
            key: 'id',
            header: 'Mã phiếu thu',
            sortable: true,
            width: '130px',
            render: (value) => (
                <span style={{ fontWeight: 600 }}>{value}</span>
            )
        },
        {
            key: 'invoiceId',
            header: 'Hóa đơn',
            sortable: true,
            width: '130px',
            render: (value) => (
                <Link
                    to={`/invoices/${value}`}
                    style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    {value} <FiExternalLink size={12} />
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
            key: 'paymentDate',
            header: 'Ngày thanh toán',
            sortable: true,
            width: '130px',
            render: (value) => formatDate(value)
        },
        {
            key: 'paymentMethod',
            header: 'Phương thức',
            width: '130px',
            render: (value) => (
                <span
                    style={{
                        padding: 'var(--spacing-1) var(--spacing-2)',
                        backgroundColor: 'var(--color-neutral-100)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-sm)'
                    }}
                >
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
                <span
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        color: 'var(--color-success)'
                    }}
                >
                    +{formatCurrency(value)}
                </span>
            )
        },
        {
            key: 'reference',
            header: 'Tham chiếu',
            width: '130px',
            render: (value) => (
                <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
                    {value || '-'}
                </span>
            )
        }
    ];

    return (
        <div>
            <PageHeader
                title="Lịch sử thanh toán"
                subtitle={`Tổng cộng ${pagination.total} phiếu thu`}
                actions={
                    <div
                        style={{
                            padding: 'var(--spacing-2) var(--spacing-4)',
                            backgroundColor: 'var(--color-success)',
                            color: 'white',
                            borderRadius: 'var(--radius-lg)',
                            fontWeight: 600
                        }}
                    >
                        <FiDollarSign style={{ marginRight: 'var(--spacing-1)' }} />
                        Tổng thu: {formatCurrency(totalAmount)}
                    </div>
                }
            />

            {/* Summary Cards */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 'var(--spacing-4)',
                    marginBottom: 'var(--spacing-6)'
                }}
            >
                {PAYMENT_METHOD_OPTIONS.map(method => {
                    const methodPayments = payments.filter(p => p.paymentMethod === method.value);
                    const methodTotal = methodPayments.reduce((sum, p) => sum + p.amount, 0);

                    return (
                        <div key={method.value} className="card" style={{ padding: 'var(--spacing-4)' }}>
                            <p className="text-sm text-secondary mb-1">{method.label}</p>
                            <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                {formatCurrency(methodTotal)}
                            </p>
                            <p className="text-sm text-muted">{methodPayments.length} phiếu thu</p>
                        </div>
                    );
                })}
            </div>

            {/* Filter Bar */}
            <div className="card mb-6">
                <div className="filter-bar">
                    {/* Search */}
                    <div className="filter-group" style={{ flex: 1 }}>
                        <input
                            type="text"
                            className="form-input search-input"
                            placeholder="Tìm kiếm theo mã phiếu, mã HĐ, khách hàng..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    {/* Payment Method Filter */}
                    <div className="filter-group">
                        <select
                            className="form-select"
                            value={filters.paymentMethod || ''}
                            onChange={(e) => handleFilterChange('paymentMethod', e.target.value || null)}
                            style={{ minWidth: '160px' }}
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
                            <span className="text-secondary">
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
