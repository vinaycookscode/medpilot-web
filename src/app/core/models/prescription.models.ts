export interface PrescriptionMedicine {
  id: string;
  medicineId?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  timing?: string;
  instructions?: string;
  quantity?: number;
  sortOrder: number;
}

export interface PrescriptionTest {
  id: string;
  testName: string;
  instructions?: string;
  sortOrder: number;
}

export interface Prescription {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  patient?: { id: string; firstName: string; lastName: string; phone: string; patientCode: string };
  doctor?: { id: string; firstName: string; lastName: string; specialization?: string };
  diagnosis: string;
  chiefComplaint?: string;
  examinationNotes?: string;
  advice?: string;
  followUpDate?: string;
  followUpNotes?: string;
  medicines: PrescriptionMedicine[];
  tests: PrescriptionTest[];
  vitalsSnapshot?: Record<string, unknown>;
  pdfUrl?: string;
  createdAt: string;
}

export interface PrescriptionMedicineDto {
  medicineId?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  timing?: string;
  instructions?: string;
  quantity?: number;
}

export interface PrescriptionTestDto {
  testName: string;
  instructions?: string;
}

export interface CreatePrescriptionDto {
  patientId: string;
  appointmentId?: string;
  diagnosis: string;
  chiefComplaint?: string;
  examinationNotes?: string;
  advice?: string;
  followUpDate?: string;
  followUpNotes?: string;
  medicines?: PrescriptionMedicineDto[];
  tests?: PrescriptionTestDto[];
}

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  category?: string;
  form?: string;
  strength?: string;
}
