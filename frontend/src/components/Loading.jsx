/**
 * Loading Component
 * Displays a loading spinner with optional text
 * 
 * @param {Object} props
 * @param {string} props.size - Size variant: 'small', 'medium', 'large'
 * @param {string} props.text - Optional loading text
 * @param {boolean} props.fullPage - Whether to display full page centered
 */
export const Loading = ({
    size = 'medium',
    text = 'Đang tải...',
    fullPage = false
}) => {
    const sizeClass = {
        small: '',
        medium: '',
        large: 'loading-spinner--lg'
    }[size] || '';

    if (fullPage) {
        return (
            <div className="loading-container" style={{ minHeight: '400px' }}>
                <div className={`loading-spinner ${sizeClass}`}></div>
                {text && <p className="loading-text">{text}</p>}
            </div>
        );
    }

    return (
        <div className="loading-container">
            <div className={`loading-spinner ${sizeClass}`}></div>
            {text && <p className="loading-text">{text}</p>}
        </div>
    );
};

/**
 * LoadingOverlay Component
 * Displays a loading overlay on top of content
 */
export const LoadingOverlay = ({ show = false }) => {
    if (!show) return null;

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
            }}
        >
            <div className="loading-spinner loading-spinner--lg"></div>
        </div>
    );
};

/**
 * InlineLoading Component
 * Small inline loading indicator
 */
export const InlineLoading = () => (
    <span className="loading-spinner" style={{ width: '16px', height: '16px' }}></span>
);

export default Loading;
