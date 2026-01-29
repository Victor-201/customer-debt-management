import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiEdit2, FiDollarSign, FiXCircle, FiPrinter, FiArrowLeft, FiMail, FiCheckCircle } from 'react-icons/fi';

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
            alert('Đã gửi hóa đơn thành công!');
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
                <div className="fc-card text-center p-8">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiXCircle className="w-8 h-8 text-red-500" />
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
                            className="fc-btn fc-btn--secondary"
                        >
                            <FiArrowLeft /> Quay lại
                        </button>
                        <Link
                            to="/invoices"
                            className="fc-btn fc-btn--primary"
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
        <div>
            {/* Page Header */}
            <div className="fc-page-header">
                <div className="fc-page-header__breadcrumb">
                    <Link to="/invoices">Hóa đơn</Link> / {invoice.id}
                </div>
                <div className="flex justify-between items-end flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="fc-page-header__title mb-0">{invoice.id}</h1>
                        <StatusTag status={invoice.status} />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {canSend && (
                            <button
                                className="fc-btn fc-btn--secondary"
                                onClick={handleSend}
                                disabled={processing}
                            >
                                <FiMail /> Gửi hóa đơn
                            </button>
                        )}

                        {canRecordPayment && (
                            <button
                                className="fc-btn fc-btn--success"
                                onClick={() => setPaymentModal(true)}
                            >
                                <FiDollarSign /> Ghi nhận thanh toán
                            </button>
                        )}

                        {canEdit && (
                            <Link
                                to={`/invoices/${id}/edit`}
                                className="fc-btn fc-btn--secondary"
                            >
                                <FiEdit2 /> Chỉnh sửa
                            </Link>
                        )}

                        {canCancel && (
                            <button
                                className="fc-btn fc-btn--danger"
                                onClick={() => setCancelModal(true)}
                            >
                                <FiXCircle /> Hủy
                            </button>
                        )}

                        <button className="fc-btn fc-btn--secondary">
                            <FiPrinter /> In
                        </button>
                    </div>
                </div>
            </div>

            {/* Balance Summary */}
            <div className="mb-6">
                <InvoiceBalanceSummary
                    total={invoice.totalAmount}
                    paidAmount={invoice.paidAmount}
                    balance={invoice.balanceAmount}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
                {/* Main Content */}
                <div className="space-y-6">
                    {/* Invoice Details */}
                    <div className="fc-card">
                        <div className="fc-card__header">
                            <h3 className="fc-card__title">Thông tin hóa đơn</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-semibold">Khách hàng</p>
                                <p className="font-semibold text-lg text-gray-900">{invoice.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-semibold">Mã hóa đơn</p>
                                <p className="font-mono font-medium text-gray-900">{invoice.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-semibold">Ngày tạo</p>
                                <p className="text-gray-900">{formatDate(invoice.issueDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-semibold">Hạn thanh toán</p>
                                <p>
                                    <span className="text-gray-900">{formatDate(invoice.dueDate)}</span>
                                    {invoice.status !== INVOICE_STATUS.PAID && invoice.status !== INVOICE_STATUS.CANCELLED && (
                                        <span
                                            className="ml-2 text-sm font-medium"
                                            style={{ color: aging.bucket.color }}
                                        >
                                            ({aging.label})
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {invoice.notes && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <p className="text-sm text-gray-500 mb-2 uppercase tracking-wider font-semibold">Ghi chú</p>
                                <div className="bg-gray-50 p-4 rounded-lg text-gray-700 italic border border-gray-100">
                                    {invoice.notes}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Line Items */}
                    <div className="fc-card">
                        <div className="fc-card__header">
                            <h3 className="fc-card__title">Chi tiết mặt hàng</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="fc-table">
                                <thead>
                                    <tr>
                                        <th className="text-left w-[40%]">Mô tả</th>
                                        <th className="text-right w-[15%]">SL</th>
                                        <th className="text-right w-[20%]">Đơn giá</th>
                                        <th className="text-right w-[25%]">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(invoice.items || []).map((item, index) => (
                                        <tr key={item.id || index}>
                                            <td className="font-medium">{item.description}</td>
                                            <td className="text-right">{item.quantity}</td>
                                            <td className="text-right font-mono text-gray-600">
                                                {formatCurrency(item.unitPrice)}
                                            </td>
                                            <td className="text-right font-mono font-semibold text-gray-900">
                                                {formatCurrency(item.quantity * item.unitPrice)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={3} className="text-right font-medium text-gray-600 pt-4">Tạm tính:</td>
                                        <td className="text-right font-mono pt-4 text-gray-900">
                                            {formatCurrency(subtotal)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="text-right font-medium text-gray-600 border-none pt-2">Thuế ({taxRate}%):</td>
                                        <td className="text-right font-mono border-none pt-2 text-gray-900">
                                            {formatCurrency(taxAmount)}
                                        </td>
                                    </tr>
                                    <tr className="border-none">
                                        <td colSpan={3} className="text-right font-bold text-lg pt-4 border-none">
                                            Tổng cộng:
                                        </td>
                                        <td className="text-right font-mono font-bold text-xl text-blue-700 pt-4 border-none">
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
                    <div className="fc-card sticky top-6">
                        <div className="fc-card__header">
                            <h3 className="fc-card__title">Lịch sử thanh toán</h3>
                        </div>

                        {payments.length === 0 ? (
                            <div className="py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <p className="text-gray-500 text-sm">Chưa có thanh toán nào</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {payments.map(payment => (
                                    <div
                                        key={payment.id}
                                        className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-100 transition-colors"
                                    >
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium text-sm text-gray-700">{payment.id}</span>
                                            <span className="font-mono font-bold text-green-600">
                                                +{formatCurrency(payment.amount)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 flex justify-between">
                                            <span>{formatDate(payment.paymentDate)}</span>
                                            <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                                                {getPaymentMethodLabel(payment.paymentMethod)}
                                            </span>
                                        </div>
                                        {payment.note && (
                                            <p className="text-xs text-gray-400 mt-2 italic border-t border-gray-200 pt-1">
                                                {payment.note}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Total Paid */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex justify-between mb-2">
                                <span className="font-semibold text-gray-700">Đã thanh toán:</span>
                                <span className="font-mono font-bold text-green-600">
                                    {formatCurrency(invoice.paidAmount)}
                                </span>
                            </div>

                            {extractAmount(invoice.balanceAmount) > 0 && (
                                <div className="flex justify-between items-center bg-red-50 p-3 rounded-lg border border-red-100">
                                    <span className="font-bold text-red-700 text-sm">CÒN PHẢI TRẢ:</span>
                                    <span className="font-mono font-bold text-red-600 text-lg">
                                        {formatCurrency(invoice.balanceAmount)}
                                    </span>
                                </div>
                            )}
                        </div>
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
