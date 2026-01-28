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

import { formatCurrency, extractAmount } from '../../utils/money.util.js';
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
        dispatch(fetchInvoiceById(id));
        dispatch(fetchPaymentsByInvoice(id));
    };

    if (loading) {
        return <Loading fullPage text="Đang tải thông tin hóa đơn..." />;
    }

    if (!invoice) {
        return (
            <div className="max-w-lg mx-auto px-4 py-12">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Không tìm thấy hóa đơn
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Hóa đơn không tồn tại hoặc đã bị xóa.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <FiArrowLeft /> Quay lại
                        </button>
                        <Link
                            to="/invoices"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Danh sách hóa đơn
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Compute subtotal from items if not available from API
    const computedSubtotal = (invoice.items || []).reduce(
        (sum, item) => sum + (item.quantity * item.unitPrice),
        0
    );
    const subtotal = invoice.subtotal || computedSubtotal;
    const taxRate = invoice.taxRate || 0;
    const taxAmount = invoice.taxAmount || (subtotal * taxRate / 100);
    const total = invoice.total || invoice.totalAmount || (subtotal + taxAmount);


    const aging = getAgingInfo(invoice.dueDate);
    const canEdit = invoice.status === INVOICE_STATUS.DRAFT ||
        (invoice.status !== INVOICE_STATUS.PAID && invoice.status !== INVOICE_STATUS.CANCELLED);
    const canRecordPayment = invoice.status !== INVOICE_STATUS.PAID &&
        invoice.status !== INVOICE_STATUS.CANCELLED &&
        invoice.status !== INVOICE_STATUS.DRAFT;
    const canCancel = invoice.paidAmount === 0 && invoice.status !== INVOICE_STATUS.CANCELLED;
    const canSend = invoice.status === INVOICE_STATUS.DRAFT;

    return (
        <div className="space-y-6">
            <PageHeader
                title={
                    <div className="flex items-center gap-3">
                        <span>{invoice.id}</span>
                        <StatusTag status={invoice.status} />
                    </div>
                }
                breadcrumbs={[
                    { label: 'Hóa đơn', to: '/invoices' },
                    { label: invoice.id }
                ]}
                actions={
                    <div className="flex flex-wrap gap-2">
                        {canSend && (
                            <button
                                className="btn flex items-center gap-2"
                                onClick={handleSend}
                                disabled={processing}
                            >
                                <FiMail /> Gửi hóa đơn
                            </button>
                        )}

                        {canRecordPayment && (
                            <button
                                className="px-4 py-2 bg-[var(--color-success)] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                                onClick={() => setPaymentModal(true)}
                            >
                                <FiDollarSign /> Ghi nhận thanh toán
                            </button>
                        )}

                        {canEdit && (
                            <Link
                                to={`/invoices/${id}/edit`}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition"
                            >
                                <FiEdit2 /> Chỉnh sửa
                            </Link>
                        )}

                        {canCancel && (
                            <button
                                className="px-4 py-2 text-[var(--color-error)] hover:bg-red-50 rounded-lg flex items-center gap-2 transition"
                                onClick={() => setCancelModal(true)}
                            >
                                <FiXCircle /> Hủy
                            </button>
                        )}

                        <button className="px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition">
                            <FiPrinter /> In
                        </button>
                    </div>
                }
            />

            {/* Balance Summary */}
            <InvoiceBalanceSummary
                total={invoice.totalAmount}
                paidAmount={invoice.paidAmount}
                balance={invoice.balanceAmount}
            />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
                {/* Main Content */}
                <div className="space-y-6">
                    {/* Invoice Details */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Thông tin hóa đơn</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Khách hàng</p>
                                <p className="font-semibold">{invoice.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Mã hóa đơn</p>
                                <p className="font-semibold">{invoice.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Ngày tạo</p>
                                <p>{formatDate(invoice.issueDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Hạn thanh toán</p>
                                <p>
                                    {formatDate(invoice.dueDate)}
                                    {invoice.status !== INVOICE_STATUS.PAID && invoice.status !== INVOICE_STATUS.CANCELLED && (
                                        <span
                                            className="ml-2 text-sm"
                                            style={{ color: aging.bucket.color }}
                                        >
                                            ({aging.label})
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {invoice.notes && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500 mb-1">Ghi chú</p>
                                <p>{invoice.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Line Items */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Chi tiết hóa đơn</h3>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Mô tả</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 w-[100px]">SL</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 w-[150px]">Đơn giá</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 w-[150px]">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(invoice.items || []).map((item, index) => (
                                        <tr key={item.id || index} className="border-b border-gray-100">
                                            <td className="px-4 py-3">{item.description}</td>
                                            <td className="px-4 py-3 text-right">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right font-mono">
                                                {formatCurrency(item.unitPrice)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono font-medium">
                                                {formatCurrency(item.quantity * item.unitPrice)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-b border-gray-100">
                                        <td colSpan={3} className="px-4 py-3 text-right font-medium">Tạm tính:</td>
                                        <td className="px-4 py-3 text-right font-mono">
                                            {formatCurrency(subtotal)}
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td colSpan={3} className="px-4 py-3 text-right font-medium">Thuế ({taxRate}%):</td>
                                        <td className="px-4 py-3 text-right font-mono">
                                            {formatCurrency(taxAmount)}
                                        </td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td colSpan={3} className="px-4 py-3 text-right font-bold text-lg">
                                            Tổng cộng:
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-lg text-[var(--color-primary)]">
                                            {formatCurrency(total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Payment History */}
                <div>
                    <div className="card sticky top-4">
                        <h3 className="text-lg font-semibold mb-4">Lịch sử thanh toán</h3>

                        {payments.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-gray-500">Chưa có thanh toán nào</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {payments.map(payment => (
                                    <div
                                        key={payment.id}
                                        className="p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium">{payment.id}</span>
                                            <span className="font-mono font-semibold text-[var(--color-success)]">
                                                +{formatCurrency(payment.amount)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            <span>{formatDate(payment.paymentDate)}</span>
                                            <span> • </span>
                                            <span>{getPaymentMethodLabel(payment.paymentMethod)}</span>
                                        </div>
                                        {payment.note && (
                                            <p className="text-sm text-gray-400 mt-1">
                                                {payment.note}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Total Paid */}
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                            <span className="font-semibold">Tổng đã thanh toán:</span>
                            <span className="font-mono font-bold text-[var(--color-success)]">
                                {formatCurrency(invoice.paidAmount)}
                            </span>
                        </div>

                        {extractAmount(invoice.balanceAmount) > 0 && (
                            <div className="flex justify-between mt-2">
                                <span className="font-semibold">Còn lại:</span>
                                <span className="font-mono font-bold text-[var(--color-error)]">
                                    {formatCurrency(invoice.balanceAmount)}
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
                        <span className="text-gray-500">Hóa đơn đã hủy không thể khôi phục.</span>
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
