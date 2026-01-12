// User Roles
export const ROLES = {
    ADMIN: 'ADMIN',
    ACCOUNTANT: 'ACCOUNTANT'
};

export const ROLE_LABELS = {
    ADMIN: 'Quản trị viên',
    ACCOUNTANT: 'Kế toán'
};

export const getRoleLabel = (role) => ROLE_LABELS[role] || role;

export const ROLE_OPTIONS = Object.entries(ROLES).map(([key, value]) => ({
    value: value,
    label: ROLE_LABELS[key]
}));
