import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import { FileText, Download, Loader2, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { reportApi } from '../../api/report.api';

/* ================= HELPER FUNCTIONS ================= */

const formatCurrency = (amount) => {
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)} tỷ`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)} triệu`;
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

const AGING_COLORS = {
    current: '#10B981',
    overdue_1_30: '#3B82F6',
    overdue_31_60: '#F59E0B',
    overdue_61_90: '#EF4444',
    overdue_90_plus: '#7C3AED'
};

const AGING_LABELS = {
    current: 'Trong hạn',
    overdue_1_30: '1-30 ngày',
    overdue_31_60: '31-60 ngày',
    overdue_61_90: '61-90 ngày',
    overdue_90_plus: '90+ ngày'
};

const AGING_DESCRIPTIONS = {
    current: 'Hóa đơn chưa đến hạn thanh toán',
    overdue_1_30: 'Hóa đơn quá hạn từ 1 đến 30 ngày',
    overdue_31_60: 'Hóa đơn quá hạn từ 31 đến 60 ngày',
    overdue_61_90: 'Hóa đơn quá hạn từ 61 đến 90 ngày',
    overdue_90_plus: 'Hóa đơn quá hạn trên 90 ngày - rủi ro cao'
};

/* ================= COMPONENTS ================= */

const SummaryCard = ({ label, count, amount, color, description }) => (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color }}>{formatCurrency(amount)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                <span className="font-bold" style={{ color }}>{count}</span>
            </div>
        </div>
        <p className="text-xs text-gray-400">{description}</p>
    </div>
);

/* ================= MAIN PAGE ================= */

const AgingReportPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [agingData, setAgingData] = useState(null);

    useEffect(() => {
        const fetchAgingReport = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await reportApi.getAgingReport();
                setAgingData(response?.data || null);
            } catch (err) {
                console.error('Aging report fetch error:', err);
                setError('Không thể tải báo cáo tuổi nợ');
            } finally {
                setLoading(false);
            }
        };

        fetchAgingReport();
    }, []);

    // Transform data for chart - API returns { data: { summary, buckets } }
    const buckets = agingData?.data?.buckets || agingData?.buckets || [];
    const summary = agingData?.data?.summary || agingData?.summary || {};

    // Map bucket labels to our keys
    const LABEL_TO_KEY = {
        'Current': 'current',
        '1-30 Days': 'overdue_1_30',
        '31-60 Days': 'overdue_31_60',
        '61-90 Days': 'overdue_61_90',
        '90+ Days': 'overdue_90_plus'
    };

    const chartData = buckets.map((bucket, index) => {
        const key = LABEL_TO_KEY[bucket.label] || `bucket_${index}`;
        return {
            key,
            name: AGING_LABELS[key] || bucket.label || `Bucket ${index + 1}`,
            amount: bucket.amount || 0,
            count: Math.round((bucket.percent || 0) * (summary.totalOutstanding || 100) / 100), // estimate count
            fill: AGING_COLORS[key] || ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#7C3AED'][index] || '#CBD5E1'
        };
    });

    const totalAmount = summary.totalOutstanding || chartData.reduce((sum, item) => sum + item.amount, 0);
    const totalCount = chartData.reduce((sum, item) => sum + item.count, 0);

    // Calculate percentages
    const chartDataWithPercent = chartData.map(item => ({
        ...item,
        percent: totalAmount > 0 ? (item.amount / totalAmount * 100).toFixed(1) : 0
    }));

    const handleExport = () => {
        // TODO: Implement CSV/Excel export
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
        <div className="space-y-6">
            {/* Header */}
            <div className="fc-page-header">
                <div className="fc-page-header__breadcrumb">Báo cáo / Tuổi nợ</div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <FileText className="text-orange-500" size={28} />
                            <h1 className="fc-page-header__title">Công nợ quá hạn</h1>
                        </div>
                        <p className="fc-page-header__subtitle">Phân bố công nợ theo thời gian quá hạn thanh toán</p>
                    </div>
                    <div className="fc-page-actions">
                        <button
                            onClick={handleExport}
                            className="fc-btn fc-btn--secondary"
                        >
                            <Download size={18} />
                            Xuất báo cáo
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
                    <AlertCircle />
                    <p>{error}</p>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total - Orange gradient */}
                <div className="p-6 flex flex-col justify-between h-40 rounded-2xl shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-bold text-white/90">Tổng quá hạn</span>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white mb-1">{formatCurrency(totalAmount)}</div>
                        <div className="text-xs text-white/80 font-medium">{totalCount} hóa đơn</div>
                    </div>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <TrendingUp size={16} className="text-green-500" />
                        Trong hạn
                    </div>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                        {chartDataWithPercent.find(d => d.key === 'current')?.percent || 0}%
                    </p>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <AlertCircle size={16} className="text-red-500" />
                        Quá hạn 90+
                    </div>
                    <p className="text-2xl font-bold text-red-600 mt-2">
                        {chartDataWithPercent.find(d => d.key === 'overdue_90_plus')?.percent || 0}%
                    </p>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar size={16} className="text-gray-400" />
                        Ngày báo cáo
                    </div>
                    <p className="text-lg font-semibold text-gray-700 mt-2">
                        {new Date().toLocaleDateString('vi-VN')}
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Biểu đồ phân bố tuổi nợ</h2>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartDataWithPercent} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-white p-3 rounded-lg shadow-lg border">
                                            <p className="font-semibold">{data.name}</p>
                                            <p className="text-sm text-gray-600">Số tiền: {formatCurrency(data.amount)}</p>
                                            <p className="text-sm text-gray-600">Số HĐ: {data.count}</p>
                                            <p className="text-sm text-gray-600">Tỉ lệ: {data.percent}%</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                            {chartDataWithPercent.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Detail Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chartDataWithPercent.map((item) => (
                    <SummaryCard
                        key={item.key}
                        label={item.name}
                        count={item.count}
                        amount={item.amount}
                        color={item.fill}
                        description={AGING_DESCRIPTIONS[item.key]}
                    />
                ))}
            </div>
        </div>
    );
};

export default AgingReportPage;
