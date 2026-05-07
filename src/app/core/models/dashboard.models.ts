export interface TodayAppointmentStats {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
  noShow: number;
}

export interface TodayRevenue {
  collected: number;
  pending: number;
}

export interface DashboardSummary {
  todayAppointments: TodayAppointmentStats;
  todayRevenue: TodayRevenue;
  totalPatients: number;
  newPatientsThisMonth: number;
  pendingInvoicesCount: number;
  pendingInvoicesAmount: number;
}

// API returns [{ status: string, count: string }]
export interface AppointmentStatusCount {
  status: string;
  count: string;
}

export interface RevenueData {
  period: string;
  totalCollected: number;
  totalTransactions: number;
  chart: { date: string; total: string; transactions: string }[];
}

export interface PatientStats {
  total: number;
  newThisMonth: number;
  newThisWeek: number;
}

export interface DoctorStats {
  id: string;
  name: string;
  specialization: string;
  todayCount: number;
  monthCount: number;
  completedCount: number;
}
