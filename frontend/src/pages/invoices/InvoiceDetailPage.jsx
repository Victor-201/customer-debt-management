import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiEdit2, FiDollarSign, FiXCircle, FiPrinter, FiArrowLeft, FiMail } from 'react-icons/fi';

import {
    fetchInvoiceById,
    cancelInvoice,
    sendInvoice,
    clearCurrentInvoice,
    selectCurrentInvoice
} from '../../store/invoice.slice.js';
import {
    fetchPaymentsByInvoice,
    clearInvoicePayments,
    selectInvoicePayments
} from '../../store/payment.slice.js';

import PageHeader from '../../components/PageHeader.jsx';
import Loading from '../../components/Loading.jsx';
import StatusTag from '../../components/StatusTag.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import PaymentModal from '../../components/PaymentModal.jsx';
import { InvoiceBalanceSummary } from '../../components/BalanceCard.jsx';

import { formatCurrency } from '../../utils/money.util.js';
import { formatDate } from '../../utils/date.util.js';
import { getAgingInfo } from '../../utils/aging.util.js';
import { INVOICE_STATUS } from '../../constants/invoiceStatus.js';
import { getPaymentMethodLabel } from '../../constants/paymentTerms.js';

/**
 * InvoiceDetailPage
 * Display detailed information about an invoice
 */
const InvoiceDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const invoice = useSelector(selectCurrentInvoice);
    const payments = useSelector(selectInvoicePayments);

    const [loading, setLoading] = useState(true);
    const [cancelModal, setCancelModal] = useState(false);
    const [paymentModal, setPaymentModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Fetch invoice and payments
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                dispatch(fetchInvoiceById(id)),
                dispatch(fetchPaymentsByInvoice(id))
            ]);
            setLoading(false);
        };

        loadData();

        return () => {
            dispatch(clearCurrentInvoice());
            dispatch(clearInvoicePayments());
        };
    }, [dispatch, id]);

    // Handle cancel invoice
    const handleCancel = async () => {
        setProcessing(true);
        try {
            await dispatch(cancelInvoice(id)).unwrap();
            setCancelModal(false);
        } catch (error) {
            alert('Lỗi: ' + error);
        }
        setProcessing(false);
    };

    // Handle send invoice
    const handleSend = async () => {
        setProcessing(true);
        try {
            await dispatch(sendInvoice(id)).unwrap();
        } catch (error) {
            alert('Lỗi: ' + error);
        }
        setProcessing(false);
    };

    // Handle payment success
    const handlePaymentSuccess = () => {
        // Refresh data
        dispatch(fetchInvoiceById(id));
        dispatch(fetchPaymentsByInvoice(id));
    };

    if (loading) {
        return <Loading fullPage text="Đang tải thông tin hóa đơn..." />;
    }

    if (!invoice) {
        return (
            <div className="empty-state">
                <h2>Không tìm thấy hóa đơn</h2>
                <p className="text-secondary">Hóa đơn không tồn tại hoặc đã bị xóa.</p>
                <Link to="/invoices" className="btn btn-primary mt-4">
                    <FiArrowLeft /> Quay lại danh sách
                </Link>
            </div>
        );
    }

    const aging = getAgingInfo(invoice.dueDate);
    const canEdit = invoice.status === INVOICE_STATUS.DRAFT ||
        (invoice.status !== INVOICE_STATUS.PAID && invoice.status !== INVOICE_STATUS.CANCELLED);
    const canRecordPayment = invoice.status !== INVOICE_STATUS.PAID &&
        invoice.status !== INVOICE_STATUS.CANCELLED &&
        invoice.status !== INVOICE_STATUS.DRAFT;
    const canCancel = invoice.paidAmount === 0 && invoice.status !== INVOICE_STATUS.CANCELLED;
    const canSend = invoice.status === INVOICE_STATUS.DRAFT;

    return (
        <div>
            <PageHeader
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                        <span>{invoice.id}</span>
                        <StatusTag status={invoice.status} />
                    </div>
                }
                breadcrumbs={[
                    { label: 'Hóa đơn', to: '/invoices' },
                    { label: invoice.id }
                ]}
                actions={
                    <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                        {canSend && (
                            <button
                                className="btn btn-primary"
                                onClick={handleSend}
                                disabled={processing}
                            >
                                <FiMail /> Gửi hóa đơn
                            </button>
                        )}

                        {canRecordPayment && (
                            <button
                                className="btn btn-success"
                                onClick={() => setPaymentModal(true)}
                            >
                                <FiDollarSign /> Ghi nhận thanh toán
                            </button>
                        )}

                        {canEdit && (
                            <Link to={`/invoices/${id}/edit`} className="btn btn-secondary">
                                <FiEdit2 /> Chỉnh sửa
                            </Link>
                        )}

                        {canCancel && (
                            <button
                                className="btn btn-ghost"
                                onClick={() => setCancelModal(true)}
                                style={{ color: 'var(--color-danger)' }}
                            >
                                <FiXCircle /> Hủy
                            </button>
                        )}

                        <button className="btn btn-ghost">
                            <FiPrinter /> In
                        </button>
                    </div>
                }
            />

            {/* Balance Summary */}
            <div className="mb-6">
                <InvoiceBalanceSummary
                    total={invoice.total}
                    paidAmount={invoice.paidAmount}
                    balance={invoice.balance}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--spacing-6)' }}>
                {/* Main Content */}
                <div>
                    {/* Invoice Details */}
                    <div className="card mb-6">
                        <h3 className="card-title mb-4">Thông tin hóa đơn</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                            <div>
                                <p className="text-sm text-secondary mb-1">Khách hàng</p>
                                <p className="font-semibold">{invoice.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary mb-1">Mã hóa đơn</p>
                                <p className="font-semibold">{invoice.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary mb-1">Ngày tạo</p>
                                <p>{formatDate(invoice.issueDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary mb-1">Hạn thanh toán</p>
                                <p>
                                    {formatDate(invoice.dueDate)}
                                    {invoice.status !== INVOICE_STATUS.PAID && invoice.status !== INVOICE_STATUS.CANCELLED && (
                                        <span
                                            style={{
                                                marginLeft: 'var(--spacing-2)',
                                                fontSize: 'var(--font-size-sm)',
                                                color: aging.bucket.color
                                            }}
                                        >
                                            ({aging.label})
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {invoice.notes && (
                            <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border-light)' }}>
                                <p className="text-sm text-secondary mb-1">Ghi chú</p>
                                <p>{invoice.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Line Items */}
                    <div className="card mb-6">
                        <h3 className="card-title mb-4">Chi tiết hóa đơn</h3>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Mô tả</th>
                                        <th style={{ width: '100px', textAlign: 'right' }}>SL</th>
                                        <th style={{ width: '150px', textAlign: 'right' }}>Đơn giá</th>
                                        <th style={{ width: '150px', textAlign: 'right' }}>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item, index) => (
                                        <tr key={item.id || index}>
                                            <td>{item.description}</td>
                                            <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                                                {formatCurrency(item.unitPrice)}
                                            </td>
                                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                                                {formatCurrency(item.quantity * item.unitPrice)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: 'right', fontWeight: 500 }}>Tạm tính:</td>
                                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                                            {formatCurrency(invoice.subtotal)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: 'right', fontWeight: 500 }}>Thuế ({invoice.taxRate}%):</td>
                                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                                            {formatCurrency(invoice.taxAmount)}
                                        </td>
                                    </tr>
                                    <tr style={{ backgroundColor: 'var(--color-neutral-50)' }}>
                                        <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>
                                            Tổng cộng:
                                        </td>
                                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
                                            {formatCurrency(invoice.total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Payment History */}
                <div>
                    <div className="card" style={{ position: 'sticky', top: 'var(--spacing-4)' }}>
                        <h3 className="card-title mb-4">Lịch sử thanh toán</h3>

                        {payments.length === 0 ? (
                            <div className="empty-state" style={{ padding: 'var(--spacing-6)' }}>
                                <p className="text-secondary">Chưa có thanh toán nào</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                                {payments.map(payment => (
                                    <div
                                        key={payment.id}
                                        style={{
                                            padding: 'var(--spacing-3)',
                                            backgroundColor: 'var(--color-neutral-50)',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-1)' }}>
                                            <span className="font-medium">{payment.id}</span>
                                            <span
                                                style={{
                                                    fontFamily: 'var(--font-mono)',
                                                    fontWeight: 600,
                                                    color: 'var(--color-success)'
                                                }}
                                            >
                                                +{formatCurrency(payment.amount)}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                            <span>{formatDate(payment.paymentDate)}</span>
                                            <span> • </span>
                                            <span>{getPaymentMethodLabel(payment.paymentMethod)}</span>
                                        </div>
                                        {payment.note && (
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                                                {payment.note}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Total Paid */}
                        <div style={{
                            marginTop: 'var(--spacing-4)',
                            paddingTop: 'var(--spacing-4)',
                            borderTop: '1px solid var(--color-border-light)',
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                            <span className="font-semibold">Tổng đã thanh toán:</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-success)' }}>
                                {formatCurrency(invoice.paidAmount)}
                            </span>
                        </div>

                        {invoice.balance > 0 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: 'var(--spacing-2)'
                            }}>
                                <span className="font-semibold">Còn lại:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-danger)' }}>
                                    {formatCurrency(invoice.balance)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            <ConfirmModal
                isOpen={cancelModal}
                onClose={() => setCancelModal(false)}
                onConfirm={handleCancel}
                title="Hủy hóa đơn"
                message={
                    <p>
                        Bạn có chắc chắn muốn hủy hóa đơn <strong>{invoice.id}</strong>?
                        <br />
                        <span className="text-secondary">Hóa đơn đã hủy không thể khôi phục.</span>
                    </p>
                }
                confirmText="Hủy hóa đơn"
                variant="danger"
                loading={processing}
            />

            {/* Payment Modal */}
            <PaymentModal
                isOpen={paymentModal}
                onClose={() => setPaymentModal(false)}
                invoice={invoice}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default InvoiceDetailPage;
