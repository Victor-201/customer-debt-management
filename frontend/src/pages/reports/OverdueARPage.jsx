import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Clock, AlertCircle, Loader2, Download, Filter,
    ChevronDown, Eye, Mail, DollarSign, FileText, Calendar
} from 'lucide-react';
import { reportApi } from '../../api/report.api';
import { invoiceApi } from '../../api/invoice.api';

/* ================= HELPER FUNCTIONS ================= */

const formatCurrency = (amount) => {
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)} tỷ`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)} triệu`;
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
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
        color = 'bg-red-100 text-red-700 border-red-200';
        label = `90+ ngày`;
    } else if (daysOverdue > 60) {
        color = 'bg-orange-100 text-orange-700 border-orange-200';
        label = `61-90 ngày`;
    } else if (daysOverdue > 30) {
        color = 'bg-yellow-100 text-yellow-700 border-yellow-200';
        label = `31-60 ngày`;
    } else {
        color = 'bg-blue-100 text-blue-700 border-blue-200';
        label = `1-30 ngày`;
    }

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
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

    useEffect(() => {
        const fetchOverdueReport = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch both overdue report and overdue invoices
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

    // Calculate stats
    const stats = {
        totalAmount: overdueData?.totalOverdueAmount || invoicesWithOverdue.reduce((sum, inv) => sum + (inv.balanceAmount || 0), 0),
        totalCount: overdueData?.totalOverdueCount || invoices.length,
        avg30Days: invoicesWithOverdue.filter(inv => inv.daysOverdue <= 30).length,
        over90Days: invoicesWithOverdue.filter(inv => inv.daysOverdue > 90).length
    };

    const handleExport = () => {
        alert('Chức năng xuất file đang được phát triển');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
                    <p className="mt-4 text-gray-500">Đang tải báo cáo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <span className="text-sm text-gray-400">Báo cáo</span>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <Clock className="text-orange-500" />
                            Công nợ quá hạn
                        </h1>
                        <p className="text-gray-500 mt-2">Chi tiết các hóa đơn đã quá hạn thanh toán</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Download size={18} />
                        Xuất báo cáo
                    </button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
                        <AlertCircle />
                        <p>{error}</p>
                    </div>
                )}

                {/* Summary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-5 text-white col-span-2 lg:col-span-1">
                        <p className="text-orange-100 text-sm">Tổng quá hạn</p>
                        <p className="text-3xl font-bold mt-1">{formatCurrency(stats.totalAmount)}</p>
                        <p className="text-orange-200 text-sm mt-2">{stats.totalCount} hóa đơn</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <FileText size={16} className="text-blue-500" />
                            Quá hạn 1-30 ngày
                        </div>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{stats.avg30Days}</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <AlertCircle size={16} className="text-red-500" />
                            Quá hạn 90+ ngày
                        </div>
                        <p className="text-2xl font-bold text-red-600 mt-1">{stats.over90Days}</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Calendar size={16} className="text-gray-400" />
                            Ngày báo cáo
                        </div>
                        <p className="text-lg font-semibold text-gray-700 mt-1">
                            {new Date().toLocaleDateString('vi-VN')}
                        </p>
                    </div>
                </div>

                {/* Filters and Sort */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">Lọc theo:</span>
                        {['ALL', '1-30', '31-60', '61-90', '90+'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${filter === f
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {f === 'ALL' ? 'Tất cả' : f + ' ngày'}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm text-gray-600">Sắp xếp:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-1 rounded-lg border border-gray-200 text-sm bg-white"
                        >
                            <option value="dueDate">Ngày đến hạn</option>
                            <option value="amount">Số tiền</option>
                            <option value="daysOverdue">Số ngày quá hạn</option>
                        </select>
                    </div>
                </div>

                {/* Invoice Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {sortedInvoices.length === 0 ? (
                        <div className="p-12 text-center">
                            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Không có hóa đơn quá hạn</h3>
                            <p className="text-gray-400">Tất cả hóa đơn đang trong hạn thanh toán</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Mã HĐ</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Ngày đến hạn</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Số tiền còn lại</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {sortedInvoices.map((invoice, idx) => (
                                        <tr key={invoice.id || idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link
                                                    to={`/invoices/${invoice.id}`}
                                                    className="font-medium text-blue-600 hover:underline"
                                                >
                                                    {invoice.invoiceNumber || `INV-${invoice.id?.slice(0, 8)}`}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    to={`/customers/${invoice.customerId}`}
                                                    className="text-gray-700 hover:text-blue-600"
                                                >
                                                    {invoice.customerName || invoice.Customer?.name || 'N/A'}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {formatDate(invoice.dueDate)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-red-600">
                                                    {formatCurrency(invoice.balanceAmount || 0)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge daysOverdue={invoice.daysOverdue} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/invoices/${invoice.id}`}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>
                                                    <button
                                                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default OverdueARPage;
