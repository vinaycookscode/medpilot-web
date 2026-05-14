import { NgModule } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import {
  LayoutDashboard, Users, Calendar, FileText, Receipt,
  Settings, Stethoscope, LogOut, Search, Bell, Plus,
  Eye, EyeOff, Trash2, ChevronLeft, ChevronRight,
  X, UserPlus, Mail, AlertCircle, CheckCircle2,
  IndianRupee, Clock, UserCheck, AlertTriangle,
  CalendarX, CheckSquare, ArrowUpRight,
  // Topbar additions
  User, KeyRound, ChevronDown, CheckCircle,
  FileStack, Hash, Phone, ShieldCheck, Lock,
  ChevronsUpDown, Loader2, Building2,
  Printer, CreditCard,
  // Prescription detail
  Pill, FlaskConical, Info,
  // Follow-ups
  CalendarCheck, RefreshCw,
  // Landing page
  ArrowRight, TrendingUp, Sparkles,
  // Clinic management
  Package, MapPin, Warehouse,
  // Reports, Labs, Insurance
  ChartBar,
  // Appointments queue detail
  ArrowLeft, CalendarDays, LogIn, MessageSquare, UserX,
  // Sort indicators
  ChevronUp,
  // Dashboard quick actions
  CalendarPlus,
} from 'lucide-angular';

@NgModule({
  imports: [
    LucideAngularModule.pick({
      LayoutDashboard, Users, Calendar, FileText, Receipt,
      Settings, Stethoscope, LogOut, Search, Bell, Plus,
      Eye, EyeOff, Trash2, ChevronLeft, ChevronRight,
      X, UserPlus, Mail, AlertCircle, CheckCircle2,
      IndianRupee, Clock, UserCheck, AlertTriangle,
      CalendarX, CheckSquare, ArrowUpRight,
      User, KeyRound, ChevronDown, CheckCircle,
      FileStack, Hash, Phone, ShieldCheck, Lock,
      ChevronsUpDown, Loader2, Building2,
      Printer, CreditCard,
      Pill, FlaskConical, Info,
      CalendarCheck, RefreshCw,
      ArrowRight, TrendingUp, Sparkles,
      Package, MapPin, Warehouse,
      ChartBar,
      ArrowLeft, CalendarDays, LogIn, MessageSquare, UserX,
      ChevronUp,
      CalendarPlus,
    }),
  ],
  exports: [LucideAngularModule],
})
export class IconsModule {}
