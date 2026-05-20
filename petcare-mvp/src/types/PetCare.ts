export interface HealthEvent {
  id: string;
  type: 'vaccine' | 'vet_visit' | 'medication' | 'deworming';
  title: string;
  date: string; // ISO 8601 format
  nextDueDate?: string; // ISO 8601 format
  notes?: string;
  documentUri?: string; // Local URI from ImagePicker
}

export interface FoodLog {
  id: string;
  date: string;
  amountGrams: number;
}

export interface WaterLog {
  id: string;
  date: string;
  servings: number; // e.g., 1 serving = 250ml
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
  healthEvents: HealthEvent[];
  foodLogs: FoodLog[];
  waterLogs: WaterLog[];
}
