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

import {
    fetchCustomerOptions,
    selectCustomerOptions
} from '../../store/customer.slice.js';

import PageHeader from '../../components/PageHeader.jsx';
import Loading from '../../components/Loading.jsx';

import { formatCurrency, calculateTotal, calculateTax } from '../../utils/money.util.js';
import { formatDateForInput, addDays, today } from '../../utils/date.util.js';
import { PAYMENT_TERMS_OPTIONS, getPaymentTermDays } from '../../constants/paymentTerms.js';
import { INVOICE_STATUS } from '../../constants/invoiceStatus.js';

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
        const customerId = e.target.value;
        const customer = customerOptions.find(c => c.id === customerId);

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
        const itemErrors = formData.items.map((item) => {
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
            await handleSave(false);
        }
    };

    if (loading) {
        return <Loading fullPage text="Đang tải thông tin hóa đơn..." />;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={isEdit ? `Chỉnh sửa: ${id}` : 'Tạo hóa đơn mới'}
                breadcrumbs={[
                    { label: 'Hóa đơn', to: '/invoices' },
                    { label: isEdit ? id : 'Tạo mới' }
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
                {/* Main Form */}
                <div className="card">
                    {/* Customer & Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Khách hàng *</label>
                            <select
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${errors.customerId ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                value={formData.customerId}
                                onChange={handleCustomerChange}
                                disabled={isEdit && currentInvoice?.paidAmount > 0}
                            >
                                <option value="">-- Chọn khách hàng --</option>
                                {customerOptions.filter(c => c.status === 'ACTIVE').map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.customerId && <p className="text-red-500 text-sm mt-1">{errors.customerId}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo *</label>
                            <input
                                type="date"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${errors.issueDate ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                value={formData.issueDate}
                                onChange={handleIssueDateChange}
                            />
                            {errors.issueDate && <p className="text-red-500 text-sm mt-1">{errors.issueDate}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Điều khoản thanh toán</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                value={formData.paymentTerm}
                                onChange={handlePaymentTermChange}
                            >
                                {PAYMENT_TERMS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hạn thanh toán *</label>
                            <input
                                type="date"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${errors.dueDate ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                value={formData.dueDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                            />
                            {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thuế suất (%)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                value={formData.taxRate}
                                onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>

                    {/* Items */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold">Chi tiết hóa đơn</h3>
                            <button
                                type="button"
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                                onClick={addItem}
                            >
                                <FiPlus className="w-4 h-4" /> Thêm dòng
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-[40%]">Mô tả</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-[15%]">Số lượng</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-[20%]">Đơn giá</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-[20%]">Thành tiền</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-[5%]"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.items.map((item, index) => {
                                        const itemErrors = errors.items?.[index];
                                        const amount = (item.quantity || 0) * (item.unitPrice || 0);

                                        return (
                                            <tr key={item.id || index} className="border-b border-gray-100">
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm ${itemErrors?.description ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                        placeholder="Nhập mô tả sản phẩm/dịch vụ"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm ${itemErrors?.quantity ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                        min="0"
                                                        step="1"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm ${itemErrors?.unitPrice ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                        value={item.unitPrice}
                                                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                                        min="0"
                                                        step="1000"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 font-mono font-medium">
                                                    {formatCurrency(amount)}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {formData.items.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="p-2 rounded-lg hover:bg-red-50 text-[var(--color-error)] transition-colors"
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Ghi chú thêm cho hóa đơn..."
                            rows={3}
                        />
                    </div>
                </div>

                {/* Summary & Actions */}
                <div>
                    <div className="card sticky top-4">
                        <h3 className="text-lg font-semibold mb-4">Tổng kết</h3>

                        <div className="mb-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tạm tính:</span>
                                <span className="font-mono">{formatCurrency(calculations.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Thuế ({formData.taxRate}%):</span>
                                <span className="font-mono">{formatCurrency(calculations.taxAmount)}</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t-2 border-gray-200 text-lg font-semibold">
                                <span>Tổng cộng:</span>
                                <span className="font-mono text-[var(--color-primary)]">
                                    {formatCurrency(calculations.total)}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                className="btn w-full flex items-center justify-center gap-2 py-3"
                                onClick={handleSend}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                                onClick={() => handleSave(true)}
                                disabled={saving}
                            >
                                <FiSave /> Lưu nháp
                            </button>

                            <button
                                type="button"
                                className="w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-2 transition-colors"
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
