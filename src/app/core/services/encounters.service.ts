import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.models';
import { GwStep } from '../../shared/ui/navigation/stepper/stepper.component';

export type EncounterStage =
  | 'registered' | 'awaiting_consult' | 'in_consultation' | 'checkout' | 'closed'
  | 'admission_form' | 'counter' | 'nurse_assignment' | 'medication'
  | 'in_care' | 'discharged' | 'cancelled';

export type EncounterDisposition = 'opd_closed' | 'investigation' | 'admit_ipd';
export type PayerType = 'cash' | 'cashless' | 'pmjay';
export type VisitType = 'opd' | 'emergency';
export type EncounterUrgency = 'routine' | 'urgent' | 'emergency';

export interface EncounterPersonRef { id: string; firstName: string; lastName: string; role?: string; }

export interface EncounterEvent {
  id: string;
  fromStage: EncounterStage | null;
  toStage: EncounterStage;
  action: string;
  actorUserId?: string | null;
  actor?: EncounterPersonRef | null;
  actorRole?: string | null;
  note?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export interface PatientEncounter {
  id: string;
  encounterNumber: string;
  clinicId: string;
  patientId: string;
  patient?: { id: string; firstName: string; lastName: string; phone?: string; patientCode?: string; dateOfBirth?: string; gender?: string };
  chiefComplaint: string;
  urgency: EncounterUrgency;
  visitType: VisitType;
  assignedDoctorId: string;
  assignedDoctor?: EncounterPersonRef;
  department?: string | null;
  appointmentId?: string | null;
  stage: EncounterStage;
  disposition?: EncounterDisposition | null;
  admissionId?: string | null;
  caseFileNumber?: string | null;
  payerType?: PayerType | null;
  admissionDiagnosis?: string | null;
  attendantName?: string | null;
  attendantPhone?: string | null;
  attendantRelation?: string | null;
  assignedNurseId?: string | null;
  assignedNurse?: EncounterPersonRef | null;
  nurseAssignedAt?: string | null;
  prescriptionId?: string | null;
  pharmacyOrderId?: string | null;
  checkoutAmount?: number | string | null;
  paymentMode?: string | null;
  closedAt?: string | null;
  cancelReason?: string | null;
  events?: EncounterEvent[];
  createdAt: string;
}

export interface EncounterStats {
  awaitingConsult: number;
  inConsultation: number;
  admissionForm: number;
  counter: number;
  nurseAssignment: number;
  medication: number;
  inCare: number;
}

export interface NurseBoardEntry {
  id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  patientCount: number;
  patients: { encounterId: string; encounterNumber: string; patientName: string; stage: EncounterStage; admissionId?: string | null }[];
}
export interface UnassignedEntry {
  encounterId: string;
  encounterNumber: string;
  patientName: string;
  urgency: EncounterUrgency;
  createdAt: string;
}
export interface NursingBoard {
  nurses: NurseBoardEntry[];
  unassigned: UnassignedEntry[];
  summary: { totalNurses: number; availableNurses: number; unassignedCount: number; assignedPatients: number };
}

export interface CreateEncounterPayload {
  patientId: string;
  chiefComplaint: string;
  urgency?: EncounterUrgency;
  visitType?: VisitType;
  assignedDoctorId: string;
  department?: string;
}

export interface MedicationItemPayload {
  prescriptionMedicineId?: string;
  medicineName: string;
  strength?: string;
  form?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  prescribedQty?: number;
  isBillable?: boolean;
}

@Injectable({ providedIn: 'root' })
export class EncountersService {
  private readonly base = `${environment.apiUrl}/encounters`;

  constructor(private http: HttpClient) {}

  list(params?: Record<string, string>) {
    return this.http.get<PaginatedResponse<PatientEncounter>>(this.base, { params: this.toParams(params) });
  }

  myWorklist() {
    return this.http.get<PaginatedResponse<PatientEncounter>>(`${this.base}/my-worklist`);
  }

  stats() {
    return this.http.get<ApiResponse<EncounterStats>>(`${this.base}/stats`);
  }

  getById(id: string) {
    return this.http.get<ApiResponse<PatientEncounter>>(`${this.base}/${id}`);
  }

  getForPatient(patientId: string) {
    return this.http.get<ApiResponse<PatientEncounter[]>>(`${this.base}/patient/${patientId}`);
  }

  nurses() {
    return this.http.get<ApiResponse<EncounterPersonRef[]>>(`${this.base}/nurses`);
  }

  nursingBoard() {
    return this.http.get<ApiResponse<NursingBoard>>(`${this.base}/nursing-board`);
  }

  reassignNurse(id: string, payload: { nurseId: string; handoverNotes?: string }) {
    return this.http.patch<ApiResponse<PatientEncounter>>(`${this.base}/${id}/reassign-nurse`, payload);
  }

  register(payload: CreateEncounterPayload) {
    return this.http.post<ApiResponse<PatientEncounter>>(this.base, payload);
  }

  startConsult(id: string) {
    return this.http.patch<ApiResponse<PatientEncounter>>(`${this.base}/${id}/start-consult`, {});
  }

  setDisposition(id: string, payload: { disposition: EncounterDisposition; note?: string; prescriptionId?: string }) {
    return this.http.patch<ApiResponse<PatientEncounter>>(`${this.base}/${id}/disposition`, payload);
  }

