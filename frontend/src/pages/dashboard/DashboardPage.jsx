import React from 'react';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import { Settings } from 'lucide-react';

/* ================= MOCK DATA ================= */

const barData = [
  { name: 'T1', value: 18 },
  { name: 'T2', value: 22 },
  { name: 'T3', value: 20 },
  { name: 'T4', value: 25 },
  { name: 'T5', value: 33 },
];

const pieData = [
  { name: 'Quá hạn', value: 26.9, color: '#F59E0B' },
  { name: 'Bình thường', value: 73.1, color: '#10B981' },
];

const lineData = [
  { time: '01', value: 130 },
  { time: '02', value: 180 },
  { time: '03', value: 220 },
  { time: '04', value: 260 },
  { time: '05', value: 290 },
  { time: '06', value: 330 },
];

const riskCustomers = [
  { id: 1, name: 'No Phu', value: '33.34M', status: '90+', color: 'bg-red-500' },
  { id: 2, name: 'Thùy Trang', value: '23.34M', status: '60+', color: 'bg-yellow-500' },
  { id: 3, name: 'Nah Mn Ola', value: '11.35M', status: '30+', color: 'bg-blue-400' },
];

/* ================= COMPONENTS ================= */

const Card = ({ title, value, colorClass, children }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[300px]">
    <h3 className="text-gray-600 font-semibold text-sm">{title}</h3>
    <p className={`text-2xl font-bold mt-1 mb-4 ${colorClass}`}>{value}</p>
    <div className="flex-grow">{children}</div>
  </div>
);

/* ================= PAGE ================= */

const DashboardPage = () => {
  return (
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <span className="text-sm text-gray-400">
            Quản lý Công nợ Khách hàng
          </span>
          <Settings size={18} className="text-gray-400 cursor-pointer" />
        </header>

        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Tổng công nợ */}
          <Card title="Tổng công nợ" value="8.45%" colorClass="text-blue-600">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Công nợ quá hạn */}
          <Card title="Công nợ quá hạn" value="26.9%" colorClass="text-yellow-500">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  outerRadius={70}
                  startAngle={90}
                  endAngle={450}
                >
                  {pieData.map((item, index) => (
                    <Cell key={index} fill={item.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Đã thu trong tháng */}
          <Card title="Đã thu trong tháng" value="74.01%" colorClass="text-emerald-500">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData}>
                <defs>
                  <linearGradient id="green" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tickLine={false} axisLine={false} />
                <Area
                  dataKey="value"
                  stroke="#10B981"
                  fill="url(#green)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Khách hàng rủi ro */}
          <Card title="Khách hàng rủi ro" value="3" colorClass="text-red-500">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 text-left border-b">
                  <th>Tên</th>
                  <th>Số nợ</th>
                  <th className="text-right">Quá hạn</th>
                </tr>
              </thead>
              <tbody>
                {riskCustomers.map(c => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-2">{c.name}</td>
                    <td>{c.value}</td>
                    <td className="text-right flex justify-end gap-2 items-center">
                      <span className={`w-2 h-2 rounded ${c.color}`} />
                      {c.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
