import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatCurrency } from '../utils/money.util.js';
import { formatDateForInput, today } from '../utils/date.util.js';
import { PAYMENT_METHOD_OPTIONS } from '../constants/paymentTerms.js';
import { createPayment, selectPaymentsSaving, selectPaymentsError, clearError } from '../store/payment.slice.js';
import { updateInvoiceInList } from '../store/invoice.slice.js';

/**
 * PaymentModal Component
 * Modal for recording a payment against an invoice
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.invoice - Invoice to record payment for
 * @param {Function} props.onSuccess - Success callback
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

    const [formData, setFormData] = useState({
        amount: '',
        paymentMethod: 'BANK_TRANSFER',
        paymentDate: today(),
        reference: '',
        note: ''
    });

    const [formErrors, setFormErrors] = useState({});

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen && invoice) {
            setFormData({
                amount: invoice.balance.toString(),
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

        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Validate form
    const validate = () => {
        const errors = {};
        const amount = parseFloat(formData.amount);

        if (!formData.amount || isNaN(amount) || amount <= 0) {
            errors.amount = 'Số tiền phải lớn hơn 0';
        } else if (amount > invoice.balance) {
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
                paymentMethod: formData.paymentMethod,
                paymentDate: formData.paymentDate,
                reference: formData.reference,
                note: formData.note
            })).unwrap();

            // Update invoice in list
            if (result.invoice) {
                dispatch(updateInvoiceInList(result.invoice));
            }

            onSuccess && onSuccess(result);
            onClose();
        } catch (err) {
            // Error is handled by Redux
            console.error('Payment failed:', err);
        }
    };

    // Quick fill buttons
    const handleQuickFill = (percentage) => {
        const amount = (invoice.balance * percentage / 100).toFixed(0);
        setFormData(prev => ({ ...prev, amount }));
    };

    if (!isOpen || !invoice) return null;

    return (
        <div className="modal-overlay" onClick={saving ? undefined : onClose}>
            <div className="modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Ghi nhận thanh toán</h3>
                    <button
                        className="modal-close"
                        onClick={onClose}
                        disabled={saving}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* Invoice Info */}
                        <div style={{
                            backgroundColor: 'var(--color-neutral-50)',
                            padding: 'var(--spacing-4)',
                            borderRadius: 'var(--radius-lg)',
                            marginBottom: 'var(--spacing-4)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-2)' }}>
                                <span className="text-secondary">Hóa đơn:</span>
                                <span className="font-semibold">{invoice.id}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-2)' }}>
                                <span className="text-secondary">Khách hàng:</span>
                                <span>{invoice.customerName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="text-secondary">Số dư còn lại:</span>
                                <span className="font-bold text-danger">{formatCurrency(invoice.balance)}</span>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div style={{
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                padding: 'var(--spacing-3)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--spacing-4)'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Amount */}
                        <div className="form-group">
                            <label className="form-label">Số tiền thanh toán *</label>
                            <input
                                type="number"
                                name="amount"
                                className={`form-input ${formErrors.amount ? 'error' : ''}`}
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="Nhập số tiền"
                                min="0"
                                max={invoice.balance}
                                step="1000"
                            />
                            {formErrors.amount && <p className="form-error">{formErrors.amount}</p>}

                            {/* Quick fill buttons */}
                            <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)' }}>
                                <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleQuickFill(25)}>25%</button>
                                <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleQuickFill(50)}>50%</button>
                                <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleQuickFill(75)}>75%</button>
                                <button type="button" className="btn btn-sm btn-primary" onClick={() => handleQuickFill(100)}>100%</button>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="form-group">
                            <label className="form-label">Phương thức thanh toán *</label>
                            <select
                                name="paymentMethod"
                                className={`form-select ${formErrors.paymentMethod ? 'error' : ''}`}
                                value={formData.paymentMethod}
                                onChange={handleChange}
                            >
                                {PAYMENT_METHOD_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {formErrors.paymentMethod && <p className="form-error">{formErrors.paymentMethod}</p>}
                        </div>

                        {/* Payment Date */}
                        <div className="form-group">
                            <label className="form-label">Ngày thanh toán *</label>
                            <input
                                type="date"
                                name="paymentDate"
                                className={`form-input ${formErrors.paymentDate ? 'error' : ''}`}
                                value={formData.paymentDate}
                                onChange={handleChange}
                            />
                            {formErrors.paymentDate && <p className="form-error">{formErrors.paymentDate}</p>}
                        </div>

                        {/* Reference */}
                        <div className="form-group">
                            <label className="form-label">Số tham chiếu</label>
                            <input
                                type="text"
                                name="reference"
                                className="form-input"
                                value={formData.reference}
                                onChange={handleChange}
                                placeholder="Mã giao dịch, số phiếu thu..."
                            />
                        </div>

                        {/* Note */}
                        <div className="form-group">
                            <label className="form-label">Ghi chú</label>
                            <textarea
                                name="note"
                                className="form-textarea"
                                value={formData.note}
                                onChange={handleChange}
                                placeholder="Ghi chú thêm..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn btn-success"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="loading-spinner" style={{ width: '16px', height: '16px' }}></span>
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
