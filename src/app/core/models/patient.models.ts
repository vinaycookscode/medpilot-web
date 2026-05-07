export type Gender = 'male' | 'female' | 'other';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Patient {
  id: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  phoneAlt?: string;
  dateOfBirth?: string;
  age?: number;
  gender: Gender;
  bloodGroup?: BloodGroup;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications?: string[];
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  referredBy?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  phoneAlt?: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodGroup?: BloodGroup;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  referredBy?: string;
  notes?: string;
  tags?: string[];
}

export interface PatientVital {
  id: string;
  patientId: string;
  type: string;
  value: string;
  unit: string;
  recordedAt: string;
  recordedById: string;
  notes?: string;
}