  fillAdmissionForm(id: string, payload: { admissionDiagnosis: string; attendantName?: string; attendantPhone?: string; attendantRelation?: string }) {
    return this.http.patch<ApiResponse<PatientEncounter>>(`${this.base}/${id}/admission-form`, payload);
  }

  generateCaseFile(id: string, payload: { payerType: PayerType; bedId: string; admittingDoctorId?: string; admissionType?: string }) {
    return this.http.patch<ApiResponse<PatientEncounter>>(`${this.base}/${id}/case-file`, payload);
  }

  assignNurse(id: string, payload: { nurseId: string; handoverNotes?: string }) {
    return this.http.patch<ApiResponse<PatientEncounter>>(`${this.base}/${id}/assign-nurse`, payload);
  }

  orderMedication(id: string, payload: { pharmacyType: string; prescriptionId?: string; items: MedicationItemPayload[]; notes?: string }) {
    return this.http.patch<ApiResponse<PatientEncounter>>(`${this.base}/${id}/order-medication`, payload);
  }

  checkout(id: string, payload: { amount?: number; paymentMode?: string; note?: string }) {
    return this.http.patch<ApiResponse<PatientEncounter>>(`${this.base}/${id}/checkout`, payload);
  }

  cancel(id: string, reason?: string) {
    return this.http.patch<ApiResponse<PatientEncounter>>(`${this.base}/${id}/cancel`, { reason });
  }

  private toParams(obj?: Record<string, string>): HttpParams {
    let p = new HttpParams();
    if (obj) Object.entries(obj).forEach(([k, v]) => { if (v) p = p.set(k, v); });
    return p;
  }
}

// ─── Journey presentation helpers ──────────────────────────────────────────

export const STAGE_LABELS: Record<EncounterStage, string> = {
  registered: 'Registered',
  awaiting_consult: 'Awaiting Consult',
  in_consultation: 'In Consultation',
  checkout: 'Checkout',
  closed: 'Closed (OPD)',
  admission_form: 'Admission Form',
  counter: 'Counter / Case File',
  nurse_assignment: 'Nurse Assignment',
  medication: 'Medication',
  in_care: 'In Care',
  discharged: 'Discharged',
  cancelled: 'Cancelled',
};

/** OPD spine + the IPD chain appended once disposition === admit_ipd. */
const OPD_SPINE: { key: EncounterStage; label: string }[] = [
  { key: 'registered', label: 'Registered' },
  { key: 'in_consultation', label: 'Consultation' },
];
const IPD_CHAIN: { key: EncounterStage; label: string }[] = [
  { key: 'admission_form', label: 'Admission' },
  { key: 'counter', label: 'Counter' },
  { key: 'nurse_assignment', label: 'Nurse' },
  { key: 'medication', label: 'Medication' },
  { key: 'in_care', label: 'In Care' },
  { key: 'discharged', label: 'Discharge' },
];

/** Order used to compute a stage's "reached" position for stepper status. */
const STAGE_ORDER: EncounterStage[] = [
  'registered', 'awaiting_consult', 'in_consultation', 'checkout', 'closed',
  'admission_form', 'counter', 'nurse_assignment', 'medication', 'in_care', 'discharged',
];

/**
 * Builds the stepper steps + active index for an encounter. OPD-only journeys
 * collapse to Registered → Consultation → Disposition → Closed; admit journeys
 * expand the full IPD chain.
 */
export function computeSteps(e: PatientEncounter): { steps: GwStep[]; active: number } {
  const isAdmit = e.disposition === 'admit_ipd'
    || ['admission_form', 'counter', 'nurse_assignment', 'medication', 'in_care', 'discharged'].includes(e.stage);

  const tail = isAdmit
    ? [{ key: 'disposition' as const, label: 'Disposition' }, ...IPD_CHAIN]
    : [
        { key: 'disposition' as const, label: 'Disposition' },
        { key: 'checkout' as EncounterStage, label: 'Checkout' },
        { key: 'closed' as EncounterStage, label: 'Closed' },
      ];

  const model = [...OPD_SPINE, ...tail];

  // Determine how far along we are.
  const reachedIndex = (() => {
    if (e.stage === 'cancelled') return model.length; // all greyed; we mark error separately
    // Map current stage to a position in the model.
    if (e.stage === 'registered' || e.stage === 'awaiting_consult') return 1;       // consultation current
    if (e.stage === 'in_consultation') return e.disposition ? 2 : 1;                // disposition current once decided
    if (e.stage === 'closed' || e.stage === 'discharged') return model.length;      // all complete
    const idx = model.findIndex(m => m.key === e.stage);
    return idx >= 0 ? idx : 2;
  })();

  const steps: GwStep[] = model.map((m, i) => {
    let status: GwStep['status'];
    if (e.stage === 'cancelled') {
      status = i === 0 ? 'complete' : 'error';
    } else if (i < reachedIndex) {
      status = 'complete';
    } else if (i === reachedIndex) {
      status = 'current';
    } else {
      status = 'pending';
    }
    return { key: m.key, label: m.label, status };
  });

  const active = Math.min(reachedIndex, model.length - 1);
  return { steps, active };
}

export function stageReached(stage: EncounterStage): number {
  const i = STAGE_ORDER.indexOf(stage);
  return i < 0 ? 0 : i;
}
