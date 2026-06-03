export interface HealthEvent {
  id: string;
  type: 'vaccine' | 'vet_visit' | 'medication' | 'deworming';
  title: string;
  date: string;
  nextDueDate?: string;
  notes?: string;
  documentUri?: string;
}

export interface FoodLog {
  id: string;
  date: string;
  amountGrams: number;
}

export interface WaterLog {
  id: string;
  date: string;
  servings: number;
}

export interface WeightLog {
  id: string;
  date: string;
  weightKg: number;
}

export interface GroomingLog {
  id: string;
  date: string;
  type: 'bath' | 'haircut' | 'nails' | 'ears' | 'teeth' | 'other';
  notes?: string;
}

export interface VetInfo {
  name: string;
  clinic: string;
  phone: string;
  notes: string;
}

export interface MedicationDoseLog {
  id: string;
  date: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'as_needed';
  startDate: string;
  endDate?: string;
  notes?: string;
  logs: MedicationDoseLog[];
}

export interface ActivityLog {
  id: string;
  date: string;
  type: 'walk' | 'run' | 'play' | 'swim' | 'training' | 'other';
  durationMinutes: number;
  distanceKm?: number;
  notes?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: 'vet' | 'food' | 'medicine' | 'grooming' | 'accessories' | 'other';
  amount: number;
  description: string;
  notes?: string;
}

export interface Photo {
  id: string;
  date: string;
  uri: string;
  caption?: string;
}

export interface CareTask {
  id: string;
  name: string;
  type: 'bath' | 'nails' | 'dental' | 'deworming' | 'flea_treatment' | 'ear_clean' | 'other';
  frequencyDays: number;
  lastDone?: string;
  notes?: string;
}

export interface Symptom {
  id: string;
  date: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  dateOfBirth?: string;
  gender: 'male' | 'female';
  weightKg: number;
  avatarUri?: string;
  foodTargetGrams: number;
  waterTargetServings: number;
  vet: VetInfo;
  healthEvents: HealthEvent[];
  foodLogs: FoodLog[];
  waterLogs: WaterLog[];
  weightLogs: WeightLog[];
  groomingLogs: GroomingLog[];
  medications: Medication[];
  activityLogs: ActivityLog[];
  expenses: Expense[];
  photos: Photo[];
  careTasks: CareTask[];
  symptoms: Symptom[];
}
