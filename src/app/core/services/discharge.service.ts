import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.models';
import { GwStep } from '../../shared/ui/navigation/stepper/stepper.component';

export type DischargeStage = 'rmo_card' | 'billing' | 'completed' | 'cancelled';

export interface DischargeMedication {
  name: string; dose: string; frequency: string; duration: string; instructions?: string;
}

export interface DischargeProcess {
  id: string;
  clinicId: string;
  admissionId: string;
  admission?: {
    id: string; admissionNumber: string; admissionDate?: string;
    patient?: { id: string; firstName: string; lastName: string; patientCode?: string };
  };
  stage: DischargeStage;
  initiatedById: string;
  initiatedBy?: { id: string; firstName: string; lastName: string };
  initiatedAt: string;
  dischargeAdvice?: string | null;
  dischargeMedications?: DischargeMedication[] | null;
  cardCreatedById?: string | null;
  cardCreatedBy?: { id: string; firstName: string; lastName: string } | null;
  cardCreatedAt?: string | null;
  finalDiagnosis?: string | null;
  treatmentGiven?: string | null;
  clinicalSummary?: string | null;
  followUpInstructions?: string | null;
  conditionAtDischarge?: string | null;
  dischargeType?: string | null;
  followUpDate?: string | null;
  icd10Codes?: string[];
  invoiceId?: string | null;
  billAmount?: number | string | null;
  billedAt?: string | null;
  completedAt?: string | null;
  cancelReason?: string | null;
  createdAt: string;
}

export interface ActivityLine {
  category: string; description: string; quantity: number; unitPrice: number; amount: number;
}
export interface ActivitySheet {
  admissionId: string;
  admissionNumber: string;
  patient?: { id: string; name: string; patientCode?: string } | null;
  lineItems: ActivityLine[];
  grandTotal: number;
}

export interface ChargeSummary {
  admissionId: string;
  grandTotal: number;
  byCategory: { category: string; total: number }[];
  lineItems: ActivityLine[];
}

export interface InitiateDischargePayload {
  admissionId: string;
  dischargeAdvice?: string;
  dischargeMedications?: DischargeMedication[];
}
export interface DischargeCardPayload {
  finalDiagnosis: string;
  dischargeType: string;
  conditionAtDischarge: string;
  clinicalSummary: string;
  treatmentGiven?: string;
  followUpInstructions?: string;
  followUpDate?: string;
  icd10Codes?: string[];
}

@Injectable({ providedIn: 'root' })
export class DischargeService {
  private readonly base = `${environment.apiUrl}/discharge`;

  constructor(private http: HttpClient) {}

  list(params?: Record<string, string>) {
    return this.http.get<PaginatedResponse<DischargeProcess>>(this.base, { params: this.toParams(params) });
  }
  myWorklist() {
    return this.http.get<PaginatedResponse<DischargeProcess>>(`${this.base}/my-worklist`);
  }
  getById(id: string) {
    return this.http.get<ApiResponse<DischargeProcess>>(`${this.base}/${id}`);
  }
  forAdmission(admissionId: string) {
    return this.http.get<ApiResponse<DischargeProcess[]>>(`${this.base}/admission/${admissionId}`);
  }
  chargeSummary(admissionId: string) {
    return this.http.get<ApiResponse<ChargeSummary>>(`${this.base}/admission/${admissionId}/charge-summary`);
  }
  getActivitySheet(id: string) {
    return this.http.get<ApiResponse<ActivitySheet>>(`${this.base}/${id}/activity-sheet`);
  }
  initiate(payload: InitiateDischargePayload) {
    return this.http.post<ApiResponse<DischargeProcess>>(this.base, payload);
  }
  createCard(id: string, payload: DischargeCardPayload) {
    return this.http.patch<ApiResponse<DischargeProcess>>(`${this.base}/${id}/card`, payload);
  }
  generateBill(id: string) {
    return this.http.patch<ApiResponse<DischargeProcess>>(`${this.base}/${id}/generate-bill`, {});
  }
  cancel(id: string, reason?: string) {
    return this.http.patch<ApiResponse<DischargeProcess>>(`${this.base}/${id}/cancel`, { reason });
  }
  /** Attachment 1 — itemized hospital bill (PDF blob). */
  getBill(id: string) {
    return this.http.get(`${this.base}/${id}/bill`, { responseType: 'blob' });
  }
  /** Attachment 2 — clinical record: rounds, handovers, notes (PDF blob). */
  getClinicalRecord(id: string) {
    return this.http.get(`${this.base}/${id}/clinical-record`, { responseType: 'blob' });
  }
  /** Bill (PDF blob) addressable by admission — works for discharged patients from history. */
  getBillByAdmission(admissionId: string) {
    return this.http.get(`${this.base}/admission/${admissionId}/bill`, { responseType: 'blob' });
  }
  /** Clinical record (PDF blob) addressable by admission. */
  getClinicalRecordByAdmission(admissionId: string) {
    return this.http.get(`${this.base}/admission/${admissionId}/clinical-record`, { responseType: 'blob' });
  }

  private toParams(obj?: Record<string, string>): HttpParams {
    let p = new HttpParams();
    if (obj) Object.entries(obj).forEach(([k, v]) => { if (v) p = p.set(k, v); });
    return p;
  }
}

export const DISCHARGE_STAGE_LABELS: Record<DischargeStage, string> = {
  rmo_card: 'Discharge Card',
  billing: 'Billing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

/** Stepper model: Initiated → Discharge Card → Billing → Completed. */
export function computeDischargeSteps(p: DischargeProcess): { steps: GwStep[]; active: number } {
  const model = [
    { label: 'Initiated' },
    { label: 'Discharge Card' },
    { label: 'Billing' },
    { label: 'Completed' },
  ];
  const reached = (() => {
    switch (p.stage) {
      case 'rmo_card': return 1;
      case 'billing': return 2;
      case 'completed': return model.length;
      case 'cancelled': return model.length;
      default: return 1;
    }
  })();
  const steps: GwStep[] = model.map((m, i) => {
    let status: GwStep['status'];
    if (p.stage === 'cancelled') status = i === 0 ? 'complete' : 'error';
    else if (i < reached) status = 'complete';
    else if (i === reached) status = 'current';
    else status = 'pending';
    return { label: m.label, status };
  });
  return { steps, active: Math.min(reached, model.length - 1) };
}
