import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertTriangle, Mail, Phone, MapPin, Loader2, AlertCircle,
    ChevronRight, Clock, DollarSign, User
} from 'lucide-react';
import { reportApi } from '../../api/report.api';
import { automationApi } from '../../api/automation.api';

/* ================= HELPER FUNCTIONS ================= */

const formatCurrency = (amount) => {
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)} tỷ`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)} triệu`;
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

/* ================= COMPONENTS ================= */

const RiskBadge = ({ level }) => {
    const styles = {
        HIGH_RISK: 'bg-red-100 text-red-700 border-red-200',
        WARNING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        NORMAL: 'bg-green-100 text-green-700 border-green-200'
    };
    const labels = {
        HIGH_RISK: 'Rủi ro cao',
        WARNING: 'Cảnh báo',
        NORMAL: 'Bình thường'
    };
    const icons = {
        HIGH_RISK: <AlertTriangle size={14} />,
        WARNING: <AlertCircle size={14} />,
        NORMAL: null
    };

    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${styles[level] || styles.NORMAL}`}>
            {icons[level]}
            {labels[level] || level}
        </span>
    );
};

const CustomerCard = ({ customer, onSendReminder }) => {
    const [sending, setSending] = useState(false);

    const handleSendReminder = async () => {
        setSending(true);
        try {
            await onSendReminder(customer.id);
            alert('Đã gửi email nhắc nợ thành công');
        } catch (err) {
            alert('Gửi email thất bại: ' + (err.message || 'Lỗi không xác định'));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                        {customer.customerName?.charAt(0)?.toUpperCase() || 'K'}
                    </div>
                    <div>
                        <Link
                            to={`/customers/${customer.id}`}
                            className="font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                        >
                            {customer.customerName}
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Mail size={14} />
                            {customer.email}
                        </div>
                    </div>
                </div>
                <RiskBadge level={customer.riskLevel} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-red-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
                        <DollarSign size={14} />
                        Tổng nợ
                    </div>
                    <p className="text-xl font-bold text-red-700">{formatCurrency(customer.totalDebt || 0)}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-orange-600 text-sm mb-1">
                        <Clock size={14} />
                        Quá hạn lâu nhất
                    </div>
                    <p className="text-xl font-bold text-orange-700">{customer.oldestOverdueDays || 0} ngày</p>
                </div>
            </div>

            {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Phone size={14} />
                    {customer.phone}
                </div>
            )}
            {customer.address && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <MapPin size={14} />
                    {customer.address}
                </div>
            )}

            <div className="flex gap-2 mt-4">
                <Link
                    to={`/customers/${customer.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                    Xem chi tiết
                    <ChevronRight size={16} />
                </Link>
                <button
                    onClick={handleSendReminder}
                    disabled={sending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50"
                >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                    {sending ? 'Đang gửi...' : 'Gửi nhắc nợ'}
                </button>
            </div>
        </div>
    );
};

/* ================= MAIN PAGE ================= */

const HighRiskCustomerPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchHighRiskCustomers = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await reportApi.getHighRiskCustomers();
                setCustomers(response?.data || []);
            } catch (err) {
                console.error('High risk customers fetch error:', err);
                setError('Không thể tải danh sách khách hàng rủi ro');
            } finally {
                setLoading(false);
            }
        };

        fetchHighRiskCustomers();
    }, []);

    const handleSendReminder = async (customerId) => {
        // This would send reminder for a specific customer
        // For now, we're using the general automation endpoint
        console.log('Sending reminder to customer:', customerId);
        // await automationApi.sendReminderToCustomer(customerId);
    };

    const handleSendAllReminders = async () => {
        try {
            const response = await automationApi.runReminders();
            const data = response?.data;
            alert(`Đã gửi ${data?.sent || 0} email nhắc nợ. Thất bại: ${data?.failed || 0}`);
        } catch (err) {
            console.error('Send all reminders error:', err);
            alert('Không thể gửi email nhắc nợ: ' + (err.message || 'Lỗi không xác định'));
        }
    };

    const filteredCustomers = customers.filter(c => {
        if (filter === 'ALL') return true;
        return c.riskLevel === filter;
    });

    const stats = {
        total: customers.length,
        highRisk: customers.filter(c => c.riskLevel === 'HIGH_RISK').length,
        warning: customers.filter(c => c.riskLevel === 'WARNING').length,
        totalDebt: customers.reduce((sum, c) => sum + (c.totalDebt || 0), 0)
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
                    <p className="mt-4 text-gray-500">Đang tải danh sách...</p>
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
                            <AlertTriangle className="text-red-500" />
                            Khách hàng rủi ro cao
                        </h1>
                        <p className="text-gray-500 mt-2">Danh sách khách hàng cần theo dõi và nhắc nợ</p>
                    </div>
                    <button
                        onClick={handleSendAllReminders}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        <Mail size={18} />
                        Gửi nhắc nợ tất cả
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
                    <div className="bg-white rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <User size={16} />
                            Tổng khách hàng
                        </div>
                        <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertTriangle size={16} />
                            Rủi ro cao
                        </div>
                        <p className="text-3xl font-bold text-red-700 mt-1">{stats.highRisk}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                        <div className="flex items-center gap-2 text-yellow-600 text-sm">
                            <AlertCircle size={16} />
                            Cảnh báo
                        </div>
                        <p className="text-3xl font-bold text-yellow-700 mt-1">{stats.warning}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-600 text-sm">
                            <DollarSign size={16} />
                            Tổng nợ
                        </div>
                        <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(stats.totalDebt)}</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {[
                        { value: 'ALL', label: `Tất cả (${customers.length})` },
                        { value: 'HIGH_RISK', label: `Rủi ro cao (${stats.highRisk})` },
                        { value: 'WARNING', label: `Cảnh báo (${stats.warning})` }
                    ].map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setFilter(tab.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.value
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Customer Cards */}
                {filteredCustomers.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Không có khách hàng rủi ro</h3>
                        <p className="text-gray-400">Tất cả khách hàng đang trong tình trạng tốt</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCustomers.map((customer, idx) => (
                            <CustomerCard
                                key={customer.id || idx}
                                customer={customer}
                                onSendReminder={handleSendReminder}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HighRiskCustomerPage;
