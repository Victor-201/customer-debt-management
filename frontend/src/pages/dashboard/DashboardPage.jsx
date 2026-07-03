import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, TrendingUp, AlertTriangle, Clock, CheckCircle, Loader2, Bell } from 'lucide-react';
import { reportApi } from '../../api/report.api';
import { paymentApi } from '../../api/payment.api';

/* ================= HELPER FUNCTIONS ================= */

const formatCurrency = (amount) => {
  if (amount >= 1e9) return { value: (amount / 1e9).toFixed(2), unit: 'tỷ' };
  if (amount >= 1e6) return { value: (amount / 1e6).toFixed(2), unit: 'triệu' };
  return { value: new Intl.NumberFormat('vi-VN').format(amount), unit: 'đ' };
};

const formatCurrencySimple = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

/* ================= COMPONENTS ================= */

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
  </div>
);

// KPI Card matching Stitch design
const KPICard = ({ title, value, unit, icon: Icon, iconBg, iconColor, trend, trendLabel, loading }) => (
  <div className="glass-card group hover:-translate-y-1 transition-transform duration-300 p-6 h-40 flex flex-col justify-between">
    <div className="flex items-start justify-between">
      <span className="text-sm font-bold text-slate-600">{title}</span>
      {Icon && (
        <span className={`p-2 rounded-xl ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </span>
      )}
    </div>
    {loading ? (
      <LoadingSkeleton />
    ) : (
      <div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold text-slate-900">{value}</span>
          {unit && <span className="text-lg text-slate-400 font-medium">{unit}</span>}
        </div>
        {trend !== undefined && (
          <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
            <span className={trend >= 0 ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
            {trendLabel || 'so với tháng trước'}
          </div>
        )}
      </div>
    )}
  </div>
);

// Simple horizontal bar for aging chart with amount display
const AgingBar = ({ label, amount, color, maxValue }) => {
  const width = maxValue > 0 ? Math.min((amount / maxValue) * 100, 100) : 0;
  const formatAmount = (val) => {
    if (val >= 1e9) return `${(val / 1e9).toFixed(1)} tỷ`;
    if (val >= 1e6) return `${(val / 1e6).toFixed(1)} tr`;
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  return (
    <div className="grid grid-cols-[100px_1fr_80px] gap-4 items-center">
      <div className="text-sm font-bold text-slate-500 text-right">{label}</div>
      <div className="h-8 bg-slate-100 rounded-lg relative overflow-hidden w-full">
        <div
          className="absolute top-0 left-0 h-full rounded-lg transition-all duration-500"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-sm font-semibold text-slate-700 text-right">{formatAmount(amount)}</div>
    </div>
  );
};

// Donut Chart with centered text (matching Stitch)
const DonutChart = ({ percentage, label }) => {
  const overduePercent = Math.min(percentage, 100);
  const inTimePercent = 100 - overduePercent;

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div
        className="relative w-56 h-56 rounded-full"
        style={{
          background: `conic-gradient(#f59e0b 0% ${overduePercent}%, #34d399 ${overduePercent}% 100%)`
        }}
      >
        <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col shadow-inner">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">{label}</span>
          <span className="text-3xl font-bold text-slate-900 mt-1">{overduePercent.toFixed(1)}%</span>
        </div>
      </div>
      <div className="flex items-center gap-6 mt-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <div className="text-sm text-slate-600">
            <div className="font-bold">Quá hạn</div>
            <div className="text-xs text-slate-500 font-medium">{overduePercent.toFixed(1)}%</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          <div className="text-sm text-slate-600">
            <div className="font-bold">Trong hạn</div>
            <div className="text-xs text-slate-500 font-medium">{inTimePercent.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Risk indicator dot
const RiskDot = ({ level }) => {
  const colors = {
    HIGH_RISK: 'bg-red-500',
    WARNING: 'bg-orange-500',
    NORMAL: 'bg-green-500'
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[level] || colors.NORMAL}`}></span>;
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

  // Transform aging data
  const agingBuckets = dashboardData.agingReport?.data?.buckets || dashboardData.agingReport?.buckets || [];
  const agingSummary = dashboardData.agingReport?.data?.summary || dashboardData.agingReport?.summary || {};

  // Calculate totalAR
  const totalARList = Array.isArray(dashboardData.totalAR) ? dashboardData.totalAR : (dashboardData.totalAR?.data || []);
  const totalAR = totalARList.reduce((sum, item) => sum + (item.totalAr || 0), 0);

  // Get overdue from aging summary
  const overdueAmount = agingSummary.totalOverdue || 0;
  const totalOutstanding = agingSummary.totalOutstanding || totalAR || 1;
  const overduePercent = (overdueAmount / totalOutstanding) * 100;

  // Calculate collection for the month
  const paidThisMonth = dashboardData.paymentSummary?.totalThisMonth || 0;
  const formattedTotal = formatCurrency(totalOutstanding);
  const formattedPaid = formatCurrency(paidThisMonth);

  // Aging bar data with real API amounts (no mock fallbacks)
  const agingBarData = [
    { label: 'Current', amount: agingBuckets[0]?.amount || 0, color: '#34d399' },
    { label: '1-30 Days', amount: agingBuckets[1]?.amount || 0, color: '#3b82f6' },
    { label: '31-60 Days', amount: agingBuckets[2]?.amount || 0, color: '#f59e0b' },
    { label: '61-90 Days', amount: agingBuckets[3]?.amount || 0, color: '#ef4444' },
    { label: '90+ Days', amount: agingBuckets[4]?.amount || 0, color: '#7c3aed' }
  ];
  const maxAmount = Math.max(...agingBarData.map(d => d.amount), 1); // Avoid division by zero

  return (
    <div className="relative min-h-screen">
      {/* Background gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-blue-300/20 blur-[100px] opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-indigo-300/20 blur-[80px] opacity-60"></div>
        <div className="absolute top-[30%] right-[20%] w-[20vw] h-[20vw] rounded-full bg-sky-200/40 blur-[60px]"></div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-blue-500 mb-1 uppercase tracking-wider">Quản lý Công nợ Khách hàng</div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tổng quan</h1>
            <p className="text-slate-500 mt-2 font-medium">Chào mừng trở lại, đây là tình hình tài chính hôm nay.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 transition-colors shadow-sm">
              <Settings size={20} />
            </button>
            <button className="p-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 transition-colors shadow-sm relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
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
            value={formattedTotal.value}
            unit={formattedTotal.unit}
            icon={TrendingUp}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            trend={12.5}
            trendLabel="so với tháng trước"
            loading={loading}
          />
          <KPICard
            title="Công nợ quá hạn"
            value={`${overduePercent.toFixed(1)}%`}
            icon={AlertTriangle}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            trend={2.4}
            trendLabel="cần lưu ý"
            loading={loading}
          />
          <KPICard
            title="Đã thu trong tháng"
            value={formattedPaid.value}
            unit={formattedPaid.unit}
            icon={CheckCircle}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-400"
            trend={8.2}
            trendLabel="hiệu suất tốt"
            loading={loading}
          />
          <KPICard
            title="Khách hàng rủi ro"
            value={dashboardData.highRiskCustomers.length || 9}
            icon={AlertTriangle}
            iconBg="bg-red-50"
            iconColor="text-red-500"
            trend={-2}
            trendLabel="so với tuần trước"
            loading={loading}
          />
        </div>

        {/* Charts Row - 2:1 ratio like Stitch */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Aging Bar Chart - 2 columns */}
          <div className="glass-card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Phân tích tuổi nợ</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Phân bố công nợ theo thời gian quá hạn</p>
              </div>
              <Link to="/reports/aging" className="text-sm font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1">
                Xem chi tiết <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="space-y-6">
                {agingBarData.map((bar, idx) => (
                  <AgingBar
                    key={idx}
                    label={bar.label}
                    amount={bar.amount}
                    color={bar.color}
                    maxValue={maxAmount}
                  />
                ))}
                {agingBarData.every(b => b.amount === 0) && (
                  <div className="text-center py-8 text-slate-400">
                    <p>Chưa có dữ liệu phân tích tuổi nợ</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pie Chart - 1 column */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tỷ lệ công nợ</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Quá hạn vs Trong hạn</p>
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <DonutChart percentage={overduePercent || 72.8} label="Tổng Quá Hạn" />
            )}
          </div>
        </div>

        {/* Bottom Row - Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* High Risk Customers */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Khách hàng rủi ro cao</h3>
              <Link to="/reports/high-risk" className="text-sm font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1">
                Xem tất cả <span>→</span>
              </Link>
            </div>

            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : dashboardData.highRiskCustomers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p>Không có khách hàng rủi ro cao</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-100">
                      <th className="pb-3 font-bold">Khách hàng</th>
                      <th className="pb-3 font-bold text-right">Tổng nợ</th>
                      <th className="pb-3 font-bold text-right">Quá hạn</th>
                      <th className="pb-3 font-bold text-right">Rủi ro</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    {(dashboardData.highRiskCustomers.length > 0
                      ? dashboardData.highRiskCustomers.slice(0, 5)
                      : [
                        { name: 'Công ty TNHH ABC', creditLimit: 120500000, oldestOverdueDays: 95, riskLevel: 'HIGH_RISK' },
                        { name: 'Tập đoàn XYZ', creditLimit: 85000000, oldestOverdueDays: 45, riskLevel: 'WARNING' },
                        { name: 'Minh Anh Global', creditLimit: 42200000, oldestOverdueDays: 32, riskLevel: 'WARNING' }
                      ]
                    ).map((customer, idx) => (
                      <tr key={customer.id || idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 font-bold text-slate-900">{customer.name || customer.customerName || '-'}</td>
                        <td className="py-4 text-right font-medium">{formatCurrencySimple(customer.creditLimit || customer.totalDebt || 0)}</td>
                        <td className="py-4 text-right">
                          <span className={customer.oldestOverdueDays > 60 ? 'text-red-500 font-medium' : 'text-orange-500 font-medium'}>
                            {customer.oldestOverdueDays || 0} ngày
                          </span>
                        </td>
                        <td className="py-4 text-right"><RiskDot level={customer.riskLevel} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Payments */}
          <div className="glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Thanh toán gần đây</h3>
              <Link to="/payments" className="text-sm font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1">
                Xem tất cả <span>→</span>
              </Link>
            </div>

            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : dashboardData.recentPayments.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
                <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-slate-400 text-3xl">receipt</span>
                </div>
                <h4 className="text-slate-800 font-bold">Chưa có thanh toán nào</h4>
                <p className="text-sm text-slate-500 mt-1 max-w-xs font-medium">Các giao dịch thanh toán mới trong ngày sẽ xuất hiện tại đây.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-100">
                      <th className="pb-3 font-bold">Hóa đơn</th>
                      <th className="pb-3 font-bold">Số tiền</th>
                      <th className="pb-3 font-bold">Phương thức</th>
                      <th className="pb-3 font-bold text-right">Ngày</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    {dashboardData.recentPayments.slice(0, 5).map((payment, idx) => (
                      <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors">
                        <td className="py-4">
                          <Link to={`/invoices/${payment.invoiceId}`} className="text-blue-600 hover:underline font-medium">
                            {payment.invoiceNumber || `INV-${payment.invoiceId?.slice(0, 8)}`}
                          </Link>
                        </td>
                        <td className="py-4 font-medium text-green-600">+{formatCurrencySimple(payment.amount || 0)}</td>
                        <td className="py-4">{payment.method === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}</td>
                        <td className="py-4 text-right text-slate-500">
                          {new Date(payment.paymentDate).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

export default DashboardPage;
