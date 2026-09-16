// Tipos generados a mano a partir del esquema SQL en /supabase.
// Si el esquema cambia, actualizar este archivo junto con los .sql.

export type TextSize = 'normal' | 'grande' | 'muy_grande';
export type ThemeMode = 'claro' | 'oscuro';
export type GlucoseUnit = 'mg/dL' | 'mmol/L';
export type WeightUnit = 'kg' | 'lb';
export type TemperatureUnit = '°C' | '°F';
export type MedicationForm =
  | 'comprimido'
  | 'capsula'
  | 'liquido'
  | 'inyeccion'
  | 'gotas'
  | 'crema'
  | 'inhalador'
  | 'parche'
  | 'otro';
export type GlucoseContext = 'ayunas' | 'antes_comer' | 'despues_comer' | 'antes_dormir' | 'otro';
export type MedicationLogStatus = 'pending' | 'taken' | 'skipped' | 'snoozed';
export type CaregiverPermission = 'read' | 'edit';
export type CaregiverStatus = 'pending' | 'accepted' | 'revoked';

export type EnabledMetrics = {
  glucose: boolean;
  blood_pressure: boolean;
  weight: boolean;
  temperature: boolean;
  heart_rate: boolean;
  oxygen: boolean;
}

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  phone: string | null;
  avatar_url: string | null;
  text_size: TextSize;
  high_contrast: boolean;
  theme: ThemeMode;
  glucose_unit: GlucoseUnit;
  timezone: string;
  enabled_metrics: EnabledMetrics;
  reminders_enabled: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type Medication = {
  id: string;
  user_id: string;
  name: string;
  active_ingredient: string | null;
  dose: number;
  dose_unit: string;
  form: MedicationForm;
  instructions: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type MedicationSchedule = {
  id: string;
  medication_id: string;
  user_id: string;
  time_of_day: string; // 'HH:MM:SS'
  days_of_week: number[]; // 0=domingo .. 6=sabado
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type MedicationLog = {
  id: string;
  medication_id: string;
  schedule_id: string | null;
  user_id: string;
  scheduled_for: string;
  taken_at: string | null;
  status: MedicationLogStatus;
  snoozed_until: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type GlucoseReading = {
  id: string;
  user_id: string;
  value: number;
  unit: GlucoseUnit;
  context: GlucoseContext;
  measured_at: string;
  notes: string | null;
  created_at: string;
}

export type BloodPressureReading = {
  id: string;
  user_id: string;
  systolic: number;
  diastolic: number;
  heart_rate: number | null;
  measured_at: string;
  notes: string | null;
  created_at: string;
}

export type WeightReading = {
  id: string;
  user_id: string;
  value: number;
  unit: WeightUnit;
  measured_at: string;
  notes: string | null;
  created_at: string;
}

export type TemperatureReading = {
  id: string;
  user_id: string;
  value: number;
  unit: TemperatureUnit;
  measured_at: string;
  notes: string | null;
  created_at: string;
}

export type HeartRateReading = {
  id: string;
  user_id: string;
  value: number;
  measured_at: string;
  notes: string | null;
  created_at: string;
}

export type OxygenReading = {
  id: string;
  user_id: string;
  value: number;
  measured_at: string;
  notes: string | null;
  created_at: string;
}

export type HealthNote = {
  id: string;
  user_id: string;
  note: string;
  measured_at: string;
  created_at: string;
}

export type Caregiver = {
  id: string;
  owner_id: string;
  caregiver_id: string | null;
  caregiver_email: string;
  permission: CaregiverPermission;
  status: CaregiverStatus;
  invited_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export type NotificationPreferences = {
  id: string;
  user_id: string;
  reminders_enabled: boolean;
  reminder_lead_minutes: number;
  sound_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type PushSubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
}

export type EmergencyContact = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * IMPORTANTE sobre este bloque: @supabase/postgrest-js resuelve el tipo de
 * cada `.select()` con un parser a nivel de tipos que necesita que Row /
 * Insert / Update sean object types 100% literales. Si en cualquiera de los
 * tres se usa `Partial<T>`, `Pick<T>` o un mapped type propio (incluso uno
 * anonimo como `{ [K in keyof T]?: T[K] }`), TypeScript deja de poder probar
 * que la tabla "extends" la forma que pide postgrest-js y todo el resultado
 * de las queries colapsa silenciosamente a `never`. Por eso Insert/Update se
 * escriben aca a mano, campo por campo, en vez de derivarlos de Row.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          first_name?: string;
          last_name?: string;
          birth_date?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          text_size?: TextSize;
          high_contrast?: boolean;
          theme?: ThemeMode;
          glucose_unit?: GlucoseUnit;
          timezone?: string;
          enabled_metrics?: EnabledMetrics;
          reminders_enabled?: boolean;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          birth_date?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          text_size?: TextSize;
          high_contrast?: boolean;
          theme?: ThemeMode;
          glucose_unit?: GlucoseUnit;
          timezone?: string;
          enabled_metrics?: EnabledMetrics;
          reminders_enabled?: boolean;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      medications: {
        Row: Medication;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          active_ingredient?: string | null;
          dose: number;
          dose_unit?: string;
          form?: MedicationForm;
          instructions?: string | null;
          start_date?: string;
          end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          active_ingredient?: string | null;
          dose?: number;
          dose_unit?: string;
          form?: MedicationForm;
          instructions?: string | null;
          start_date?: string;
          end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      medication_schedules: {
        Row: MedicationSchedule;
        Insert: {
          id?: string;
          medication_id: string;
          user_id: string;
          time_of_day: string;
          days_of_week?: number[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          medication_id?: string;
          user_id?: string;
          time_of_day?: string;
          days_of_week?: number[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      medication_logs: {
        Row: MedicationLog;
        Insert: {
          id?: string;
          medication_id: string;
          schedule_id?: string | null;
          user_id: string;
          scheduled_for: string;
          taken_at?: string | null;
          status?: MedicationLogStatus;
          snoozed_until?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          medication_id?: string;
          schedule_id?: string | null;
          user_id?: string;
          scheduled_for?: string;
          taken_at?: string | null;
          status?: MedicationLogStatus;
          snoozed_until?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      glucose_readings: {
        Row: GlucoseReading;
        Insert: {
          id?: string;
          user_id: string;
          value: number;
          unit?: GlucoseUnit;
          context?: GlucoseContext;
          measured_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          value?: number;
          unit?: GlucoseUnit;
          context?: GlucoseContext;
          measured_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      blood_pressure_readings: {
        Row: BloodPressureReading;
        Insert: {
          id?: string;
          user_id: string;
          systolic: number;
          diastolic: number;
          heart_rate?: number | null;
          measured_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          systolic?: number;
          diastolic?: number;
          heart_rate?: number | null;
          measured_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      weight_readings: {
        Row: WeightReading;
        Insert: {
          id?: string;
          user_id: string;
          value: number;
          unit?: WeightUnit;
          measured_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          value?: number;
          unit?: WeightUnit;
          measured_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      temperature_readings: {
        Row: TemperatureReading;
        Insert: {
          id?: string;
          user_id: string;
          value: number;
          unit?: TemperatureUnit;
          measured_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          value?: number;
          unit?: TemperatureUnit;
          measured_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      heart_rate_readings: {
        Row: HeartRateReading;
        Insert: {
          id?: string;
          user_id: string;
          value: number;
          measured_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          value?: number;
          measured_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      oxygen_readings: {
        Row: OxygenReading;
        Insert: {
          id?: string;
          user_id: string;
          value: number;
          measured_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          value?: number;
          measured_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      health_notes: {
        Row: HealthNote;
        Insert: {
          id?: string;
          user_id: string;
          note: string;
          measured_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          note?: string;
          measured_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      caregivers: {
        Row: Caregiver;
        Insert: {
          id?: string;
          owner_id: string;
          caregiver_id?: string | null;
          caregiver_email: string;
          permission?: CaregiverPermission;
          status?: CaregiverStatus;
          invited_at?: string;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          caregiver_id?: string | null;
          caregiver_email?: string;
          permission?: CaregiverPermission;
          status?: CaregiverStatus;
          invited_at?: string;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: NotificationPreferences;
        Insert: {
          id?: string;
          user_id: string;
          reminders_enabled?: boolean;
          reminder_lead_minutes?: number;
          sound_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          reminders_enabled?: boolean;
          reminder_lead_minutes?: number;
          sound_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: PushSubscriptionRow;
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      emergency_contacts: {
        Row: EmergencyContact;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone: string;
          relationship?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string;
          relationship?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    // Vacio a proposito (sin vistas ni funciones RPC en el schema publico).
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
  };
}
