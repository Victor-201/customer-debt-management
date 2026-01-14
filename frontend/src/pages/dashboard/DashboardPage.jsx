import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { Settings } from 'lucide-react';

// Dữ liệu giả lập cho biểu đồ
const barData = [
  { name: '114', value: 18, label: '62%' },
  { name: '126', value: 22, label: '32%' },
  { name: '215', value: 20, label: '59%' },
  { name: '124', value: 25, label: '1.8%' },
  { name: '10%', value: 33, label: '9.9%' },
];

const pieData = [
  { name: 'Quá hạn', value: 26.9, color: '#F59E0B' },
  { name: 'Bình thường', value: 73.1, color: '#EF4444' },
];

const lineData = [
  { time: '10', value: 130 },
  { time: '20', value: 180 },
  { time: '01', value: 220 },
  { time: '22', value: 260 },
  { time: '10', value: 290 },
  { time: '13', value: 330 },
];

const riskCustomers = [
  { id: 1, name: 'No phu', value: '33.34', status: '30.34', color: 'bg-yellow-500' },
  { id: 2, name: 'thuy trang', value: '23.34', status: '1.60.90', color: 'bg-green-500' },
  { id: 3, name: 'Nah Mn Ola', value: '11.35', status: '1.30.90', color: 'bg-blue-400' },
  { id: 4, name: 'Tha hang', value: '6.27', status: '1.90.04', color: 'bg-orange-500' },
  { id: 5, name: 'Ahh shiba', value: '23.34', status: '0.30.98', color: 'bg-green-600' },
];

const Card = ({ title, value, colorClass, children }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[300px]">
    <h3 className="text-gray-600 font-semibold text-sm">{title}</h3>
    <p className={`text-2xl font-bold mt-1 mb-4 ${colorClass}`}>{value}</p>
    <div className="flex-grow w-full h-full">
      {children}
    </div>
  </div>
);

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-gray-800">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <span className="text-gray-400 text-sm">Quản lý Công nợ Khách hàng</span>
          <Settings size={20} className="text-gray-400 cursor-pointer" />
        </header>
        
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Cột 1: Tổng công nợ */}
          <Card title="Tổng công nợ" value="8.45%" colorClass="text-blue-600">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Cột 2: Công nợ quá hạn */}
          <Card title="Công nợ quá hạn" value="3,16%" colorClass="text-yellow-500">
            <div className="relative h-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={0}
                    outerRadius={60}
                    paddingAngle={0}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute left-0 bottom-10 text-[10px] text-gray-500">126%</div>
              <div className="absolute right-0 bottom-10 text-[10px] text-gray-500">26.9%</div>
            </div>
          </Card>

          {/* Cột 3: Đã thu trong tháng */}
          <Card title="Đã thu trong tháng" value="74,01%" colorClass="text-emerald-500">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Cột 4: Khách hàng rủi ro */}
          <Card title="Khách hàng rủi ro" value="3,56%" colorClass="text-red-500">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 text-left">
                  <th className="pb-2 font-normal">Nabh</th>
                  <th className="pb-2 font-normal">Ryshai</th>
                  <th className="pb-2 font-normal text-right">Rēso</th>
                </tr>
              </thead>
              <tbody>
                {riskCustomers.map((cust) => (
                  <tr key={cust.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 text-gray-600">{cust.id}. {cust.name}</td>
                    <td className="py-2 text-gray-600">{cust.value}</td>
                    <td className="py-2 text-right flex items-center justify-end gap-1">
                       <span className={`w-2 h-2 rounded-sm ${cust.color}`}></span>
                       {cust.status}
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
}
