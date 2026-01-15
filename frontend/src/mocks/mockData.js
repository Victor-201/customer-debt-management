// Mock data for development without backend
// NOTE: mockInvoices and mockPayments have been removed - now using real backend API
// Only mockCustomers remains for customer.api.js compatibility (to be updated later)

// Mock Customers
export const mockCustomers = [
    {
        id: 1,
        name: 'Công ty TNHH ABC Tech',
        email: 'contact@abctech.vn',
        phone: '0901234567',
        address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        paymentTerm: 'NET_30',
        creditLimit: 100000000,
        riskLevel: 'NORMAL',
        status: 'ACTIVE',
        createdAt: '2025-06-15T00:00:00Z'
    },
    {
        id: 2,
        name: 'Công ty CP XYZ Solutions',
        email: 'info@xyzsolutions.vn',
        phone: '0902345678',
        address: '456 Lê Lợi, Quận 3, TP.HCM',
        paymentTerm: 'NET_45',
        creditLimit: 200000000,
        riskLevel: 'NORMAL',
        status: 'ACTIVE',
        createdAt: '2025-07-20T00:00:00Z'
    },
    {
        id: 3,
        name: 'Công ty TNHH Thương mại Hòa Phát',
        email: 'sales@hoaphat.vn',
        phone: '0903456789',
        address: '789 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
        paymentTerm: 'NET_30',
        creditLimit: 150000000,
        riskLevel: 'WARNING',
        status: 'ACTIVE',
        createdAt: '2025-08-10T00:00:00Z'
    },
    {
        id: 4,
        name: 'Công ty TNHH Điện tử Việt Nam',
        email: 'order@vne.vn',
        phone: '0904567890',
        address: '321 Cách Mạng Tháng 8, Quận 10, TP.HCM',
        paymentTerm: 'NET_60',
        creditLimit: 300000000,
        riskLevel: 'NORMAL',
        status: 'ACTIVE',
        createdAt: '2025-05-05T00:00:00Z'
    },
    {
        id: 5,
        name: 'Công ty CP Phân phối Miền Nam',
        email: 'contact@miennam.vn',
        phone: '0905678901',
        address: '555 Võ Văn Tần, Quận 3, TP.HCM',
        paymentTerm: 'NET_30',
        creditLimit: 50000000,
        riskLevel: 'HIGH_RISK',
        status: 'ACTIVE',
        createdAt: '2025-09-01T00:00:00Z'
    }
];
