// Mock data for development without backend

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

// Mock Invoices
export const mockInvoices = [
    {
        id: 'INV-2026-001',
        customerId: 1,
        customerName: 'Công ty TNHH ABC Tech',
        issueDate: '2026-01-01',
        dueDate: '2026-01-31',
        paymentTerm: 'NET_30',
        items: [
            { id: 1, description: 'Phần mềm quản lý kho - License 1 năm', quantity: 1, unitPrice: 15000000 },
            { id: 2, description: 'Dịch vụ triển khai', quantity: 1, unitPrice: 5000000 },
            { id: 3, description: 'Đào tạo nhân viên (8 giờ)', quantity: 8, unitPrice: 500000 }
        ],
        subtotal: 24000000,
        taxRate: 10,
        taxAmount: 2400000,
        total: 26400000,
        paidAmount: 0,
        balance: 26400000,
        status: 'PENDING',
        notes: 'Hợp đồng số HĐ-2026-001',
        createdAt: '2026-01-01T09:00:00Z'
    },
    {
        id: 'INV-2026-002',
        customerId: 2,
        customerName: 'Công ty CP XYZ Solutions',
        issueDate: '2025-12-15',
        dueDate: '2026-01-14',
        paymentTerm: 'NET_30',
        items: [
            { id: 1, description: 'Máy chủ Dell PowerEdge R750', quantity: 2, unitPrice: 85000000 },
            { id: 2, description: 'Ổ cứng SSD 1TB', quantity: 8, unitPrice: 3500000 }
        ],
        subtotal: 198000000,
        taxRate: 10,
        taxAmount: 19800000,
        total: 217800000,
        paidAmount: 100000000,
        balance: 117800000,
        status: 'PARTIAL',
        notes: 'Thanh toán đợt 1 đã nhận',
        createdAt: '2025-12-15T10:30:00Z'
    },
    {
        id: 'INV-2026-003',
        customerId: 3,
        customerName: 'Công ty TNHH Thương mại Hòa Phát',
        issueDate: '2025-11-01',
        dueDate: '2025-12-01',
        paymentTerm: 'NET_30',
        items: [
            { id: 1, description: 'Thiết bị mạng Cisco', quantity: 5, unitPrice: 12000000 },
            { id: 2, description: 'Cáp mạng Cat6 (cuộn 300m)', quantity: 3, unitPrice: 1500000 }
        ],
        subtotal: 64500000,
        taxRate: 10,
        taxAmount: 6450000,
        total: 70950000,
        paidAmount: 0,
        balance: 70950000,
        status: 'OVERDUE',
        notes: 'Đã gửi email nhắc nợ lần 2',
        createdAt: '2025-11-01T14:00:00Z'
    },
    {
        id: 'INV-2026-004',
        customerId: 1,
        customerName: 'Công ty TNHH ABC Tech',
        issueDate: '2025-12-20',
        dueDate: '2026-01-19',
        paymentTerm: 'NET_30',
        items: [
            { id: 1, description: 'Bảo trì hệ thống Q1/2026', quantity: 1, unitPrice: 8000000 }
        ],
        subtotal: 8000000,
        taxRate: 10,
        taxAmount: 800000,
        total: 8800000,
        paidAmount: 8800000,
        balance: 0,
        status: 'PAID',
        notes: 'Thanh toán qua chuyển khoản ngày 10/01/2026',
        createdAt: '2025-12-20T08:00:00Z'
    },
    {
        id: 'INV-2026-005',
        customerId: 4,
        customerName: 'Công ty TNHH Điện tử Việt Nam',
        issueDate: '2026-01-05',
        dueDate: '2026-03-06',
        paymentTerm: 'NET_60',
        items: [
            { id: 1, description: 'Linh kiện điện tử các loại', quantity: 1, unitPrice: 45000000 },
            { id: 2, description: 'Phí vận chuyển', quantity: 1, unitPrice: 500000 }
        ],
        subtotal: 45500000,
        taxRate: 10,
        taxAmount: 4550000,
        total: 50050000,
        paidAmount: 0,
        balance: 50050000,
        status: 'PENDING',
        notes: '',
        createdAt: '2026-01-05T11:00:00Z'
    },
    {
        id: 'INV-2026-006',
        customerId: 5,
        customerName: 'Công ty CP Phân phối Miền Nam',
        issueDate: '2025-10-15',
        dueDate: '2025-11-14',
        paymentTerm: 'NET_30',
        items: [
            { id: 1, description: 'Hàng hóa theo đơn hàng ĐH-2025-089', quantity: 1, unitPrice: 35000000 }
        ],
        subtotal: 35000000,
        taxRate: 10,
        taxAmount: 3500000,
        total: 38500000,
        paidAmount: 10000000,
        balance: 28500000,
        status: 'OVERDUE',
        notes: 'Khách hàng cam kết thanh toán trong tuần',
        createdAt: '2025-10-15T15:30:00Z'
    },
    {
        id: 'INV-2026-007',
        customerId: 2,
        customerName: 'Công ty CP XYZ Solutions',
        issueDate: '2026-01-10',
        dueDate: '2026-02-09',
        paymentTerm: 'NET_30',
        items: [
            { id: 1, description: 'Dịch vụ tư vấn IT', quantity: 40, unitPrice: 1500000 }
        ],
        subtotal: 60000000,
        taxRate: 10,
        taxAmount: 6000000,
        total: 66000000,
        paidAmount: 0,
        balance: 66000000,
        status: 'DRAFT',
        notes: 'Chờ xác nhận từ khách hàng',
        createdAt: '2026-01-10T09:00:00Z'
    }
];

