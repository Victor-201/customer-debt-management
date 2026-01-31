import React, { useState, useEffect } from 'react';
import {
    Settings, Mail, Clock, Save, AlertCircle, CheckCircle,
    Loader2, FileText, Calendar, Bell, Edit3, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import emailApi from '../../api/email.api';
import settingsApi from '../../api/settings.api';

/* ================= EMAIL SETTINGS PAGE ================= */

const EmailSettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);

    // Email template config
    const [emailConfig, setEmailConfig] = useState({
        subject: '[Nhắc nhở] Thanh toán hóa đơn quá hạn - {{customerName}}',
        html: `<p>Kính gửi {{customerName}},</p>
<p>Chúng tôi xin thông báo rằng quý khách có hóa đơn đã quá hạn thanh toán.</p>
<p>Vui lòng thanh toán sớm để tránh phát sinh thêm chi phí.</p>
<p>Trân trọng,<br/>Phòng Kế toán - FE Credit</p>`
    });

    // Schedule config (cron based)
    const [scheduleConfig, setScheduleConfig] = useState({
        enabled: true,
        sendTime: '08:00',
        frequency: 'daily', // daily, weekly, monthly
        weeklyDay: 1, // Monday = 1
        cron: '0 8 * * *' // Default: 8 AM every day
    });

    const [previewMode, setPreviewMode] = useState(false);

    // Load settings from API
    useEffect(() => {
        const loadSettings = async () => {
            try {
                setLoading(true);

                // Load email templates
                const templates = await emailApi.getTemplates();
                const reminderTemplate = templates.find(t => t.type === 'reminder') || templates[0];
                if (reminderTemplate) {
                    setEmailConfig({
                        subject: reminderTemplate.subject || emailConfig.subject,
                        html: reminderTemplate.html || emailConfig.html
                    });
                }

                // Load settings
                const settings = await settingsApi.getSettings();
                if (settings && settings.cron) {
                    const cronParts = settings.cron.SEND_REMINDER?.split(' ') || ['0', '8', '*', '*', '*'];
                    const hour = cronParts[1] || '8';
                    const minute = cronParts[0] || '0';

                    // Determine frequency from cron
                    let frequency = 'daily';
                    let weeklyDay = 1;
                    if (cronParts[4] !== '*') {
                        frequency = 'weekly';
                        weeklyDay = parseInt(cronParts[4]) || 1;
                    } else if (cronParts[2] !== '*') {
                        frequency = 'monthly';
                    }

                    setScheduleConfig({
                        enabled: true,
                        sendTime: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`,
                        frequency,
                        weeklyDay,
                        cron: settings.cron.SEND_REMINDER
                    });
                }
            } catch (err) {
                console.error('Failed to load settings:', err);
                // Use defaults if API fails
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, []);

    // Convert schedule config to cron expression
    const buildCronExpression = (config) => {
        const [hour, minute] = config.sendTime.split(':');

        switch (config.frequency) {
            case 'weekly':
                return `${minute} ${hour} * * ${config.weeklyDay}`;
            case 'monthly':
                return `${minute} ${hour} 1 * *`;
            default: // daily
                return `${minute} ${hour} * * *`;
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            // Save email template
            await emailApi.updateTemplate('reminder', {
                subject: emailConfig.subject,
                html: emailConfig.html
            });

            // Save schedule settings
            const cronExpression = buildCronExpression(scheduleConfig);
            await settingsApi.updateSettings({
                cron: {
                    SEND_REMINDER: cronExpression
                }
            });

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Failed to save settings:', err);
            setError(err.response?.data?.message || 'Không thể lưu cấu hình');
        } finally {
            setSaving(false);
        }
    };

    const frequencyLabels = {
        daily: 'Hàng ngày',
        weekly: 'Hàng tuần',
        monthly: 'Hàng tháng'
    };

    const weekDays = [
        { value: 1, label: 'Thứ 2' },
        { value: 2, label: 'Thứ 3' },
        { value: 3, label: 'Thứ 4' },
        { value: 4, label: 'Thứ 5' },
        { value: 5, label: 'Thứ 6' },
        { value: 6, label: 'Thứ 7' },
        { value: 0, label: 'Chủ nhật' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

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
                                        onChange={(e) => setEmailConfig({ ...emailConfig, subject: e.target.value })}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Sử dụng {'{{customerName}}'} để thay thế tên khách hàng</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung email (HTML)</label>
                                    <textarea
                                        className="fc-input w-full resize-none font-mono text-sm"
                                        rows={12}
                                        value={emailConfig.html}
                                        onChange={(e) => setEmailConfig({ ...emailConfig, html: e.target.value })}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">
                                        Biến: {'{{customerName}}, {{invoiceNumber}}, {{amount}}, {{dueDate}}'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Preview Mode */
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <div className="border-b border-slate-200 pb-3 mb-4">
                                    <p className="text-xs text-slate-500">Tiêu đề:</p>
                                    <p className="font-medium text-slate-800">
                                        {emailConfig.subject.replace('{{customerName}}', 'Nguyễn Văn A')}
                                    </p>
                                </div>
                                <div
                                    className="text-sm text-slate-600 prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{
                                        __html: emailConfig.html
                                            .replace(/\{\{customerName\}\}/g, 'Nguyễn Văn A')
                                            .replace(/\{\{invoiceNumber\}\}/g, 'INV-001')
                                            .replace(/\{\{amount\}\}/g, '15.000.000 đ')
                                            .replace(/\{\{dueDate\}\}/g, '15/01/2026')
                                    }}
                                />
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
                                        onChange={(e) => setScheduleConfig({ ...scheduleConfig, enabled: e.target.checked })}
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
                                        onChange={(e) => setScheduleConfig({ ...scheduleConfig, sendTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tần suất</label>
                                    <select
                                        className="fc-input w-full"
                                        value={scheduleConfig.frequency}
                                        onChange={(e) => setScheduleConfig({ ...scheduleConfig, frequency: e.target.value })}
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
                                        onChange={(e) => setScheduleConfig({ ...scheduleConfig, weeklyDay: parseInt(e.target.value) })}
                                    >
                                        {weekDays.map(day => (
                                            <option key={day.value} value={day.value}>{day.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
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
                                    <span className="text-slate-600 font-mono text-xs">
                                        Cron: {buildCronExpression(scheduleConfig)}
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
