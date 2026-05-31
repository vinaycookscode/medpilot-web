import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.models';
import { Patient, CreatePatientDto, PatientVital } from '../models/patient.models';

export interface PatientOverview {
  patient: { id: string; name: string; firstName?: string; lastName?: string; patientCode?: string; phone?: string; gender?: string; dateOfBirth?: string; bloodGroup?: string };
  currentStatus: 'admitted' | 'opd_active' | 'inactive';
  activeAdmission?: { admissionNumber: string; diagnosis?: string; ward?: string; bed?: string; doctor?: string; admissionDate?: string; lengthOfStay?: number } | null;
  activeEncounter?: { encounterNumber: string; stage: string; chiefComplaint?: string; doctor?: string } | null;
  counts: { admissions: number; opdVisits: number; prescriptions: number; investigations: number };
}

export interface HistoryAdmission {
  id: string; admissionNumber: string; status: string;
  admissionDate?: string; dischargeDate?: string; admissionType?: string;
  admissionDiagnosis?: string; finalDiagnosis?: string; dischargeType?: string;
  conditionAtDischarge?: string; clinicalSummary?: string; treatmentGiven?: string;
  followUpDate?: string; followUpInstructions?: string;
  dischargeMedications?: { name: string; dose: string; frequency: string; duration: string; instructions?: string }[];
  ward?: string; bed?: string; doctor?: string; lengthOfStay?: number; invoiceId?: string;
  dischargeProcessId?: string | null; billAmount?: number | null; hasBill?: boolean; hasClinicalRecord?: boolean;
}
export interface HistoryVisit {
  id: string; encounterNumber: string; createdAt: string; stage: string; disposition?: string;
  chiefComplaint?: string; urgency?: string; visitType?: string; doctor?: string; nurse?: string;
  payerType?: string; admissionId?: string;
}
export interface HistoryPrescription {
  id: string; createdAt: string; diagnosis?: string; chiefComplaint?: string; doctor?: string;
  medicineCount: number; medicines: { name: string; dosage?: string; frequency?: string; duration?: string }[];
}
export interface HistoryInvestigation {
  id: string; orderNumber: string; departmentType: string; createdAt: string; status: string;
  reportFileUrl?: string; reportNotes?: string; amount: number; admissionId?: string;
}
export interface HistoryPharmacy {
  id: string; orderNumber: string; createdAt: string; status: string; pharmacyType: string; totalAmount: number; admissionId?: string;
}
export interface PatientHistory {
  patient: PatientOverview['patient'] & { allergies?: string[] };
  summary: {
    currentStatus: string; activeAdmission?: HistoryAdmission | null; activeEncounter?: HistoryVisit | null;
    totalAdmissions: number; totalOpdVisits: number; totalPrescriptions: number; totalInvestigations: number; totalPharmacy: number;
    lastVisitAt?: string | null;
  };
  admissions: HistoryAdmission[];
  opdVisits: HistoryVisit[];
  prescriptions: HistoryPrescription[];
  investigations: HistoryInvestigation[];
  pharmacy: HistoryPharmacy[];
}

@Injectable({ providedIn: 'root' })
export class PatientsService {
  private readonly api = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  list(params: { search?: string; page?: number; limit?: number } = {}) {
    let p = new HttpParams();
    if (params.search) p = p.set('search', params.search);
    if (params.page)   p = p.set('page', params.page);
    if (params.limit)  p = p.set('limit', params.limit);
    return this.http.get<PaginatedResponse<Patient>>(this.api, { params: p });
  }

  get(id: string) {
    return this.http.get<ApiResponse<Patient>>(`${this.api}/${id}`);
  }

  create(body: CreatePatientDto) {
    return this.http.post<ApiResponse<Patient>>(this.api, body);
  }

  update(id: string, body: Partial<CreatePatientDto>) {
    return this.http.put<ApiResponse<Patient>>(`${this.api}/${id}`, body);
  }

  delete(id: string) {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`);
  }

  overview(patientId: string) {
    return this.http.get<ApiResponse<PatientOverview>>(`${this.api}/${patientId}/overview`);
  }

  history(patientId: string) {
    return this.http.get<ApiResponse<PatientHistory>>(`${this.api}/${patientId}/history`);
  }

  getVitals(patientId: string) {
    return this.http.get<ApiResponse<PatientVital[]>>(`${this.api}/${patientId}/vitals`);
  }

  addVital(patientId: string, body: Omit<PatientVital, 'id' | 'patientId' | 'recordedAt' | 'recordedById'>) {
    return this.http.post<ApiResponse<PatientVital>>(`${this.api}/${patientId}/vitals`, body);
  }
}
