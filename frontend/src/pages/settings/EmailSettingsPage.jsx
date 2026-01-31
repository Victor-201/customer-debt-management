import React, { useState, useEffect } from 'react';
import {
    Settings, Mail, Clock, Save, AlertCircle, CheckCircle,
    Loader2, FileText, Calendar, Bell, Edit3, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ================= EMAIL SETTINGS PAGE ================= */

const EmailSettingsPage = () => {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);
    
    // Email template config
    const [emailConfig, setEmailConfig] = useState({
        subject: '[Nhắc nhở] Thanh toán hóa đơn quá hạn - {{Tên khách hàng}}',
        greeting: 'Kính gửi {{Tên khách hàng}},',
        opening: 'Chúng tôi xin thông báo rằng quý khách có {{số lượng}} hóa đơn đã quá hạn thanh toán với tổng số tiền {{tổng tiền}}.',
        closing: 'Vui lòng thanh toán sớm để tránh phát sinh thêm chi phí. Nếu quý khách đã thanh toán, vui lòng bỏ qua email này.',
        signature: 'Phòng Kế toán - FE Credit',
        companyName: 'FE Credit'
    });

    // Schedule config
    const [scheduleConfig, setScheduleConfig] = useState({
        enabled: true,
        sendTime: '08:00',
        frequency: 'daily', // daily, weekly, monthly
        weeklyDay: 'monday',
        minDaysOverdue: 1,
        reminderGapDays: 7 // Don't send again if sent within X days
    });

    const [previewMode, setPreviewMode] = useState(false);

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // In real app: save to backend
            localStorage.setItem('emailConfig', JSON.stringify(emailConfig));
            localStorage.setItem('scheduleConfig', JSON.stringify(scheduleConfig));
            
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError('Không thể lưu cấu hình');
        } finally {
            setSaving(false);
        }
    };

    // Load saved config on mount
    useEffect(() => {
        const savedEmailConfig = localStorage.getItem('emailConfig');
        const savedScheduleConfig = localStorage.getItem('scheduleConfig');
        if (savedEmailConfig) setEmailConfig(JSON.parse(savedEmailConfig));
        if (savedScheduleConfig) setScheduleConfig(JSON.parse(savedScheduleConfig));
    }, []);

    const frequencyLabels = {
        daily: 'Hàng ngày',
        weekly: 'Hàng tuần',
        monthly: 'Hàng tháng'
    };

    const weekDays = [
        { value: 'monday', label: 'Thứ 2' },
        { value: 'tuesday', label: 'Thứ 3' },
        { value: 'wednesday', label: 'Thứ 4' },
        { value: 'thursday', label: 'Thứ 5' },
        { value: 'friday', label: 'Thứ 6' },
        { value: 'saturday', label: 'Thứ 7' },
        { value: 'sunday', label: 'Chủ nhật' }
    ];

    return (
        <div className="relative min-h-screen">
            {/* Background gradient blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-purple-300/20 blur-[100px] opacity-70"></div>
                <div className="absolute bottom-[-10%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-indigo-300/20 blur-[80px] opacity-60"></div>
            </div>

            <div className="relative z-10 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <div className="text-xs font-bold text-purple-500 mb-1 uppercase tracking-wider flex items-center gap-2">
                            <span>Cài đặt</span>
                            <span className="text-slate-400">/</span>
                            <span className="text-slate-600">Email</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <Settings className="text-purple-500" size={28} />
                            Cấu hình Email
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">
                            Thiết lập mẫu email và lịch gửi nhắc nợ tự động
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/reports/email-history"
                            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium flex items-center gap-2 transition-colors"
                        >
                            <FileText size={18} />
                            Lịch sử gửi mail
                        </Link>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-purple-500/25"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Lưu cấu hình
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {saved && (
                    <div className="glass-card p-4 border-l-4 border-green-500 bg-green-50/50 flex items-center gap-3">
                        <CheckCircle className="text-green-500" size={20} />
                        <span className="text-green-700 font-medium">Đã lưu cấu hình thành công!</span>
                    </div>
                )}
                {error && (
                    <div className="glass-card p-4 border-l-4 border-red-500 bg-red-50/50 flex items-center gap-3">
                        <AlertCircle className="text-red-500" size={20} />
                        <span className="text-red-700 font-medium">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Email Template Config */}
                    <div className="glass-card p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Mail className="text-purple-500" size={20} />
                                Mẫu Email nhắc nợ
                            </h2>
                            <button
                                onClick={() => setPreviewMode(!previewMode)}
                                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                            >
                                {previewMode ? <Edit3 size={14} /> : <Eye size={14} />}
                                {previewMode ? 'Chỉnh sửa' : 'Xem trước'}
                            </button>
                        </div>

                        {!previewMode ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề email</label>
                                    <input
                                        type="text"
                                        className="fc-input w-full"
                                        value={emailConfig.subject}
                                        onChange={(e) => setEmailConfig({...emailConfig, subject: e.target.value})}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Sử dụng {'{{Tên khách hàng}}'} để thay thế tên</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Lời chào</label>
                                    <input
                                        type="text"
                                        className="fc-input w-full"
                                        value={emailConfig.greeting}
                                        onChange={(e) => setEmailConfig({...emailConfig, greeting: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung mở đầu</label>
                                    <textarea
                                        className="fc-input w-full resize-none"
                                        rows={3}
                                        value={emailConfig.opening}
                                        onChange={(e) => setEmailConfig({...emailConfig, opening: e.target.value})}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Biến: {'{{số lượng}}, {{tổng tiền}}'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Lời kết</label>
                                    <textarea
                                        className="fc-input w-full resize-none"
                                        rows={2}
                                        value={emailConfig.closing}
                                        onChange={(e) => setEmailConfig({...emailConfig, closing: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Chữ ký</label>
                                        <input
                                            type="text"
                                            className="fc-input w-full"
                                            value={emailConfig.signature}
                                            onChange={(e) => setEmailConfig({...emailConfig, signature: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Tên công ty</label>
                                        <input
                                            type="text"
                                            className="fc-input w-full"
                                            value={emailConfig.companyName}
                                            onChange={(e) => setEmailConfig({...emailConfig, companyName: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Preview Mode */
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <div className="border-b border-slate-200 pb-3 mb-4">
                                    <p className="text-xs text-slate-500">Tiêu đề:</p>
                                    <p className="font-medium text-slate-800">{emailConfig.subject.replace('{{Tên khách hàng}}', 'Nguyễn Văn A')}</p>
                                </div>
                                <div className="text-sm text-slate-600 space-y-3">
                                    <p>{emailConfig.greeting.replace('{{Tên khách hàng}}', 'Nguyễn Văn A')}</p>
                                    <p>{emailConfig.opening.replace('{{số lượng}}', '3').replace('{{tổng tiền}}', '15.000.000 đ')}</p>
                                    <p className="text-slate-500">Chi tiết các hóa đơn quá hạn:</p>
                                    <ul className="list-disc list-inside pl-4 text-slate-400">
                                        <li>INV-001 - Quá hạn 5 ngày - 5.000.000 đ</li>
                                        <li>INV-002 - Quá hạn 10 ngày - 7.000.000 đ</li>
                                        <li>INV-003 - Quá hạn 15 ngày - 3.000.000 đ</li>
                                    </ul>
                                    <p>{emailConfig.closing}</p>
                                    <p className="pt-3 text-slate-400">
                                        Trân trọng,<br/>
                                        {emailConfig.signature} - {emailConfig.companyName}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Schedule Config */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 space-y-5">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Clock className="text-blue-500" size={20} />
                                Lịch gửi email
                            </h2>

                            {/* Enable/Disable */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="font-semibold text-slate-800">Tự động gửi email</p>
                                    <p className="text-sm text-slate-500">Hệ thống sẽ tự động gửi email nhắc nợ theo lịch</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={scheduleConfig.enabled}
                                        onChange={(e) => setScheduleConfig({...scheduleConfig, enabled: e.target.checked})}
                                    />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Giờ gửi</label>
                                    <input
                                        type="time"
                                        className="fc-input w-full"
                                        value={scheduleConfig.sendTime}
                                        onChange={(e) => setScheduleConfig({...scheduleConfig, sendTime: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tần suất</label>
                                    <select
                                        className="fc-input w-full"
                                        value={scheduleConfig.frequency}
                                        onChange={(e) => setScheduleConfig({...scheduleConfig, frequency: e.target.value})}
                                    >
                                        <option value="daily">Hàng ngày</option>
                                        <option value="weekly">Hàng tuần</option>
                                        <option value="monthly">Hàng tháng (ngày 1)</option>
                                    </select>
                                </div>
                            </div>

                            {scheduleConfig.frequency === 'weekly' && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Ngày gửi trong tuần</label>
                                    <select
                                        className="fc-input w-full"
                                        value={scheduleConfig.weeklyDay}
                                        onChange={(e) => setScheduleConfig({...scheduleConfig, weeklyDay: e.target.value})}
                                    >
                                        {weekDays.map(day => (
                                            <option key={day.value} value={day.value}>{day.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <hr className="border-slate-100" />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Quá hạn tối thiểu (ngày)</label>
                                    <input
                                        type="number"
                                        className="fc-input w-full"
                                        min="1"
                                        value={scheduleConfig.minDaysOverdue}
                                        onChange={(e) => setScheduleConfig({...scheduleConfig, minDaysOverdue: parseInt(e.target.value) || 1})}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Chỉ gửi cho hóa đơn quá hạn ít nhất X ngày</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Khoảng cách nhắc lại (ngày)</label>
                                    <input
                                        type="number"
                                        className="fc-input w-full"
                                        min="1"
                                        value={scheduleConfig.reminderGapDays}
                                        onChange={(e) => setScheduleConfig({...scheduleConfig, reminderGapDays: parseInt(e.target.value) || 7})}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Không gửi lại nếu đã gửi trong X ngày</p>
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="glass-card p-6">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Calendar className="text-green-500" size={18} />
                                Tóm tắt cấu hình
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${scheduleConfig.enabled ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                    <span className="text-slate-600">
                                        Tự động gửi: <strong>{scheduleConfig.enabled ? 'Bật' : 'Tắt'}</strong>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-slate-400" />
                                    <span className="text-slate-600">
                                        Thời gian: <strong>{scheduleConfig.sendTime}</strong> - {frequencyLabels[scheduleConfig.frequency]}
                                        {scheduleConfig.frequency === 'weekly' && ` (${weekDays.find(d => d.value === scheduleConfig.weeklyDay)?.label})`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Bell size={14} className="text-slate-400" />
                                    <span className="text-slate-600">
                                        Điều kiện: Quá hạn ≥ <strong>{scheduleConfig.minDaysOverdue} ngày</strong>, 
                                        chưa gửi trong <strong>{scheduleConfig.reminderGapDays} ngày</strong>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-slate-400 py-6 font-medium">
                    © 2026 ARMS – Internal System
                </div>
            </div>
        </div>
    );
};

export default EmailSettingsPage;