// Mock Payments
export const mockPayments = [
    {
        id: 'PAY-2026-001',
        invoiceId: 'INV-2026-002',
        invoiceNumber: 'INV-2026-002',
        customerName: 'Công ty CP XYZ Solutions',
        amount: 100000000,
        paymentMethod: 'BANK_TRANSFER',
        paymentDate: '2025-12-28',
        reference: 'TK-VCB-281225',
        note: 'Thanh toán đợt 1 - 50%',
        createdBy: 'admin@company.com',
        createdAt: '2025-12-28T10:15:00Z'
    },
    {
        id: 'PAY-2026-002',
        invoiceId: 'INV-2026-004',
        invoiceNumber: 'INV-2026-004',
        customerName: 'Công ty TNHH ABC Tech',
        amount: 8800000,
        paymentMethod: 'BANK_TRANSFER',
        paymentDate: '2026-01-10',
        reference: 'TK-TCB-100126',
        note: 'Thanh toán toàn bộ hóa đơn',
        createdBy: 'admin@company.com',
        createdAt: '2026-01-10T14:30:00Z'
    },
    {
        id: 'PAY-2026-003',
        invoiceId: 'INV-2026-006',
        invoiceNumber: 'INV-2026-006',
        customerName: 'Công ty CP Phân phối Miền Nam',
        amount: 10000000,
        paymentMethod: 'CASH',
        paymentDate: '2025-11-20',
        reference: 'PT-2025-089',
        note: 'Thu tiền mặt tại văn phòng',
        createdBy: 'admin@company.com',
        createdAt: '2025-11-20T16:00:00Z'
    }
];

// Helper to generate next invoice ID
export const generateInvoiceId = () => {
    const year = new Date().getFullYear();
    const maxNum = mockInvoices
        .filter(inv => inv.id.includes(`INV-${year}`))
        .reduce((max, inv) => {
            const num = parseInt(inv.id.split('-')[2], 10);
            return num > max ? num : max;
        }, 0);
    return `INV-${year}-${String(maxNum + 1).padStart(3, '0')}`;
};

// Helper to generate next payment ID  
export const generatePaymentId = () => {
    const year = new Date().getFullYear();
    const maxNum = mockPayments
        .filter(pay => pay.id.includes(`PAY-${year}`))
        .reduce((max, pay) => {
            const num = parseInt(pay.id.split('-')[2], 10);
            return num > max ? num : max;
        }, 0);
    return `PAY-${year}-${String(maxNum + 1).padStart(3, '0')}`;
};
