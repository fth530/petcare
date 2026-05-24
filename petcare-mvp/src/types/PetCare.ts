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

export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  dateOfBirth: string;
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
}
