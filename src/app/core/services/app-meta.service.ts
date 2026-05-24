import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

export interface MetaOption { value: string; label: string; color?: string | null; }
export interface DoctorMeta { id: string; name: string; firstName: string; lastName: string; specialization: string; consultationFee: number; avatarUrl?: string; }
export interface DepartmentMeta { id: string; name: string; code?: string; }
export interface WardMeta { id: string; name: string; type?: string; }
export interface ClinicMeta {
  id: string; name: string; type: string; logoUrl?: string;
  addressLine1?: string; city?: string; state?: string; pincode?: string;
  phone?: string; email?: string; gstin?: string; registrationNumber?: string;
  gstRegistered: boolean; currency: string; timezone: string; settings: Record<string, any>;
}

export interface AppMeta {
  clinic: ClinicMeta | null;
  meta: Record<string, MetaOption[]>;
  departments: DepartmentMeta[];
  wards: WardMeta[];
  doctors: DoctorMeta[];
  permissions: Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canApprove: boolean }>;
}

const STORAGE_KEY = 'mp_app_meta';
const VERSION_KEY = 'mp_app_meta_version';
const POLL_INTERVAL_MS = 5000;

@Injectable({ providedIn: 'root' })
export class AppMetaService implements OnDestroy {
  private readonly api = `${environment.apiUrl}/app-meta`;

  private _meta = signal<AppMeta | null>(this.loadFromStorage());
  readonly meta = this._meta.asReadonly();
  readonly loaded = computed(() => this._meta() !== null);

  // Meta option shortcuts
  readonly specializations  = computed(() => this._meta()?.meta['specialization']   ?? []);
  readonly appointmentTypes = computed(() => this._meta()?.meta['appointment_type'] ?? []);
  readonly admissionTypes   = computed(() => this._meta()?.meta['admission_type']   ?? []);
  readonly dischargeTypes   = computed(() => this._meta()?.meta['discharge_type']   ?? []);
  readonly patientConditions= computed(() => this._meta()?.meta['patient_condition']?? []);
  readonly noteTypes        = computed(() => this._meta()?.meta['note_type']        ?? []);
  readonly ipdChargeTypes   = computed(() => this._meta()?.meta['ipd_charge_type']  ?? []);
  readonly bloodGroups      = computed(() => this._meta()?.meta['blood_group']      ?? []);
  readonly genders          = computed(() => this._meta()?.meta['gender']           ?? []);
  readonly medicineUnits    = computed(() => this._meta()?.meta['medicine_unit']    ?? []);
  readonly dosageFrequencies= computed(() => this._meta()?.meta['dosage_frequency'] ?? []);
  readonly medicineRoutes   = computed(() => this._meta()?.meta['medicine_route']   ?? []);
  readonly bedCategories    = computed(() => this._meta()?.meta['bed_category']     ?? []);
  readonly leaveTypes       = computed(() => this._meta()?.meta['leave_type']       ?? []);

  readonly clinic      = computed(() => this._meta()?.clinic ?? null);
  readonly departments = computed(() => this._meta()?.departments ?? []);
  readonly wards       = computed(() => this._meta()?.wards ?? []);
  readonly doctors     = computed(() => this._meta()?.doctors ?? []);
  readonly permissions = computed(() => this._meta()?.permissions ?? {});

  private pollTimer: any = null;
  private knownVersion: string | null = sessionStorage.getItem(VERSION_KEY);
  private visibilityHandler: (() => void) | null = null;

  constructor(private http: HttpClient) {
    if (typeof document !== 'undefined') {
      this.visibilityHandler = () => {
        if (document.visibilityState === 'visible') {
          // Tab became visible — catch up immediately then resume polling
          this.checkVersionAndRefresh();
        }
      };
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
    if (this.visibilityHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  load() {
    return this.http.get<ApiResponse<AppMeta>>(this.api).pipe(
      map(r => r.data),
      tap(data => {
        this._meta.set(data);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }),
    );
  }

  /** Fetch the lightweight version stamp; called by the polling loop. */
  fetchVersion() {
    return this.http.get<ApiResponse<{ version: string }>>(`${this.api}/version`).pipe(
      map(r => r.data),
    );
  }

  /** Start polling for permission/meta changes. Idempotent. */
  startAutoRefresh() {
    if (this.pollTimer !== null) return;
    // Kick off an immediate check so we don't wait a full interval to catch
    // changes that landed while this tab was idle / mid-login.
    this.checkVersionAndRefresh();
    this.pollTimer = setInterval(() => this.checkVersionAndRefresh(), POLL_INTERVAL_MS);
  }

  /** Force a refresh now — called by route navigation events. */
  refreshNow() {
    this.checkVersionAndRefresh();
  }

  /** Stop polling (call on logout). */
  stopAutoRefresh() {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /**
   * Hits /app-meta/version. If the server's version differs from the one we
   * last applied, re-fetches the full payload so signals update and the UI
   * re-renders automatically.
   */
  private checkVersionAndRefresh() {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    this.fetchVersion().pipe(catchError(() => of(null))).subscribe(res => {
      if (!res) return;
      if (this.knownVersion === null || res.version !== this.knownVersion) {
        this.load().pipe(catchError(() => of(null))).subscribe(data => {
          if (data) {
            this.knownVersion = res.version;
            sessionStorage.setItem(VERSION_KEY, res.version);
          }
        });
      }
    });
  }

  clear() {
    this.stopAutoRefresh();
    this._meta.set(null);
    this.knownVersion = null;
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(VERSION_KEY);
  }

  canDo(module: string, action: 'canView' | 'canCreate' | 'canEdit' | 'canApprove'): boolean {
    return this._meta()?.permissions?.[module]?.[action] ?? false;
  }

  private loadFromStorage(): AppMeta | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Guard against stale wrapper-shaped cache from an earlier buggy version
      // that stored the full ApiResponse instead of just the data payload.
      if (!parsed || typeof parsed !== 'object' || !('meta' in parsed) || !('permissions' in parsed)) {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(VERSION_KEY);
        return null;
      }
      return parsed as AppMeta;
    } catch {
      return null;
    }
  }
}
