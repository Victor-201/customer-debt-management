import { Link } from 'react-router-dom';

/**
 * PageHeader Component
 * Displays a page title with optional subtitle and actions
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Optional subtitle
 * @param {React.ReactNode} props.actions - Action buttons/links
 * @param {Array} props.breadcrumbs - Breadcrumb items [{label, to}]
 */
export const PageHeader = ({
    title,
    subtitle,
    actions,
    breadcrumbs
}) => {
    return (
        <div className="page-header">
            <div>
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav className="breadcrumbs" style={{ marginBottom: 'var(--spacing-2)' }}>
                        {breadcrumbs.map((item, index) => (
                            <span key={index} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                {item.to ? (
                                    <Link to={item.to} style={{ color: 'var(--color-primary)' }}>
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span>{item.label}</span>
                                )}
                                {index < breadcrumbs.length - 1 && (
                                    <span style={{ margin: '0 var(--spacing-2)' }}>/</span>
                                )}
                            </span>
                        ))}
                    </nav>
                )}
                <h1 className="page-title">{title}</h1>
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>

            {actions && (
                <div className="page-actions flex gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
