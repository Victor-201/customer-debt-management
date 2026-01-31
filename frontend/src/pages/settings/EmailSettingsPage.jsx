import React, { useState, useEffect, useMemo } from 'react';
import {
    Settings, Mail, Clock, Save, AlertCircle, CheckCircle,
    Loader2, FileText, Calendar, Bell, Copy, Code, Variable, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import emailApi from '../../api/email.api';
import settingsApi from '../../api/settings.api';

/* ================= TEMPLATE VARIABLES ================= */
const TEMPLATE_VARIABLES = [
    { key: '{{customerName}}', label: 'Tên khách hàng', description: 'Tên đầy đủ của khách hàng' },
    { key: '{{customerEmail}}', label: 'Email khách hàng', description: 'Địa chỉ email' },
    { key: '{{invoiceNumber}}', label: 'Số hóa đơn', description: 'Mã hóa đơn (VD: INV-001)' },
    { key: '{{invoiceAmount}}', label: 'Số tiền hóa đơn', description: 'Tổng tiền cần thanh toán' },
    { key: '{{dueDate}}', label: 'Ngày đến hạn', description: 'Ngày đến hạn thanh toán' },
    { key: '{{daysOverdue}}', label: 'Số ngày quá hạn', description: 'Số ngày đã quá hạn' },
    { key: '{{companyName}}', label: 'Tên công ty', description: 'Tên công ty gửi email' },
];

/* ================= VARIABLE PICKER ================= */
const VariablePicker = ({ onInsert }) => {
    const [copied, setCopied] = useState(null);

    const handleCopy = (variable) => {
        navigator.clipboard.writeText(variable);
        setCopied(variable);
        setTimeout(() => setCopied(null), 1500);
    };

    return (
        <div className="glass-card p-4 space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Variable size={18} className="text-purple-500" />
                Biến có sẵn
            </h3>
            <p className="text-xs text-slate-500">Click để chèn vào editor hoặc sao chép</p>
            <div className="grid gap-2">
                {TEMPLATE_VARIABLES.map((v) => (
                    <div
                        key={v.key}
                        className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-purple-50 transition-colors group cursor-pointer"
                        onClick={() => onInsert(v.key)}
                    >
                        <div className="flex-1">
                            <code className="text-sm font-mono text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                                {v.key}
                            </code>
                            <p className="text-xs text-slate-500 mt-1">{v.description}</p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(v.key);
                            }}
                            className="p-1.5 text-slate-400 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Sao chép"
                        >
                            {copied === v.key ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ================= EMAIL SETTINGS PAGE ================= */
const EmailSettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('editor'); // 'editor', 'html', 'preview'
    const quillRef = React.useRef(null);

    // Email template config
    const [emailConfig, setEmailConfig] = useState({
        subject: '[Nhắc nhở] Thanh toán hóa đơn quá hạn - {{customerName}}',
        html: `<p>Kính gửi <strong>{{customerName}}</strong>,</p>
<p>Chúng tôi xin thông báo rằng hóa đơn <strong>{{invoiceNumber}}</strong> với số tiền <strong>{{invoiceAmount}}</strong> đã quá hạn thanh toán <strong>{{daysOverdue}}</strong> ngày (hạn thanh toán: {{dueDate}}).</p>
<p>Vui lòng thanh toán sớm để tránh phát sinh thêm chi phí và ảnh hưởng đến uy tín tín dụng của quý khách.</p>
<p><strong>Thông tin thanh toán:</strong></p>
<ul>
    <li>Số hóa đơn: {{invoiceNumber}}</li>
    <li>Số tiền: {{invoiceAmount}}</li>
    <li>Ngày đến hạn: {{dueDate}}</li>
</ul>
<p>Nếu quý khách đã thanh toán, vui lòng bỏ qua email này.</p>
<p>Trân trọng,<br/><strong>Phòng Kế toán</strong><br/>{{companyName}}</p>`
    });

    // Schedule config
    const [scheduleConfig, setScheduleConfig] = useState({
        enabled: true,
        sendTime: '08:00',
        frequency: 'daily',
        weeklyDay: 1,
        cron: '0 8 * * *'
    });

    // Quill editor modules
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['link'],
            ['clean']
        ],
    }), []);

    const formats = [
        'header', 'bold', 'italic', 'underline', 'strike',
        'color', 'background', 'list', 'bullet', 'align', 'link'
    ];

    // Load settings from API
    useEffect(() => {
        const loadSettings = async () => {
            try {
                setLoading(true);
                const templates = await emailApi.getTemplates();
                const reminderTemplate = templates.find(t => t.type === 'reminder') || templates[0];
                if (reminderTemplate) {
                    setEmailConfig({
                        subject: reminderTemplate.subject || emailConfig.subject,
                        html: reminderTemplate.html || emailConfig.html
                    });
                }

                const settings = await settingsApi.getSettings();
                if (settings && settings.cron) {
                    const cronParts = settings.cron.SEND_REMINDER?.split(' ') || ['0', '8', '*', '*', '*'];
                    const hour = cronParts[1] || '8';
                    const minute = cronParts[0] || '0';

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
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    const buildCronExpression = (config) => {
        const [hour, minute] = config.sendTime.split(':');
        switch (config.frequency) {
            case 'weekly': return `${minute} ${hour} * * ${config.weeklyDay}`;
            case 'monthly': return `${minute} ${hour} 1 * *`;
            default: return `${minute} ${hour} * * *`;
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            await emailApi.updateTemplate('reminder', {
                subject: emailConfig.subject,
                html: emailConfig.html
            });

            const cronExpression = buildCronExpression(scheduleConfig);
            await settingsApi.updateSettings({
                cron: { SEND_REMINDER: cronExpression }
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

    const handleInsertVariable = (variable) => {
        const editor = quillRef.current?.getEditor();
        if (editor) {
            const range = editor.getSelection(true);
            editor.insertText(range.index, variable);
            editor.setSelection(range.index + variable.length);
        }
    };

    const previewHtml = emailConfig.html
        .replace(/\{\{customerName\}\}/g, '<strong style="color:#7c3aed">Nguyễn Văn A</strong>')
        .replace(/\{\{customerEmail\}\}/g, 'nguyenvana@email.com')
        .replace(/\{\{invoiceNumber\}\}/g, '<code style="background:#f3e8ff;padding:2px 6px;border-radius:4px">INV-2026-001</code>')
        .replace(/\{\{invoiceAmount\}\}/g, '<strong style="color:#dc2626">15.000.000 đ</strong>')
        .replace(/\{\{dueDate\}\}/g, '15/01/2026')
        .replace(/\{\{daysOverdue\}\}/g, '<strong style="color:#f59e0b">7</strong>')
        .replace(/\{\{companyName\}\}/g, 'FA Credit');

    const weekDays = [
        { value: 1, label: 'Thứ 2' }, { value: 2, label: 'Thứ 3' },
        { value: 3, label: 'Thứ 4' }, { value: 4, label: 'Thứ 5' },
        { value: 5, label: 'Thứ 6' }, { value: 6, label: 'Thứ 7' },
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
            {/* Background */}
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
                            Cấu hình Email Template
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">
                            Thiết lập nội dung và lịch gửi email nhắc nợ tự động
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/reports/email-history"
                            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium flex items-center gap-2 transition-colors"
                        >
                            <FileText size={18} />
                            Lịch sử gửi
                        </Link>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-purple-500/25"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
                        </button>
                    </div>
                </div>

                {/* Messages */}
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Email Editor */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Subject */}
                        <div className="glass-card p-6 space-y-4">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Mail className="text-purple-500" size={20} />
                                Tiêu đề Email
                            </h2>
                            <input
                                type="text"
                                className="fc-input w-full"
                                value={emailConfig.subject}
                                onChange={(e) => setEmailConfig({ ...emailConfig, subject: e.target.value })}
                                placeholder="Nhập tiêu đề email..."
                            />
                            <p className="text-xs text-slate-400">
                                Sử dụng các biến như <code className="bg-slate-100 px-1 rounded">{'{{customerName}}'}</code> để tự động thay thế
                            </p>
                        </div>

                        {/* Rich Text Editor */}
                        <div className="glass-card p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Code className="text-blue-500" size={20} />
                                    Nội dung Email
                                </h2>
                                <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('editor')}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'editor' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'
                                            }`}
                                    >
                                        Editor
                                    </button>
                                    <button
                                        onClick={() => setViewMode('html')}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'html' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'
                                            }`}
                                    >
                                        HTML
                                    </button>
                                    <button
                                        onClick={() => setViewMode('preview')}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${viewMode === 'preview' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'
                                            }`}
                                    >
                                        <Eye size={14} />
                                        Preview
                                    </button>
                                </div>
                            </div>

                            {viewMode === 'editor' && (
                                <div className="email-editor-container">
                                    <style>{`
                                        .email-editor-container .ql-container {
                                            min-height: 300px;
                                            font-size: 14px;
                                            font-family: inherit;
                                        }
                                        .email-editor-container .ql-editor {
                                            min-height: 300px;
                                        }
                                        .email-editor-container .ql-toolbar {
                                            border-radius: 12px 12px 0 0;
                                            background: #f8fafc;
                                            border-color: #e2e8f0;
                                        }
                                        .email-editor-container .ql-container {
                                            border-radius: 0 0 12px 12px;
                                            border-color: #e2e8f0;
                                        }
                                    `}</style>
                                    <ReactQuill
                                        ref={quillRef}
                                        theme="snow"
                                        value={emailConfig.html}
                                        onChange={(html) => setEmailConfig({ ...emailConfig, html })}
                                        modules={modules}
                                        formats={formats}
                                        placeholder="Soạn nội dung email..."
                                    />
                                </div>
                            )}

                            {viewMode === 'html' && (
                                <textarea
                                    className="fc-input w-full font-mono text-sm leading-relaxed resize-none"
                                    rows={16}
                                    value={emailConfig.html}
                                    onChange={(e) => setEmailConfig({ ...emailConfig, html: e.target.value })}
                                    placeholder="Nhập HTML code..."
                                    spellCheck={false}
                                />
                            )}

                            {viewMode === 'preview' && (
                                <div className="bg-white border border-slate-200 rounded-xl p-6 min-h-[300px]">
                                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                                </div>
                            )}
                        </div>

                        {/* Schedule Config */}
                        <div className="glass-card p-6 space-y-5">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Clock className="text-blue-500" size={20} />
                                Lịch gửi tự động
                            </h2>

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

                            <div className="p-4 bg-purple-50 rounded-xl">
                                <p className="text-sm text-purple-700">
                                    <strong>Cron Expression:</strong>{' '}
                                    <code className="bg-purple-100 px-2 py-0.5 rounded font-mono">
                                        {buildCronExpression(scheduleConfig)}
                                    </code>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Variable Picker */}
                    <div className="space-y-6">
                        <VariablePicker onInsert={handleInsertVariable} />

                        {/* Quick Stats */}
                        <div className="glass-card p-5">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                <Bell className="text-green-500" size={18} />
                                Hướng dẫn
                            </h3>
                            <div className="space-y-3 text-sm text-slate-600">
                                <p>1. Sử dụng <strong>Editor</strong> để soạn nội dung với định dạng</p>
                                <p>2. Click vào <strong>biến</strong> ở bên phải để chèn vào editor</p>
                                <p>3. Chuyển sang <strong>HTML</strong> để chỉnh sửa code trực tiếp</p>
                                <p>4. Xem <strong>Preview</strong> để kiểm tra kết quả</p>
                            </div>
                        </div>
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

export default EmailSettingsPage;
