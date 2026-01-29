import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Clock, AlertCircle, Loader2, Download,
    Eye, Mail, Calendar, FileText, ChevronLeft, ChevronRight
} from 'lucide-react';
import { reportApi } from '../../api/report.api';
import { invoiceApi } from '../../api/invoice.api';

/* ================= HELPER FUNCTIONS ================= */

const formatCurrency = (amount) => {
    if (amount >= 1e9) return { value: (amount / 1e9).toFixed(2), unit: 'tỷ' };
    if (amount >= 1e6) return { value: (amount / 1e6).toFixed(2), unit: 'triệu' };
    return { value: new Intl.NumberFormat('vi-VN').format(amount), unit: 'đ' };
};

const formatCurrencySimple = (amount) => {
    const f = formatCurrency(amount);
    return `${f.value} ${f.unit}`;
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
};

const getDaysOverdue = (dueDate) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
};

/* ================= COMPONENTS ================= */

const StatusBadge = ({ daysOverdue }) => {
    let color, label;
    if (daysOverdue > 90) {
        color = 'bg-red-100 text-red-600 border-red-200';
        label = '90+ ngày';
    } else if (daysOverdue > 60) {
        color = 'bg-orange-100 text-orange-600 border-orange-200';
        label = '61-90 ngày';
    } else if (daysOverdue > 30) {
        color = 'bg-yellow-100 text-yellow-600 border-yellow-200';
        label = '31-60 ngày';
    } else {
        color = 'bg-blue-100 text-blue-600 border-blue-200';
        label = '1-30 ngày';
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${color}`}>
            <Clock size={12} />
            {label}
        </span>
    );
};

/* ================= MAIN PAGE ================= */

const OverdueARPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [overdueData, setOverdueData] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('dueDate');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    useEffect(() => {
        const fetchOverdueReport = async () => {
            try {
                setLoading(true);
                setError(null);

                const [reportRes, invoicesRes] = await Promise.allSettled([
                    reportApi.getOverdueReport(),
                    invoiceApi.getAll({ status: 'OVERDUE' })
                ]);

                setOverdueData(reportRes.status === 'fulfilled' ? reportRes.value?.data : null);
                setInvoices(invoicesRes.status === 'fulfilled' ? (invoicesRes.value?.data || []) : []);
            } catch (err) {
                console.error('Overdue report fetch error:', err);
                setError('Không thể tải báo cáo quá hạn');
            } finally {
                setLoading(false);
            }
        };

        fetchOverdueReport();
    }, []);

    // Add daysOverdue to invoices
    const invoicesWithOverdue = invoices.map(inv => ({
        ...inv,
        daysOverdue: getDaysOverdue(inv.dueDate)
    }));

    // Filter invoices
    const filteredInvoices = invoicesWithOverdue.filter(inv => {
        if (filter === 'ALL') return true;
        if (filter === '1-30') return inv.daysOverdue <= 30;
        if (filter === '31-60') return inv.daysOverdue > 30 && inv.daysOverdue <= 60;
        if (filter === '61-90') return inv.daysOverdue > 60 && inv.daysOverdue <= 90;
        if (filter === '90+') return inv.daysOverdue > 90;
        return true;
    });

    // Sort invoices
    const sortedInvoices = [...filteredInvoices].sort((a, b) => {
        if (sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
        if (sortBy === 'amount') return b.balanceAmount - a.balanceAmount;
        if (sortBy === 'daysOverdue') return b.daysOverdue - a.daysOverdue;
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);
    const paginatedInvoices = sortedInvoices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Calculate stats
    const stats = {
        totalAmount: overdueData?.totalOverdueAmount || invoicesWithOverdue.reduce((sum, inv) => sum + (inv.balanceAmount || 0), 0),
        totalCount: overdueData?.totalOverdueCount || invoices.length,
        count1to30: invoicesWithOverdue.filter(inv => inv.daysOverdue <= 30).length,
        count90plus: invoicesWithOverdue.filter(inv => inv.daysOverdue > 90).length
    };

    const formattedTotal = formatCurrency(stats.totalAmount);

    const handleExport = () => {
        alert('Chức năng xuất file đang được phát triển');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
                    <p className="mt-4 text-gray-500">Đang tải báo cáo...</p>
                </div>
            </div>
        );
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
                        <div className="text-xs font-bold text-orange-500 mb-1 uppercase tracking-wider">Báo cáo</div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                <Clock size={20} className="text-white" />
                            </span>
                            Công nợ quá hạn
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">Chi tiết các hóa đơn đã quá hạn thanh toán</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm font-medium text-slate-700"
                    >
                        <Download size={18} />
                        Xuất báo cáo
                    </button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                        <AlertCircle />
                        <p>{error}</p>
                    </div>
                )}

                {/* Summary Stats - Glass Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Overdue - Orange Gradient */}
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20 col-span-2 lg:col-span-1">
                        <p className="text-orange-100 text-sm font-medium">Tổng quá hạn</p>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-4xl font-bold">{formattedTotal.value}</span>
                            <span className="text-xl text-orange-200">{formattedTotal.unit}</span>
                        </div>
                        <p className="text-orange-200 text-sm mt-3">{stats.totalCount} hóa đơn</p>
                    </div>

                    {/* 1-30 Days */}
                    <div className="glass-card p-5 flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                            <FileText size={16} className="text-blue-500" />
                            Quá hạn 1-30 ngày
                        </div>
                        <div className="mt-3">
                            <span className="text-3xl font-bold text-blue-600">{stats.count1to30}</span>
                            <span className="text-slate-400 ml-2">Hóa đơn</span>
                        </div>
                    </div>

                    {/* 90+ Days */}
                    <div className="glass-card p-5 flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                            <AlertCircle size={16} className="text-red-500" />
                            Quá hạn 90+ ngày
                        </div>
                        <div className="mt-3">
                            <span className="text-3xl font-bold text-red-600">{stats.count90plus}</span>
                            <span className="text-slate-400 ml-2">Hóa đơn</span>
                        </div>
                    </div>

                    {/* Report Date */}
                    <div className="glass-card p-5 flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                            <Calendar size={16} className="text-slate-400" />
                            Ngày báo cáo
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl font-bold text-slate-800">
                                {new Date().toLocaleDateString('vi-VN')}
                            </span>
                            <p className="text-xs text-slate-400 mt-1">Cập nhật lúc {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                </div>

                {/* Filters and Sort */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600 font-medium">Lọc theo:</span>
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                            {['ALL', '1-30', '31-60', '61-90', '90+'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => { setFilter(f); setCurrentPage(1); }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                            ? 'bg-blue-500 text-white shadow-sm'
                                            : 'text-slate-600 hover:bg-white hover:shadow-sm'
                                        }`}
                                >
                                    {f === 'ALL' ? 'Tất cả' : f + ' ngày'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm text-slate-600 font-medium">Sắp xếp:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="fc-input py-2 px-3 pr-8 min-w-[160px]"
                        >
                            <option value="dueDate">Ngày đến hạn</option>
                            <option value="amount">Số tiền</option>
                            <option value="daysOverdue">Số ngày quá hạn</option>
                        </select>
                    </div>
                </div>

                {/* Invoice Table */}
                <div className="glass-card p-0 overflow-hidden">
                    {paginatedInvoices.length === 0 ? (
                        <div className="p-12 text-center">
                            <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-600 mb-2">Không có hóa đơn quá hạn</h3>
                            <p className="text-slate-400">Tất cả hóa đơn đang trong hạn thanh toán</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mã HĐ</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày đến hạn</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Số tiền còn lại</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {paginatedInvoices.map((invoice, idx) => (
                                            <tr key={invoice.id || idx} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <Link
                                                        to={`/invoices/${invoice.id}`}
                                                        className="font-semibold text-blue-600 hover:underline"
                                                    >
                                                        {invoice.invoiceNumber || `INV-${invoice.id?.slice(0, 8)}`}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 font-medium">
                                                    {invoice.customerName || invoice.Customer?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {formatDate(invoice.dueDate)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-red-600">
                                                        {formatCurrencySimple(invoice.balanceAmount || 0)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge daysOverdue={invoice.daysOverdue} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Link
                                                            to={`/invoices/${invoice.id}`}
                                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Xem chi tiết"
                                                        >
                                                            <Eye size={18} />
                                                        </Link>
                                                        <button
                                                            className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                            title="Gửi nhắc nợ"
                                                        >
                                                            <Mail size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                                <p className="text-sm text-slate-500">
                                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến {Math.min(currentPage * itemsPerPage, sortedInvoices.length)} trong {sortedInvoices.length} kết quả
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                                        const page = i + 1;
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === page
                                                        ? 'bg-blue-500 text-white shadow-sm'
                                                        : 'text-slate-600 hover:bg-white border border-slate-200'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                    {totalPages > 3 && <span className="text-slate-400">...</span>}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OverdueARPage;
