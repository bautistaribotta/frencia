export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      aceptaciones_legales: {
        Row: {
          aceptada_el: string
          id: number
          user_id: string
          version_privacidad: string
          version_terminos: string
        }
        Insert: {
          aceptada_el?: string
          id?: never
          user_id: string
          version_privacidad: string
          version_terminos: string
        }
        Update: {
          aceptada_el?: string
          id?: never
          user_id?: string
          version_privacidad?: string
          version_terminos?: string
        }
        Relationships: [
          {
            foreignKeyName: "aceptaciones_legales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_muscles: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          is_primary: boolean
          muscle_group_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          is_primary?: boolean
          muscle_group_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          is_primary?: boolean
          muscle_group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_muscles_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_muscles_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          equipment: string | null
          id: string
          image_url: string | null
          instructions: string | null
          kind: string
          name: string
          name_en: string | null
          slug: string
          tracks_distance: boolean
          tracks_duration: boolean
          tracks_reps: boolean
          tracks_weight: boolean
        }
        Insert: {
          created_at?: string
          equipment?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          kind?: string
          name: string
          name_en?: string | null
          slug: string
          tracks_distance?: boolean
          tracks_duration?: boolean
          tracks_reps?: boolean
          tracks_weight?: boolean
        }
        Update: {
          created_at?: string
          equipment?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          kind?: string
          name?: string
          name_en?: string | null
          slug?: string
          tracks_distance?: boolean
          tracks_duration?: boolean
          tracks_reps?: boolean
          tracks_weight?: boolean
        }
        Relationships: []
      }
      muscle_groups: {
        Row: {
          id: string
          name: string
          position: number
          slug: string
        }
        Insert: {
          id?: string
          name: string
          position?: number
          slug: string
        }
        Update: {
          id?: string
          name?: string
          position?: number
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          altura: number | null
          avatar_path: string | null
          avatar_seed: string | null
          created_at: string
          deletion_requested_at: string | null
          fecha_nacimiento: string | null
          id: string
          medidor_esfuerzo: string
          name: string | null
          onboarding_completed: boolean
          peso: number | null
          sexo: string | null
          surname: string | null
          tema: string
          unidad_altura: string
          unidad_distancia: string
          unidad_peso: string
          username: string | null
        }
        Insert: {
          altura?: number | null
          avatar_path?: string | null
          avatar_seed?: string | null
          created_at?: string
          deletion_requested_at?: string | null
          fecha_nacimiento?: string | null
          id: string
          medidor_esfuerzo?: string
          name?: string | null
          onboarding_completed?: boolean
          peso?: number | null
          sexo?: string | null
          surname?: string | null
          tema?: string
          unidad_altura?: string
          unidad_distancia?: string
          unidad_peso?: string
          username?: string | null
        }
        Update: {
          altura?: number | null
          avatar_path?: string | null
          avatar_seed?: string | null
          created_at?: string
          deletion_requested_at?: string | null
          fecha_nacimiento?: string | null
          id?: string
          medidor_esfuerzo?: string
          name?: string | null
          onboarding_completed?: boolean
          peso?: number | null
          sexo?: string | null
          surname?: string | null
          tema?: string
          unidad_altura?: string
          unidad_distancia?: string
          unidad_peso?: string
          username?: string | null
        }
        Relationships: []
      }
      routines: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      session_sets: {
        Row: {
          completed_at: string
          distance_m: number | null
          duration_seconds: number | null
          exercise_id: string
          id: string
          intensity_kind: string | null
          intensity_value: number | null
          reps: number | null
          session_id: string
          set_index: number
          weight_kg: number | null
        }
        Insert: {
          completed_at?: string
          distance_m?: number | null
          duration_seconds?: number | null
          exercise_id: string
          id?: string
          intensity_kind?: string | null
          intensity_value?: number | null
          reps?: number | null
          session_id: string
          set_index: number
          weight_kg?: number | null
        }
        Update: {
          completed_at?: string
          distance_m?: number | null
          duration_seconds?: number | null
          exercise_id?: string
          id?: string
          intensity_kind?: string | null
          intensity_value?: number | null
          reps?: number | null
          session_id?: string
          set_index?: number
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_sets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      training_day_exercises: {
        Row: {
          created_at: string
          distance_m: number | null
          duration_seconds: number | null
          exercise_id: string
          id: string
          intensity_kind: string | null
          intensity_value: number | null
          position: number
          reps: number | null
          rest_seconds: number | null
          sets: number | null
          training_day_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          distance_m?: number | null
          duration_seconds?: number | null
          exercise_id: string
          id?: string
          intensity_kind?: string | null
          intensity_value?: number | null
          position?: number
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          training_day_id: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          distance_m?: number | null
          duration_seconds?: number | null
          exercise_id?: string
          id?: string
          intensity_kind?: string | null
          intensity_value?: number | null
          position?: number
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          training_day_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "training_day_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_day_exercises_training_day_id_fkey"
            columns: ["training_day_id"]
            isOneToOne: false
            referencedRelation: "training_days"
            referencedColumns: ["id"]
          },
        ]
      }
      training_day_weekdays: {
        Row: {
          created_at: string
          id: string
          training_day_id: string
          weekday: number
        }
        Insert: {
          created_at?: string
          id?: string
          training_day_id: string
          weekday: number
        }
        Update: {
          created_at?: string
          id?: string
          training_day_id?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_day_weekdays_training_day_id_fkey"
            columns: ["training_day_id"]
            isOneToOne: false
            referencedRelation: "training_days"
            referencedColumns: ["id"]
          },
        ]
      }
      training_days: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
          routine_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position?: number
          routine_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          routine_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_days_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          created_at: string
          finished_at: string | null
          id: string
          started_at: string
          training_day_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          finished_at?: string | null
          id?: string
          started_at?: string
          training_day_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          finished_at?: string | null
          id?: string
          started_at?: string
          training_day_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_training_day_id_fkey"
            columns: ["training_day_id"]
            isOneToOne: false
            referencedRelation: "training_days"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activar_rutina: { Args: { p_routine_id: string }; Returns: undefined }
      cancelar_eliminacion_cuenta: { Args: never; Returns: undefined }
      cuentas_a_purgar: {
        Args: { p_limite?: number }
        Returns: {
          motivo: string
          user_id: string
        }[]
      }
      guardar_dia_entrenamiento: {
        Args: {
          p_day_id: string
          p_exercises: Json
          p_name: string
          p_weekdays: number[]
        }
        Returns: undefined
      }
      guardar_rutina: {
        Args: { p_dias: Json; p_name: string; p_routine_id: string }
        Returns: undefined
      }
      motivo_de_purga: { Args: { p_user_id: string }; Returns: string }
      registrar_aceptacion_legal: {
        Args: { p_version_privacidad: string; p_version_terminos: string }
        Returns: string
      }
      solicitar_eliminacion_cuenta: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
