export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'insurance';

export interface InvoiceItem {
  id: string;
  serviceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'flat' | 'percent';
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  appointmentId?: string;
  patient?: { id: string; firstName: string; lastName: string; phone: string };
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate?: string;
  subtotal: number;
  discountTotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalGst: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  notes?: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  gstRate: number;
  category?: string;
  isActive: boolean;
}
