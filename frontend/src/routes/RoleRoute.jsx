import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/auth.slice.js';

/**
 * RoleRoute Component
 * Protects routes that require specific roles
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {Array<string>} props.allowedRoles - Array of allowed role names
 */
const RoleRoute = ({ children, allowedRoles = [] }) => {
    const user = useSelector(selectUser);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // User doesn't have required role
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default RoleRoute;
