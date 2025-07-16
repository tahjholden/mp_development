export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      infrastructure_activity_logs: {
        Row: {
          action: string;
          id: string;
          ip_address: string | null;
          organization_id: string | null;
          person_id: string | null;
          timestamp: string;
        };
        Insert: {
          action: string;
          id?: string;
          ip_address?: string | null;
          organization_id?: string | null;
          person_id?: string | null;
          timestamp?: string;
        };
        Update: {
          action?: string;
          id?: string;
          ip_address?: string | null;
          organization_id?: string | null;
          person_id?: string | null;
          timestamp?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'infrastructure_activity_logs_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'infrastructure_activity_logs_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'infrastructure_activity_logs_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
        ];
      };
      infrastructure_dashboard_config: {
        Row: {
          created_at: string | null;
          dashboard_type: string;
          id: string;
          is_default: boolean | null;
          organization_id: string | null;
          person_id: string | null;
          updated_at: string | null;
          widget_config: Json;
        };
        Insert: {
          created_at?: string | null;
          dashboard_type: string;
          id?: string;
          is_default?: boolean | null;
          organization_id?: string | null;
          person_id?: string | null;
          updated_at?: string | null;
          widget_config: Json;
        };
        Update: {
          created_at?: string | null;
          dashboard_type?: string;
          id?: string;
          is_default?: boolean | null;
          organization_id?: string | null;
          person_id?: string | null;
          updated_at?: string | null;
          widget_config?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'dashboard_config_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      infrastructure_file_storage: {
        Row: {
          bucket_name: string;
          created_at: string | null;
          description: string | null;
          entity_id: string | null;
          entity_type: string | null;
          file_name: string;
          file_path: string;
          file_size: number | null;
          file_type: string;
          id: string;
          metadata: Json | null;
          organization_id: string | null;
          original_name: string;
          processing_status: string | null;
          public_access: boolean | null;
          tags: string[] | null;
          thumbnail_path: string | null;
          uploaded_by: string | null;
        };
        Insert: {
          bucket_name: string;
          created_at?: string | null;
          description?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          file_name: string;
          file_path: string;
          file_size?: number | null;
          file_type: string;
          id?: string;
          metadata?: Json | null;
          organization_id?: string | null;
          original_name: string;
          processing_status?: string | null;
          public_access?: boolean | null;
          tags?: string[] | null;
          thumbnail_path?: string | null;
          uploaded_by?: string | null;
        };
        Update: {
          bucket_name?: string;
          created_at?: string | null;
          description?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          file_name?: string;
          file_path?: string;
          file_size?: number | null;
          file_type?: string;
          id?: string;
          metadata?: Json | null;
          organization_id?: string | null;
          original_name?: string;
          processing_status?: string | null;
          public_access?: boolean | null;
          tags?: string[] | null;
          thumbnail_path?: string | null;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'file_storage_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      infrastructure_invitations: {
        Row: {
          email: string;
          id: string;
          invited_at: string;
          invited_by: string;
          role: string;
          status: string;
          team_id: string;
        };
        Insert: {
          email: string;
          id?: string;
          invited_at?: string;
          invited_by: string;
          role: string;
          status: string;
          team_id: string;
        };
        Update: {
          email?: string;
          id?: string;
          invited_at?: string;
          invited_by?: string;
          role?: string;
          status?: string;
          team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'infrastructure_invitations_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_group';
            referencedColumns: ['id'];
          },
        ];
      };
      infrastructure_invites: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          organization_id: string | null;
          role: string | null;
          status: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
          organization_id?: string | null;
          role?: string | null;
          status?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          organization_id?: string | null;
          role?: string | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'invites_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      infrastructure_memberships: {
        Row: {
          created_at: string | null;
          id: string;
          organization_id: string | null;
          role: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          organization_id?: string | null;
          role?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          organization_id?: string | null;
          role?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'memberships_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      infrastructure_notification_queue: {
        Row: {
          created_at: string | null;
          data: Json | null;
          error_message: string | null;
          id: string;
          message: string;
          notification_type: string;
          organization_id: string | null;
          priority: number | null;
          recipient_id: string;
          retry_count: number | null;
          scheduled_for: string | null;
          sent_at: string | null;
          status: string | null;
          subject: string | null;
        };
        Insert: {
          created_at?: string | null;
          data?: Json | null;
          error_message?: string | null;
          id?: string;
          message: string;
          notification_type: string;
          organization_id?: string | null;
          priority?: number | null;
          recipient_id: string;
          retry_count?: number | null;
          scheduled_for?: string | null;
          sent_at?: string | null;
          status?: string | null;
          subject?: string | null;
        };
        Update: {
          created_at?: string | null;
          data?: Json | null;
          error_message?: string | null;
          id?: string;
          message?: string;
          notification_type?: string;
          organization_id?: string | null;
          priority?: number | null;
          recipient_id?: string;
          retry_count?: number | null;
          scheduled_for?: string | null;
          sent_at?: string | null;
          status?: string | null;
          subject?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'notification_queue_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      infrastructure_participation_log: {
        Row: {
          absence_reason: string | null;
          advance_notice: boolean | null;
          arrival_time: string | null;
          departure_time: string | null;
          energy_level: number | null;
          focus_level: number | null;
          id: string;
          makeup_required: boolean | null;
          metadata: Json | null;
          notes: string | null;
          organization_id: string | null;
          participation_level: number | null;
          person_id: string | null;
          recorded_at: string | null;
          recorded_by: string | null;
          session_id: string | null;
          status: string;
        };
        Insert: {
          absence_reason?: string | null;
          advance_notice?: boolean | null;
          arrival_time?: string | null;
          departure_time?: string | null;
          energy_level?: number | null;
          focus_level?: number | null;
          id?: string;
          makeup_required?: boolean | null;
          metadata?: Json | null;
          notes?: string | null;
          organization_id?: string | null;
          participation_level?: number | null;
          person_id?: string | null;
          recorded_at?: string | null;
          recorded_by?: string | null;
          session_id?: string | null;
          status: string;
        };
        Update: {
          absence_reason?: string | null;
          advance_notice?: boolean | null;
          arrival_time?: string | null;
          departure_time?: string | null;
          energy_level?: number | null;
          focus_level?: number | null;
          id?: string;
          makeup_required?: boolean | null;
          metadata?: Json | null;
          notes?: string | null;
          organization_id?: string | null;
          participation_level?: number | null;
          person_id?: string | null;
          recorded_at?: string | null;
          recorded_by?: string | null;
          session_id?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'participation_log_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'participation_log_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'infrastructure_sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'participation_log_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_participation_summary';
            referencedColumns: ['session_id'];
          },
        ];
      };
      infrastructure_program_cycle: {
        Row: {
          active: boolean | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          end_date: string;
          id: string;
          name: string;
          objectives: string[] | null;
          organization_id: string | null;
          start_date: string;
          term: string | null;
          year: number;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          end_date: string;
          id?: string;
          name: string;
          objectives?: string[] | null;
          organization_id?: string | null;
          start_date: string;
          term?: string | null;
          year: number;
        };
        Update: {
          active?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          end_date?: string;
          id?: string;
          name?: string;
          objectives?: string[] | null;
          organization_id?: string | null;
          start_date?: string;
          term?: string | null;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'program_cycle_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      infrastructure_sessions: {
        Row: {
          actual_attendance: number | null;
          conditions: string | null;
          created_at: string | null;
          created_by: string | null;
          cycle_id: string | null;
          date: string;
          end_time: string | null;
          equipment_issues: string | null;
          expected_attendance: number | null;
          facilitator_reflection: string | null;
          group_id: string | null;
          id: string;
          intensity_level: number | null;
          location: string | null;
          metadata: Json | null;
          organization_id: string | null;
          post_session_notes: string | null;
          pre_session_notes: string | null;
          session_number: number | null;
          session_objective: string | null;
          session_type: string | null;
          start_time: string | null;
          status: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          actual_attendance?: number | null;
          conditions?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          cycle_id?: string | null;
          date: string;
          end_time?: string | null;
          equipment_issues?: string | null;
          expected_attendance?: number | null;
          facilitator_reflection?: string | null;
          group_id?: string | null;
          id?: string;
          intensity_level?: number | null;
          location?: string | null;
          metadata?: Json | null;
          organization_id?: string | null;
          post_session_notes?: string | null;
          pre_session_notes?: string | null;
          session_number?: number | null;
          session_objective?: string | null;
          session_type?: string | null;
          start_time?: string | null;
          status?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          actual_attendance?: number | null;
          conditions?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          cycle_id?: string | null;
          date?: string;
          end_time?: string | null;
          equipment_issues?: string | null;
          expected_attendance?: number | null;
          facilitator_reflection?: string | null;
          group_id?: string | null;
          id?: string;
          intensity_level?: number | null;
          location?: string | null;
          metadata?: Json | null;
          organization_id?: string | null;
          post_session_notes?: string | null;
          pre_session_notes?: string | null;
          session_number?: number | null;
          session_objective?: string | null;
          session_type?: string | null;
          start_time?: string | null;
          status?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'infrastructure_sessions_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_group';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sessions_cycle_id_fkey';
            columns: ['cycle_id'];
            isOneToOne: false;
            referencedRelation: 'infrastructure_program_cycle';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sessions_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      infrastructure_system_settings: {
        Row: {
          category: string;
          created_at: string | null;
          data_type: string;
          description: string | null;
          id: string;
          is_public: boolean | null;
          last_changed_by: string | null;
          organization_id: string | null;
          requires_restart: boolean | null;
          setting_key: string;
          setting_value: Json;
          updated_at: string | null;
        };
        Insert: {
          category: string;
          created_at?: string | null;
          data_type: string;
          description?: string | null;
          id?: string;
          is_public?: boolean | null;
          last_changed_by?: string | null;
          organization_id?: string | null;
          requires_restart?: boolean | null;
          setting_key: string;
          setting_value: Json;
          updated_at?: string | null;
        };
        Update: {
          category?: string;
          created_at?: string | null;
          data_type?: string;
          description?: string | null;
          id?: string;
          is_public?: boolean | null;
          last_changed_by?: string | null;
          organization_id?: string | null;
          requires_restart?: boolean | null;
          setting_key?: string;
          setting_value?: Json;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'system_settings_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      mp_core_actions: {
        Row: {
          advancement_progress: Json | null;
          benchmark_assessments: Json | null;
          challenge_level: number | null;
          challenge_rating: number | null;
          created_at: string | null;
          description: string | null;
          duration_minutes: number | null;
          executed_at: string | null;
          group_id: string | null;
          id: string;
          intention_id: string | null;
          metadata: Json | null;
          person_id: string | null;
          responsibility_progress: Json | null;
          status: string | null;
          success_rate: number | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          advancement_progress?: Json | null;
          benchmark_assessments?: Json | null;
          challenge_level?: number | null;
          challenge_rating?: number | null;
          created_at?: string | null;
          description?: string | null;
          duration_minutes?: number | null;
          executed_at?: string | null;
          group_id?: string | null;
          id?: string;
          intention_id?: string | null;
          metadata?: Json | null;
          person_id?: string | null;
          responsibility_progress?: Json | null;
          status?: string | null;
          success_rate?: number | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          advancement_progress?: Json | null;
          benchmark_assessments?: Json | null;
          challenge_level?: number | null;
          challenge_rating?: number | null;
          created_at?: string | null;
          description?: string | null;
          duration_minutes?: number | null;
          executed_at?: string | null;
          group_id?: string | null;
          id?: string;
          intention_id?: string | null;
          metadata?: Json | null;
          person_id?: string | null;
          responsibility_progress?: Json | null;
          status?: string | null;
          success_rate?: number | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_actions_group';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_group';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_actions_intention';
            columns: ['intention_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_intentions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_actions_person';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_actions_person';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_actions_intention_id_fkey';
            columns: ['intention_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_intentions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_actions_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_actions_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_actions_team_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_group';
            referencedColumns: ['id'];
          },
        ];
      };
      mp_core_group: {
        Row: {
          active: boolean | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          group_type: string | null;
          id: string;
          lead_person_id: string | null;
          level_category: string | null;
          max_capacity: number | null;
          metadata: Json | null;
          name: string;
          organization_id: string | null;
          program: string | null;
          schedule: Json | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          group_type?: string | null;
          id?: string;
          lead_person_id?: string | null;
          level_category?: string | null;
          max_capacity?: number | null;
          metadata?: Json | null;
          name: string;
          organization_id?: string | null;
          program?: string | null;
          schedule?: Json | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          active?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          group_type?: string | null;
          id?: string;
          lead_person_id?: string | null;
          level_category?: string | null;
          max_capacity?: number | null;
          metadata?: Json | null;
          name?: string;
          organization_id?: string | null;
          program?: string | null;
          schedule?: Json | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_group_created_by';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_group_created_by';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_group_lead_person';
            columns: ['lead_person_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_group_lead_person';
            columns: ['lead_person_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_group_organization';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_group_updated_by';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_group_updated_by';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
        ];
      };
      mp_core_intentions: {
        Row: {
          advancement_level: number | null;
          benchmark_targets: Json | null;
          challenge_level: number | null;
          cla_category_focus: string | null;
          context_complexity_rating: number | null;
          created_at: string | null;
          description: string | null;
          development_stage: string | null;
          domain_code: string | null;
          group_id: string | null;
          id: string;
          metadata: Json | null;
          optimal_challenge_level: number | null;
          person_id: string | null;
          progress_percentage: number | null;
          responsibility_tier: number | null;
          status: string | null;
          target_date: string | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          advancement_level?: number | null;
          benchmark_targets?: Json | null;
          challenge_level?: number | null;
          cla_category_focus?: string | null;
          context_complexity_rating?: number | null;
          created_at?: string | null;
          description?: string | null;
          development_stage?: string | null;
          domain_code?: string | null;
          group_id?: string | null;
          id?: string;
          metadata?: Json | null;
          optimal_challenge_level?: number | null;
          person_id?: string | null;
          progress_percentage?: number | null;
          responsibility_tier?: number | null;
          status?: string | null;
          target_date?: string | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          advancement_level?: number | null;
          benchmark_targets?: Json | null;
          challenge_level?: number | null;
          cla_category_focus?: string | null;
          context_complexity_rating?: number | null;
          created_at?: string | null;
          description?: string | null;
          development_stage?: string | null;
          domain_code?: string | null;
          group_id?: string | null;
          id?: string;
          metadata?: Json | null;
          optimal_challenge_level?: number | null;
          person_id?: string | null;
          progress_percentage?: number | null;
          responsibility_tier?: number | null;
          status?: string | null;
          target_date?: string | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_intentions_group';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_group';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_intentions_person';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_intentions_person';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_intentions_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_intentions_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_intentions_team_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_group';
            referencedColumns: ['id'];
          },
        ];
      };
      mp_core_organizations: {
        Row: {
          active: boolean | null;
          contact_info: Json | null;
          created_at: string;
          description: string | null;
          id: string;
          logo_url: string | null;
          name: string | null;
          overlay_version: string | null;
          settings: Json | null;
          subscription_tier: string | null;
          type: string;
          updated_at: string | null;
        };
        Insert: {
          active?: boolean | null;
          contact_info?: Json | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string | null;
          overlay_version?: string | null;
          settings?: Json | null;
          subscription_tier?: string | null;
          type?: string;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean | null;
          contact_info?: Json | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string | null;
          overlay_version?: string | null;
          settings?: Json | null;
          subscription_tier?: string | null;
          type?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mp_core_person: {
        Row: {
          active: boolean | null;
          auth_uid: string | null;
          created_at: string | null;
          created_by: string | null;
          date_of_birth: string | null;
          email: string | null;
          emergency_contact: Json | null;
          first_name: string | null;
          id: string;
          is_admin: boolean | null;
          is_superadmin: boolean | null;
          last_name: string | null;
          medical_info: Json | null;
          metadata: Json | null;
          notes: string | null;
          organization_id: string | null;
          parent_guardian_info: Json | null;
          person_type: string | null;
          phone: string | null;
          plan_name: string | null;
          profile_image_url: string | null;
          seats_purchased: number | null;
          seats_used: number | null;
          stripe_customer_id: string | null;
          stripe_product_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          active?: boolean | null;
          auth_uid?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          date_of_birth?: string | null;
          email?: string | null;
          emergency_contact?: Json | null;
          first_name?: string | null;
          id?: string;
          is_admin?: boolean | null;
          is_superadmin?: boolean | null;
          last_name?: string | null;
          medical_info?: Json | null;
          metadata?: Json | null;
          notes?: string | null;
          organization_id?: string | null;
          parent_guardian_info?: Json | null;
          person_type?: string | null;
          phone?: string | null;
          plan_name?: string | null;
          profile_image_url?: string | null;
          seats_purchased?: number | null;
          seats_used?: number | null;
          stripe_customer_id?: string | null;
          stripe_product_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          active?: boolean | null;
          auth_uid?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          date_of_birth?: string | null;
          email?: string | null;
          emergency_contact?: Json | null;
          first_name?: string | null;
          id?: string;
          is_admin?: boolean | null;
          is_superadmin?: boolean | null;
          last_name?: string | null;
          medical_info?: Json | null;
          metadata?: Json | null;
          notes?: string | null;
          organization_id?: string | null;
          parent_guardian_info?: Json | null;
          person_type?: string | null;
          phone?: string | null;
          plan_name?: string | null;
          profile_image_url?: string | null;
          seats_purchased?: number | null;
          seats_used?: number | null;
          stripe_customer_id?: string | null;
          stripe_product_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_person_created_by';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_person_created_by';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_person_organization';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_person_updated_by';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_person_updated_by';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
        ];
      };
      mp_core_person_group: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          cycle_id: string | null;
          group_id: string | null;
          id: string;
          identifier: string | null;
          joined_at: string | null;
          left_at: string | null;
          metadata: Json | null;
          organization_id: string | null;
          payer_id: string | null;
          person_id: string | null;
          position: string | null;
          role: string;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          cycle_id?: string | null;
          group_id?: string | null;
          id?: string;
          identifier?: string | null;
          joined_at?: string | null;
          left_at?: string | null;
          metadata?: Json | null;
          organization_id?: string | null;
          payer_id?: string | null;
          person_id?: string | null;
          position?: string | null;
          role: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          cycle_id?: string | null;
          group_id?: string | null;
          id?: string;
          identifier?: string | null;
          joined_at?: string | null;
          left_at?: string | null;
          metadata?: Json | null;
          organization_id?: string | null;
          payer_id?: string | null;
          person_id?: string | null;
          position?: string | null;
          role?: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_person_group_created_by';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_person_group_created_by';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_person_group_group';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_group';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_person_group_organization';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_person_group_payer';
            columns: ['payer_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_person_group_payer';
            columns: ['payer_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_person_group_person';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_person_group_person';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_person_group_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_group';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_person_group_payer_id_fkey';
            columns: ['payer_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_person_group_payer_id_fkey';
            columns: ['payer_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_person_group_payer_id_mp_core_person_id_fk';
            columns: ['payer_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_person_group_payer_id_mp_core_person_id_fk';
            columns: ['payer_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_person_group_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_person_group_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'person_group_cycle_id_fkey';
            columns: ['cycle_id'];
            isOneToOne: false;
            referencedRelation: 'infrastructure_program_cycle';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'person_group_org_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      mp_core_person_role: {
        Row: {
          active: boolean | null;
          created_at: string | null;
          created_by: string | null;
          ended_at: string | null;
          id: string;
          organization_id: string | null;
          permissions: string[] | null;
          person_id: string | null;
          role: string;
          scope_ids: string[] | null;
          scope_type: string | null;
          started_at: string | null;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          ended_at?: string | null;
          id?: string;
          organization_id?: string | null;
          permissions?: string[] | null;
          person_id?: string | null;
          role: string;
          scope_ids?: string[] | null;
          scope_type?: string | null;
          started_at?: string | null;
        };
        Update: {
          active?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          ended_at?: string | null;
          id?: string;
          organization_id?: string | null;
          permissions?: string[] | null;
          person_id?: string | null;
          role?: string;
          scope_ids?: string[] | null;
          scope_type?: string | null;
          started_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_person_role_created_by';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_person_role_created_by';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_person_role_organization';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_person_role_person';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_person_role_person';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_person_role_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_person_role_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'person_role_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      mp_core_reflections: {
        Row: {
          action_id: string | null;
          advancement_insights: string | null;
          advancement_progress: Json | null;
          benchmark_progress: Json | null;
          challenge_feedback: string | null;
          collective_insights: string | null;
          collective_progress: Json | null;
          confidence_score: number | null;
          content: string;
          created_at: string | null;
          development_insights: Json | null;
          group_id: string | null;
          id: string;
          insights: string | null;
          intention_id: string | null;
          metadata: Json | null;
          next_steps: string | null;
          perceived_difficulty: number | null;
          person_id: string | null;
          responsibility_insights: string | null;
          responsibility_progress: Json | null;
          updated_at: string | null;
        };
        Insert: {
          action_id?: string | null;
          advancement_insights?: string | null;
          advancement_progress?: Json | null;
          benchmark_progress?: Json | null;
          challenge_feedback?: string | null;
          collective_insights?: string | null;
          collective_progress?: Json | null;
          confidence_score?: number | null;
          content: string;
          created_at?: string | null;
          development_insights?: Json | null;
          group_id?: string | null;
          id?: string;
          insights?: string | null;
          intention_id?: string | null;
          metadata?: Json | null;
          next_steps?: string | null;
          perceived_difficulty?: number | null;
          person_id?: string | null;
          responsibility_insights?: string | null;
          responsibility_progress?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          action_id?: string | null;
          advancement_insights?: string | null;
          advancement_progress?: Json | null;
          benchmark_progress?: Json | null;
          challenge_feedback?: string | null;
          collective_insights?: string | null;
          collective_progress?: Json | null;
          confidence_score?: number | null;
          content?: string;
          created_at?: string | null;
          development_insights?: Json | null;
          group_id?: string | null;
          id?: string;
          insights?: string | null;
          intention_id?: string | null;
          metadata?: Json | null;
          next_steps?: string | null;
          perceived_difficulty?: number | null;
          person_id?: string | null;
          responsibility_insights?: string | null;
          responsibility_progress?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_reflections_action';
            columns: ['action_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_actions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_reflections_group';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_group';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_reflections_intention';
            columns: ['intention_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_intentions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_reflections_person';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_reflections_person';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_reflections_action_id_fkey';
            columns: ['action_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_actions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_reflections_intention_id_fkey';
            columns: ['intention_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_intentions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_reflections_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_reflections_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_reflections_team_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_group';
            referencedColumns: ['id'];
          },
        ];
      };
      mp_philosophy_arc_advancement: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          level: number | null;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          level?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          level?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mp_philosophy_arc_collective: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          phase: number | null;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          phase?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          phase?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mp_philosophy_arc_responsibility: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          tier: number | null;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          tier?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          tier?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mp_philosophy_arc_types: {
        Row: {
          created_at: string | null;
          default_graduation_threshold: number | null;
          description: string;
          domain_code: string;
          id: string;
          name: string;
          stages: Json;
          typical_duration_days: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          default_graduation_threshold?: number | null;
          description: string;
          domain_code: string;
          id?: string;
          name: string;
          stages: Json;
          typical_duration_days?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          default_graduation_threshold?: number | null;
          description?: string;
          domain_code?: string;
          id?: string;
          name?: string;
          stages?: Json;
          typical_duration_days?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mp_philosophy_benchmark_framework: {
        Row: {
          created_at: string | null;
          description: string;
          id: string;
          measurement_types: Json;
          name: string;
          progression_rules: Json;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description: string;
          id?: string;
          measurement_types: Json;
          name: string;
          progression_rules: Json;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string;
          id?: string;
          measurement_types?: Json;
          name?: string;
          progression_rules?: Json;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mp_philosophy_challenge_point: {
        Row: {
          calculation_rules: Json | null;
          created_at: string | null;
          description: string | null;
          id: string;
          type: string | null;
          updated_at: string | null;
        };
        Insert: {
          calculation_rules?: Json | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          type?: string | null;
          updated_at?: string | null;
        };
        Update: {
          calculation_rules?: Json | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          type?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mpbc_age_bands: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          max_age: number | null;
          min_age: number | null;
          name: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          max_age?: number | null;
          min_age?: number | null;
          name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          max_age?: number | null;
          min_age?: number | null;
          name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mpbc_audit_log: {
        Row: {
          action: string | null;
          changed_at: string | null;
          changed_by: string | null;
          id: string;
          new_values: Json | null;
          record_id: string | null;
          table_name: string | null;
        };
        Insert: {
          action?: string | null;
          changed_at?: string | null;
          changed_by?: string | null;
          id?: string;
          new_values?: Json | null;
          record_id?: string | null;
          table_name?: string | null;
        };
        Update: {
          action?: string | null;
          changed_at?: string | null;
          changed_by?: string | null;
          id?: string;
          new_values?: Json | null;
          record_id?: string | null;
          table_name?: string | null;
        };
        Relationships: [];
      };
      mpbc_benchmark_constraints: {
        Row: {
          cla_benchmark_id: string | null;
          constraint_id: string | null;
          created_at: string | null;
          id: string;
          notes: string | null;
          priority: number | null;
        };
        Insert: {
          cla_benchmark_id?: string | null;
          constraint_id?: string | null;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          priority?: number | null;
        };
        Update: {
          cla_benchmark_id?: string | null;
          constraint_id?: string | null;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          priority?: number | null;
        };
        Relationships: [];
      };
      mpbc_block_player_assignment: {
        Row: {
          block_id: string | null;
          constraints: Json | null;
          created_at: string | null;
          created_by: string | null;
          id: string;
          modifications: string | null;
          objectives: string | null;
          performance_notes: string | null;
          player_id: string | null;
          special_role: string | null;
        };
        Insert: {
          block_id?: string | null;
          constraints?: Json | null;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          modifications?: string | null;
          objectives?: string | null;
          performance_notes?: string | null;
          player_id?: string | null;
          special_role?: string | null;
        };
        Update: {
          block_id?: string | null;
          constraints?: Json | null;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          modifications?: string | null;
          objectives?: string | null;
          performance_notes?: string | null;
          player_id?: string | null;
          special_role?: string | null;
        };
        Relationships: [];
      };
      mpbc_cla_benchmarks: {
        Row: {
          advancement_level: string | null;
          age_band_id: string | null;
          assessment_criteria: string | null;
          benchmark_category_id: string | null;
          cla_category_id: string | null;
          context: string | null;
          created_at: string | null;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          advancement_level?: string | null;
          age_band_id?: string | null;
          assessment_criteria?: string | null;
          benchmark_category_id?: string | null;
          cla_category_id?: string | null;
          context?: string | null;
          created_at?: string | null;
          id?: string;
          updated_at?: string | null;
        };
        Update: {
          advancement_level?: string | null;
          age_band_id?: string | null;
          assessment_criteria?: string | null;
          benchmark_category_id?: string | null;
          cla_category_id?: string | null;
          context?: string | null;
          created_at?: string | null;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mpbc_cla_categories: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          learning_focus: string | null;
          name: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          learning_focus?: string | null;
          name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          learning_focus?: string | null;
          name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mpbc_coach_template_preferences: {
        Row: {
          coach_id: string | null;
          created_at: string | null;
          id: string;
          last_used: string | null;
          preference_score: number | null;
          preferred_modifications: Json | null;
          template_id: string | null;
          updated_at: string | null;
          usage_frequency: number | null;
        };
        Insert: {
          coach_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_used?: string | null;
          preference_score?: number | null;
          preferred_modifications?: Json | null;
          template_id?: string | null;
          updated_at?: string | null;
          usage_frequency?: number | null;
        };
        Update: {
          coach_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_used?: string | null;
          preference_score?: number | null;
          preferred_modifications?: Json | null;
          template_id?: string | null;
          updated_at?: string | null;
          usage_frequency?: number | null;
        };
        Relationships: [];
      };
      mpbc_constraint_manipulations: {
        Row: {
          challenge_level: number | null;
          cla_category_id: string | null;
          constraint_type: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          implementation_notes: string | null;
          name: string | null;
          updated_at: string | null;
        };
        Insert: {
          challenge_level?: number | null;
          cla_category_id?: string | null;
          constraint_type?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          implementation_notes?: string | null;
          name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          challenge_level?: number | null;
          cla_category_id?: string | null;
          constraint_type?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          implementation_notes?: string | null;
          name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mpbc_constraint_type: {
        Row: {
          application_method: string | null;
          attendance_adaptable: boolean | null;
          category: string | null;
          created_at: string | null;
          description: string | null;
          example_implementations: Json | null;
          id: string;
          intensity_scalable: boolean | null;
          name: string | null;
        };
        Insert: {
          application_method?: string | null;
          attendance_adaptable?: boolean | null;
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          example_implementations?: Json | null;
          id?: string;
          intensity_scalable?: boolean | null;
          name?: string | null;
        };
        Update: {
          application_method?: string | null;
          attendance_adaptable?: boolean | null;
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          example_implementations?: Json | null;
          id?: string;
          intensity_scalable?: boolean | null;
          name?: string | null;
        };
        Relationships: [];
      };
      mpbc_constraints_bank: {
        Row: {
          ai_parsing_rules: Json | null;
          confidence_score: number | null;
          constraint_name: string | null;
          constraint_text: string | null;
          constraint_type: string | null;
          example_contexts: string | null;
          id: string;
          notes: string | null;
          offensive_or_defensive: string | null;
          prompt_keywords: string | null;
          skill_tag: string | null;
        };
        Insert: {
          ai_parsing_rules?: Json | null;
          confidence_score?: number | null;
          constraint_name?: string | null;
          constraint_text?: string | null;
          constraint_type?: string | null;
          example_contexts?: string | null;
          id?: string;
          notes?: string | null;
          offensive_or_defensive?: string | null;
          prompt_keywords?: string | null;
          skill_tag?: string | null;
        };
        Update: {
          ai_parsing_rules?: Json | null;
          confidence_score?: number | null;
          constraint_name?: string | null;
          constraint_text?: string | null;
          constraint_type?: string | null;
          example_contexts?: string | null;
          id?: string;
          notes?: string | null;
          offensive_or_defensive?: string | null;
          prompt_keywords?: string | null;
          skill_tag?: string | null;
        };
        Relationships: [];
      };
      mpbc_core_person_profile: {
        Row: {
          advancement_level: string | null;
          basketball_profile: Json | null;
          created_at: string;
          dominant_hand: string | null;
          height_cm: number | null;
          organization_id: string | null;
          person_id: string;
          playing_position: string | null;
          preferred_shot_zone: string | null;
          responsibility_tier: string | null;
          updated_at: string;
        };
        Insert: {
          advancement_level?: string | null;
          basketball_profile?: Json | null;
          created_at?: string;
          dominant_hand?: string | null;
          height_cm?: number | null;
          organization_id?: string | null;
          person_id: string;
          playing_position?: string | null;
          preferred_shot_zone?: string | null;
          responsibility_tier?: string | null;
          updated_at?: string;
        };
        Update: {
          advancement_level?: string | null;
          basketball_profile?: Json | null;
          created_at?: string;
          dominant_hand?: string | null;
          height_cm?: number | null;
          organization_id?: string | null;
          person_id?: string;
          playing_position?: string | null;
          preferred_shot_zone?: string | null;
          responsibility_tier?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mpbc_core_person_profile_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_core_person_profile_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: true;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_core_person_profile_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: true;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
        ];
      };
      mpbc_core_skill_mapping: {
        Row: {
          ai_confidence_score: number | null;
          complementary_skills: string[] | null;
          contextual_factors: Json | null;
          core_skill_id: string | null;
          core_skill_name: string | null;
          created_at: string | null;
          development_priority: number | null;
          id: string;
          mapping_context: string | null;
          mapping_strength: number | null;
          mpbc_skill_id: string | null;
          optimal_age_range: string | null;
          prerequisite_skills: string[] | null;
          relationship_type: string | null;
          skill_transfer_coefficient: number | null;
        };
        Insert: {
          ai_confidence_score?: number | null;
          complementary_skills?: string[] | null;
          contextual_factors?: Json | null;
          core_skill_id?: string | null;
          core_skill_name?: string | null;
          created_at?: string | null;
          development_priority?: number | null;
          id?: string;
          mapping_context?: string | null;
          mapping_strength?: number | null;
          mpbc_skill_id?: string | null;
          optimal_age_range?: string | null;
          prerequisite_skills?: string[] | null;
          relationship_type?: string | null;
          skill_transfer_coefficient?: number | null;
        };
        Update: {
          ai_confidence_score?: number | null;
          complementary_skills?: string[] | null;
          contextual_factors?: Json | null;
          core_skill_id?: string | null;
          core_skill_name?: string | null;
          created_at?: string | null;
          development_priority?: number | null;
          id?: string;
          mapping_context?: string | null;
          mapping_strength?: number | null;
          mpbc_skill_id?: string | null;
          optimal_age_range?: string | null;
          prerequisite_skills?: string[] | null;
          relationship_type?: string | null;
          skill_transfer_coefficient?: number | null;
        };
        Relationships: [];
      };
      mpbc_core_skills: {
        Row: {
          category: string | null;
          combo_code: string | null;
          created_at: string | null;
          description: string | null;
          display_name: string | null;
          id: string;
          is_active: boolean | null;
          parent_skill_id: string | null;
          subcategory: string | null;
          synonyms: string[] | null;
          updated_at: string | null;
          use_case: string | null;
        };
        Insert: {
          category?: string | null;
          combo_code?: string | null;
          created_at?: string | null;
          description?: string | null;
          display_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          parent_skill_id?: string | null;
          subcategory?: string | null;
          synonyms?: string[] | null;
          updated_at?: string | null;
          use_case?: string | null;
        };
        Update: {
          category?: string | null;
          combo_code?: string | null;
          created_at?: string | null;
          description?: string | null;
          display_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          parent_skill_id?: string | null;
          subcategory?: string | null;
          synonyms?: string[] | null;
          updated_at?: string | null;
          use_case?: string | null;
        };
        Relationships: [];
      };
      mpbc_cue_pack: {
        Row: {
          created_at: string | null;
          cue_type: string | null;
          cues: string[] | null;
          effectiveness_rating: number | null;
          example_scenarios: string | null;
          id: string;
          name: string | null;
          phase_id: string | null;
          skill_tag_id: string | null;
          when_to_use: string | null;
        };
        Insert: {
          created_at?: string | null;
          cue_type?: string | null;
          cues?: string[] | null;
          effectiveness_rating?: number | null;
          example_scenarios?: string | null;
          id?: string;
          name?: string | null;
          phase_id?: string | null;
          skill_tag_id?: string | null;
          when_to_use?: string | null;
        };
        Update: {
          created_at?: string | null;
          cue_type?: string | null;
          cues?: string[] | null;
          effectiveness_rating?: number | null;
          example_scenarios?: string | null;
          id?: string;
          name?: string | null;
          phase_id?: string | null;
          skill_tag_id?: string | null;
          when_to_use?: string | null;
        };
        Relationships: [];
      };
      mpbc_development_plan: {
        Row: {
          actual_end_date: string | null;
          archived_at: string | null;
          archived_by: string | null;
          baseline_assessment: string | null;
          cla_primary_benchmark_id: string | null;
          cla_secondary_benchmark_id: string | null;
          cla_tertiary_benchmark_id: string | null;
          context_assessment_enabled: boolean | null;
          created_at: string | null;
          created_by: string | null;
          cycle_id: string | null;
          end_date: string | null;
          focus_skills_id: string | null;
          group_id: string | null;
          id: string;
          initial_observation: string | null;
          intelligence_development_goals: Json | null;
          last_review_date: string | null;
          metadata: Json | null;
          migration_phase: string | null;
          needs_enhancement: boolean | null;
          next_review_date: string | null;
          objective: string | null;
          old_id: string | null;
          org_id: string | null;
          organization_id: string | null;
          original_content: string | null;
          overlay_schema: string | null;
          person_id: string | null;
          player_id: string | null;
          primary_pillar_id: string | null;
          priority: number | null;
          priority_level: string | null;
          progress_notes: string | null;
          progress_percentage: number | null;
          season_id: string | null;
          secondary_pillar_id: string | null;
          start_date: string | null;
          status: string | null;
          target_end_date: string | null;
          target_metrics: Json | null;
          target_outcomes: string | null;
          timeline_weeks: number | null;
          updated_at: string | null;
          updated_by: string | null;
          version: string | null;
        };
        Insert: {
          actual_end_date?: string | null;
          archived_at?: string | null;
          archived_by?: string | null;
          baseline_assessment?: string | null;
          cla_primary_benchmark_id?: string | null;
          cla_secondary_benchmark_id?: string | null;
          cla_tertiary_benchmark_id?: string | null;
          context_assessment_enabled?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          cycle_id?: string | null;
          end_date?: string | null;
          focus_skills_id?: string | null;
          group_id?: string | null;
          id?: string;
          initial_observation?: string | null;
          intelligence_development_goals?: Json | null;
          last_review_date?: string | null;
          metadata?: Json | null;
          migration_phase?: string | null;
          needs_enhancement?: boolean | null;
          next_review_date?: string | null;
          objective?: string | null;
          old_id?: string | null;
          org_id?: string | null;
          organization_id?: string | null;
          original_content?: string | null;
          overlay_schema?: string | null;
          person_id?: string | null;
          player_id?: string | null;
          primary_pillar_id?: string | null;
          priority?: number | null;
          priority_level?: string | null;
          progress_notes?: string | null;
          progress_percentage?: number | null;
          season_id?: string | null;
          secondary_pillar_id?: string | null;
          start_date?: string | null;
          status?: string | null;
          target_end_date?: string | null;
          target_metrics?: Json | null;
          target_outcomes?: string | null;
          timeline_weeks?: number | null;
          updated_at?: string | null;
          updated_by?: string | null;
          version?: string | null;
        };
        Update: {
          actual_end_date?: string | null;
          archived_at?: string | null;
          archived_by?: string | null;
          baseline_assessment?: string | null;
          cla_primary_benchmark_id?: string | null;
          cla_secondary_benchmark_id?: string | null;
          cla_tertiary_benchmark_id?: string | null;
          context_assessment_enabled?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          cycle_id?: string | null;
          end_date?: string | null;
          focus_skills_id?: string | null;
          group_id?: string | null;
          id?: string;
          initial_observation?: string | null;
          intelligence_development_goals?: Json | null;
          last_review_date?: string | null;
          metadata?: Json | null;
          migration_phase?: string | null;
          needs_enhancement?: boolean | null;
          next_review_date?: string | null;
          objective?: string | null;
          old_id?: string | null;
          org_id?: string | null;
          organization_id?: string | null;
          original_content?: string | null;
          overlay_schema?: string | null;
          person_id?: string | null;
          player_id?: string | null;
          primary_pillar_id?: string | null;
          priority?: number | null;
          priority_level?: string | null;
          progress_notes?: string | null;
          progress_percentage?: number | null;
          season_id?: string | null;
          secondary_pillar_id?: string | null;
          start_date?: string | null;
          status?: string | null;
          target_end_date?: string | null;
          target_metrics?: Json | null;
          target_outcomes?: string | null;
          timeline_weeks?: number | null;
          updated_at?: string | null;
          updated_by?: string | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_mpbc_development_plan_person';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_development_plan_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_group';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_development_plan_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_development_plan_season_id_fkey';
            columns: ['season_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_season';
            referencedColumns: ['id'];
          },
        ];
      };
      mpbc_development_plan_assessments: {
        Row: {
          assessment_date: string | null;
          context_notes: string | null;
          created_at: string | null;
          development_plan_id: string | null;
          id: string;
          mp_core_benchmark_assessment_id: string | null;
          updated_at: string | null;
          video_evidence_url: string | null;
        };
        Insert: {
          assessment_date?: string | null;
          context_notes?: string | null;
          created_at?: string | null;
          development_plan_id?: string | null;
          id?: string;
          mp_core_benchmark_assessment_id?: string | null;
          updated_at?: string | null;
          video_evidence_url?: string | null;
        };
        Update: {
          assessment_date?: string | null;
          context_notes?: string | null;
          created_at?: string | null;
          development_plan_id?: string | null;
          id?: string;
          mp_core_benchmark_assessment_id?: string | null;
          updated_at?: string | null;
          video_evidence_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'mpbc_development_plan_assessments_development_plan_id_fkey';
            columns: ['development_plan_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_development_plan';
            referencedColumns: ['id'];
          },
        ];
      };
      mpbc_development_plan_progress: {
        Row: {
          assessed_by: string | null;
          assessment_date: string | null;
          assessment_method: string | null;
          created_at: string | null;
          current_level: string | null;
          development_plan_id: string | null;
          evidence: string | null;
          id: string;
          improvement_notes: string | null;
          next_steps: string | null;
          previous_level: string | null;
          skill_tag_id: string | null;
        };
        Insert: {
          assessed_by?: string | null;
          assessment_date?: string | null;
          assessment_method?: string | null;
          created_at?: string | null;
          current_level?: string | null;
          development_plan_id?: string | null;
          evidence?: string | null;
          id?: string;
          improvement_notes?: string | null;
          next_steps?: string | null;
          previous_level?: string | null;
          skill_tag_id?: string | null;
        };
        Update: {
          assessed_by?: string | null;
          assessment_date?: string | null;
          assessment_method?: string | null;
          created_at?: string | null;
          current_level?: string | null;
          development_plan_id?: string | null;
          evidence?: string | null;
          id?: string;
          improvement_notes?: string | null;
          next_steps?: string | null;
          previous_level?: string | null;
          skill_tag_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'mpbc_development_plan_progress_development_plan_id_fkey';
            columns: ['development_plan_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_development_plan';
            referencedColumns: ['id'];
          },
        ];
      };
      mpbc_drill_master: {
        Row: {
          active: boolean | null;
          age_appropriate: string | null;
          category: string | null;
          coaching_points: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          diagram_url: string | null;
          difficulty_level: string | null;
          duration_minutes: number | null;
          equipment_needed: string | null;
          id: string;
          max_players: number | null;
          min_players: number | null;
          name: string | null;
          optimal_players: number | null;
          pdf_url: string | null;
          phase_tags: string[] | null;
          rating_avg: number | null;
          setup_instructions: string | null;
          skill_tags: string[] | null;
          space_requirements: string | null;
          subcategory: string | null;
          tags: string[] | null;
          updated_at: string | null;
          updated_by: string | null;
          usage_count: number | null;
          verified: boolean | null;
          video_url: string | null;
        };
        Insert: {
          active?: boolean | null;
          age_appropriate?: string | null;
          category?: string | null;
          coaching_points?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          diagram_url?: string | null;
          difficulty_level?: string | null;
          duration_minutes?: number | null;
          equipment_needed?: string | null;
          id?: string;
          max_players?: number | null;
          min_players?: number | null;
          name?: string | null;
          optimal_players?: number | null;
          pdf_url?: string | null;
          phase_tags?: string[] | null;
          rating_avg?: number | null;
          setup_instructions?: string | null;
          skill_tags?: string[] | null;
          space_requirements?: string | null;
          subcategory?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
          updated_by?: string | null;
          usage_count?: number | null;
          verified?: boolean | null;
          video_url?: string | null;
        };
        Update: {
          active?: boolean | null;
          age_appropriate?: string | null;
          category?: string | null;
          coaching_points?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          diagram_url?: string | null;
          difficulty_level?: string | null;
          duration_minutes?: number | null;
          equipment_needed?: string | null;
          id?: string;
          max_players?: number | null;
          min_players?: number | null;
          name?: string | null;
          optimal_players?: number | null;
          pdf_url?: string | null;
          phase_tags?: string[] | null;
          rating_avg?: number | null;
          setup_instructions?: string | null;
          skill_tags?: string[] | null;
          space_requirements?: string | null;
          subcategory?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
          updated_by?: string | null;
          usage_count?: number | null;
          verified?: boolean | null;
          video_url?: string | null;
        };
        Relationships: [];
      };
      mpbc_drill_org: {
        Row: {
          active: boolean | null;
          created_at: string | null;
          created_by: string | null;
          customizations: Json | null;
          description: string | null;
          id: string;
          master_drill_id: string | null;
          name: string | null;
          organization_id: string | null;
          private: boolean | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          customizations?: Json | null;
          description?: string | null;
          id?: string;
          master_drill_id?: string | null;
          name?: string | null;
          organization_id?: string | null;
          private?: boolean | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          active?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          customizations?: Json | null;
          description?: string | null;
          id?: string;
          master_drill_id?: string | null;
          name?: string | null;
          organization_id?: string | null;
          private?: boolean | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      mpbc_drill_phase_tags: {
        Row: {
          drill_id: string | null;
          id: string;
          phase_id: string | null;
          relevance_level: number | null;
        };
        Insert: {
          drill_id?: string | null;
          id?: string;
          phase_id?: string | null;
          relevance_level?: number | null;
        };
        Update: {
          drill_id?: string | null;
          id?: string;
          phase_id?: string | null;
          relevance_level?: number | null;
        };
        Relationships: [];
      };
      mpbc_drill_skill_tags: {
        Row: {
          drill_id: string | null;
          emphasis_level: number | null;
          id: string;
          skill_tag_id: string | null;
        };
        Insert: {
          drill_id?: string | null;
          emphasis_level?: number | null;
          id?: string;
          skill_tag_id?: string | null;
        };
        Update: {
          drill_id?: string | null;
          emphasis_level?: number | null;
          id?: string;
          skill_tag_id?: string | null;
        };
        Relationships: [];
      };
      mpbc_goal_tracking: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          current_value: string | null;
          deadline: string | null;
          description: string | null;
          development_plan_id: string | null;
          goal_type: string | null;
          group_id: string | null;
          id: string;
          last_updated: string | null;
          person_id: string | null;
          priority: string | null;
          progress_notes: string | null;
          season_id: string | null;
          status: string | null;
          target_metric: string | null;
          target_value: string | null;
          title: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          current_value?: string | null;
          deadline?: string | null;
          description?: string | null;
          development_plan_id?: string | null;
          goal_type?: string | null;
          group_id?: string | null;
          id?: string;
          last_updated?: string | null;
          person_id?: string | null;
          priority?: string | null;
          progress_notes?: string | null;
          season_id?: string | null;
          status?: string | null;
          target_metric?: string | null;
          target_value?: string | null;
          title?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          current_value?: string | null;
          deadline?: string | null;
          description?: string | null;
          development_plan_id?: string | null;
          goal_type?: string | null;
          group_id?: string | null;
          id?: string;
          last_updated?: string | null;
          person_id?: string | null;
          priority?: string | null;
          progress_notes?: string | null;
          season_id?: string | null;
          status?: string | null;
          target_metric?: string | null;
          target_value?: string | null;
          title?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'mpbc_goal_tracking_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_group';
            referencedColumns: ['id'];
          },
        ];
      };
      mpbc_group: {
        Row: {
          active: boolean | null;
          collective_skill_level: string | null;
          conference: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          division: string | null;
          equipment_inventory: Json | null;
          group_type: string | null;
          home_court: string | null;
          id: string;
          lead_person_id: string | null;
          leadership_structure: Json | null;
          level_category: string | null;
          max_capacity: number | null;
          metadata: Json | null;
          mp_core_group_id: string | null;
          name: string | null;
          playing_style: string | null;
          practice_facility: string | null;
          program: string | null;
          schedule: Json | null;
          season_record: string | null;
          team_chemistry_rating: number | null;
          team_philosophy: string | null;
          team_statistics: Json | null;
          travel_requirements: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          active?: boolean | null;
          collective_skill_level?: string | null;
          conference?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          division?: string | null;
          equipment_inventory?: Json | null;
          group_type?: string | null;
          home_court?: string | null;
          id?: string;
          lead_person_id?: string | null;
          leadership_structure?: Json | null;
          level_category?: string | null;
          max_capacity?: number | null;
          metadata?: Json | null;
          mp_core_group_id?: string | null;
          name?: string | null;
          playing_style?: string | null;
          practice_facility?: string | null;
          program?: string | null;
          schedule?: Json | null;
          season_record?: string | null;
          team_chemistry_rating?: number | null;
          team_philosophy?: string | null;
          team_statistics?: Json | null;
          travel_requirements?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          active?: boolean | null;
          collective_skill_level?: string | null;
          conference?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          division?: string | null;
          equipment_inventory?: Json | null;
          group_type?: string | null;
          home_court?: string | null;
          id?: string;
          lead_person_id?: string | null;
          leadership_structure?: Json | null;
          level_category?: string | null;
          max_capacity?: number | null;
          metadata?: Json | null;
          mp_core_group_id?: string | null;
          name?: string | null;
          playing_style?: string | null;
          practice_facility?: string | null;
          program?: string | null;
          schedule?: Json | null;
          season_record?: string | null;
          team_chemistry_rating?: number | null;
          team_philosophy?: string | null;
          team_statistics?: Json | null;
          travel_requirements?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_mpbc_group_mp_core_group';
            columns: ['mp_core_group_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_group';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_group_lead_person_id_fkey';
            columns: ['lead_person_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_person';
            referencedColumns: ['id'];
          },
        ];
      };
      mpbc_group_metadata: {
        Row: {
          collective_growth_phase: string | null;
          created_at: string | null;
          id: string;
          mp_core_group_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          collective_growth_phase?: string | null;
          created_at?: string | null;
          id?: string;
          mp_core_group_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          collective_growth_phase?: string | null;
          created_at?: string | null;
          id?: string;
          mp_core_group_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mpbc_group_profile: {
        Row: {
          adaptability_rating: number | null;
          areas_for_improvement: string[] | null;
          assessment_notes: string | null;
          collective_advancement_level: string | null;
          collective_growth_phase: string | null;
          collective_responsibility_tier: string | null;
          communication_effectiveness: number | null;
          created_at: string | null;
          defensive_rating: number | null;
          id: string;
          last_team_assessment_date: string | null;
          milestone_achievements: string[] | null;
          mpbc_group_id: string | null;
          next_development_targets: string[] | null;
          offensive_rating: number | null;
          pace_of_play: number | null;
          performance_trends: Json | null;
          problem_solving_effectiveness: number | null;
          strengths: string[] | null;
          team_efficiency: number | null;
          team_goals: string | null;
          updated_at: string | null;
        };
        Insert: {
          adaptability_rating?: number | null;
          areas_for_improvement?: string[] | null;
          assessment_notes?: string | null;
          collective_advancement_level?: string | null;
          collective_growth_phase?: string | null;
          collective_responsibility_tier?: string | null;
          communication_effectiveness?: number | null;
          created_at?: string | null;
          defensive_rating?: number | null;
          id?: string;
          last_team_assessment_date?: string | null;
          milestone_achievements?: string[] | null;
          mpbc_group_id?: string | null;
          next_development_targets?: string[] | null;
          offensive_rating?: number | null;
          pace_of_play?: number | null;
          performance_trends?: Json | null;
          problem_solving_effectiveness?: number | null;
          strengths?: string[] | null;
          team_efficiency?: number | null;
          team_goals?: string | null;
          updated_at?: string | null;
        };
        Update: {
          adaptability_rating?: number | null;
          areas_for_improvement?: string[] | null;
          assessment_notes?: string | null;
          collective_advancement_level?: string | null;
          collective_growth_phase?: string | null;
          collective_responsibility_tier?: string | null;
          communication_effectiveness?: number | null;
          created_at?: string | null;
          defensive_rating?: number | null;
          id?: string;
          last_team_assessment_date?: string | null;
          milestone_achievements?: string[] | null;
          mpbc_group_id?: string | null;
          next_development_targets?: string[] | null;
          offensive_rating?: number | null;
          pace_of_play?: number | null;
          performance_trends?: Json | null;
          problem_solving_effectiveness?: number | null;
          strengths?: string[] | null;
          team_efficiency?: number | null;
          team_goals?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mpbc_individual_challenge_points: {
        Row: {
          cla_category_id: string | null;
          created_at: string | null;
          current_challenge_level: number | null;
          id: string;
          last_calculated_at: string | null;
          mp_core_person_id: string | null;
          optimal_challenge_level: number | null;
          success_rate: number | null;
          updated_at: string | null;
        };
        Insert: {
          cla_category_id?: string | null;
          created_at?: string | null;
          current_challenge_level?: number | null;
          id?: string;
          last_calculated_at?: string | null;
          mp_core_person_id?: string | null;
          optimal_challenge_level?: number | null;
          success_rate?: number | null;
          updated_at?: string | null;
        };
        Update: {
          cla_category_id?: string | null;
          created_at?: string | null;
          current_challenge_level?: number | null;
          id?: string;
          last_calculated_at?: string | null;
          mp_core_person_id?: string | null;
          optimal_challenge_level?: number | null;
          success_rate?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mpbc_message_threads: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          id: string;
          title: string | null;
          type: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          title?: string | null;
          type?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          title?: string | null;
          type?: string | null;
        };
        Relationships: [];
      };
      mpbc_messages: {
        Row: {
          attachments: Json | null;
          content: string | null;
          created_at: string | null;
          id: string;
          sender_id: string | null;
          thread_id: string | null;
        };
        Insert: {
          attachments?: Json | null;
          content?: string | null;
          created_at?: string | null;
          id?: string;
          sender_id?: string | null;
          thread_id?: string | null;
        };
        Update: {
          attachments?: Json | null;
          content?: string | null;
          created_at?: string | null;
          id?: string;
          sender_id?: string | null;
          thread_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'mpbc_messages_thread_id_fkey';
            columns: ['thread_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_message_threads';
            referencedColumns: ['id'];
          },
        ];
      };
      mpbc_observations: {
        Row: {
          archived_at: string | null;
          archived_by: string | null;
          basketball_specific_metrics: Json | null;
          cla_category: string | null;
          context: string | null;
          created_at: string | null;
          cycle_id: string | null;
          development_plan_id: string | null;
          group_id: string | null;
          id: string;
          observation_date: string | null;
          observation_text: string | null;
          observer_id: string | null;
          org_id: string | null;
          organization_id: string | null;
          performance_rating: number | null;
          person_id: string | null;
          player_id: string | null;
          skill_tags: string[] | null;
          tags: string[] | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          archived_at?: string | null;
          archived_by?: string | null;
          basketball_specific_metrics?: Json | null;
          cla_category?: string | null;
          context?: string | null;
          created_at?: string | null;
          cycle_id?: string | null;
          development_plan_id?: string | null;
          group_id?: string | null;
          id?: string;
          observation_date?: string | null;
          observation_text?: string | null;
          observer_id?: string | null;
          org_id?: string | null;
          organization_id?: string | null;
          performance_rating?: number | null;
          person_id?: string | null;
          player_id?: string | null;
          skill_tags?: string[] | null;
          tags?: string[] | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          archived_at?: string | null;
          archived_by?: string | null;
          basketball_specific_metrics?: Json | null;
          cla_category?: string | null;
          context?: string | null;
          created_at?: string | null;
          cycle_id?: string | null;
          development_plan_id?: string | null;
          group_id?: string | null;
          id?: string;
          observation_date?: string | null;
          observation_text?: string | null;
          observer_id?: string | null;
          org_id?: string | null;
          organization_id?: string | null;
          performance_rating?: number | null;
          person_id?: string | null;
          player_id?: string | null;
          skill_tags?: string[] | null;
          tags?: string[] | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_mpbc_observations_development_plan';
            columns: ['development_plan_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_development_plan';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_mpbc_observations_person';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_observations_observer_id_fkey';
            columns: ['observer_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_observations_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_person';
            referencedColumns: ['id'];
          },
        ];
      };
      mpbc_organizations: {
        Row: {
          active: boolean | null;
          contact_info: Json | null;
          created_at: string | null;
          description: string | null;
          id: string;
          logo_url: string | null;
          name: string | null;
          overlay_version: string | null;
          settings: Json | null;
          subscription_tier: string | null;
          type: string | null;
          updated_at: string | null;
        };
        Insert: {
          active?: boolean | null;
          contact_info?: Json | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string | null;
          overlay_version?: string | null;
          settings?: Json | null;
          subscription_tier?: string | null;
          type?: string | null;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean | null;
          contact_info?: Json | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string | null;
          overlay_version?: string | null;
          settings?: Json | null;
          subscription_tier?: string | null;
          type?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mpbc_outcome: {
        Row: {
          active: boolean | null;
          created_at: string | null;
          description: string | null;
          id: string;
          measurement_type: string | null;
          name: string | null;
          phase_id: string | null;
          success_criteria: string | null;
          theme_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          measurement_type?: string | null;
          name?: string | null;
          phase_id?: string | null;
          success_criteria?: string | null;
          theme_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          measurement_type?: string | null;
          name?: string | null;
          phase_id?: string | null;
          success_criteria?: string | null;
          theme_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mpbc_performance_indicators: {
        Row: {
          cla_benchmark_id: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          level: string | null;
          mp_core_benchmark_standard_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          cla_benchmark_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          level?: string | null;
          mp_core_benchmark_standard_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          cla_benchmark_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          level?: string | null;
          mp_core_benchmark_standard_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mpbc_performance_metrics: {
        Row: {
          calculated_at: string | null;
          calculation_method: string | null;
          confidence_score: number | null;
          data_points: number | null;
          entity_id: string | null;
          entity_type: string | null;
          id: string;
          metric_date: string | null;
          metric_type: string | null;
          metric_value: number | null;
          notes: string | null;
          season_id: string | null;
        };
        Insert: {
          calculated_at?: string | null;
          calculation_method?: string | null;
          confidence_score?: number | null;
          data_points?: number | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          metric_date?: string | null;
          metric_type?: string | null;
          metric_value?: number | null;
          notes?: string | null;
          season_id?: string | null;
        };
        Update: {
          calculated_at?: string | null;
          calculation_method?: string | null;
          confidence_score?: number | null;
          data_points?: number | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          metric_date?: string | null;
          metric_type?: string | null;
          metric_value?: number | null;
          notes?: string | null;
          season_id?: string | null;
        };
        Relationships: [];
      };
      mpbc_person: {
        Row: {
          active: boolean | null;
          advancement_evidence: string | null;
          areas_for_improvement: string[] | null;
          auth_id: string | null;
          basketball_advancement_level: string | null;
          basketball_collective_phase: string | null;
          basketball_profile: Json | null;
          basketball_responsibility_tier: string | null;
          business_profile: Json | null;
          created_at: string | null;
          created_by: string | null;
          date_of_birth: string | null;
          education_profile: Json | null;
          email: string | null;
          emergency_contact: Json | null;
          first_name: string | null;
          height: string | null;
          id: string;
          jersey_number: string | null;
          last_advancement_date: string | null;
          last_name: string | null;
          medical_info: Json | null;
          metadata: Json | null;
          mp_core_person_id: string;
          notes: string | null;
          organization_id: string | null;
          parent_guardian_info: Json | null;
          person_type: string | null;
          phone: string | null;
          position: string | null;
          previous_advancement_level: string | null;
          profile_image_url: string | null;
          skill_ratings: Json | null;
          strengths: string[] | null;
          updated_at: string | null;
          updated_by: string | null;
          user_id: string | null;
        };
        Insert: {
          active?: boolean | null;
          advancement_evidence?: string | null;
          areas_for_improvement?: string[] | null;
          auth_id?: string | null;
          basketball_advancement_level?: string | null;
          basketball_collective_phase?: string | null;
          basketball_profile?: Json | null;
          basketball_responsibility_tier?: string | null;
          business_profile?: Json | null;
          created_at?: string | null;
          created_by?: string | null;
          date_of_birth?: string | null;
          education_profile?: Json | null;
          email?: string | null;
          emergency_contact?: Json | null;
          first_name?: string | null;
          height?: string | null;
          id: string;
          jersey_number?: string | null;
          last_advancement_date?: string | null;
          last_name?: string | null;
          medical_info?: Json | null;
          metadata?: Json | null;
          mp_core_person_id: string;
          notes?: string | null;
          organization_id?: string | null;
          parent_guardian_info?: Json | null;
          person_type?: string | null;
          phone?: string | null;
          position?: string | null;
          previous_advancement_level?: string | null;
          profile_image_url?: string | null;
          skill_ratings?: Json | null;
          strengths?: string[] | null;
          updated_at?: string | null;
          updated_by?: string | null;
          user_id?: string | null;
        };
        Update: {
          active?: boolean | null;
          advancement_evidence?: string | null;
          areas_for_improvement?: string[] | null;
          auth_id?: string | null;
          basketball_advancement_level?: string | null;
          basketball_collective_phase?: string | null;
          basketball_profile?: Json | null;
          basketball_responsibility_tier?: string | null;
          business_profile?: Json | null;
          created_at?: string | null;
          created_by?: string | null;
          date_of_birth?: string | null;
          education_profile?: Json | null;
          email?: string | null;
          emergency_contact?: Json | null;
          first_name?: string | null;
          height?: string | null;
          id?: string;
          jersey_number?: string | null;
          last_advancement_date?: string | null;
          last_name?: string | null;
          medical_info?: Json | null;
          metadata?: Json | null;
          mp_core_person_id?: string;
          notes?: string | null;
          organization_id?: string | null;
          parent_guardian_info?: Json | null;
          person_type?: string | null;
          phone?: string | null;
          position?: string | null;
          previous_advancement_level?: string | null;
          profile_image_url?: string | null;
          skill_ratings?: Json | null;
          strengths?: string[] | null;
          updated_at?: string | null;
          updated_by?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_mpbc_person_mp_core_person';
            columns: ['mp_core_person_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_mpbc_person_mp_core_person';
            columns: ['mp_core_person_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_person_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_person_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
        ];
      };
      mpbc_person_group: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          cycle_id: string | null;
          group_id: string | null;
          id: string;
          identifier: string | null;
          joined_at: string | null;
          left_at: string | null;
          metadata: Json | null;
          organization_id: string | null;
          person_id: string | null;
          position: string | null;
          role: string | null;
          status: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          cycle_id?: string | null;
          group_id?: string | null;
          id?: string;
          identifier?: string | null;
          joined_at?: string | null;
          left_at?: string | null;
          metadata?: Json | null;
          organization_id?: string | null;
          person_id?: string | null;
          position?: string | null;
          role?: string | null;
          status?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          cycle_id?: string | null;
          group_id?: string | null;
          id?: string;
          identifier?: string | null;
          joined_at?: string | null;
          left_at?: string | null;
          metadata?: Json | null;
          organization_id?: string | null;
          person_id?: string | null;
          position?: string | null;
          role?: string | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'mpbc_person_group_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_group';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_person_group_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_person_group_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_person';
            referencedColumns: ['id'];
          },
        ];
      };
      mpbc_person_metadata: {
        Row: {
          advancement_level: string | null;
          basketball_profile: Json | null;
          created_at: string | null;
          id: string;
          mp_core_person_id: string | null;
          responsibility_tier: string | null;
          updated_at: string | null;
        };
        Insert: {
          advancement_level?: string | null;
          basketball_profile?: Json | null;
          created_at?: string | null;
          id?: string;
          mp_core_person_id?: string | null;
          responsibility_tier?: string | null;
          updated_at?: string | null;
        };
        Update: {
          advancement_level?: string | null;
          basketball_profile?: Json | null;
          created_at?: string | null;
          id?: string;
          mp_core_person_id?: string | null;
          responsibility_tier?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mpbc_person_profile: {
        Row: {
          advancement_level: string | null;
          age_band_id: string | null;
          basketball_profile: Json | null;
          created_at: string | null;
          id: string;
          mp_core_person_id: string | null;
          responsibility_tier: string | null;
          updated_at: string | null;
        };
        Insert: {
          advancement_level?: string | null;
          age_band_id?: string | null;
          basketball_profile?: Json | null;
          created_at?: string | null;
          id?: string;
          mp_core_person_id?: string | null;
          responsibility_tier?: string | null;
          updated_at?: string | null;
        };
        Update: {
          advancement_level?: string | null;
          age_band_id?: string | null;
          basketball_profile?: Json | null;
          created_at?: string | null;
          id?: string;
          mp_core_person_id?: string | null;
          responsibility_tier?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mpbc_person_relationships: {
        Row: {
          created_at: string | null;
          id: string;
          person_id: string | null;
          related_person_id: string | null;
          relationship_type: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          person_id?: string | null;
          related_person_id?: string | null;
          relationship_type?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          person_id?: string | null;
          related_person_id?: string | null;
          relationship_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'mpbc_person_relationships_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_person_relationships_related_person_id_fkey';
            columns: ['related_person_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_person';
            referencedColumns: ['id'];
          },
        ];
      };
      mpbc_person_role: {
        Row: {
          active: boolean | null;
          created_at: string | null;
          created_by: string | null;
          ended_at: string | null;
          id: string;
          organization_id: string | null;
          permissions: string[] | null;
          person_id: string | null;
          role: string;
          scope_ids: string[] | null;
          scope_type: string | null;
          started_at: string | null;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          ended_at?: string | null;
          id?: string;
          organization_id?: string | null;
          permissions?: string[] | null;
          person_id?: string | null;
          role: string;
          scope_ids?: string[] | null;
          scope_type?: string | null;
          started_at?: string | null;
        };
        Update: {
          active?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          ended_at?: string | null;
          id?: string;
          organization_id?: string | null;
          permissions?: string[] | null;
          person_id?: string | null;
          role?: string;
          scope_ids?: string[] | null;
          scope_type?: string | null;
          started_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'mpbc_person_role_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_person_role_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_person_role_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_person_role_organization_id_fkey1';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_person_role_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_person_role_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_person_role_person_id_fkey1';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_person_role_person_id_fkey1';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
        ];
      };
      mpbc_phase: {
        Row: {
          active: boolean | null;
          created_at: string | null;
          description: string | null;
          id: string;
          key_concepts: string | null;
          name: string | null;
          order_index: number | null;
          pillar_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          key_concepts?: string | null;
          name?: string | null;
          order_index?: number | null;
          pillar_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          key_concepts?: string | null;
          name?: string | null;
          order_index?: number | null;
          pillar_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mpbc_pillar: {
        Row: {
          active: boolean | null;
          created_at: string | null;
          description: string | null;
          desired_outcomes: string | null;
          focus_area: string | null;
          id: string;
          key_principles: string | null;
          name: string | null;
          order_index: number | null;
          updated_at: string | null;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string | null;
          description?: string | null;
          desired_outcomes?: string | null;
          focus_area?: string | null;
          id?: string;
          key_principles?: string | null;
          name?: string | null;
          order_index?: number | null;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean | null;
          created_at?: string | null;
          description?: string | null;
          desired_outcomes?: string | null;
          focus_area?: string | null;
          id?: string;
          key_principles?: string | null;
          name?: string | null;
          order_index?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mpbc_player_skill_challenge: {
        Row: {
          challenge_title: string | null;
          coach_notes: string | null;
          created_at: string | null;
          created_by: string | null;
          deadline: string | null;
          description: string | null;
          development_plan_id: string | null;
          difficulty: string | null;
          id: string;
          player_id: string | null;
          player_notes: string | null;
          practice_frequency: string | null;
          priority: string | null;
          progress_percentage: number | null;
          resources: Json | null;
          skill_tag_id: string | null;
          status: string | null;
          success_criteria: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          challenge_title?: string | null;
          coach_notes?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          deadline?: string | null;
          description?: string | null;
          development_plan_id?: string | null;
          difficulty?: string | null;
          id?: string;
          player_id?: string | null;
          player_notes?: string | null;
          practice_frequency?: string | null;
          priority?: string | null;
          progress_percentage?: number | null;
          resources?: Json | null;
          skill_tag_id?: string | null;
          status?: string | null;
          success_criteria?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          challenge_title?: string | null;
          coach_notes?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          deadline?: string | null;
          description?: string | null;
          development_plan_id?: string | null;
          difficulty?: string | null;
          id?: string;
          player_id?: string | null;
          player_notes?: string | null;
          practice_frequency?: string | null;
          priority?: string | null;
          progress_percentage?: number | null;
          resources?: Json | null;
          skill_tag_id?: string | null;
          status?: string | null;
          success_criteria?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'mpbc_player_skill_challenge_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'mpbc_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_player_skill_challenge_development_plan_id_fkey';
            columns: ['development_plan_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_development_plan';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_player_skill_challenge_player_id_fkey';
            columns: ['player_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_player_skill_challenge_skill_tag_id_fkey';
            columns: ['skill_tag_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_skill_tag';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mpbc_player_skill_challenge_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'mpbc_person';
            referencedColumns: ['id'];
          },
        ];
      };
      mpbc_practice_block: {
        Row: {
          active: boolean | null;
          assessment_opportunities: string | null;
          block_name: string | null;
          cla_intelligence_targets: Json | null;
          coaching_emphasis: string | null;
          completed: boolean | null;
          constraints: Json | null;
          context_complexity_level: number | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          duration_minutes: number | null;
          effectiveness_rating: number | null;
          equipment_needed: string | null;
          format: string | null;
          id: string;
          master_drill_id: string | null;
          modifications: string | null;
          notes: string | null;
          objective: string | null;
          order_index: number | null;
          org_drill_id: string | null;
          phase_id: string | null;
          player_groupings: Json | null;
          session_id: string | null;
          space_setup: string | null;
          success_criteria: string | null;
          theme_id: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          active?: boolean | null;
          assessment_opportunities?: string | null;
          block_name?: string | null;
          cla_intelligence_targets?: Json | null;
          coaching_emphasis?: string | null;
          completed?: boolean | null;
          constraints?: Json | null;
          context_complexity_level?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          duration_minutes?: number | null;
          effectiveness_rating?: number | null;
          equipment_needed?: string | null;
          format?: string | null;
          id?: string;
          master_drill_id?: string | null;
          modifications?: string | null;
          notes?: string | null;
          objective?: string | null;
          order_index?: number | null;
          org_drill_id?: string | null;
          phase_id?: string | null;
          player_groupings?: Json | null;
          session_id?: string | null;
          space_setup?: string | null;
          success_criteria?: string | null;
          theme_id?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          active?: boolean | null;
          assessment_opportunities?: string | null;
          block_name?: string | null;
          cla_intelligence_targets?: Json | null;
          coaching_emphasis?: string | null;
          completed?: boolean | null;
          constraints?: Json | null;
          context_complexity_level?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          duration_minutes?: number | null;
          effectiveness_rating?: number | null;
          equipment_needed?: string | null;
          format?: string | null;
          id?: string;
          master_drill_id?: string | null;
          modifications?: string | null;
          notes?: string | null;
          objective?: string | null;
          order_index?: number | null;
          org_drill_id?: string | null;
          phase_id?: string | null;
          player_groupings?: Json | null;
          session_id?: string | null;
          space_setup?: string | null;
          success_criteria?: string | null;
          theme_id?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      mpbc_practice_block_cla_constraints: {
        Row: {
          application_notes: string | null;
          constraint_manipulation_id: string | null;
          created_at: string | null;
          effectiveness_rating: number | null;
          id: string;
          practice_block_id: string | null;
        };
        Insert: {
          application_notes?: string | null;
          constraint_manipulation_id?: string | null;
          created_at?: string | null;
          effectiveness_rating?: number | null;
          id?: string;
          practice_block_id?: string | null;
        };
        Update: {
          application_notes?: string | null;
          constraint_manipulation_id?: string | null;
          created_at?: string | null;
          effectiveness_rating?: number | null;
          id?: string;
          practice_block_id?: string | null;
        };
        Relationships: [];
      };
      mpbc_practice_session: {
        Row: {
          actual_attendance: number | null;
          coach_reflection: string | null;
          created_at: string | null;
          created_by: string | null;
          date: string | null;
          end_time: string | null;
          equipment_issues: string | null;
          expected_attendance: number | null;
          facility_info: string | null;
          id: string;
          intensity_level: number | null;
          location: string | null;
          post_practice_notes: string | null;
          pre_practice_notes: string | null;
          primary_theme_id: string | null;
          season_id: string | null;
          secondary_theme_id: string | null;
          session_number: number | null;
          session_objective: string | null;
          start_time: string | null;
          status: string | null;
          team_id: string | null;
          updated_at: string | null;
          updated_by: string | null;
          weather_conditions: string | null;
        };
        Insert: {
          actual_attendance?: number | null;
          coach_reflection?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          date?: string | null;
          end_time?: string | null;
          equipment_issues?: string | null;
          expected_attendance?: number | null;
          facility_info?: string | null;
          id?: string;
          intensity_level?: number | null;
          location?: string | null;
          post_practice_notes?: string | null;
          pre_practice_notes?: string | null;
          primary_theme_id?: string | null;
          season_id?: string | null;
          secondary_theme_id?: string | null;
          session_number?: number | null;
          session_objective?: string | null;
          start_time?: string | null;
          status?: string | null;
          team_id?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          weather_conditions?: string | null;
        };
        Update: {
          actual_attendance?: number | null;
          coach_reflection?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          date?: string | null;
          end_time?: string | null;
          equipment_issues?: string | null;
          expected_attendance?: number | null;
          facility_info?: string | null;
          id?: string;
          intensity_level?: number | null;
          location?: string | null;
          post_practice_notes?: string | null;
          pre_practice_notes?: string | null;
          primary_theme_id?: string | null;
          season_id?: string | null;
          secondary_theme_id?: string | null;
          session_number?: number | null;
          session_objective?: string | null;
          start_time?: string | null;
          status?: string | null;
          team_id?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          weather_conditions?: string | null;
        };
        Relationships: [];
      };
      mpbc_practice_templates_enhanced: {
        Row: {
          attendance_adaptations: Json | null;
          attendance_max: number | null;
          attendance_min: number | null;
          base_practice_number: number | null;
          cla_enhanced: boolean | null;
          constraint_density: number | null;
          created_at: string | null;
          effectiveness_score: number | null;
          estimated_duration: number | null;
          focus_area: string | null;
          id: string;
          intensity_level: number | null;
          mpbc_alignment: Json | null;
          template_blocks: Json | null;
          template_id: string | null;
          usage_count: number | null;
          variability_factors: Json | null;
        };
        Insert: {
          attendance_adaptations?: Json | null;
          attendance_max?: number | null;
          attendance_min?: number | null;
          base_practice_number?: number | null;
          cla_enhanced?: boolean | null;
          constraint_density?: number | null;
          created_at?: string | null;
          effectiveness_score?: number | null;
          estimated_duration?: number | null;
          focus_area?: string | null;
          id?: string;
          intensity_level?: number | null;
          mpbc_alignment?: Json | null;
          template_blocks?: Json | null;
          template_id?: string | null;
          usage_count?: number | null;
          variability_factors?: Json | null;
        };
        Update: {
          attendance_adaptations?: Json | null;
          attendance_max?: number | null;
          attendance_min?: number | null;
          base_practice_number?: number | null;
          cla_enhanced?: boolean | null;
          constraint_density?: number | null;
          created_at?: string | null;
          effectiveness_score?: number | null;
          estimated_duration?: number | null;
          focus_area?: string | null;
          id?: string;
          intensity_level?: number | null;
          mpbc_alignment?: Json | null;
          template_blocks?: Json | null;
          template_id?: string | null;
          usage_count?: number | null;
          variability_factors?: Json | null;
        };
        Relationships: [];
      };
      mpbc_practice_theme: {
        Row: {
          active: boolean | null;
          category: string | null;
          combo_code: number | null;
          created_at: string | null;
          description: string | null;
          id: string;
          name: string | null;
          phase_id: string | null;
          pillar_id: string | null;
          source_uid: string | null;
          subcategory: string | null;
          suggested_by: string | null;
          synonyms: Json | null;
          updated_at: string | null;
          use_case: string | null;
          verified: boolean | null;
        };
        Insert: {
          active?: boolean | null;
          category?: string | null;
          combo_code?: number | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string | null;
          phase_id?: string | null;
          pillar_id?: string | null;
          source_uid?: string | null;
          subcategory?: string | null;
          suggested_by?: string | null;
          synonyms?: Json | null;
          updated_at?: string | null;
          use_case?: string | null;
          verified?: boolean | null;
        };
        Update: {
          active?: boolean | null;
          category?: string | null;
          combo_code?: number | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string | null;
          phase_id?: string | null;
          pillar_id?: string | null;
          source_uid?: string | null;
          subcategory?: string | null;
          suggested_by?: string | null;
          synonyms?: Json | null;
          updated_at?: string | null;
          use_case?: string | null;
          verified?: boolean | null;
        };
        Relationships: [];
      };
      mpbc_prompt_templates: {
        Row: {
          active: boolean | null;
          created_at: string | null;
          example_inputs: Json | null;
          example_outputs: Json | null;
          id: string;
          model_parameters: Json | null;
          prompt_name: string;
          prompt_template: string;
          system_instructions: string | null;
          updated_at: string | null;
          use_case: string;
          version: string | null;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string | null;
          example_inputs?: Json | null;
          example_outputs?: Json | null;
          id?: string;
          model_parameters?: Json | null;
          prompt_name: string;
          prompt_template: string;
          system_instructions?: string | null;
          updated_at?: string | null;
          use_case: string;
          version?: string | null;
        };
        Update: {
          active?: boolean | null;
          created_at?: string | null;
          example_inputs?: Json | null;
          example_outputs?: Json | null;
          id?: string;
          model_parameters?: Json | null;
          prompt_name?: string;
          prompt_template?: string;
          system_instructions?: string | null;
          updated_at?: string | null;
          use_case?: string;
          version?: string | null;
        };
        Relationships: [];
      };
      mpbc_season: {
        Row: {
          active: boolean | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          end_date: string;
          goals: string[] | null;
          id: string;
          name: string;
          organization_id: string;
          start_date: string;
          term: string | null;
          updated_at: string | null;
          updated_by: string | null;
          year: number;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          end_date: string;
          goals?: string[] | null;
          id?: string;
          name: string;
          organization_id: string;
          start_date: string;
          term?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          year: number;
        };
        Update: {
          active?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          end_date?: string;
          goals?: string[] | null;
          id?: string;
          name?: string;
          organization_id?: string;
          start_date?: string;
          term?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          year?: number;
        };
        Relationships: [];
      };
      mpbc_session_participation: {
        Row: {
          areas_struggled: string[] | null;
          attitude_rating: number | null;
          blocks_participated: string[] | null;
          coach_feedback: string | null;
          created_at: string | null;
          effort_level: number | null;
          id: string;
          leadership_displayed: string[] | null;
          player_id: string;
          player_self_assessment: string | null;
          recorded_by: string | null;
          session_id: string;
          skill_demonstration: string[] | null;
        };
        Insert: {
          areas_struggled?: string[] | null;
          attitude_rating?: number | null;
          blocks_participated?: string[] | null;
          coach_feedback?: string | null;
          created_at?: string | null;
          effort_level?: number | null;
          id?: string;
          leadership_displayed?: string[] | null;
          player_id: string;
          player_self_assessment?: string | null;
          recorded_by?: string | null;
          session_id: string;
          skill_demonstration?: string[] | null;
        };
        Update: {
          areas_struggled?: string[] | null;
          attitude_rating?: number | null;
          blocks_participated?: string[] | null;
          coach_feedback?: string | null;
          created_at?: string | null;
          effort_level?: number | null;
          id?: string;
          leadership_displayed?: string[] | null;
          player_id?: string;
          player_self_assessment?: string | null;
          recorded_by?: string | null;
          session_id?: string;
          skill_demonstration?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'session_participation_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_practice_session';
            referencedColumns: ['id'];
          },
        ];
      };
      mpbc_signal_type: {
        Row: {
          auto_generate: boolean | null;
          category: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          priority_level: number | null;
          prompt_template: string | null;
          recommended_actions: string[] | null;
          signal_name: string;
          trigger_conditions: Json | null;
        };
        Insert: {
          auto_generate?: boolean | null;
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          priority_level?: number | null;
          prompt_template?: string | null;
          recommended_actions?: string[] | null;
          signal_name: string;
          trigger_conditions?: Json | null;
        };
        Update: {
          auto_generate?: boolean | null;
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          priority_level?: number | null;
          prompt_template?: string | null;
          recommended_actions?: string[] | null;
          signal_name?: string;
          trigger_conditions?: Json | null;
        };
        Relationships: [];
      };
      mpbc_skill_prerequisites: {
        Row: {
          id: string;
          prerequisite_skill_id: string | null;
          required: boolean | null;
          skill_id: string | null;
        };
        Insert: {
          id?: string;
          prerequisite_skill_id?: string | null;
          required?: boolean | null;
          skill_id?: string | null;
        };
        Update: {
          id?: string;
          prerequisite_skill_id?: string | null;
          required?: boolean | null;
          skill_id?: string | null;
        };
        Relationships: [];
      };
      mpbc_skill_tag: {
        Row: {
          active: boolean | null;
          category: string | null;
          cla_category_mapping: string | null;
          context_requirements: string | null;
          created_at: string | null;
          description: string | null;
          difficulty_level: number | null;
          id: string;
          intelligence_focus: string | null;
          name: string | null;
          parent_skill_id: string | null;
          pillar_id: string | null;
          prerequisites: string | null;
          progression_order: number | null;
          updated_at: string | null;
        };
        Insert: {
          active?: boolean | null;
          category?: string | null;
          cla_category_mapping?: string | null;
          context_requirements?: string | null;
          created_at?: string | null;
          description?: string | null;
          difficulty_level?: number | null;
          id?: string;
          intelligence_focus?: string | null;
          name?: string | null;
          parent_skill_id?: string | null;
          pillar_id?: string | null;
          prerequisites?: string | null;
          progression_order?: number | null;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean | null;
          category?: string | null;
          cla_category_mapping?: string | null;
          context_requirements?: string | null;
          created_at?: string | null;
          description?: string | null;
          difficulty_level?: number | null;
          id?: string;
          intelligence_focus?: string | null;
          name?: string | null;
          parent_skill_id?: string | null;
          pillar_id?: string | null;
          prerequisites?: string | null;
          progression_order?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mpbc_template_usage_log: {
        Row: {
          attendance_actual: number | null;
          coach_feedback: string | null;
          coach_id: string | null;
          effectiveness_rating: number | null;
          id: string;
          modifications_made: Json | null;
          organization_id: string | null;
          session_id: string | null;
          template_id: string | null;
          used_at: string | null;
          would_use_again: boolean | null;
        };
        Insert: {
          attendance_actual?: number | null;
          coach_feedback?: string | null;
          coach_id?: string | null;
          effectiveness_rating?: number | null;
          id?: string;
          modifications_made?: Json | null;
          organization_id?: string | null;
          session_id?: string | null;
          template_id?: string | null;
          used_at?: string | null;
          would_use_again?: boolean | null;
        };
        Update: {
          attendance_actual?: number | null;
          coach_feedback?: string | null;
          coach_id?: string | null;
          effectiveness_rating?: number | null;
          id?: string;
          modifications_made?: Json | null;
          organization_id?: string | null;
          session_id?: string | null;
          template_id?: string | null;
          used_at?: string | null;
          would_use_again?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'template_usage_log_template_id_fkey';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_practice_templates_enhanced';
            referencedColumns: ['id'];
          },
        ];
      };
      mpbc_thread_participants: {
        Row: {
          id: string;
          joined_at: string | null;
          role: string | null;
          thread_id: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          joined_at?: string | null;
          role?: string | null;
          thread_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          joined_at?: string | null;
          role?: string | null;
          thread_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'mpbc_thread_participants_thread_id_fkey';
            columns: ['thread_id'];
            isOneToOne: false;
            referencedRelation: 'mpbc_message_threads';
            referencedColumns: ['id'];
          },
        ];
      };
      mpbc_version_config: {
        Row: {
          active: boolean | null;
          ai_model_config: Json | null;
          constraint_definitions: Json | null;
          created_at: string | null;
          id: string;
          prompt_library: Json | null;
          schema_version: string;
          version: string;
        };
        Insert: {
          active?: boolean | null;
          ai_model_config?: Json | null;
          constraint_definitions?: Json | null;
          created_at?: string | null;
          id?: string;
          prompt_library?: Json | null;
          schema_version: string;
          version: string;
        };
        Update: {
          active?: boolean | null;
          ai_model_config?: Json | null;
          constraint_definitions?: Json | null;
          created_at?: string | null;
          id?: string;
          prompt_library?: Json | null;
          schema_version?: string;
          version?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      current_participants: {
        Row: {
          auth_uid: string | null;
          cycle_name: string | null;
          email: string | null;
          first_name: string | null;
          group_id: string | null;
          group_name: string | null;
          id: string | null;
          identifier: string | null;
          last_name: string | null;
          organization_id: string | null;
          person_type: string | null;
          position: string | null;
          role: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_person_group_group';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_group';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_person_organization';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_person_group_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_group';
            referencedColumns: ['id'];
          },
        ];
      };
      session_participation_summary: {
        Row: {
          absent_count: number | null;
          attendance_percentage: number | null;
          date: string | null;
          group_name: string | null;
          late_count: number | null;
          present_count: number | null;
          session_id: string | null;
          session_type: string | null;
          total_tracked: number | null;
        };
        Relationships: [];
      };
      v_mp_core_group_membership: {
        Row: {
          created_at: string | null;
          group_id: string | null;
          id: string | null;
          person_id: string | null;
          role: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          group_id?: string | null;
          id?: string | null;
          person_id?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          group_id?: string | null;
          id?: string | null;
          person_id?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_person_group_group';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_group';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_person_group_person';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_person_group_person';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_person_group_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_group';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_person_group_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'current_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mp_core_person_group_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'mp_core_person';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      count_active_players: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      get_current_coach_attributes: {
        Args: Record<PropertyKey, never>;
        Returns: {
          coach_auth_uid: string;
          org_id: string;
          is_admin: boolean;
          is_superadmin: boolean;
        }[];
      };
      get_user_organization_access: {
        Args: Record<PropertyKey, never>;
        Returns: {
          org_id: string;
          role_name: string;
          is_superadmin: boolean;
        }[];
      };
      get_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: {
          person_id: string;
          organization_id: string;
          role: string;
          is_superadmin: boolean;
          is_admin: boolean;
          team_ids: string[];
        }[];
      };
      is_org_admin: {
        Args: { p_org_id: string; p_user_id: string };
        Returns: boolean;
      };
      set_null_start_date: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: {
      group_type: 'team' | 'pod' | 'session';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      group_type: ['team', 'pod', 'session'],
    },
  },
} as const;
