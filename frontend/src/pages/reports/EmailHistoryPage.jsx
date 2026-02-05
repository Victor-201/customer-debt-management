import React, { useState, useEffect } from 'react';
import {
    Mail, Search, Calendar, CheckCircle, XCircle, Clock,
    Loader2, RefreshCw, Eye, User, FileText, Filter, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import emailApi from '../../api/email.api';

/* ================= EMAIL HISTORY PAGE ================= */

const formatCurrency = (amount) => {
    if (!amount) return '—';
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)} tỷ`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)} tr`;
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const StatusBadge = ({ status }) => {
    const statusMap = {
        'SUCCESS': 'sent',
        'FAILED': 'failed',
        'sent': 'sent',
        'failed': 'failed'
    };
    const normalizedStatus = statusMap[status] || 'pending';

    const config = {
        sent: { bg: 'bg-green-100', text: 'text-green-600', icon: CheckCircle, label: 'Đã gửi' },
        failed: { bg: 'bg-red-100', text: 'text-red-600', icon: XCircle, label: 'Thất bại' },
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: Clock, label: 'Đang gửi' }
    };
    const { bg, text, icon: Icon, label } = config[normalizedStatus];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${bg} ${text}`}>
            <Icon size={12} />
            {label}
        </span>
    );
};

const EmailTypeBadge = ({ type }) => {
    const config = {
        'BEFORE_DUE': { label: 'Trước hạn', color: 'bg-blue-100 text-blue-600' },
        'OVERDUE_1': { label: 'Quá hạn lần 1', color: 'bg-orange-100 text-orange-600' },
        'OVERDUE_2': { label: 'Quá hạn lần 2', color: 'bg-red-100 text-red-600' }
    };
    const { label, color } = config[type] || { label: type, color: 'bg-slate-100 text-slate-600' };

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {label}
        </span>
    );
};

const EmailHistoryPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [emailHistory, setEmailHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch email logs from API
    const fetchEmailLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await emailApi.getLogs({ page: 1, limit: 500 });
            // Handle paginated response - data is in result.data
            const logs = result.data || result;
            // Transform data to match UI expectations
            const transformed = logs.map(log => ({
                id: log.id,
                customerName: log.Customer?.name || 'Không xác định',
                customerEmail: log.Customer?.email || 'Không có email',
                invoiceNumber: log.Invoice?.invoice_number || log.invoice_id,
                invoiceAmount: log.Invoice?.total_amount || 0,
                emailType: log.email_type,
                status: log.status,
                sentAt: log.sent_at,
                errorMessage: log.error_message
            }));
            setEmailHistory(transformed);
        } catch (err) {
            console.error('Failed to fetch email logs:', err);
            setError(err.message || 'Không thể tải lịch sử email');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmailLogs();
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = [...emailHistory];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.customerName?.toLowerCase().includes(term) ||
                item.customerEmail?.toLowerCase().includes(term) ||
                item.id?.toLowerCase().includes(term) ||
                item.invoiceNumber?.toLowerCase().includes(term)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(item => {
                if (statusFilter === 'sent') return item.status === 'SUCCESS';
                if (statusFilter === 'failed') return item.status === 'FAILED';
                return true;
            });
        }

        // Date filter
        const now = new Date();
        if (dateFilter === 'today') {
            filtered = filtered.filter(item => {
                const date = new Date(item.sentAt);
                return date.toDateString() === now.toDateString();
            });
        } else if (dateFilter === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(item => new Date(item.sentAt) >= weekAgo);
        } else if (dateFilter === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(item => new Date(item.sentAt) >= monthAgo);
        }

        setFilteredHistory(filtered);
        setCurrentPage(1);
    }, [emailHistory, searchTerm, statusFilter, dateFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const paginatedData = filteredHistory.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Stats
    const stats = {
        total: emailHistory.length,
        sent: emailHistory.filter(e => e.status === 'SUCCESS').length,
        failed: emailHistory.filter(e => e.status === 'FAILED').length
    };

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
                            <Link to="/reports/aging" className="hover:underline">Báo cáo</Link>
                            <span className="text-slate-400">/</span>
                            <span className="text-slate-600">Lịch sử gửi mail</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <Mail className="text-blue-500" size={28} />
                            Lịch sử gửi Email
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">
                            Theo dõi lịch sử gửi email nhắc nợ đến khách hàng
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/settings/email"
                            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium flex items-center gap-2 transition-colors"
                        >
                            <FileText size={18} />
                            Cấu hình email
                        </Link>
                        <button
                            onClick={fetchEmailLogs}
                            disabled={loading}
                            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="glass-card p-4 border-l-4 border-red-500 bg-red-50">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="text-red-500" size={20} />
                            <p className="text-red-700 font-medium">{error}</p>
                            <button
                                onClick={fetchEmailLogs}
                                className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                Thử lại
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                <Mail className="text-slate-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                                <p className="text-sm text-slate-500">Tổng email</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="text-green-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
                                <p className="text-sm text-slate-500">Đã gửi</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <XCircle className="text-red-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                                <p className="text-sm text-slate-500">Thất bại</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="glass-card p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="fc-search-bar flex-1 min-w-[200px]">
                            <Search className="fc-search-bar__icon" size={16} />
                            <input
                                type="text"
                                placeholder="Tìm theo tên, email, mã HĐ..."
                                className="fc-search-bar__input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            className="fc-input w-40"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="sent">Đã gửi</option>
                            <option value="failed">Thất bại</option>
                        </select>

                        {/* Date Filter */}
                        <select
                            className="fc-input w-40"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        >
                            <option value="all">Tất cả thời gian</option>
                            <option value="today">Hôm nay</option>
                            <option value="week">7 ngày qua</option>
                            <option value="month">30 ngày qua</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hóa đơn</th>
                                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Loại email</th>
                                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {paginatedData.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                    {emailHistory.length === 0
                                                        ? 'Chưa có email nào được gửi'
                                                        : 'Không tìm thấy email phù hợp'}
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedData.map((email) => (
                                                <tr key={email.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-semibold text-slate-800">{email.customerName}</p>
                                                            <p className="text-sm text-slate-400">{email.customerEmail}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <span className="font-mono text-sm text-slate-600">{email.invoiceNumber}</span>
                                                            {email.invoiceAmount > 0 && (
                                                                <p className="text-sm text-slate-400">{formatCurrency(email.invoiceAmount)}</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <EmailTypeBadge type={email.emailType} />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-500">{formatDate(email.sentAt)}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <StatusBadge status={email.status} />
                                                        {email.errorMessage && (
                                                            <p className="text-xs text-red-500 mt-1">{email.errorMessage}</p>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                                    <p className="text-sm text-slate-500">
                                        Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredHistory.length)} / {filteredHistory.length} kết quả
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`w-10 h-10 rounded-lg font-medium ${currentPage === pageNum
                                                        ? 'bg-blue-500 text-white'
                                                        : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-slate-400 py-6 font-medium">
                    © 2026 FA Credit by Group 6
                </div>
            </div>
        </div>
    );
};

export default EmailHistoryPage;
