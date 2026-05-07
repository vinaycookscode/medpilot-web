export type AppointmentStatus = 'scheduled' | 'confirmed' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type AppointmentType = 'consultation' | 'follow_up' | 'procedure' | 'emergency' | 'routine_checkup';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patient?: { id: string; firstName: string; lastName: string; phone: string; patientCode: string };
  doctor?: { id: string; firstName: string; lastName: string; specialization?: string };
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  type: AppointmentType;
  tokenNumber?: number;
  chiefComplaint?: string;
  notes?: string;
  followUpDate?: string;
  cancelledReason?: string;
  createdAt: string;
}

export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  chiefComplaint?: string;
  notes?: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}
