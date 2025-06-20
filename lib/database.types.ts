export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      Availability: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      Contractor: {
        Row: {
          createdAt: string
          email: string
          fullName: string
          id: string
          isPremium: boolean
          location: string | null
          userId: string
        }
        Insert: {
          createdAt?: string
          email: string
          fullName: string
          id: string
          isPremium?: boolean
          location?: string | null
          userId: string
        }
        Update: {
          createdAt?: string
          email?: string
          fullName?: string
          id?: string
          isPremium?: boolean
          location?: string | null
          userId?: string
        }
        Relationships: []
      }
      Favorite: {
        Row: {
          contractorId: string
          createdAt: string
          id: string
          musicianId: string
        }
        Insert: {
          contractorId: string
          createdAt?: string
          id: string
          musicianId: string
        }
        Update: {
          contractorId?: string
          createdAt?: string
          id?: string
          musicianId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Favorite_contractorId_fkey"
            columns: ["contractorId"]
            isOneToOne: false
            referencedRelation: "Contractor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Favorite_musicianId_fkey"
            columns: ["musicianId"]
            isOneToOne: false
            referencedRelation: "Musician"
            referencedColumns: ["id"]
          },
        ]
      }
      Genre: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      Instrument: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      Musician: {
        Row: {
          accepts_collaborations: boolean | null
          accepts_gigs: boolean | null
          artisticName: string | null
          audioSamples: Json | null
          bio: string | null
          createdAt: string
          email: string
          experienceLevel: string | null
          fullName: string
          gearHighlights: string[] | null
          hourlyRate: number | null
          id: string
          influences: string[] | null
          instagramUrl: string | null
          is_public: boolean | null
          isFeatured: boolean
          isPremium: boolean
          location: string | null
          lookingFor: string[] | null
          preferredVenueTypes: string[] | null
          pressKitUrl: string | null
          profileCompleteness: number
          profileImageUrl: string | null
          servicesOffered: string[] | null
          socialMediaLinks: Json | null
          soundcloudUrl: string | null
          userId: string
          videoSamples: Json | null
          websiteUrl: string | null
          youtubeUrl: string | null
        }
        Insert: {
          accepts_collaborations?: boolean | null
          accepts_gigs?: boolean | null
          artisticName?: string | null
          audioSamples?: Json | null
          bio?: string | null
          createdAt?: string
          email: string
          experienceLevel?: string | null
          fullName: string
          gearHighlights?: string[] | null
          hourlyRate?: number | null
          id: string
          influences?: string[] | null
          instagramUrl?: string | null
          is_public?: boolean | null
          isFeatured?: boolean
          isPremium?: boolean
          location?: string | null
          lookingFor?: string[] | null
          preferredVenueTypes?: string[] | null
          pressKitUrl?: string | null
          profileCompleteness?: number
          profileImageUrl?: string | null
          servicesOffered?: string[] | null
          socialMediaLinks?: Json | null
          soundcloudUrl?: string | null
          userId: string
          videoSamples?: Json | null
          websiteUrl?: string | null
          youtubeUrl?: string | null
        }
        Update: {
          accepts_collaborations?: boolean | null
          accepts_gigs?: boolean | null
          artisticName?: string | null
          audioSamples?: Json | null
          bio?: string | null
          createdAt?: string
          email?: string
          experienceLevel?: string | null
          fullName?: string
          gearHighlights?: string[] | null
          hourlyRate?: number | null
          id?: string
          influences?: string[] | null
          instagramUrl?: string | null
          is_public?: boolean | null
          isFeatured?: boolean
          isPremium?: boolean
          location?: string | null
          lookingFor?: string[] | null
          preferredVenueTypes?: string[] | null
          pressKitUrl?: string | null
          profileCompleteness?: number
          profileImageUrl?: string | null
          servicesOffered?: string[] | null
          socialMediaLinks?: Json | null
          soundcloudUrl?: string | null
          userId?: string
          videoSamples?: Json | null
          websiteUrl?: string | null
          youtubeUrl?: string | null
        }
        Relationships: []
      }
      MusicianAvailability: {
        Row: {
          availabilityId: string
          musicianId: string
        }
        Insert: {
          availabilityId: string
          musicianId: string
        }
        Update: {
          availabilityId?: string
          musicianId?: string
        }
        Relationships: [
          {
            foreignKeyName: "MusicianAvailability_availabilityId_fkey"
            columns: ["availabilityId"]
            isOneToOne: false
            referencedRelation: "Availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "MusicianAvailability_musicianId_fkey"
            columns: ["musicianId"]
            isOneToOne: false
            referencedRelation: "Musician"
            referencedColumns: ["id"]
          },
        ]
      }
      MusicianGenre: {
        Row: {
          genreId: string
          musicianId: string
        }
        Insert: {
          genreId: string
          musicianId: string
        }
        Update: {
          genreId?: string
          musicianId?: string
        }
        Relationships: [
          {
            foreignKeyName: "MusicianGenre_genreId_fkey"
            columns: ["genreId"]
            isOneToOne: false
            referencedRelation: "Genre"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "MusicianGenre_musicianId_fkey"
            columns: ["musicianId"]
            isOneToOne: false
            referencedRelation: "Musician"
            referencedColumns: ["id"]
          },
        ]
      }
      MusicianInstrument: {
        Row: {
          instrumentId: string
          musicianId: string
        }
        Insert: {
          instrumentId: string
          musicianId: string
        }
        Update: {
          instrumentId?: string
          musicianId?: string
        }
        Relationships: [
          {
            foreignKeyName: "MusicianInstrument_instrumentId_fkey"
            columns: ["instrumentId"]
            isOneToOne: false
            referencedRelation: "Instrument"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "MusicianInstrument_musicianId_fkey"
            columns: ["musicianId"]
            isOneToOne: false
            referencedRelation: "Musician"
            referencedColumns: ["id"]
          },
        ]
      }
      MusicianPreference: {
        Row: {
          musicianId: string
          preferenceId: string
        }
        Insert: {
          musicianId: string
          preferenceId: string
        }
        Update: {
          musicianId?: string
          preferenceId?: string
        }
        Relationships: [
          {
            foreignKeyName: "MusicianPreference_musicianId_fkey"
            columns: ["musicianId"]
            isOneToOne: false
            referencedRelation: "Musician"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "MusicianPreference_preferenceId_fkey"
            columns: ["preferenceId"]
            isOneToOne: false
            referencedRelation: "Preference"
            referencedColumns: ["id"]
          },
        ]
      }
      MusicianSkill: {
        Row: {
          musicianId: string
          skillId: string
        }
        Insert: {
          musicianId: string
          skillId: string
        }
        Update: {
          musicianId?: string
          skillId?: string
        }
        Relationships: [
          {
            foreignKeyName: "MusicianSkill_musicianId_fkey"
            columns: ["musicianId"]
            isOneToOne: false
            referencedRelation: "Musician"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "MusicianSkill_skillId_fkey"
            columns: ["skillId"]
            isOneToOne: false
            referencedRelation: "Skill"
            referencedColumns: ["id"]
          },
        ]
      }
      Payment: {
        Row: {
          amount: number
          createdAt: string
          id: string
          role: string
          status: string
          userId: string
        }
        Insert: {
          amount: number
          createdAt?: string
          id: string
          role: string
          status: string
          userId: string
        }
        Update: {
          amount?: number
          createdAt?: string
          id?: string
          role?: string
          status?: string
          userId?: string
        }
        Relationships: []
      }
      Preference: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      Skill: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
