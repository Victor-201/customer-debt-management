import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatCurrency } from '../utils/money.util.js';
import { formatDateForInput, today } from '../utils/date.util.js';
import { PAYMENT_METHOD_OPTIONS } from '../constants/paymentTerms.js';
import { createPayment, selectPaymentsSaving, selectPaymentsError, clearError } from '../store/payment.slice.js';
import { updateInvoiceInList } from '../store/invoice.slice.js';
import { selectUser } from '../store/auth.slice.js';

/**
 * PaymentModal Component
 * Modal for recording a payment against an invoice
 */
export const PaymentModal = ({
    isOpen,
    onClose,
    invoice,
    onSuccess
}) => {
    const dispatch = useDispatch();
    const saving = useSelector(selectPaymentsSaving);
    const error = useSelector(selectPaymentsError);
    const currentUser = useSelector(selectUser);

    const [formData, setFormData] = useState({
        amount: '',
        paymentMethod: 'BANK_TRANSFER',
        paymentDate: today(),
        reference: '',
        note: ''
    });

    const [formErrors, setFormErrors] = useState({});

    // Get balance amount safely (handle backend Money object structure)
    const getBalance = () => {
        if (!invoice) return 0;
        // Backend returns balanceAmount as { amount, formatted } or just a number
        if (typeof invoice.balanceAmount === 'object') {
            return invoice.balanceAmount?.amount ?? 0;
        }
        return invoice.balanceAmount ?? invoice.balance ?? 0;
    };

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen && invoice) {
            const balance = getBalance();
            setFormData({
                amount: balance.toString(),
                paymentMethod: 'BANK_TRANSFER',
                paymentDate: today(),
                reference: '',
                note: ''
            });
            setFormErrors({});
            dispatch(clearError());
        }
    }, [isOpen, invoice, dispatch]);

    // Handle escape key
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape' && !saving) {
            onClose();
        }
    }, [onClose, saving]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Validate form
    const validate = () => {
        const errors = {};
        const amount = parseFloat(formData.amount);

        const balance = getBalance();
        if (!formData.amount || isNaN(amount) || amount <= 0) {
            errors.amount = 'Số tiền phải lớn hơn 0';
        } else if (amount > balance) {
            errors.amount = 'Số tiền không được lớn hơn số dư còn lại';
        }

        if (!formData.paymentDate) {
            errors.paymentDate = 'Vui lòng chọn ngày thanh toán';
        }

        if (!formData.paymentMethod) {
            errors.paymentMethod = 'Vui lòng chọn phương thức';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            const result = await dispatch(createPayment({
                invoiceId: invoice.id,
                amount: parseFloat(formData.amount),
                method: formData.paymentMethod,
                paymentDate: formData.paymentDate,
                reference: formData.reference || undefined,
                recordedBy: currentUser?.id
            })).unwrap();

            if (result.invoice) {
                dispatch(updateInvoiceInList(result.invoice));
            }

            onSuccess && onSuccess(result);
            onClose();
        } catch (err) {
            console.error('Payment failed:', err);
        }
    };

    // Quick fill buttons
    const handleQuickFill = (percentage) => {
        const balance = getBalance();
        // Keep full precision for 100%, round to 2 decimals for partial payments
        const amount = percentage === 100
            ? balance.toString()
            : (balance * percentage / 100).toFixed(2);
        setFormData(prev => ({ ...prev, amount }));
    };

    if (!isOpen || !invoice) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={saving ? undefined : onClose}
        >
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-[500px]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Ghi nhận thanh toán</h3>
                    <button
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={onClose}
                        disabled={saving}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {/* Invoice Info */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Hóa đơn:</span>
                                <span className="font-semibold">{invoice.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Khách hàng:</span>
                                <span>{invoice.customerName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Số dư còn lại:</span>
                                <span className="font-bold text-[var(--color-error)]">{formatCurrency(getBalance())}</span>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền thanh toán *</label>
                            <input
                                type="number"
                                name="amount"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${formErrors.amount ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="Nhập số tiền"
                                min="0"
                                max={getBalance()}
                                step="any"
                            />
                            {formErrors.amount && <p className="text-red-500 text-sm mt-1">{formErrors.amount}</p>}

                            {/* Quick fill buttons */}
                            <div className="flex gap-2 mt-2">
                                <button
                                    type="button"
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition"
                                    onClick={() => handleQuickFill(25)}
                                >
                                    25%
                                </button>
                                <button
                                    type="button"
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition"
                                    onClick={() => handleQuickFill(50)}
                                >
                                    50%
                                </button>
                                <button
                                    type="button"
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition"
                                    onClick={() => handleQuickFill(75)}
                                >
                                    75%
                                </button>
                                <button
                                    type="button"
                                    className="px-3 py-1 text-sm bg-[var(--color-primary)] text-white rounded hover:opacity-90 transition"
                                    onClick={() => handleQuickFill(100)}
                                >
                                    100%
                                </button>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán *</label>
                            <select
                                name="paymentMethod"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${formErrors.paymentMethod ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                value={formData.paymentMethod}
                                onChange={handleChange}
                            >
                                {PAYMENT_METHOD_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {formErrors.paymentMethod && <p className="text-red-500 text-sm mt-1">{formErrors.paymentMethod}</p>}
                        </div>

                        {/* Payment Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thanh toán *</label>
                            <input
                                type="date"
                                name="paymentDate"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${formErrors.paymentDate ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                value={formData.paymentDate}
                                onChange={handleChange}
                            />
                            {formErrors.paymentDate && <p className="text-red-500 text-sm mt-1">{formErrors.paymentDate}</p>}
                        </div>

                        {/* Reference */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số tham chiếu</label>
                            <input
                                type="text"
                                name="reference"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                value={formData.reference}
                                onChange={handleChange}
                                placeholder="Mã giao dịch, số phiếu thu..."
                            />
                        </div>

                        {/* Note */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                            <textarea
                                name="note"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                value={formData.note}
                                onChange={handleChange}
                                placeholder="Ghi chú thêm..."
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[var(--color-success)] text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>Ghi nhận thanh toán</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
