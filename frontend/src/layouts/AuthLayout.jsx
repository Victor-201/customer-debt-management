import { Outlet } from 'react-router-dom';

/**
 * AuthLayout
 * Layout for authentication pages (login, register, etc.)
 */
const AuthLayout = () => {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--color-background)',
                padding: 'var(--spacing-4)'
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '400px'
                }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-8)' }}>
                    <h1 style={{
                        fontSize: 'var(--font-size-3xl)',
                        fontWeight: 700,
                        color: 'var(--color-primary)'
                    }}>
                        ARMS
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Hệ thống Quản lý Công nợ Khách hàng
                    </p>
                </div>

                {/* Auth Content */}
                <div className="card">
                    <Outlet />
                </div>

                {/* Footer */}
                <p
                    style={{
                        textAlign: 'center',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-muted)',
                        marginTop: 'var(--spacing-6)'
                    }}
                >
                    © 2026 ARMS - Accounts Receivable Management System
                </p>
            </div>
        </div>
    );
};

export default AuthLayout;
