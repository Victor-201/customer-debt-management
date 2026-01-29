import React, { useState } from 'react';
import {
    Settings, Mail, Clock, Play, AlertCircle, CheckCircle,
    Loader2, RefreshCw, Calendar, Bell, Zap
} from 'lucide-react';
import { automationApi } from '../../api/automation.api';

/* ================= MAIN PAGE ================= */

const AutomationSettingsPage = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleRunReminders = async () => {
        try {
            setIsRunning(true);
            setError(null);
            setResult(null);

            const response = await automationApi.runReminders();
            setResult(response?.data || { sent: 0, failed: 0 });
        } catch (err) {
            console.error('Run reminders error:', err);
            setError(err.response?.data?.message || 'Không thể gửi email nhắc nợ');
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="fc-page-header">
                <div className="fc-page-header__breadcrumb">Cài đặt / Tự động hóa</div>
                <div className="flex items-center gap-2">
                    <Settings className="text-purple-500" size={28} />
                    <h1 className="fc-page-header__title">Tự động hóa nhắc nợ</h1>
                </div>
                <p className="fc-page-header__subtitle">Cấu hình và chạy hệ thống gửi email nhắc nợ tự động</p>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
                {/* Run Reminders Card */}
                <div className="glass-card">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Zap className="w-7 h-7 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-gray-800">Gửi email nhắc nợ ngay</h2>
                            <p className="text-gray-500 mt-1">
                                Hệ thống sẽ quét tất cả hóa đơn quá hạn và gửi email nhắc nợ đến khách hàng.
                                Email được cá nhân hóa theo từng khách hàng với danh sách hóa đơn cụ thể.
                            </p>

                            {/* Result Display */}
                            {result && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-700 font-medium">
                                        <CheckCircle size={18} />
                                        Đã gửi email nhắc nợ thành công
                                    </div>
                                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-green-600">Gửi thành công: </span>
                                            <span className="font-bold">{result.sent || 0}</span>
                                        </div>
                                        <div>
                                            <span className="text-red-600">Thất bại: </span>
                                            <span className="font-bold">{result.failed || 0}</span>
                                        </div>
                                    </div>
                                    {result.errors && result.errors.length > 0 && (
                                        <div className="mt-2 text-sm text-red-600">
                                            {result.errors.map((err, idx) => (
                                                <p key={idx}>{err}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Error Display */}
                            {error && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700">
                                    <AlertCircle size={18} />
                                    <p>{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleRunReminders}
                                disabled={isRunning}
                                className="mt-4 fc-btn fc-btn--primary-glow"
                                style={{ background: '#8b5cf6' }}
                            >
                                {isRunning ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <Play size={18} />
                                        Chạy gửi email ngay
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800">Lịch tự động</h3>
                        </div>
                        <p className="text-sm text-gray-500">
                            Hệ thống tự động gửi email nhắc nợ vào <strong>8:00 sáng</strong> mỗi ngày cho các hóa đơn quá hạn.
                        </p>
                    </div>

                    <div className="glass-card">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Mail className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800">Nội dung email</h3>
                        </div>
                        <p className="text-sm text-gray-500">
                            Email được cá nhân hóa với tên khách hàng, danh sách hóa đơn quá hạn và tổng số tiền cần thanh toán.
                        </p>
                    </div>

                    <div className="glass-card">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Bell className="w-5 h-5 text-orange-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800">Điều kiện gửi</h3>
                        </div>
                        <p className="text-sm text-gray-500">
                            Chỉ gửi cho khách hàng có hóa đơn <strong>quá hạn ít nhất 1 ngày</strong> và chưa được gửi trong 7 ngày gần nhất.
                        </p>
                    </div>
                </div>

                {/* Email Template Preview */}
                <div className="glass-card">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Mail className="text-gray-400" />
                        Mẫu email nhắc nợ
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="border-b border-gray-200 pb-4 mb-4">
                            <p className="text-sm text-gray-500">Tiêu đề:</p>
                            <p className="font-medium text-gray-800">[Nhắc nhở] Thanh toán hóa đơn quá hạn - {"{{Tên khách hàng}}"}</p>
                        </div>
                        <div className="text-sm text-gray-600 space-y-3">
                            <p>Kính gửi <strong>{"{{Tên khách hàng}}"}</strong>,</p>
                            <p>
                                Chúng tôi xin thông báo rằng quý khách có <strong>{"{{số lượng}}"} hóa đơn</strong> đã quá hạn thanh toán
                                với tổng số tiền <strong>{"{{tổng tiền}}"}</strong>.
                            </p>
                            <p>Chi tiết các hóa đơn quá hạn:</p>
                            <ul className="list-disc list-inside pl-4 text-gray-500">
                                <li>{"{{Mã hóa đơn}}"} - Quá hạn {"{{số ngày}}"} ngày - {"{{số tiền}}"}</li>
                            </ul>
                            <p>
                                Vui lòng thanh toán sớm để tránh phát sinh thêm chi phí.
                                Nếu quý khách đã thanh toán, vui lòng bỏ qua email này.
                            </p>
                            <p className="pt-4 text-gray-400">
                                Trân trọng,<br />
                                Phòng Kế toán - Công ty ABC
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutomationSettingsPage;
