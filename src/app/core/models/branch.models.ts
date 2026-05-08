export interface Branch {
  id: string;
  clinicId: string;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  isHeadOffice: boolean;
  isActive: boolean;
  createdAt: string;
}
