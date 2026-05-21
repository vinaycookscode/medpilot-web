export type WardType = 'general' | 'icu' | 'maternity' | 'pediatric' | 'surgical' | 'private' | 'emergency';
export type BedType = 'general' | 'private' | 'semi_private' | 'icu' | 'deluxe';
export type BedStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';
export type AdmissionType = 'elective' | 'emergency' | 'referral' | 'transfer';
export type AdmissionStatus = 'admitted' | 'discharged' | 'transferred' | 'deceased' | 'absconded';
export type DischargeType = 'recovered' | 'improved' | 'referred' | 'lama' | 'deceased' | 'absconded';
export type ConditionAtDischarge = 'good' | 'satisfactory' | 'stable' | 'serious' | 'critical' | 'poor';
export type NoteType = 'doctor_round' | 'nursing' | 'procedure_note' | 'incident' | 'handover';
export type ChargeType = 'room' | 'procedure' | 'medicine' | 'lab' | 'nursing' | 'service' | 'other';

export interface Ward {
  id: string;
  clinicId: string;
  name: string;
  type: WardType;
  totalBeds: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Bed {
  id: string;
  clinicId: string;
  wardId: string;
  ward?: Ward;
  bedNumber: string;
  bedType: BedType;
  status: BedStatus;
  floor?: string;
  defaultRate: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface WardOccupancy {
  ward: Ward;
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  reserved: number;
  occupancyRate: number;
}

export interface DischargeMedication {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface NoteVitals {
  bp?: string;
  pulse?: number;
  temperature?: number;
  spo2?: number;
  respiratoryRate?: number;
  urineOutput?: number;
  weight?: number;
  bloodSugar?: number;
  notes?: string;
}

export interface IpdAdmission {
  id: string;
  clinicId: string;
  admissionNumber: string;
  patientId: string;
  patient?: { id: string; firstName: string; lastName: string; phone: string; patientCode: string };
  bedId: string;
  bed?: Bed;
  wardId: string;
  ward?: Ward;
  admittingDoctorId: string;
  admittingDoctor?: { id: string; firstName: string; lastName: string; specialization?: string };
  attendingDoctorId?: string;
  attendingDoctor?: { id: string; firstName: string; lastName: string };
  admissionDate: string;
  admissionTime: string;
  admissionType: AdmissionType;
  admissionDiagnosis: string;
  attendantName?: string;
  attendantPhone?: string;
  attendantRelation?: string;
  status: AdmissionStatus;
  dischargeDate?: string;
  dischargeTime?: string;
  dischargeType?: DischargeType;
  finalDiagnosis?: string;
  icd10Codes: string[];
  conditionAtDischarge?: ConditionAtDischarge;
  procedureSummary?: string;
  investigationSummary?: string;
  treatmentGiven?: string;
  clinicalSummary?: string;
  dischargeMedications?: DischargeMedication[];
  followUpDate?: string;
  followUpInstructions?: string;
  invoiceId?: string;
  notes?: string;
  createdAt: string;
}

export interface IpdDailyNote {
  id: string;
  admissionId: string;
  clinicId: string;
  patientId: string;
  noteDate: string;
  noteTime: string;
  noteType: NoteType;
  authorId: string;
  author?: { id: string; firstName: string; lastName: string; role: string };
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  vitalsSnapshot?: NoteVitals;
  notes?: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface IpdProcedure {
  id: string;
  admissionId: string;
  clinicId: string;
  patientId: string;
  procedureName: string;
  procedureCode?: string;
  performedById: string;
  performedBy?: { id: string; firstName: string; lastName: string };
  performedAt: string;
  anesthesiaType?: string;
  durationMinutes?: number;
  notes?: string;
  complications?: string;
  amount: number;
}

export interface IpdCharge {
  id: string;
  admissionId: string;
  clinicId: string;
  chargeDate: string;
  chargeType: ChargeType;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  serviceId?: string;
  isPosted: boolean;
  notes?: string;
}

export interface IpdStats {
  currentAdmissions: number;
  todayAdmissions: number;
  todayDischarges: number;
  pendingDischarges: number;
}

export interface CreateAdmissionDto {
  patientId: string;
  bedId: string;
  admittingDoctorId: string;
  attendingDoctorId?: string;
  admissionDate: string;
  admissionTime: string;
  admissionType?: AdmissionType;
  admissionDiagnosis: string;
  attendantName?: string;
  attendantPhone?: string;
  attendantRelation?: string;
  notes?: string;
}

export interface DischargePatientDto {
  dischargeDate: string;
  dischargeTime: string;
  dischargeType: DischargeType;
  finalDiagnosis: string;
  icd10Codes?: string[];
  conditionAtDischarge: ConditionAtDischarge;
  procedureSummary?: string;
  investigationSummary?: string;
  treatmentGiven?: string;
  clinicalSummary: string;
  dischargeMedications?: DischargeMedication[];
  followUpDate?: string;
  followUpInstructions?: string;
}

export interface CreateDailyNoteDto {
  noteDate: string;
  noteTime: string;
  noteType?: NoteType;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  vitalsSnapshot?: NoteVitals;
  notes?: string;
  isPrivate?: boolean;
}

export interface AddChargeDto {
  chargeDate?: string;
  chargeType: ChargeType;
  description: string;
  quantity?: number;
  unitPrice: number;
  serviceId?: string;
  notes?: string;
}
