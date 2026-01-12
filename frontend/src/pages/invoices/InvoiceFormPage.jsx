import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiSend, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

import {
    fetchInvoiceById,
    createInvoice,
    updateInvoice,
    sendInvoice,
    clearCurrentInvoice,
    selectCurrentInvoice,
    selectInvoicesSaving
} from '../../store/invoice.slice.js';
import { fetchCustomerOptions, selectCustomerOptions } from '../../store/customer.slice.js';

import PageHeader from '../../components/PageHeader.jsx';
import Loading from '../../components/Loading.jsx';

import { formatCurrency, calculateTotal, calculateTax } from '../../utils/money.util.js';
import { formatDateForInput, addDays, today } from '../../utils/date.util.js';
import { PAYMENT_TERMS_OPTIONS, getPaymentTermDays } from '../../constants/paymentTerms.js';
import { INVOICE_STATUS } from '../../constants/invoiceStatus.js';
import { mockCustomers } from '../../mocks/mockData.js';

/**
 * InvoiceFormPage
 * Create or edit an invoice
 */
const InvoiceFormPage = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const currentInvoice = useSelector(selectCurrentInvoice);
    const saving = useSelector(selectInvoicesSaving);
    const customerOptions = useSelector(selectCustomerOptions);

    // Form state
    const [formData, setFormData] = useState({
        customerId: '',
        customerName: '',
        issueDate: today(),
        paymentTerm: 'NET_30',
        dueDate: formatDateForInput(addDays(new Date(), 30)),
        items: [{ id: 1, description: '', quantity: 1, unitPrice: 0 }],
        taxRate: 10,
        notes: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(isEdit);

    // Fetch customer options
    useEffect(() => {
        dispatch(fetchCustomerOptions());
    }, [dispatch]);

    // If editing, load invoice data
    useEffect(() => {
        if (isEdit) {
            dispatch(fetchInvoiceById(id)).then((result) => {
                if (result.payload) {
                    const inv = result.payload;
                    setFormData({
                        customerId: inv.customerId,
                        customerName: inv.customerName,
                        issueDate: formatDateForInput(inv.issueDate),
                        paymentTerm: inv.paymentTerm || 'NET_30',
                        dueDate: formatDateForInput(inv.dueDate),
                        items: inv.items.length > 0 ? inv.items : [{ id: 1, description: '', quantity: 1, unitPrice: 0 }],
                        taxRate: inv.taxRate || 10,
                        notes: inv.notes || ''
                    });
                }
                setLoading(false);
            });
        }

        return () => {
            dispatch(clearCurrentInvoice());
        };
    }, [dispatch, id, isEdit]);

    // Calculate totals
    const calculations = useMemo(() => {
        const subtotal = calculateTotal(formData.items);
        const taxAmount = calculateTax(subtotal, formData.taxRate);
        const total = subtotal + taxAmount;

        return { subtotal, taxAmount, total };
    }, [formData.items, formData.taxRate]);

    // Handle customer change
    const handleCustomerChange = (e) => {
        const customerId = parseInt(e.target.value);
        const customer = mockCustomers.find(c => c.id === customerId);

        if (customer) {
            const paymentTerm = customer.paymentTerm || 'NET_30';
            const days = getPaymentTermDays(paymentTerm);

            setFormData(prev => ({
                ...prev,
                customerId,
                customerName: customer.name,
                paymentTerm,
                dueDate: formatDateForInput(addDays(new Date(prev.issueDate), days))
            }));
        }
    };

    // Handle payment term change
    const handlePaymentTermChange = (e) => {
        const paymentTerm = e.target.value;
        const days = getPaymentTermDays(paymentTerm);

        setFormData(prev => ({
            ...prev,
            paymentTerm,
            dueDate: formatDateForInput(addDays(new Date(prev.issueDate), days))
        }));
    };

    // Handle issue date change
    const handleIssueDateChange = (e) => {
        const issueDate = e.target.value;
        const days = getPaymentTermDays(formData.paymentTerm);

        setFormData(prev => ({
            ...prev,
            issueDate,
            dueDate: formatDateForInput(addDays(new Date(issueDate), days))
        }));
    };

    // Handle item change
    const handleItemChange = (index, field, value) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index] = {
                ...newItems[index],
                [field]: field === 'quantity' || field === 'unitPrice'
                    ? parseFloat(value) || 0
                    : value
            };
            return { ...prev, items: newItems };
        });
    };

    // Add item
    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                { id: Date.now(), description: '', quantity: 1, unitPrice: 0 }
            ]
        }));
    };

    // Remove item
    const removeItem = (index) => {
        if (formData.items.length <= 1) return;

        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    // Validate form
    const validate = () => {
        const newErrors = {};

        if (!formData.customerId) {
            newErrors.customerId = 'Vui lòng chọn khách hàng';
        }

        if (!formData.issueDate) {
            newErrors.issueDate = 'Vui lòng chọn ngày tạo';
        }

        if (!formData.dueDate) {
            newErrors.dueDate = 'Vui lòng chọn hạn thanh toán';
        }

        // Check items
        const itemErrors = formData.items.map((item, index) => {
            const err = {};
            if (!item.description.trim()) {
                err.description = 'Vui lòng nhập mô tả';
            }
            if (item.quantity <= 0) {
                err.quantity = 'Số lượng phải > 0';
            }
            if (item.unitPrice <= 0) {
                err.unitPrice = 'Đơn giá phải > 0';
            }
            return Object.keys(err).length > 0 ? err : null;
        });

        if (itemErrors.some(e => e !== null)) {
            newErrors.items = itemErrors;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle save (as draft)
    const handleSave = async (asDraft = true) => {
        if (!validate()) return;

        const invoiceData = {
            customerId: formData.customerId,
            customerName: formData.customerName,
            issueDate: formData.issueDate,
            paymentTerm: formData.paymentTerm,
            dueDate: formData.dueDate,
            items: formData.items,
            subtotal: calculations.subtotal,
            taxRate: formData.taxRate,
            taxAmount: calculations.taxAmount,
            total: calculations.total,
            notes: formData.notes,
            status: asDraft ? INVOICE_STATUS.DRAFT : INVOICE_STATUS.PENDING
        };

        try {
            if (isEdit) {
                await dispatch(updateInvoice({ id, data: invoiceData })).unwrap();
            } else {
                const result = await dispatch(createInvoice(invoiceData)).unwrap();
                if (!asDraft) {
                    // Send immediately after creation
                    await dispatch(sendInvoice(result.id)).unwrap();
                }
            }
            navigate('/invoices');
        } catch (error) {
            alert('Lỗi: ' + error);
        }
    };

    // Handle send (save and change status to PENDING)
    const handleSend = async () => {
        if (!validate()) return;

        if (isEdit && currentInvoice?.status === INVOICE_STATUS.DRAFT) {
            // Update then send
            const invoiceData = {
                customerId: formData.customerId,
                customerName: formData.customerName,
                issueDate: formData.issueDate,
                paymentTerm: formData.paymentTerm,
                dueDate: formData.dueDate,
                items: formData.items,
                subtotal: calculations.subtotal,
                taxRate: formData.taxRate,
                taxAmount: calculations.taxAmount,
                total: calculations.total,
                notes: formData.notes
            };

            try {
                await dispatch(updateInvoice({ id, data: invoiceData })).unwrap();
                await dispatch(sendInvoice(id)).unwrap();
                navigate('/invoices');
            } catch (error) {
                alert('Lỗi: ' + error);
            }
        } else {
            // Create and send
            await handleSave(false);
        }
    };

    if (loading) {
        return <Loading fullPage text="Đang tải thông tin hóa đơn..." />;
    }

    return (
        <div>
            <PageHeader
                title={isEdit ? `Chỉnh sửa: ${id}` : 'Tạo hóa đơn mới'}
                breadcrumbs={[
                    { label: 'Hóa đơn', to: '/invoices' },
                    { label: isEdit ? id : 'Tạo mới' }
                ]}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--spacing-6)' }}>
                {/* Main Form */}
                <div className="card">
                    {/* Customer & Dates */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Khách hàng *</label>
                            <select
                                className={`form-select ${errors.customerId ? 'error' : ''}`}
                                value={formData.customerId}
                                onChange={handleCustomerChange}
                                disabled={isEdit && currentInvoice?.paidAmount > 0}
                            >
                                <option value="">-- Chọn khách hàng --</option>
                                {mockCustomers.filter(c => c.status === 'ACTIVE').map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.customerId && <p className="form-error">{errors.customerId}</p>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Ngày tạo *</label>
                            <input
                                type="date"
                                className={`form-input ${errors.issueDate ? 'error' : ''}`}
                                value={formData.issueDate}
                                onChange={handleIssueDateChange}
                            />
                            {errors.issueDate && <p className="form-error">{errors.issueDate}</p>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Điều khoản thanh toán</label>
                            <select
                                className="form-select"
                                value={formData.paymentTerm}
                                onChange={handlePaymentTermChange}
                            >
                                {PAYMENT_TERMS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Hạn thanh toán *</label>
                            <input
                                type="date"
                                className={`form-input ${errors.dueDate ? 'error' : ''}`}
                                value={formData.dueDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                            />
                            {errors.dueDate && <p className="form-error">{errors.dueDate}</p>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Thuế suất (%)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.taxRate}
                                onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>

                    {/* Items */}
                    <div style={{ marginBottom: 'var(--spacing-6)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>Chi tiết hóa đơn</h3>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
                                <FiPlus /> Thêm dòng
                            </button>
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40%' }}>Mô tả</th>
                                        <th style={{ width: '15%' }}>Số lượng</th>
                                        <th style={{ width: '20%' }}>Đơn giá</th>
                                        <th style={{ width: '20%' }}>Thành tiền</th>
                                        <th style={{ width: '5%' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.items.map((item, index) => {
                                        const itemErrors = errors.items?.[index];
                                        const amount = (item.quantity || 0) * (item.unitPrice || 0);

                                        return (
                                            <tr key={item.id || index}>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className={`form-input ${itemErrors?.description ? 'error' : ''}`}
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                        placeholder="Nhập mô tả sản phẩm/dịch vụ"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className={`form-input ${itemErrors?.quantity ? 'error' : ''}`}
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                        min="0"
                                                        step="1"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className={`form-input ${itemErrors?.unitPrice ? 'error' : ''}`}
                                                        value={item.unitPrice}
                                                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                                        min="0"
                                                        step="1000"
                                                    />
                                                </td>
                                                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                                                    {formatCurrency(amount)}
                                                </td>
                                                <td>
                                                    {formData.items.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-ghost btn-icon btn-sm"
                                                            onClick={() => removeItem(index)}
                                                            style={{ color: 'var(--color-danger)' }}
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label className="form-label">Ghi chú</label>
                        <textarea
                            className="form-textarea"
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Ghi chú thêm cho hóa đơn..."
                            rows={3}
                        />
                    </div>
                </div>

                {/* Summary & Actions */}
                <div>
                    <div className="card" style={{ position: 'sticky', top: 'var(--spacing-4)' }}>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--spacing-4)' }}>
                            Tổng kết
                        </h3>

                        <div style={{ marginBottom: 'var(--spacing-4)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-2)' }}>
                                <span className="text-secondary">Tạm tính:</span>
                                <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(calculations.subtotal)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-2)' }}>
                                <span className="text-secondary">Thuế ({formData.taxRate}%):</span>
                                <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(calculations.taxAmount)}</span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingTop: 'var(--spacing-3)',
                                    borderTop: '2px solid var(--color-border)',
                                    fontSize: 'var(--font-size-lg)',
                                    fontWeight: 600
                                }}
                            >
                                <span>Tổng cộng:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                                    {formatCurrency(calculations.total)}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                            <button
                                type="button"
                                className="btn btn-primary btn-lg w-full"
                                onClick={handleSend}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <span className="loading-spinner" style={{ width: '16px', height: '16px' }}></span>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <FiSend /> Lưu & Gửi
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                className="btn btn-secondary w-full"
                                onClick={() => handleSave(true)}
                                disabled={saving}
                            >
                                <FiSave /> Lưu nháp
                            </button>

                            <button
                                type="button"
                                className="btn btn-ghost w-full"
                                onClick={() => navigate('/invoices')}
                                disabled={saving}
                            >
                                <FiX /> Hủy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceFormPage;
