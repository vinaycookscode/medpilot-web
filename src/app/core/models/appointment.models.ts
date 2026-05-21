export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type AppointmentType = 'new_patient' | 'follow_up' | 'emergency' | 'routine';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patient?: { id: string; firstName: string; lastName: string; phone: string; patientCode: string };
  doctor?: { id: string; firstName: string; lastName: string; specialization?: string };
  appointmentDate: string;
  startTime: string;
  endTime?: string;
  status: AppointmentStatus;
  appointmentType: AppointmentType;
  tokenNumber?: number;
  chiefComplaint?: string;
  notes?: string;
  followUpDate?: string;
  cancelledReason?: string;
  opdNumber?: string;
  triageAt?: string;
  triageById?: string;
  triageVitals?: TriageVitals;
  createdAt: string;
}

export interface TriageVitals {
  bp?: string;
  pulse?: number;
  temperature?: number;
  spo2?: number;
  respiratoryRate?: number;
  weight?: number;
  height?: number;
  notes?: string;
}

export interface OpdQueueStats {
  waiting: number;
  inProgress: number;
  completed: number;
  triaged: number;
}

export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  startTime: string;
  appointmentType?: AppointmentType;
  chiefComplaint?: string;
  notes?: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}
