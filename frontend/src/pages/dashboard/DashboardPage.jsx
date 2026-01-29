import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie,
  AreaChart, Area
} from 'recharts';
import { Settings, TrendingUp, TrendingDown, AlertTriangle, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { reportApi } from '../../api/report.api';
import { paymentApi } from '../../api/payment.api';
import { invoiceApi } from '../../api/invoice.api';

/* ================= HELPER FUNCTIONS ================= */

const formatCurrency = (amount) => {
  if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)} tỷ`;
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)} triệu`;
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

const formatPercent = (value) => {
  return `${(value * 100).toFixed(1)}%`;
};

const AGING_COLORS = {
  current: '#10B981',      // Green
  overdue_1_30: '#3B82F6', // Blue
  overdue_31_60: '#F59E0B', // Yellow
  overdue_61_90: '#EF4444', // Red
  overdue_90_plus: '#7C3AED' // Purple
};

const AGING_LABELS = {
  current: 'Trong hạn',
  overdue_1_30: '1-30 ngày',
  overdue_31_60: '31-60 ngày',
  overdue_61_90: '61-90 ngày',
  overdue_90_plus: '90+ ngày'
};

/* ================= COMPONENTS ================= */

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
  </div>
);

const KPICard = ({ title, value, icon: Icon, colorClass, iconBg, trend, loading }) => (
  <div className="glass-card group hover:-translate-y-1 transition-transform duration-300 h-40 flex flex-col justify-between">
    <div className="flex items-start justify-between">
      <span className="text-sm font-bold text-slate-600">{title}</span>
      {Icon && (
        <span className={`p-2 rounded-xl ${iconBg || 'bg-blue-50'}`}>
          <Icon size={20} className={colorClass} />
        </span>
      )}
    </div>
    {loading ? (
      <LoadingSkeleton />
    ) : (
      <div>
        <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
        {trend && (
          <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
            <span className={trend > 0 ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            so với tháng trước
          </div>
        )}
      </div>
    )}
  </div>
);

const ChartCard = ({ title, subtitle, children, loading, action }) => (
  <div className="glass-card">
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
      </div>
      {action}
    </div>
    {loading ? (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    ) : (
      children
    )}
  </div>
);

const RiskBadge = ({ level }) => {
  const colors = {
    HIGH_RISK: 'bg-red-100 text-red-700',
    WARNING: 'bg-yellow-100 text-yellow-700',
    NORMAL: 'bg-green-100 text-green-700'
  };
  const labels = {
    HIGH_RISK: 'Cao',
    WARNING: 'Cảnh báo',
    NORMAL: 'Bình thường'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level] || colors.NORMAL}`}>
      {labels[level] || level}
    </span>
  );
};

/* ================= MAIN PAGE ================= */

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalAR: null,
    agingReport: null,
    highRiskCustomers: [],
    recentPayments: [],
    paymentSummary: null,
    overdueReport: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all dashboard data in parallel
        const [
          totalARRes,
          agingRes,
          highRiskRes,
          recentPaymentsRes,
          paymentSummaryRes,
          overdueRes
        ] = await Promise.allSettled([
          reportApi.getTotalAR(),
          reportApi.getAgingReport(),
          reportApi.getHighRiskCustomers(),
          paymentApi.getRecent(5),
          paymentApi.getSummary(),
          reportApi.getOverdueReport()
        ]);

        setDashboardData({
          totalAR: totalARRes.status === 'fulfilled' ? totalARRes.value?.data : null,
          agingReport: agingRes.status === 'fulfilled' ? agingRes.value?.data : null,
          highRiskCustomers: highRiskRes.status === 'fulfilled' ? (highRiskRes.value?.data || []) : [],
          recentPayments: recentPaymentsRes.status === 'fulfilled' ? (recentPaymentsRes.value?.data || []) : [],
          paymentSummary: paymentSummaryRes.status === 'fulfilled' ? paymentSummaryRes.value : null,
          overdueReport: overdueRes.status === 'fulfilled' ? overdueRes.value?.data : null
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Transform aging data for chart - API returns { data: { summary, buckets } }
  const agingBuckets = dashboardData.agingReport?.data?.buckets || dashboardData.agingReport?.buckets || [];
  const agingSummary = dashboardData.agingReport?.data?.summary || dashboardData.agingReport?.summary || {};
  const agingChartData = agingBuckets.map((bucket, index) => {
    const colorKeys = ['current', 'overdue_1_30', 'overdue_31_60', 'overdue_61_90', 'overdue_90_plus'];
    return {
      name: bucket.label || `T${index + 1}`,
      value: bucket.amount || 0,
      percent: bucket.percent || 0,
      fill: AGING_COLORS[colorKeys[index]] || '#CBD5E1'
    };
  });

  // Calculate totalAR - API returns array of customers with totalAr
  const totalARList = Array.isArray(dashboardData.totalAR) ? dashboardData.totalAR : (dashboardData.totalAR?.data || []);
  const totalAR = totalARList.reduce((sum, item) => sum + (item.totalAr || 0), 0);

  // Get overdue from aging summary
  const overdueAmount = agingSummary.totalOverdue || 0;
  const overduePercent = (agingSummary.totalOutstanding || totalAR) > 0
    ? ((overdueAmount / (agingSummary.totalOutstanding || totalAR)) * 100)
    : 0;

  const pieData = [
    { name: 'Quá hạn', value: overduePercent, color: '#F59E0B' },
    { name: 'Trong hạn', value: 100 - overduePercent, color: '#10B981' }
  ];

  // Calculate collection rate for the month
  const paidThisMonth = dashboardData.paymentSummary?.totalThisMonth || 0;
  const expectedThisMonth = dashboardData.paymentSummary?.expectedThisMonth || 1;
  const collectionRate = (paidThisMonth / expectedThisMonth * 100) || 0;

  return (
    <div className="relative min-h-screen">
      {/* Background gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-blue-300/20 blur-[100px] opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-indigo-300/20 blur-[80px] opacity-60"></div>
        <div className="absolute top-[30%] right-[20%] w-[20vw] h-[20vw] rounded-full bg-sky-200/40 blur-[60px]"></div>
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="fc-page-header">
          <div className="fc-page-header__breadcrumb">Quản lý Công nợ Khách hàng</div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="fc-page-header__title">Tổng quan</h1>
              <p className="fc-page-header__subtitle">Chào mừng trở lại, đây là tình hình tài chính hôm nay.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 transition-colors shadow-sm">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p>{error}</p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Tổng công nợ"
            value={formatCurrency(agingSummary.totalOutstanding || totalAR || 0)}
            icon={TrendingUp}
            colorClass="text-blue-500"
            iconBg="bg-blue-50"
            loading={loading}
          />
          <KPICard
            title="Công nợ quá hạn"
            value={`${overduePercent.toFixed(1)}%`}
            icon={AlertTriangle}
            colorClass="text-amber-500"
            iconBg="bg-amber-50"
            loading={loading}
          />
          <KPICard
            title="Đã thu trong tháng"
            value={formatCurrency(paidThisMonth)}
            icon={CheckCircle}
            colorClass="text-emerald-400"
            iconBg="bg-emerald-50"
            loading={loading}
          />
          <KPICard
            title="Khách hàng rủi ro"
            value={dashboardData.highRiskCustomers.length || 0}
            icon={AlertTriangle}
            colorClass="text-red-500"
            iconBg="bg-red-50"
            loading={loading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Aging Bar Chart */}
          <ChartCard
            title="Phân tích tuổi nợ"
            subtitle="Phân bố công nợ theo thời gian quá hạn"
            loading={loading}
            action={
              <Link to="/reports/aging" className="text-sm text-blue-600 hover:underline">
                Xem chi tiết →
              </Link>
            }
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={agingChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                <YAxis type="category" dataKey="name" width={90} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Số tiền']}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {agingChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Pie Chart - Overdue vs Current */}
          <ChartCard
            title="Tỷ lệ công nợ"
            subtitle="Quá hạn vs Trong hạn"
            loading={loading}
            action={
              <Link to="/reports/overdue" className="text-sm text-blue-600 hover:underline">
                Xem chi tiết →
              </Link>
            }
          >
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {pieData.map((item, index) => (
                      <Cell key={index} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 ml-4">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-sm text-gray-600">{item.name}: {item.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* High Risk Customers */}
          <ChartCard
            title="Khách hàng rủi ro cao"
            loading={loading}
            action={
              <Link to="/reports/high-risk" className="text-sm text-blue-600 hover:underline">
                Xem tất cả →
              </Link>
            }
          >
            {dashboardData.highRiskCustomers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p>Không có khách hàng rủi ro cao</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-left border-b">
                      <th className="pb-3 font-medium">Khách hàng</th>
                      <th className="pb-3 font-medium">Tổng nợ</th>
                      <th className="pb-3 font-medium">Quá hạn</th>
                      <th className="pb-3 font-medium text-right">Rủi ro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.highRiskCustomers.slice(0, 5).map((customer, idx) => (
                      <tr key={customer.id || idx} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3">
                          <Link to={`/customers/${customer.id}`} className="text-blue-600 hover:underline">
                            {customer.name || customer.customerName || '-'}
                          </Link>
                        </td>
                        <td className="py-3 font-medium">{formatCurrency(customer.creditLimit || customer.totalDebt || 0)}</td>
                        <td className="py-3">
                          <span className="flex items-center gap-1">
                            <Clock size={14} className="text-red-400" />
                            {customer.oldestOverdueDays || 0} ngày
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <RiskBadge level={customer.riskLevel} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>

          {/* Recent Payments */}
          <ChartCard
            title="Thanh toán gần đây"
            loading={loading}
            action={
              <Link to="/payments" className="text-sm text-blue-600 hover:underline">
                Xem tất cả →
              </Link>
            }
          >
            {dashboardData.recentPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Chưa có thanh toán nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-left border-b">
                      <th className="pb-3 font-medium">Hóa đơn</th>
                      <th className="pb-3 font-medium">Số tiền</th>
                      <th className="pb-3 font-medium">Phương thức</th>
                      <th className="pb-3 font-medium text-right">Ngày</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentPayments.slice(0, 5).map((payment, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3">
                          <Link to={`/invoices/${payment.invoiceId}`} className="text-blue-600 hover:underline">
                            {payment.invoiceNumber || `INV-${payment.invoiceId?.slice(0, 8)}`}
                          </Link>
                        </td>
                        <td className="py-3 font-medium text-green-600">+{formatCurrency(payment.amount || 0)}</td>
                        <td className="py-3">{payment.method === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}</td>
                        <td className="py-3 text-right text-gray-500">
                          {new Date(payment.paymentDate).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/reports/aging" className="glass-card group hover:-translate-y-1 transition-transform duration-300 flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg shadow-blue-500/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Báo cáo tuổi nợ</h4>
              <p className="text-sm text-slate-500 font-medium">Xem chi tiết tình hình công nợ theo từng bucket</p>
            </div>
          </Link>
          <Link to="/settings/automation" className="glass-card group hover:-translate-y-1 transition-transform duration-300 flex items-center gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-3 rounded-xl shadow-lg shadow-purple-500/30">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Nhắc nợ tự động</h4>
              <p className="text-sm text-slate-500 font-medium">Cấu hình gửi email nhắc nợ tự động</p>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 py-6 font-medium">
          © 2026 FA Credit – Internal System
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
