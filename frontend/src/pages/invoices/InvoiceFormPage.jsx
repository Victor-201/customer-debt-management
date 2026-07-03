import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiSave, FiSend, FiX, FiPlus, FiTrash2, FiSettings, FiBell } from 'react-icons/fi';

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
    fetchCustomers,
    selectCustomerOptions
} from '../../store/customer.slice.js';

import Loading from '../../components/Loading.jsx';

import { formatCurrency, calculateTotal, calculateTax } from '../../utils/money.util.js';
import { formatDateForInput, addDays, today } from '../../utils/date.util.js';
import { PAYMENT_TERMS_OPTIONS, getPaymentTermDays } from '../../constants/paymentTerms.js';
import { INVOICE_STATUS } from '../../constants/invoiceStatus.js';

/**
 * InvoiceFormPage - ARMS Design
 * Create or edit an invoice with glassmorphism styling
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
        dispatch(fetchCustomers());
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
            invoiceNumber: formData.invoiceNumber ?? undefined,
            issueDate: formData.issueDate,
            dueDate: formData.dueDate,
            totalAmount: calculations.total,
            paidAmount: 0,
            status: asDraft ? INVOICE_STATUS.DRAFT : INVOICE_STATUS.PENDING,
            items: formData.items
        };

        try {
            if (isEdit) {
                await dispatch(updateInvoice({ id, data: invoiceData })).unwrap();
            } else {
                await dispatch(createInvoice(invoiceData)).unwrap();
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
                issueDate: formData.issueDate,
                dueDate: formData.dueDate,
                totalAmount: calculations.total,
                items: formData.items
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
        <div className="relative min-h-screen">
            {/* Background gradient blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-blue-300/20 blur-[100px] opacity-70"></div>
                <div className="absolute bottom-[-10%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-indigo-300/20 blur-[80px] opacity-60"></div>
            </div>

            <div className="relative z-10 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <div className="text-xs font-bold text-blue-500 mb-1 uppercase tracking-wider flex items-center gap-2">
                            <Link to="/invoices" className="hover:underline">Hóa đơn</Link>
                            <span className="text-slate-400">/</span>
                            <span className="text-slate-600">{isEdit ? id.slice(0, 12).toUpperCase() + '...' : 'Tạo mới'}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {isEdit ? 'Chỉnh sửa hóa đơn' : 'Tạo Hóa đơn'}
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">
                            {isEdit ? `Cập nhật thông tin chi tiết cho hóa đơn #${id.slice(0, 8)}...` : 'Tạo hóa đơn mới cho khách hàng'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 transition-colors shadow-sm">
                            <FiSettings size={20} />
                        </button>
                        <button className="p-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 transition-colors shadow-sm relative">
                            <FiBell size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                    {/* Main Form - Glass Card */}
                    <div className="glass-card p-6 space-y-8">
                        {/* Customer & Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Khách hàng *</label>
                                <select
                                    className={`fc-input w-full ${errors.customerId ? 'border-red-400 focus:border-red-400' : ''}`}
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
                                <label className="block text-sm font-bold text-slate-700 mb-2">Ngày tạo *</label>
                                <input
                                    type="date"
                                    className={`fc-input w-full ${errors.issueDate ? 'border-red-400' : ''}`}
                                    value={formData.issueDate}
                                    onChange={handleIssueDateChange}
                                />
                                {errors.issueDate && <p className="text-red-500 text-sm mt-1">{errors.issueDate}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Điều khoản thanh toán</label>
                                <select
                                    className="fc-input w-full"
                                    value={formData.paymentTerm}
                                    onChange={handlePaymentTermChange}
                                >
                                    {PAYMENT_TERMS_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Hạn thanh toán *</label>
                                <input
                                    type="date"
                                    className={`fc-input w-full ${errors.dueDate ? 'border-red-400' : ''}`}
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                />
                                {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Thuế suất (%)</label>
                                <input
                                    type="number"
                                    className="fc-input w-full"
                                    value={formData.taxRate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                                    min="0"
                                    max="100"
                                />
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Items Section */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-900">Chi tiết hóa đơn</h3>
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-2 font-medium text-slate-600 transition-colors"
                                    onClick={addItem}
                                >
                                    <FiPlus className="w-4 h-4" /> Thêm dòng
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="pb-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[40%]">Mô tả</th>
                                            <th className="pb-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[12%]">Số lượng</th>
                                            <th className="pb-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[18%]">Đơn giá</th>
                                            <th className="pb-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[20%]">Thành tiền</th>
                                            <th className="pb-3 w-[10%]"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.items.map((item, index) => {
                                            const itemErrors = errors.items?.[index];
                                            const amount = (item.quantity || 0) * (item.unitPrice || 0);

                                            return (
                                                <tr key={item.id || index} className="border-b border-slate-50">
                                                    <td className="py-3 pr-3">
                                                        <input
                                                            type="text"
                                                            className={`fc-input w-full ${itemErrors?.description ? 'border-red-400' : ''}`}
                                                            value={item.description}
                                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                            placeholder="Mô tả sản phẩm/dịch vụ"
                                                        />
                                                    </td>
                                                    <td className="py-3 pr-3">
                                                        <input
                                                            type="number"
                                                            className={`fc-input w-full text-center ${itemErrors?.quantity ? 'border-red-400' : ''}`}
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                            min="0"
                                                            step="1"
                                                        />
                                                    </td>
                                                    <td className="py-3 pr-3">
                                                        <input
                                                            type="number"
                                                            className={`fc-input w-full ${itemErrors?.unitPrice ? 'border-red-400' : ''}`}
                                                            value={item.unitPrice}
                                                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                                            min="0"
                                                            step="1000"
                                                        />
                                                    </td>
                                                    <td className="py-3 pr-3">
                                                        <span className="font-bold text-slate-800">
                                                            {formatCurrency(amount)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">
                                                        {formData.items.length > 1 && (
                                                            <button
                                                                type="button"
                                                                className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
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

                        <hr className="border-slate-100" />

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Ghi chú</label>
                            <textarea
                                className="fc-input w-full resize-none"
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Ghi chú thêm cho hóa đơn..."
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Summary & Actions - Sticky Glass Card */}
                    <div className="lg:sticky lg:top-4 h-fit">
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Tổng kết</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-medium">Tạm tính:</span>
                                    <span className="font-semibold text-slate-800">{formatCurrency(calculations.subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-medium">Thuế ({formData.taxRate}%):</span>
                                    <span className="font-semibold text-slate-800">{formatCurrency(calculations.taxAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t-2 border-slate-200">
                                    <span className="text-slate-700 font-bold">Tổng cộng:</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(calculations.total)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    type="button"
                                    className="w-full py-3.5 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/25"
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
                                    className="w-full py-3 px-4 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-slate-700"
                                    onClick={() => handleSave(true)}
                                    disabled={saving}
                                >
                                    <FiSave /> Lưu nháp
                                </button>

                                <button
                                    type="button"
                                    className="w-full py-3 px-4 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                                    onClick={() => navigate('/invoices')}
                                    disabled={saving}
                                >
                                    <FiX /> Hủy bỏ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-slate-400 py-6 font-medium">
                    © 2026 FA Credit by Group 6
                </div>
            </div>
        </div>
    );
};

export default InvoiceFormPage;
