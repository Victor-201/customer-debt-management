import { useEffect, useCallback } from 'react';

/**
 * ConfirmModal Component
 * Displays a confirmation dialog
 */
export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Xác nhận',
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    variant = 'danger',
    loading = false
}) => {
    // Handle escape key
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape' && !loading) {
            onClose();
        }
    }, [onClose, loading]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const buttonStyles = {
        danger: 'bg-[var(--color-error)] hover:opacity-90',
        warning: 'bg-[var(--color-warning)] hover:opacity-90',
        primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-secondary)]',
        success: 'bg-[var(--color-success)] hover:opacity-90'
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={loading ? undefined : onClose}
        >
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Đóng"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4">
                    {typeof message === 'string' ? <p>{message}</p> : message}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <button
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${buttonStyles[variant] || buttonStyles.primary}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Đang xử lý...
                            </>
                        ) : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
