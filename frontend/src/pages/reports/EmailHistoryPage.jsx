import React, { useState, useEffect } from 'react';
import {
    Mail, Search, Calendar, CheckCircle, XCircle, Clock,
    Loader2, RefreshCw, Eye, User, FileText, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ================= EMAIL HISTORY PAGE ================= */

// Mock data - in real app, would come from API
const generateMockEmailHistory = () => {
    const statuses = ['sent', 'failed', 'pending'];
    const customers = [
        { name: 'Công ty ABC', email: 'abc@company.vn' },
        { name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com' },
        { name: 'Trần Thị B', email: 'tranthib@yahoo.com' },
        { name: 'Lê Văn C', email: 'levanc@outlook.com' },
        { name: 'Phạm Văn D', email: 'phamvand@company.vn' },
        { name: 'Hoàng Thị E', email: 'hoangthie@gmail.com' }
    ];

    const history = [];
    for (let i = 0; i < 50; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        date.setHours(Math.floor(Math.random() * 12) + 6);
        date.setMinutes(Math.floor(Math.random() * 60));

        history.push({
            id: `EMAIL-${String(i + 1).padStart(5, '0')}`,
            customerName: customer.name,
            customerEmail: customer.email,
            subject: `[Nhắc nhở] Thanh toán hóa đơn quá hạn - ${customer.name}`,
            invoiceCount: Math.floor(Math.random() * 5) + 1,
            totalAmount: Math.floor(Math.random() * 100) * 1000000 + 1000000,
            status: statuses[Math.floor(Math.random() * 10) < 8 ? 0 : (Math.floor(Math.random() * 10) < 9 ? 2 : 1)],
            sentAt: date.toISOString(),
            errorMessage: Math.random() > 0.8 ? 'Email không hợp lệ' : null
        });
    }

    return history.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
};

const formatCurrency = (amount) => {
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)} tỷ`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)} tr`;
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

const formatDate = (dateString) => {
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
    const config = {
        sent: { bg: 'bg-green-100', text: 'text-green-600', icon: CheckCircle, label: 'Đã gửi' },
        failed: { bg: 'bg-red-100', text: 'text-red-600', icon: XCircle, label: 'Thất bại' },
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: Clock, label: 'Đang gửi' }
    };
    const { bg, text, icon: Icon, label } = config[status] || config.pending;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${bg} ${text}`}>
            <Icon size={12} />
            {label}
        </span>
    );
};

const EmailHistoryPage = () => {
    const [loading, setLoading] = useState(true);
    const [emailHistory, setEmailHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setEmailHistory(generateMockEmailHistory());
            setLoading(false);
        }, 500);
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = [...emailHistory];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.customerName.toLowerCase().includes(term) ||
                item.customerEmail.toLowerCase().includes(term) ||
                item.id.toLowerCase().includes(term)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(item => item.status === statusFilter);
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
        sent: emailHistory.filter(e => e.status === 'sent').length,
        failed: emailHistory.filter(e => e.status === 'failed').length,
        pending: emailHistory.filter(e => e.status === 'pending').length
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
                            onClick={() => {
                                setLoading(true);
                                setTimeout(() => {
                                    setEmailHistory(generateMockEmailHistory());
                                    setLoading(false);
                                }, 500);
                            }}
                            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <Clock className="text-yellow-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                <p className="text-sm text-slate-500">Đang gửi</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="glass-card p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên, email, mã..."
                                    className="fc-input w-full pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
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
                            <option value="pending">Đang gửi</option>
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
                                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mã</th>
                                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Số HĐ</th>
                                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng tiền</th>
                                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {paginatedData.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                                    Không tìm thấy email nào
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedData.map((email) => (
                                                <tr key={email.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-sm text-slate-600">{email.id}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-semibold text-slate-800">{email.customerName}</p>
                                                            <p className="text-sm text-slate-400">{email.customerEmail}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-semibold text-slate-700">{email.invoiceCount}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-semibold text-slate-800">{formatCurrency(email.totalAmount)}</span>
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
                    © 2026 ARMS – Internal System
                </div>
            </div>
        </div>
    );
};

export default EmailHistoryPage;
