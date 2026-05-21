import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import {
  Ward, Bed, BedStatus, WardOccupancy, IpdAdmission, IpdDailyNote,
  IpdProcedure, IpdCharge, IpdStats, CreateAdmissionDto,
  DischargePatientDto, CreateDailyNoteDto, AddChargeDto,
} from '../models/ipd.models';
import { TriageVitals, OpdQueueStats } from '../models/appointment.models';
import { Appointment } from '../models/appointment.models';

@Injectable({ providedIn: 'root' })
export class IpdService {
  private readonly api = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // ─── OPD ──────────────────────────────────────────────────────────────────

  getOpdQueue(date?: string, page = 1, limit = 50, status?: string) {
    const params: any = { page, limit };
    if (date) params.date = date;
    if (status) params.status = status;
    return this.http.get<ApiResponse<Appointment[]> & { stats: OpdQueueStats }>(
      `${this.api}/appointments/opd-queue`, { params },
    );
  }

  triage(appointmentId: string, vitals: TriageVitals) {
    return this.http.patch<ApiResponse<Appointment>>(
      `${this.api}/appointments/${appointmentId}/triage`, vitals,
    );
  }

  // ─── Wards ────────────────────────────────────────────────────────────────

  getWards() {
    return this.http.get<ApiResponse<Ward[]>>(`${this.api}/ipd/wards`);
  }

  getWardOccupancy() {
    return this.http.get<ApiResponse<WardOccupancy[]>>(`${this.api}/ipd/wards/occupancy`);
  }

  createWard(dto: Partial<Ward>) {
    return this.http.post<ApiResponse<Ward>>(`${this.api}/ipd/wards`, dto);
  }

  updateWard(id: string, dto: Partial<Ward>) {
    return this.http.patch<ApiResponse<Ward>>(`${this.api}/ipd/wards/${id}`, dto);
  }

  deleteWard(id: string) {
    return this.http.delete<ApiResponse<void>>(`${this.api}/ipd/wards/${id}`);
  }

  // ─── Beds ─────────────────────────────────────────────────────────────────

  getBeds(wardId?: string, status?: BedStatus) {
    const params: any = {};
    if (wardId) params.wardId = wardId;
    if (status) params.status = status;
    return this.http.get<ApiResponse<Bed[]>>(`${this.api}/ipd/beds`, { params });
  }

  getAvailableBeds(wardId?: string) {
    const params: any = {};
    if (wardId) params.wardId = wardId;
    return this.http.get<ApiResponse<Bed[]>>(`${this.api}/ipd/beds/available`, { params });
  }

  createBed(dto: any) {
    return this.http.post<ApiResponse<Bed>>(`${this.api}/ipd/beds`, dto);
  }

  updateBed(id: string, dto: any) {
    return this.http.patch<ApiResponse<Bed>>(`${this.api}/ipd/beds/${id}`, dto);
  }

  updateBedStatus(id: string, status: BedStatus) {
    return this.http.patch<ApiResponse<Bed>>(`${this.api}/ipd/beds/${id}/status`, { status });
  }

  // ─── Admissions ───────────────────────────────────────────────────────────

  getStats() {
    return this.http.get<ApiResponse<IpdStats>>(`${this.api}/ipd/admissions/stats`);
  }

  getAdmissions(params: Record<string, any> = {}) {
    return this.http.get<ApiResponse<IpdAdmission[]>>(`${this.api}/ipd/admissions`, { params });
  }

  getAdmission(id: string) {
    return this.http.get<ApiResponse<IpdAdmission>>(`${this.api}/ipd/admissions/${id}`);
  }

  admit(dto: CreateAdmissionDto) {
    return this.http.post<ApiResponse<IpdAdmission>>(`${this.api}/ipd/admissions`, dto);
  }

  discharge(id: string, dto: DischargePatientDto) {
    return this.http.patch<ApiResponse<IpdAdmission>>(`${this.api}/ipd/admissions/${id}/discharge`, dto);
  }

  transferBed(id: string, toBedId: string, reason?: string) {
    return this.http.patch<ApiResponse<IpdAdmission>>(
      `${this.api}/ipd/admissions/${id}/transfer-bed`,
      { toBedId, transferReason: reason },
    );
  }

  // ─── Daily Notes ──────────────────────────────────────────────────────────

  getNotes(admissionId: string) {
    return this.http.get<ApiResponse<IpdDailyNote[]>>(
      `${this.api}/ipd/admissions/${admissionId}/notes`,
    );
  }

  addNote(admissionId: string, dto: CreateDailyNoteDto) {
    return this.http.post<ApiResponse<IpdDailyNote>>(
      `${this.api}/ipd/admissions/${admissionId}/notes`, dto,
    );
  }

  updateNote(admissionId: string, noteId: string, dto: Partial<CreateDailyNoteDto>) {
    return this.http.patch<ApiResponse<IpdDailyNote>>(
      `${this.api}/ipd/admissions/${admissionId}/notes/${noteId}`, dto,
    );
  }

  // ─── Charges ──────────────────────────────────────────────────────────────

  getCharges(admissionId: string) {
    return this.http.get<ApiResponse<{ charges: IpdCharge[]; byType: Record<string, number>; total: number }>>(
      `${this.api}/ipd/admissions/${admissionId}/charges`,
    );
  }

  addCharge(admissionId: string, dto: AddChargeDto) {
    return this.http.post<ApiResponse<IpdCharge>>(
      `${this.api}/ipd/admissions/${admissionId}/charges`, dto,
    );
  }

  // ─── Procedures ───────────────────────────────────────────────────────────

  getProcedures(admissionId: string) {
    return this.http.get<ApiResponse<IpdProcedure[]>>(
      `${this.api}/ipd/admissions/${admissionId}/procedures`,
    );
  }
}
