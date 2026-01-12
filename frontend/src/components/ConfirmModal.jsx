import { useEffect, useCallback } from 'react';

/**
 * ConfirmModal Component
 * Displays a confirmation dialog
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onConfirm - Confirm handler
 * @param {string} props.title - Modal title
 * @param {string|React.ReactNode} props.message - Confirmation message
 * @param {string} props.confirmText - Confirm button text
 * @param {string} props.cancelText - Cancel button text
 * @param {string} props.variant - Button variant: 'danger', 'warning', 'primary'
 * @param {boolean} props.loading - Whether confirm action is loading
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

    const buttonClass = {
        danger: 'btn-danger',
        warning: 'btn-warning',
        primary: 'btn-primary',
        success: 'btn-success'
    }[variant] || 'btn-primary';

    return (
        <div className="modal-overlay" onClick={loading ? undefined : onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button
                        className="modal-close"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Đóng"
                    >
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    {typeof message === 'string' ? <p>{message}</p> : message}
                </div>

                <div className="modal-footer">
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`btn ${buttonClass}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading-spinner" style={{ width: '16px', height: '16px' }}></span>
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
