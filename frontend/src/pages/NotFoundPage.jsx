import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>

                {/* Error Code */}
                <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>

                {/* Title */}
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    Không tìm thấy trang
                </h2>

                {/* Description */}
                <p className="text-gray-500 mb-8">
                    Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
                    Vui lòng kiểm tra lại URL hoặc quay về trang chủ.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        <ArrowLeft size={18} />
                        Quay lại
                    </button>
                    <Link
                        to="/dashboard"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        <Home size={18} />
                        Về trang chủ
                    </Link>
                </div>

                {/* Help Text */}
                <p className="text-sm text-gray-400 mt-8">
                    Nếu bạn tin rằng đây là lỗi, vui lòng liên hệ quản trị viên.
                </p>
            </div>
        </div>
    );
};

export default NotFoundPage;
